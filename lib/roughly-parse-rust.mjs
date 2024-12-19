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

export const roughlyParseRust = (rust) => {
    const errors = [];
    const parts = [{
        kind: 'WS', // start with zero or more whitespace characters
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
            case 'WS':
                if (c0 === ' ' || c0 === '\t' || c0 === '\n') { // WS
                    partRef.rust.push(c0); // more whitespace
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
                        kind: 'IDENTIFIER',
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
                        kind: 'WS',
                        rust: [],
                    };
                    parts.push({
                        kind: 'BRACKET_CURLY_OPEN',
                        rust: [c0],
                    }, partRef);
                } else if (c0 === ';') { // SEMICOLON
                    partRef = {
                        kind: 'WS',
                        rust: [],
                    };
                    parts.push({
                        kind: 'SEMICOLON',
                        rust: [c0],
                    }, partRef);
                } else {
                    partRef.rust.push(c0);
                }
                break;
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
                            kind: 'WS',
                            rust: [],
                        };
                        parts.push(partRef);    
                    }
                } else if (partRef.rust.length === 2 || partRef.rust.slice(2).every(c => c === '_')) { // never found a valid digit
                    pos -= partRef.rust.length; // step back two or more places, to recapture the 'b' and any '_' chars
                    partRef.kind = 'NUM_DECIMAL_INTEGER';
                    partRef.rust = ['0'];
                    partRef = {
                        kind: 'WS',
                        rust: [],
                    };
                    parts.push(partRef);    
                } else {
                    pos -= 1; // step back one place, to recapture c0
                    partRef = {
                        kind: 'WS',
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
                        kind: 'WS',
                        rust: [],
                    };
                    parts.push(partRef);    
                } else {
                    pos -= 1; // step back one place, to recapture c0
                    partRef = {
                        kind: 'WS',
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
                        kind: 'WS',
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
                            kind: 'WS',
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
                            kind: 'WS',
                            rust: [],
                        };
                        parts.push(partRef);
                    }
                } else {
                    pos -= 1; // step back one place, to recapture c0
                    partRef = {
                        kind: 'WS',
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
                            kind: 'WS',
                            rust: [],
                        };
                        parts.push(partRef);    
                    }
                } else if (partRef.rust.length === 2 || partRef.rust.slice(2).every(c => c === '_')) { // never found a valid digit
                    pos -= partRef.rust.length; // step back two or more places, to recapture the 'x' and any '_' chars
                    partRef.kind = 'NUM_DECIMAL_INTEGER';
                    partRef.rust = ['0'];
                    partRef = {
                        kind: 'WS',
                        rust: [],
                    };
                    parts.push(partRef);    
                } else {
                    pos -= 1; // step back one place, to recapture c0
                    partRef = {
                        kind: 'WS',
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
                            kind: 'WS',
                            rust: [],
                        };
                        parts.push(partRef);    
                    }
                } else if (partRef.rust.length === 2 || partRef.rust.slice(2).every(c => c === '_')) { // never found a valid digit
                    pos -= partRef.rust.length; // step back two or more places, to recapture the 'o' and any '_' chars
                    partRef.kind = 'NUM_DECIMAL_INTEGER';
                    partRef.rust = ['0'];
                    partRef = {
                        kind: 'WS',
                        rust: [],
                    };
                    parts.push(partRef);
                } else {
                    pos -= 1; // step back one place, to recapture c0
                    partRef = {
                        kind: 'WS',
                        rust: [],
                    };
                    parts.push(partRef);
                }
                break;
            case 'IDENTIFIER':
                // TODO full XID_Continue set
                if (c0 === '_' || (c0 >= '0' && c0 <= '9') || (c0 >= 'a' && c0 <= 'z') || (c0 >= 'A' && c0 <= 'Z')) {
                    partRef.rust.push(c0); // another potential keyword character
                } else {
                    const identifier = partRef.rust.join('');
                    if (rustKeywords.has(identifier)) {
                        partRef.kind = 'KEYWORD';
                    } else if (bothTypes.has(identifier)) {
                        partRef.kind = 'TYPE_BOTH';
                    } else if (rustTypes.has(identifier)) {
                        partRef.kind = 'TYPE_RUST';
                    } else if (wgslTypes.has(identifier)) {
                        partRef.kind = 'TYPE_WGSL';
                    }
                    pos -= 1; // step back one place, to recapture c0
                    partRef = {
                        kind: 'WS',
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
                            kind: 'WS',
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
                        kind: 'WS',
                        rust: [],
                    };
                    parts.push(partRef);
                }
                break;
            case 'CHAR_LITERAL':
                partRef.rust.push(c0);
                if (c0 === "'") {
                    partRef = {
                        kind: 'WS',
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
                        kind: 'WS',
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

    // Remove and any empty parts (expected to just be unnecessary WHITESPACE).
    return {
        errors,
        parts: parts.filter(({ rust }) => rust.length),
    };
}
