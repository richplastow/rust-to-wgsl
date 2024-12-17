var RUST_TO_WGSL = (function (exports) {
    'use strict';

    const rustToBasicParts = (...rustLines) => {
        const parts = [{
            kind: 'TOP', // start at the top-level
            rust: [],
        }];
        let partRef = parts[0];

        const rust = rustLines.join('\n');
        for (let pos=0; pos<rust.length; pos++) {
            const c0 = rust[pos];
            const c1 = rust[pos+1]; // possibly undefined

            switch (partRef.kind) {
                case 'TOP':
                    if (c0 === '/' && c1 === '*') {
                        pos += 1;
                        partRef = {
                            depth: 1,
                            kind: 'BLOCK_COMMENT',
                            rust: ['/','*'],
                        };
                        parts.push(partRef);
                    } else if (c0 === '/' && c1 === '/') {
                        pos += 1;
                        partRef = {
                            kind: 'INLINE_COMMENT',
                            rust: ['/','/'],
                        };
                        parts.push(partRef);
                    } else if (c0 === "'") {
                        partRef = {
                            kind: 'CHAR_LITERAL',
                            pos, // used for error message
                            rust: [c0],
                        };
                        parts.push(partRef);
                    } else if (c0 === '"') {
                        partRef = {
                            kind: 'STRING_LITERAL',
                            pos, // used for error message
                            rust: [c0],
                        };
                        parts.push(partRef);
                    } else {
                        partRef.rust.push(c0);
                    }
                    break;
                case 'BLOCK_COMMENT':
                    if (c0 === '/' && c1 === '*') {
                        pos += 1;
                        partRef.depth += 1;
                        partRef.rust.push('/','*');
                    } else if (c0 === '*' && c1 === '/') {
                        pos += 1;
                        partRef.depth -= 1;
                        partRef.rust.push('*','/');
                        if (partRef.depth === 0) {
                            delete partRef.depth;
                            partRef = {
                                kind: 'TOP',
                                rust: [],
                            };
                            parts.push(partRef);
                        }
                    } else {
                        partRef.rust.push(c0);
                    }
                    break;
                case 'INLINE_COMMENT':
                    partRef.rust.push(c0);
                    if (c0 === '\n') {
                        partRef = {
                            kind: 'TOP',
                            rust: [],
                        };
                        parts.push(partRef);
                    }
                    break;
                case 'CHAR_LITERAL':
                    partRef.rust.push(c0);
                    if (c0 === "'") {
                        partRef = {
                            kind: 'TOP',
                            rust: [],
                        };
                        parts.push(partRef);
                    }
                    break;
                case 'STRING_LITERAL':
                    partRef.rust.push(c0);
                    if (c0 === '\\' && c1 === '\\') { // escaped backslash
                        pos += 1;
                        partRef.rust.push(c1);
                    } else if (c0 === '\\' && c1 === '"') { // escaped double-quote
                        pos += 1;
                        partRef.rust.push(c1);
                    } else if (c0 === '"') {
                        partRef = {
                            kind: 'TOP',
                            rust: [],
                        };
                        parts.push(partRef);
                    }
                    break;
            }
        }

        return parts;
    };

    const rust01 =
`// Inline comment
/* Block
   comment */
/* Nested /* comment */ */
`;

    const rust02 =
`let a: u32 = 1;
let b: u32 = 2;
let c = a + b;
// let d: u32 = 4;
/** /*/* let e: u32 = 5; */*/ let f: u32 = 5; */
`;

    const rust03 =
`let a = 'A';
// let b = 'B'; commented-out with an inline comment
/* let c = 'C'; commented-out with a block comment */
let eAcute = '\\u{c9}';
`;

    const rust04 =
`let a = "Can \\\\ contain \\" backslashes";
// let b = "Commented-out with an inline comment";
/* let c = "Commented-out with a block comment"; */
let d = "Not an // inline comment";
let e = "Not a /* block */ comment";
`;

    const keywordChars = new Set(['l','e','t']);
    const isKeywordChar = (char) => keywordChars.has(char);

    const classNames = new Map();
    classNames.set('TOP', 'top');
    classNames.set('BLOCK_COMMENT', 'comment');
    classNames.set('INLINE_COMMENT', 'comment');
    classNames.set('CHAR_LITERAL', 'char-or-string');
    classNames.set('STRING_LITERAL', 'char-or-string');

    const highlightWGSL = (charArray, options, kind) => {
        const str = charArray.join('');
        const { classPrefix, highlight } = options;
        if (highlight === 'PLAIN') return str;    
        const className = `${classPrefix}${classNames.get(kind)}`;
        const htmlStr = str.replace(/</g, '&lt;').replace(/\n/g, '<br />\n');
        return `<span class="${className}">${htmlStr}</span>`;
    };

    const topToWGSL = (rust, options) => {
        const wgsl = [];
        let token = []; // characters building the current token

        for (let i=0; i<rust.length; i++) {
            const char = rust[i];

            if (isKeywordChar(char)) {
                token.push(char);
            } else {
                token = token.join('');
                switch (token) {
                    case 'let':
                        wgsl.push('var');
                        break;
                    default: // not a recognised keyword
                        wgsl.push(token);
                }
                token = [];
                wgsl.push(char);
            }
        }

        // TODO highlight numbers differently, etc
        return highlightWGSL(wgsl, options, 'TOP');
    };

    const validHighlight = new Set([ 'PLAIN', 'HTML' ]);

    /** #### Transforms Rust source code to WebGPU Shading Language (WGSL) source code
     * 
     * @param rust  Rust source code
     * @param options  Configures the response
     * @returns  WGSL source code
     */
    const rustToWGSL = (rust, options = {}) => {
        const pfx = 'rustToWGSL(): Invalid'; // error prefix

        // Validate argument types.
        if (typeof rust !== 'string') throw RangeError(
            `${pfx} rust argument type '${typeof rust}', should be 'string'`);
        if (typeof options !== 'object') throw RangeError(
            `${pfx} options type '${typeof options}', should be 'object', if present`);

        // Validate `options`, and fall back to defaults.
        const defaultedOptions = {
            classPrefix: '',
            highlight: 'PLAIN',
            ...options,
        };
        const { classPrefix, highlight } = defaultedOptions;
        if (typeof classPrefix !== 'string') throw RangeError(
            `${pfx} options.classPrefix type '${typeof classPrefix}', should be 'string'`);
        if (!validHighlight.has(highlight)) throw RangeError(
            `${pfx} options.highlight '${highlight}', use 'PLAIN' or 'HTML'`);

        const errors = [];
        const wgsl = [];

        const rustParts = rustToBasicParts(rust);

        for (const { kind, pos, rust } of rustParts) {
            switch (kind) {
                case 'TOP':
                    wgsl.push(topToWGSL(rust, defaultedOptions));
                    break;
                case 'BLOCK_COMMENT':
                case 'INLINE_COMMENT':
                    wgsl.push(highlightWGSL(rust, defaultedOptions, kind));
                    break;
                case 'CHAR_LITERAL':
                    errors.push(`Contains a char at pos ${pos}`);
                    wgsl.push(highlightWGSL(rust, defaultedOptions, kind));
                    break;
                case 'STRING_LITERAL':
                    errors.push(`Contains a string at pos ${pos}`);
                    wgsl.push(highlightWGSL(rust, defaultedOptions, kind));
                    break;
            }
        }

        switch (rustParts[rustParts.length-1].kind) {
            case 'BLOCK_COMMENT':
                errors.push('Unterminated block comment');
                break;
            case 'CHAR_LITERAL':
                errors.push('Unterminated char literal');
                break;
            case 'STRING_LITERAL':
                errors.push('Unterminated string literal');
                break;
        }

        return {
            errors,
            wgsl: wgsl.join(''),
        };
    };

    exports.rust01 = rust01;
    exports.rust02 = rust02;
    exports.rust03 = rust03;
    exports.rust04 = rust04;
    exports.rustToWGSL = rustToWGSL;

    return exports;

})({});
