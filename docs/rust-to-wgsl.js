var RUST_TO_WGSL = (function (exports) {
    'use strict';

    const rustToThreeParts = (...rustLines) => {
        const parts = [{
            kind: 'TOP', // start at the top-level
            rust: [],
        }];
        let partRef = parts[0];

        const rust = rustLines.join('\n');
        for (let i=0; i<rust.length; i++) {
            const c0 = rust[i];
            const c1 = rust[i+1]; // possibly undefined

            switch (partRef.kind) {
                case 'TOP':
                    if (c0 === '/' && c1 === '*') {
                        i += 1;
                        partRef = {
                            depth: 1,
                            kind: 'BLOCK_COMMENT',
                            rust: ['/','*'],
                        };
                        parts.push(partRef);
                    } else if (c0 === '/' && c1 === '/') {
                        i += 1;
                        partRef = {
                            kind: 'INLINE_COMMENT',
                            rust: ['/','/'],
                        };
                        parts.push(partRef);
                    } else {
                        partRef.rust.push(c0);
                    }
                    break;
                case 'BLOCK_COMMENT':
                    if (c0 === '/' && c1 === '*') {
                        i += 1;
                        partRef.depth += 1;
                        partRef.rust.push('/','*');
                    } else if (c0 === '*' && c1 === '/') {
                        i += 1;
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
                    if (c0 === '\n') {
                        partRef.rust.push('\n');
                        partRef = {
                            kind: 'TOP',
                            rust: [],
                        };
                        parts.push(partRef);
                    } else {
                        partRef.rust.push(c0);
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

    const keywordChars = new Set(['l','e','t']);
    const isKeywordChar = (char) => keywordChars.has(char);

    const topToWGSL = (rust) => {
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

        return wgsl.join('');
    };

    /** #### Transforms Rust source code to WebGPU Shading Language (WGSL) source code
     * 
     * @param rust  Rust source code
     * @returns  WGSL source code
     */
    const rustToWGSL = (rust) => {
        const wgsl = [];

        const rustParts = rustToThreeParts(rust);

        for (const { kind, rust } of rustParts) {
            switch (kind) {
                case 'TOP':
                    wgsl.push(topToWGSL(rust));
                    break;
                case 'BLOCK_COMMENT':
                    // TODO next check for unterminated block comment (has `depth`)
                case 'INLINE_COMMENT':
                    wgsl.push(rust.join(''));
                    break;
            }
        }

        return wgsl.join('');
    };

    exports.rust01 = rust01;
    exports.rust02 = rust02;
    exports.rustToWGSL = rustToWGSL;

    return exports;

})({});
