var RUST_TO_WGSL = (function (exports) {
    'use strict';

    const classNames = new Map();
    classNames.set('BLOCK_COMMENT', 'comment');
    classNames.set('CHAR_LITERAL', 'char-or-string');
    classNames.set('INLINE_COMMENT', 'comment');
    classNames.set('KEYWORD', 'keyword');
    classNames.set('NUM_BINARY', 'number');
    classNames.set('NUM_DECIMAL_FLOAT', 'number');
    classNames.set('NUM_DECIMAL_INTEGER', 'number');
    classNames.set('NUM_HEX', 'number');
    classNames.set('NUM_OCTAL', 'number');
    classNames.set('STRING_LITERAL', 'char-or-string');
    classNames.set('TYPE_BOTH', 'type-both');
    classNames.set('TYPE_RUST', 'type-rust');
    classNames.set('TYPE_WGSL', 'type-wgsl');
    classNames.set('UNIDENTIFIED', 'unidentified');
    classNames.set('WHITESPACE_MOST', 'whitespace-most');
    classNames.set('WHITESPACE_RARE', 'whitespace-rare');

    /** #### Adds syntax highlighting to WGSL source code
     * 
     * @param {string} wgsl  The WGSL source code, as an array of characters
     * @param {string} kind  'BLOCK_COMMENT', 'STRING_LITERAL', etc
     * @param {object} options  A validated `options` argument, with all fallbacks
     * @returns {string}  The WGSL source code as a string, highlighted appropriately
     */
    const highlightWGSL = (wgsl, kind, options) => {
        const { classPrefix, highlight } = options;

        // Plain text can be returned immediately.
        if (highlight === 'PLAIN') return wgsl;

        // If the last characters are newlines, it’s better to place the "<br />"
        // code after the closing `</span>` tag, not before it.
        let trailingNLs = 0;
        for (let i=wgsl.length-1; i>=0; i--) {
            if (wgsl[i] !== '\n') break; // found the last non-newline character
            trailingNLs++;
        }
        const wgslTrimmed = trailingNLs ? wgsl.slice(0, -trailingNLs) : wgsl;

        // Add syntax highlighting for HTML. Note, ANSI may be supported in future.
        const className = `${classPrefix}${classNames.get(kind)}`;
        const htmlStr = wgslTrimmed.replace(/</g, '&lt;').replace(/\n/g, '<br />');
        const trailingNLsHTML = '<br />'.repeat(trailingNLs);
        return `<span class="${className}">${htmlStr}</span>${trailingNLsHTML}`;
    };

    // Set of the most commonly encountered Pattern_White_Space characters.
    const whitespaceMostChars = new Set([
        '\t',    // U+0009 Horizontal Tab
        '\n',    // U+000A Line Feed, aka Newline
        ' ',     // U+0020 Space
    ]);

    // Set of the less common Pattern_White_Space characters, which Rust treats the
    // same as space, tab and newline.
    const whitespaceRareChars = new Set([
        '\u000B',// U+000B Vertical Tab
        '\u000C',// U+000C Form Feed
        '\r',    // U+000D Carriage Return
        '\u0085',// U+0085 Next Line
        '\u200E',// U+200E Left-to-Right Mark
        '\u200F',// U+200F Right-to-Left Mark
        '\u2028',// U+2028 Line Separator
        '\u2029' // U+2029 Paragraph Separator
    ]);

    /** #### Detects the most commonly encountered ‘Pattern_White_Space’ characters
     * 
     * These can be passed directly to WGSL without any transformation or special
     * syntax highlighting.
     * 
     * @todo maybe a simple conditional would be more performant?
     * 
     * @param {string} char  A single character
     * @returns {boolean}  `true` if the character is a space, tab or newline
     */
    const isWhitespaceMost = (char) => whitespaceMostChars.has(char);

    /** #### Detects the less commonly encountered ‘Pattern_White_Space’ characters
     * 
     * Although these can be passed directly to WGSL without any transformation,
     * special syntax highlighting may be useful.
     * 
     * @param {string} char  A single character
     * @returns {boolean}  `true` if the character is a rare whitespace character
     */
    const isWhitespaceRare = (char) => whitespaceRareChars.has(char);

    const rustKeywords = new Set([
        'abstract',
        'as',
        'async',
        'await',
        'become',
        'box',
        'break',
        'const',
        'continue',
        'crate',
        'do',
        'dyn',
        'else',
        'enum',
        'extern',
        'false',
        'final',
        'fn',
        'for',
        'if',
        'impl',
        'in',
        'let',
        'loop',
        'macro_rules', // TODO `c0 >= 'a' && c0 <= 'z'` misses this
        'macro',
        'match',
        'mod',
        'move',
        'mut',
        'override',
        'priv',
        'pub',
        'ref',
        'return',
        'self',
        'Self',
        'static',
        'struct',
        'super',
        'trait',
        'true',
        'try',
        'type',
        'typeof',
        'union',
        'unsafe',
        'unsized',
        'use',
        'virtual',
        'where',
        'while',
        'yield',
        "'static", // TODO `c0 >= 'a' && c0 <= 'z'` misses this
    ]);

    const bothTypes = new Set([
        'bool', // a true or false value (no storage representation specified)
        'f32',  // an IEEE-754 binary32 floating point
        'i32',  // a signed, two’s complement, 32-bit integer
        'u32',  // an unsigned 32-bit integer
    ]);

    const rustTypes = new Set([
        'bool', // both - a true or false value (no storage representation specified)
        'char',
        'str',
        'String',
        'Vec',
        'Option',
        'Box',
        'f32', // both - an IEEE-754 binary32 floating point
        'f64',
        'i8',
        'i16',
        'i32', // both - a signed, two’s complement, 32-bit integer
        'i64',
        'i128',
        'isize',
        'u8',
        'u16',
        'u32', // both - an unsigned 32-bit integer
        'u64',
        'u128',
        'usize',
    ]);

    const wgslTypes = new Set([
        // array<> types are very varied, so can’t just be looked up
        'atomic<i32>',
        'atomic<u32>',
        'bool', //       both - a true or false value (no storage representation specified)
        'f16',  // 1.0h  an IEEE-754 binary16 floating point (if extension enabled)
        'f32',  // 1.0f  both - an IEEE-754 binary32 floating point
        'i32',  // 1i    both - a signed, two’s complement, 32-bit integer
        'mat2x2f',
        'mat2x3f',
        'mat2x4f',
        'mat3x2f',
        'mat3x3f',
        'mat3x4f',
        'mat4x2f',
        'mat4x3f',
        'mat4x4f',
        'mat2x2h', // if f16 extension enabled
        'mat2x3h', // if f16 extension enabled
        'mat2x4h', // if f16 extension enabled
        'mat3x2h', // if f16 extension enabled
        'mat3x3h', // if f16 extension enabled
        'mat3x4h', // if f16 extension enabled
        'mat4x2h', // if f16 extension enabled
        'mat4x3h', // if f16 extension enabled
        'mat4x4h', // if f16 extension enabled
        'mat2x2<f32>',
        'mat2x3<f32>',
        'mat2x4<f32>',
        'mat3x2<f32>',
        'mat3x3<f32>',
        'mat3x4<f32>',
        'mat4x2<f32>',
        'mat4x3<f32>',
        'mat4x4<f32>',
        'mat2x2<f16>', // if f16 extension enabled
        'mat2x3<f16>', // if f16 extension enabled
        'mat2x4<f16>', // if f16 extension enabled
        'mat3x2<f16>', // if f16 extension enabled
        'mat3x3<f16>', // if f16 extension enabled
        'mat3x4<f16>', // if f16 extension enabled
        'mat4x2<f16>', // if f16 extension enabled
        'mat4x3<f16>', // if f16 extension enabled
        'mat4x4<f16>', // if f16 extension enabled
        'u32', // 1u     both - an unsigned 32-bit integer
        'vec2<f16>', // if f16 extension enabled
        'vec2<f32>',
        'vec2<i32>',
        'vec2<u32>',
        'vec2f',
        'vec2h', // if f16 extension enabled
        'vec2i',
        'vec2u',
        'vec3<f16>', // if f16 extension enabled
        'vec3<f32>',
        'vec3<i32>',
        'vec3<u32>',
        'vec3f',
        'vec3h', // if f16 extension enabled
        'vec3i',
        'vec3u',
        'vec4<f16>', // if f16 extension enabled
        'vec4<f32>',
        'vec4<i32>',
        'vec4<u32>',
        'vec4f',
        'vec4h', // if f16 extension enabled
        'vec4i',
        'vec4u',
    ]);

    const roughlyParseRust = (rust) => {
        const errors = [];
        const parts = [{
            kind: 'WHITESPACE_MOST', // start with zero or more whitespace characters
            rust: [],
        }];
        let partRef = parts[0];

        // Append `NULL`, which will help avoid some edge cases. The `NULL` will be
        // removed before roughlyParseRust() `return`s.
        const rustPlusNull = `${rust}\x00`;

        for (let pos=0; pos<rustPlusNull.length; pos++) {
            const c0 = rustPlusNull[pos];
            const c1 = rustPlusNull[pos+1]; // possibly undefined

            switch (partRef.kind) {
                case 'WHITESPACE_MOST':
                    if (isWhitespaceMost(c0)) { // WHITESPACE_MORE
                        partRef.rust.push(c0); // more spaces, tabs or newlines
                    } else if (c0 >= '0' && c0 <= '9') { // NUM_DECIMAL_INTEGER
                        partRef = {
                            kind: 'NUM_DECIMAL_INTEGER', // but may change, depending on what comes next
                            pos, // used for error message TODO remove if not used
                            rust: [c0],
                        };
                        parts.push(partRef);
                    } else if (c0 === '_' || (c0 >= 'a' && c0 <= 'z') || (c0 >= 'A' && c0 <= 'Z')) { // IDENTIFIER
                        // TODO full XID_Start set
                        partRef = {
                            kind: 'UNIDENTIFIED',
                            pos, // used for error message TODO remove if not used
                            rust: [c0],
                        };
                        parts.push(partRef);
                    } else if (c0 === '/' && c1 === '*') { // BLOCK_COMMENT
                        pos += 1;
                        partRef = {
                            depth: 1,
                            kind: 'BLOCK_COMMENT',
                            rust: ['/','*'],
                        };
                        parts.push(partRef);
                    } else if (c0 === '/' && c1 === '/') { // INLINE_COMMENT
                        pos += 1;
                        partRef = {
                            kind: 'INLINE_COMMENT',
                            rust: ['/','/'],
                        };
                        parts.push(partRef);
                    } else if (c0 === "'") { // CHAR_LITERAL
                        errors.push(`Contains a char at pos ${pos}`);
                        partRef = {
                            kind: 'CHAR_LITERAL',
                            pos, // used for error message TODO remove if not used
                            rust: [c0],
                        };
                        parts.push(partRef);
                    } else if (c0 === '"') { // STRING_LITERAL
                        errors.push(`Contains a string at pos ${pos}`);
                        partRef = {
                            kind: 'STRING_LITERAL',
                            pos, // used for error message TODO remove if not used
                            rust: [c0],
                        };
                        parts.push(partRef);
                    } else if (c0 === '{') { // BRACKET_CURLY_OPEN
                        partRef = {
                            kind: 'WHITESPACE_MOST',
                            rust: [],
                        };
                        parts.push({
                            kind: 'BRACKET_CURLY_OPEN',
                            rust: [c0],
                        }, partRef);
                    } else if (c0 === ';') { // SEMICOLON
                        partRef = {
                            kind: 'WHITESPACE_MOST',
                            rust: [],
                        };
                        parts.push({
                            kind: 'SEMICOLON',
                            rust: [c0],
                        }, partRef);
                    } else if (isWhitespaceRare(c0)) { // WHITESPACE_RARE TODO
                        partRef = {
                            kind: 'WHITESPACE_RARE',
                            rust: [c0],
                        };
                        parts.push(partRef);
                    } else {
                        partRef.rust.push(c0);
                    }
                    break;
                case 'WHITESPACE_RARE':
                    if (isWhitespaceRare(c0)) { // WHITESPACE_RARE
                        partRef.rust.push(c0); // more unusual chars from ‘Pattern_White_Space’
                    }
                case 'NUM_BINARY':
                    if (c0 === '0' || c0 === '1' || c0 === '_') {
                        partRef.rust.push(c0); // another character in the binary integer
                    } else if (c0 === 'i' || c0 === 'u') {
                        if (c1 === '8') {
                            partRef.rust.push(c0, c1); // 8-bit signed or unsigned integer
                            pos += 1;
                        } else if (['16','32','64'].includes(rustPlusNull.slice(pos + 1, pos + 3))) {
                            partRef.rust.push(...rustPlusNull.slice(pos, pos + 3)); // 16/32/64-bit signed or unsigned integer
                            pos += 2;
                        } else if (rustPlusNull.slice(pos + 1, pos + 4) === '128') {
                            partRef.rust.push(...rustPlusNull.slice(pos, pos + 4)); // 128-bit signed or unsigned integer
                            pos += 3;
                        } else if (rustPlusNull.slice(pos + 1, pos + 5) === 'size') {
                            partRef.rust.push(...rustPlusNull.slice(pos, pos + 5)); // device-size signed or unsigned integer
                            pos += 4;
                        } else {
                            pos -= 1; // step back one place, to recapture the 'i' or 'u'
                            partRef = {
                                kind: 'WHITESPACE_MOST',
                                rust: [],
                            };
                            parts.push(partRef);    
                        }
                    } else if (partRef.rust.length === 2 || partRef.rust.slice(2).every(c => c === '_')) { // never found a valid digit
                        pos -= partRef.rust.length; // step back two or more places, to recapture the 'b' and any '_' chars
                        partRef.kind = 'NUM_DECIMAL_INTEGER';
                        partRef.rust = ['0'];
                        partRef = {
                            kind: 'WHITESPACE_MOST',
                            rust: [],
                        };
                        parts.push(partRef);    
                    } else {
                        pos -= 1; // step back one place, to recapture c0
                        partRef = {
                            kind: 'WHITESPACE_MOST',
                            rust: [],
                        };
                        parts.push(partRef);
                    }
                    break;
                case 'NUM_DECIMAL_FLOAT':
                    if ((c0 >= '0' && c0 <= '9') || c0 === '_') { // already has its '.'
                        partRef.rust.push(c0); // another character in the decimal float
                    } else if (c0 === 'f') {
                        if (['32','64'].includes(rustPlusNull.slice(pos + 1, pos + 3))) {
                            partRef.rust.push(...rustPlusNull.slice(pos, pos + 3)); // 32/64-bit float suffix
                            pos += 2;
                        } else {
                            pos -= 1; // step back one place, to recapture the 'f'
                        }
                        partRef = {
                            kind: 'WHITESPACE_MOST',
                            rust: [],
                        };
                        parts.push(partRef);    
                    } else {
                        pos -= 1; // step back one place, to recapture c0
                        partRef = {
                            kind: 'WHITESPACE_MOST',
                            rust: [],
                        };
                        parts.push(partRef);
                    }
                    break;
                case 'NUM_DECIMAL_INTEGER':
                    if ((c0 >= '0' && c0 <= '9') || c0 === '_') {
                        partRef.rust.push(c0); // another character in the decimal integer
                    } else if (c0 === '.') {
                        partRef.kind = 'NUM_DECIMAL_FLOAT'; // change to a floating point number
                        partRef.rust.push(c0); // the decimal point
                    } else if (c0 === 'f') { // !!!! IMPORTANT !!!! must be placed before `(partRef.rust.length === 1 && partRef.rust[0] === '0')`
                        if (['32','64'].includes(rustPlusNull.slice(pos + 1, pos + 3))) {
                            partRef.kind = 'NUM_DECIMAL_FLOAT'; // change to a floating point number
                            partRef.rust.push(...rustPlusNull.slice(pos, pos + 3)); // 32/64-bit floating point
                            pos += 2;
                        } else {
                            pos -= 1; // step back one place, to recapture the 'f'
                        }
                        partRef = {
                            kind: 'WHITESPACE_MOST',
                            rust: [],
                        };
                        parts.push(partRef);    
                    } else if (c0 === 'i' || c0 === 'u') { // !!!! IMPORTANT !!!! must be placed before `(partRef.rust.length === 1 && partRef.rust[0] === '0')`
                        if (c1 === '8') {
                            partRef.rust.push(c0, c1); // 8-bit signed or unsigned integer
                            pos += 1;
                        } else if (['16','32','64'].includes(rustPlusNull.slice(pos + 1, pos + 3))) {
                            partRef.rust.push(...rustPlusNull.slice(pos, pos + 3)); // 16/32/64-bit signed or unsigned integer
                            pos += 2;
                        } else if (rustPlusNull.slice(pos + 1, pos + 4) === '128') {
                            partRef.rust.push(...rustPlusNull.slice(pos, pos + 4)); // 128-bit signed or unsigned integer
                            pos += 3;
                        } else if (rustPlusNull.slice(pos + 1, pos + 5) === 'size') {
                            partRef.rust.push(...rustPlusNull.slice(pos, pos + 5)); // device-size signed or unsigned integer
                            pos += 4;
                        } else {
                            pos -= 1; // step back one place, to recapture the 'i' or 'u'
                            partRef = {
                                kind: 'WHITESPACE_MOST',
                                rust: [],
                            };
                            parts.push(partRef);    
                        }
                    } else if (partRef.rust.length === 1 && partRef.rust[0] === '0') {
                        if (c0 === 'b') {
                            partRef.kind = 'NUM_BINARY'; // change to a binary number
                            partRef.rust.push(c0);
                        } else if (c0 === 'o') {
                            partRef.kind = 'NUM_OCTAL'; // change to an octal number
                            partRef.rust.push(c0);
                        } else if (c0 === 'x') {
                            partRef.kind = 'NUM_HEX'; // change to a hexadecimal number (tentative, until a valid digit is found)
                            partRef.rust.push(c0);
                        } else {
                            pos -= 1; // step back one place, to recapture c0
                            partRef = {
                                kind: 'WHITESPACE_MOST',
                                rust: [],
                            };
                            parts.push(partRef);
                        }
                    } else {
                        pos -= 1; // step back one place, to recapture c0
                        partRef = {
                            kind: 'WHITESPACE_MOST',
                            rust: [],
                        };
                        parts.push(partRef);
                    }
                    break;
                case 'NUM_HEX':
                    if ((c0 >= '0' && c0 <= '9') || (c0 >= 'a' && c0 <= 'f') || (c0 >= 'A' && c0 <= 'F') || c0 === '_') {
                        partRef.rust.push(c0); // another character in the hexadecimal integer
                    } else if (c0 === 'i' || c0 === 'u') {
                        if (c1 === '8') {
                            partRef.rust.push(c0, c1); // 8-bit signed or unsigned integer
                            pos += 1;
                        } else if (['16','32','64'].includes(rustPlusNull.slice(pos + 1, pos + 3))) {
                            partRef.rust.push(...rustPlusNull.slice(pos, pos + 3)); // 16/32/64-bit signed or unsigned integer
                            pos += 2;
                        } else if (rustPlusNull.slice(pos + 1, pos + 4) === '128') {
                            partRef.rust.push(...rustPlusNull.slice(pos, pos + 4)); // 128-bit signed or unsigned integer
                            pos += 3;
                        } else if (rustPlusNull.slice(pos + 1, pos + 5) === 'size') {
                            partRef.rust.push(...rustPlusNull.slice(pos, pos + 5)); // device-size signed or unsigned integer
                            pos += 4;
                        } else {
                            pos -= 1; // step back one place, to recapture the 'i' or 'u'
                            partRef = {
                                kind: 'WHITESPACE_MOST',
                                rust: [],
                            };
                            parts.push(partRef);    
                        }
                    } else if (partRef.rust.length === 2 || partRef.rust.slice(2).every(c => c === '_')) { // never found a valid digit
                        pos -= partRef.rust.length; // step back two or more places, to recapture the 'x' and any '_' chars
                        partRef.kind = 'NUM_DECIMAL_INTEGER';
                        partRef.rust = ['0'];
                        partRef = {
                            kind: 'WHITESPACE_MOST',
                            rust: [],
                        };
                        parts.push(partRef);    
                    } else {
                        pos -= 1; // step back one place, to recapture c0
                        partRef = {
                            kind: 'WHITESPACE_MOST',
                            rust: [],
                        };
                        parts.push(partRef);
                    }
                    break;
                case 'NUM_OCTAL':
                    if ((c0 >= '0' && c0 <= '7') || c0 === '_') {
                        partRef.rust.push(c0); // another character in the octal integer
                    } else if (c0 === 'i' || c0 === 'u') {
                        if (c1 === '8') {
                            partRef.rust.push(c0, c1); // 8-bit signed or unsigned integer
                            pos += 1;
                        } else if (['16','32','64'].includes(rustPlusNull.slice(pos + 1, pos + 3))) {
                            partRef.rust.push(...rustPlusNull.slice(pos, pos + 3)); // 16/32/64-bit signed or unsigned integer
                            pos += 2;
                        } else if (rustPlusNull.slice(pos + 1, pos + 4) === '128') {
                            partRef.rust.push(...rustPlusNull.slice(pos, pos + 4)); // 128-bit signed or unsigned integer
                            pos += 3;
                        } else if (rustPlusNull.slice(pos + 1, pos + 5) === 'size') {
                            partRef.rust.push(...rustPlusNull.slice(pos, pos + 5)); // device-size signed or unsigned integer
                            pos += 4;
                        } else {
                            pos -= 1; // step back one place, to recapture the 'i' or 'u'
                            partRef = {
                                kind: 'WHITESPACE_MOST',
                                rust: [],
                            };
                            parts.push(partRef);    
                        }
                    } else if (partRef.rust.length === 2 || partRef.rust.slice(2).every(c => c === '_')) { // never found a valid digit
                        pos -= partRef.rust.length; // step back two or more places, to recapture the 'o' and any '_' chars
                        partRef.kind = 'NUM_DECIMAL_INTEGER';
                        partRef.rust = ['0'];
                        partRef = {
                            kind: 'WHITESPACE_MOST',
                            rust: [],
                        };
                        parts.push(partRef);
                    } else {
                        pos -= 1; // step back one place, to recapture c0
                        partRef = {
                            kind: 'WHITESPACE_MOST',
                            rust: [],
                        };
                        parts.push(partRef);
                    }
                    break;
                case 'UNIDENTIFIED':
                    // TODO full XID_Continue set
                    if (c0 === '_' || (c0 >= '0' && c0 <= '9') || (c0 >= 'a' && c0 <= 'z') || (c0 >= 'A' && c0 <= 'Z')) {
                        partRef.rust.push(c0); // another potential keyword character
                    } else {
                        const unidentified = partRef.rust.join('');
                        if (rustKeywords.has(unidentified)) {
                            partRef.kind = 'KEYWORD';
                        } else if (bothTypes.has(unidentified)) {
                            partRef.kind = 'TYPE_BOTH';
                        } else if (rustTypes.has(unidentified)) {
                            partRef.kind = 'TYPE_RUST';
                        } else if (wgslTypes.has(unidentified)) {
                            partRef.kind = 'TYPE_WGSL';
                        }
                        pos -= 1; // step back one place, to recapture c0
                        partRef = {
                            kind: 'WHITESPACE_MOST',
                            rust: [],
                        };
                        parts.push(partRef);
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
                                kind: 'WHITESPACE_MOST',
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
                            kind: 'WHITESPACE_MOST',
                            rust: [],
                        };
                        parts.push(partRef);
                    }
                    break;
                case 'CHAR_LITERAL':
                    partRef.rust.push(c0);
                    if (c0 === "'") {
                        partRef = {
                            kind: 'WHITESPACE_MOST',
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
                            kind: 'WHITESPACE_MOST',
                            rust: [],
                        };
                        parts.push(partRef);
                    }
                    break;
            }
        }

        // Remove the trailing `NULL`.
        partRef.rust = partRef.rust.slice(0, -1);

        // Add an error if a block comment, char or string was not ended correctly.
        switch (partRef.kind) {
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

        // Remove and any empty parts (expected to just be unnecessary whitespace).
        return {
            errors,
            parts: parts.filter(({ rust }) => rust.length),
        };
    };

    /** #### 
     * 
     * @param {*} parsedParts  
     * @param {*} options 
     * @returns 
     */
    const transformParts = (parsedParts, options) => {
        const errors = [];
        const parts = [];

        for (let i=0; i<parsedParts.length; i++) {
            const { kind, rust } = parsedParts[i];

            switch (kind) {
                case 'KEYWORD':
                    if (rust.join('') === 'let') {
                        parts.push({
                            kind,
                            wgsl: 'var',
                        });
                    } else {
                        parts.push({
                            kind,
                            wgsl: rust.join(''),
                        });    
                    }
                    break;
                default:
                    parts.push({
                        kind,
                        wgsl: rust.join(''),
                    });
                    break;
            }
        }

        // 
        return { errors, parts };
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

    const validHighlight = new Set([ 'PLAIN', 'HTML' ]);

    /** #### Transforms Rust source code to WebGPU Shading Language (WGSL) source code
     * 
     * @param {string} rust  Rust source code
     * @param {object} [options={}]  Configures the response
     * @returns  WGSL source code, along with an array of error messages
     */
    const rustToWGSL = (rust, options = {}) => {
        const xpx = 'rustToWGSL(): Invalid'; // exception prefix

        // Validate argument types.
        if (typeof rust !== 'string') throw RangeError(
            `${xpx} rust argument type '${typeof rust}', should be 'string'`);
        if (typeof options !== 'object') throw RangeError(
            `${xpx} options type '${typeof options}', should be 'object', if present`);

        // Validate `options`, and fall back to defaults.
        const defaultedOptions = {
            classPrefix: '',
            highlight: 'PLAIN',
            ...options,
        };
        const { classPrefix, highlight } = defaultedOptions;
        if (typeof classPrefix !== 'string') throw RangeError(
            `${xpx} options.classPrefix type '${typeof classPrefix}', should be 'string'`);
        if (!validHighlight.has(highlight)) throw RangeError(
            `${xpx} options.highlight '${highlight}', use 'PLAIN' or 'HTML'`);

        const errors = [];

        // Divide the Rust source code into parts of different kinds, for example
        // 'BLOCK_COMMENT', 'KEYWORD' and 'NUM_HEX'.
        const {
            errors: parseErrors,
            parts: parsedParts
        } = roughlyParseRust(rust);
        errors.push(...parseErrors);

        const {
            errors: transformationErrors,
            parts: transformedParts
        } = transformParts(parsedParts);
        errors.push(...transformationErrors);

        const wgslParts = [];
        for (const { kind, wgsl } of transformedParts) {
            wgslParts.push(highlightWGSL(wgsl, kind, defaultedOptions));
        }

        return {
            errors,
            wgsl: wgslParts.join(''),
        };
    };

    exports.rust01 = rust01;
    exports.rust02 = rust02;
    exports.rust03 = rust03;
    exports.rust04 = rust04;
    exports.rustToWGSL = rustToWGSL;

    return exports;

})({});
