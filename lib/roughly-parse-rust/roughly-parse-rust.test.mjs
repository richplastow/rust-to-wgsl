import { deepStrictEqual as deep } from 'assert';
import { roughlyParseRust } from './roughly-parse-rust.mjs';

const spc = { kind: 'WHITESPACE_MOST', rust: [' '] }; // a single space character
const sc = { kind: 'SEMICOLON', rust: [';'] }; // a single semicolon character

const fn = (...rustLines) => roughlyParseRust(rustLines.join('\n')).parts;

export const testRoughlyParseRust = () => {
    deep(
        fn(''),
        [],
        'Empty string'
    );

    deep(
        fn('  \t\n\t '),
        [{
            kind: 'WHITESPACE_MOST',
            rust: '  \t\n\t '.split(''),
        }],
        'Just commonly encountered whitespace'
    );

    // deep(
    //     fn('\v\f\r'),
    //     [{
    //         kind: 'WHITESPACE_RARE',
    //         rust: '\v\f\r'.split(''),
    //     }],
    //     'Just a few rarely encountered whitespace'
    // );

    // Valid decimal integers.
    deep(
        fn('0'),
        [{ kind: 'NUM_DECIMAL_INTEGER', pos: 0, rust: ['0'] }],
        'Just the "0" character'
    );
    deep(
        fn(' 0;'),
        [spc,{ kind: 'NUM_DECIMAL_INTEGER', pos: 1, rust: ['0'] },sc],
        'A "0" character within minimal code'
    );
    deep(
        fn('9'),
        [{ kind: 'NUM_DECIMAL_INTEGER', pos: 0, rust: ['9'] }],
        'Just the "9" character'
    );
    deep(
        fn(';1234567890 '),
        [sc,{ kind: 'NUM_DECIMAL_INTEGER', pos: 1, rust: '1234567890'.split('') },spc],
        'The ten digits within minimal code'
    );
    deep(
        fn('0_'),
        [{ kind: 'NUM_DECIMAL_INTEGER', pos: 0, rust: ['0','_'] }],
        'Just the "0" and "_" characters'
    );
    deep(
        fn('0i8'),
        [{ kind: 'NUM_DECIMAL_INTEGER', pos: 0, rust: ['0','i','8'] }],
        'Just a 8-bit signed zero'
    );
    deep(
        fn('0u16'),
        [{ kind: 'NUM_DECIMAL_INTEGER', pos: 0, rust: '0u16'.split('') }],
        'Just a 16-bit unsigned zero'
    );
    deep(
        fn(' 1_23__i32 '),
        [spc,{ kind: 'NUM_DECIMAL_INTEGER', pos: 1, rust: '1_23__i32'.split('') },spc],
        'A 32-bit signed 123 with underscores, within minimal code'
    );
    deep(
        fn('0000u64'),
        [{ kind: 'NUM_DECIMAL_INTEGER', pos: 0, rust: '0000u64'.split('') }],
        'Just a 64-bit unsigned 0000'
    );
    deep(
        fn('99i128'),
        [{ kind: 'NUM_DECIMAL_INTEGER', pos: 0, rust: '99i128'.split('') }],
        'Just a 128-bit signed 99'
    );
    deep(
        fn(';0usize;'),
        [sc,{ kind: 'NUM_DECIMAL_INTEGER', pos: 1, rust: '0usize'.split('') },sc],
        'A device-sized unsigned zero, within minimal code'
    );

    // Invalid decimal integers.
    deep(
        fn('0a'),
        [
            { kind: 'NUM_DECIMAL_INTEGER', pos: 0, rust: ['0'] },
            { kind: 'UNIDENTIFIED', pos: 1, rust: ['a'] },
        ],
        'Integer zero, followed by the letter "a"'
    );
    deep(
        fn('0i3'),
        [
            { kind: 'NUM_DECIMAL_INTEGER', pos: 0, rust: ['0'] },
            { kind: 'UNIDENTIFIED', pos: 1, rust: ['i','3'] },
        ],
        'Just a 3-bit signed zero'
    );
    deep(
        fn(' 099u12;'),
        [   spc,
            { kind: 'NUM_DECIMAL_INTEGER', pos: 1, rust: ['0','9','9'] },
            { kind: 'UNIDENTIFIED', pos: 4, rust: ['u','1','2'] },
            sc,
        ],
        'A 12-bit unsigned 099, within minimal code'
    );

    // Valid floating point numbers.
    deep(
        fn('0.'),
        [{ kind: 'NUM_DECIMAL_FLOAT', pos: 0, rust: ['0','.'] }],
        'Just a floating point zero, without a trailing zero'
    );
    deep(
        fn('0.0'),
        [{ kind: 'NUM_DECIMAL_FLOAT', pos: 0, rust: ['0','.','0'] }],
        'Just a floating point zero, with a trailing zero'
    );
    deep(
        fn('012345.67890'),
        [{ kind: 'NUM_DECIMAL_FLOAT', pos: 0, rust: '012345.67890'.split('') }],
        'Just a floating point 012345.67890'
    );
    deep(
        fn('0_123__45_.___678_90f32'),
        [{ kind: 'NUM_DECIMAL_FLOAT', pos: 0, rust: '0_123__45_.___678_90f32'.split('') }],
        'Just a complicated looking floating point, with trailing "f32"'
    );
    deep(
        fn(';123__45_.___678_90f64;'),
        [sc,{ kind: 'NUM_DECIMAL_FLOAT', pos: 1, rust: '123__45_.___678_90f64'.split('') },sc],
        'A complicated looking floating point, with trailing "f64", within minimal code'
    );
    deep(
        fn('24680f32'),
        [{ kind: 'NUM_DECIMAL_FLOAT', pos: 0, rust: '24680f32'.split('') }],
        'Just a 32-bit floating point 24680, without a decimal point'
    );
    deep(
        fn(';;0f64;'),
        [sc,sc,{ kind: 'NUM_DECIMAL_FLOAT', pos: 2, rust: '0f64'.split('') },sc],
        'A 64-bit floating point zero, without a decimal point, within minimal code'
    );
    deep(
        fn('0.f32'),
        [{ kind: 'NUM_DECIMAL_FLOAT', pos: 0, rust: '0.f32'.split('') }],
        'Just a 32-bit floating point zero, without a trailing zero'
    );

    // Invalid floating point numbers.
    deep(
        fn('.'),
        [{ kind: 'WHITESPACE_MOST', rust: ['.'] }],
        'Just a decimal place character'
    );
    deep(
        fn('.0'),
        [{ kind: 'WHITESPACE_MOST', rust: ['.'] },{ kind: 'NUM_DECIMAL_INTEGER', pos: 1, rust: ['0'] }],
        'Just a decimal place followed by zero'
    );
    deep(
        fn(' 0.0a '),
        [
            spc,
            { kind: 'NUM_DECIMAL_FLOAT', pos: 1, rust: ['0','.','0'] },
            { kind: 'UNIDENTIFIED', pos: 4, rust: ['a'] },
            spc,
        ],
        'Floating point zero, followed by the letter "a", within minimal code'
    );
    deep(
        fn('0.1.2'),
        [
            { kind: 'NUM_DECIMAL_FLOAT', pos: 0, rust: ['0','.','1'] },
            { kind: 'WHITESPACE_MOST', rust: ['.'] },
            { kind: 'NUM_DECIMAL_INTEGER', pos: 4, rust: ['2'] },
        ],
        'Just a floating point number with two decimal points'
    );
    deep(
        fn(' 1.f321;'),
        [
            spc,
            { kind: 'NUM_DECIMAL_FLOAT', pos: 1, rust: '1.f32'.split('') },
            { kind: 'NUM_DECIMAL_INTEGER', pos: 6, rust: ['1'] },
            sc,
        ],
        'Just a 32-bit floating point "1.", followed directly by "1", within minimal code'
    );
    deep(
        fn('0f64_'),
        [
            { kind: 'NUM_DECIMAL_FLOAT', pos: 0, rust: '0f64'.split('') },
            { kind: 'UNIDENTIFIED', pos: 4, rust: ['_'] },
        ],
        'Just a 64-bit floating point zero, followed directly by "_"'
    );
    deep(
        fn(';123f30;'),
        [   sc,
            { kind: 'NUM_DECIMAL_INTEGER', pos: 1, rust: ['1','2','3'] },
            { kind: 'UNIDENTIFIED', pos: 4, rust: ['f','3','0'] },
            sc,
        ],
        'A 30-bit floating point 123, within minimal code'
    );

    // Valid binary, octal and hex numbers.
    deep(
        fn('0b0'),
        [{ kind: 'NUM_BINARY', pos: 0, rust: ['0','b','0'] }],
        'Just minimal binary zero'
    );
    deep(
        fn('0o0'),
        [{ kind: 'NUM_OCTAL', pos: 0, rust: ['0','o','0'] }],
        'Just minimal octal zero'
    );
    deep(
        fn('0x0'),
        [{ kind: 'NUM_HEX', pos: 0, rust: ['0','x','0'] }],
        'Just minimal hex zero'
    );
    deep(
        fn('0b000__0_0'),
        [{ kind: 'NUM_BINARY', pos: 0, rust: '0b000__0_0'.split('') }],
        'Just complicated binary zero'
    );
    deep(
        fn(' 0o0000_0___;;'),
        [spc,{ kind: 'NUM_OCTAL', pos: 1, rust: '0o0000_0___'.split('') },sc,sc],
        'Complicated octal zero, within minimal code'
    );
    deep(
        fn(';0x___00_0 '),
        [sc,{ kind: 'NUM_HEX', pos: 1, rust: '0x___00_0'.split('') },spc],
        'Complicated hex zero, within minimal code'
    );
    deep(
        fn(';0b_010101; '),
        [sc,{ kind: 'NUM_BINARY', pos: 1, rust: '0b_010101'.split('') },sc,spc],
        'A valid binary number, within minimal code'
    );
    deep(
        fn('0o__01234567'),
        [{ kind: 'NUM_OCTAL', pos: 0, rust: '0o__01234567'.split('') }],
        'Just a valid octal number'
    );
    deep(
        fn('0x0123456789abcdefABCDEF'),
        [{ kind: 'NUM_HEX', pos: 0, rust: '0x0123456789abcdefABCDEF'.split('') }],
        'Just a valid hex number'
    );
    deep(
        fn('0b11111111u8'),
        [{ kind: 'NUM_BINARY', pos: 0, rust: '0b11111111u8'.split('') }],
        'Just a valid binary number, with u8 suffix'
    );
    deep(
        fn(';0o76543210isize;'),
        [sc,{ kind: 'NUM_OCTAL', pos: 1, rust: '0o76543210isize'.split('') },sc],
        'A valid octal number, with isize suffix, within minimal code'
    );
    deep(
        fn(' 0x0123456789abcdefABCDEFu128;'),
        [spc,{ kind: 'NUM_HEX', pos: 1, rust: '0x0123456789abcdefABCDEFu128'.split('') },sc],
        'A valid hex number, with u128 suffix, within minimal code'
    );

    // Invalid binary, octal and hex numbers.
    deep(
        fn('0b'),
        [
            { kind: 'NUM_DECIMAL_INTEGER', pos: 0, rust: ['0'] },
            { kind: 'UNIDENTIFIED', pos: 1, rust: ['b'] },
        ],
        'Just "0b"'
    );
    deep(
        fn(' 0b2;'),
        [
            spc,
            { kind: 'NUM_DECIMAL_INTEGER', pos: 1, rust: ['0'] },
            { kind: 'UNIDENTIFIED', pos: 2, rust: ['b','2'] },
            sc,
        ],
        '"0b2", within minimal code'
    );
    deep(
        fn(' 0b___;'),
        [
            spc,
            { kind: 'NUM_DECIMAL_INTEGER', pos: 1, rust: ['0'] },
            { kind: 'UNIDENTIFIED', pos: 2, rust: 'b___'.split('') },
            sc,
        ],
        '"0b___", within minimal code'
    );
    deep(
        fn(';0o '),
        [
            sc,
            { kind: 'NUM_DECIMAL_INTEGER', pos: 1, rust: ['0'] },
            { kind: 'UNIDENTIFIED', pos: 2, rust: ['o'] },
            spc,
        ],
        '"0o", within minimal code'
    );
    deep(
        fn('0o8'),
        [
            { kind: 'NUM_DECIMAL_INTEGER', pos: 0, rust: ['0'] },
            { kind: 'UNIDENTIFIED', pos: 1, rust: ['o','8'] },
        ],
        'Just "0o8"'
    );
    deep(
        fn(';0o___ '),
        [
            sc,
            { kind: 'NUM_DECIMAL_INTEGER', pos: 1, rust: ['0'] },
            { kind: 'UNIDENTIFIED', pos: 2, rust: 'o___'.split('') },
            spc,
        ],
        '"0o___", within minimal code'
    );
    deep(
        fn('0x'),
        [
            { kind: 'NUM_DECIMAL_INTEGER', pos: 0, rust: ['0'] },
            { kind: 'UNIDENTIFIED', pos: 1, rust: ['x'] },
        ],
        'Just "0x"'
    );
    deep(
        fn('0x___'),
        [
            { kind: 'NUM_DECIMAL_INTEGER', pos: 0, rust: ['0'] },
            { kind: 'UNIDENTIFIED', pos: 1, rust: 'x___'.split('') },
        ],
        'Just "0x___"'
    );
    deep(
        fn(' 0xG;'),
        [
            spc,
            { kind: 'NUM_DECIMAL_INTEGER', pos: 1, rust: ['0'] },
            { kind: 'UNIDENTIFIED', pos: 2, rust: ['x','G'] },
            sc,
        ],
        '"0xG", within minimal code'
    );




    deep(
        fn('a'),
        [{
            kind: 'UNIDENTIFIED',
            pos: 0,
            rust: ['a'],
        }],
        'Just a single "a" character'
    );

    deep(
        fn(';'),
        [{
            kind: 'SEMICOLON',
            rust: [';'],
        }],
        'Just a semicolon'
    );

    deep(
        fn('{'),
        [{
            kind: 'BRACKET_CURLY_OPEN',
            rust: ['{'],
        }],
        'Just an open curly bracket'
    );

    deep(
        fn('a;'),
        [{
            kind: 'UNIDENTIFIED',
            pos: 0,
            rust: ['a'],
        },{
            kind: 'SEMICOLON',
            rust: [';'],
        }],
        'Just a single "z" character, followed by an open curly bracket'
    );

    deep(
        fn('//'),
        [{
            kind: 'INLINE_COMMENT',
            rust: '//'.split(''),
        }],
        'Minimal line comment'
    );

    deep(
        fn(`abc // "def" 'G'`,
           'hij'),
        [{
            kind: 'UNIDENTIFIED',
            pos: 0,
            rust: 'abc'.split(''),
        },spc,{
            kind: 'INLINE_COMMENT',
            rust: `// "def" 'G'\n`.split(''),
        },{
            kind: 'UNIDENTIFIED',
            pos: 17,
            rust: 'hij'.split(''),
        }],
        'A line comment, not a string or char literal'
    );

    deep(
        fn('/**/'),
        [{
            kind: 'BLOCK_COMMENT',
            rust: '/**/'.split(''),
        }],
        'Minimal block comment'
    );

    deep(
        fn(`start /* "not a string" 'x' */ end`),
        [{
            kind: 'UNIDENTIFIED',
            pos: 0,
            rust: 'start'.split(''),
        },spc,{
            kind: 'BLOCK_COMMENT',
            rust: `/* "not a string" 'x' */`.split(''),
        },spc,{
            kind: 'UNIDENTIFIED',
            pos: 31,
            rust: 'end'.split(''),
        }],
        'A block comment, not a string or char literal'
    );

    deep(
        fn('start /* outer /* mid /* inner */\n \t*/*/ end'),
        [{
            kind: 'UNIDENTIFIED',
            pos: 0,
            rust: 'start'.split(''),
        },spc,{
            kind: 'BLOCK_COMMENT',
            rust: '/* outer /* mid /* inner */\n \t*/*/'.split(''),
        },spc,{
            kind: 'UNIDENTIFIED',
            pos: 41,
            rust: 'end'.split(''),
        }],
        'Nested block comment'
    );

    deep(
        fn("''"), // rustc: `error: empty character literal`
        [{
            kind: 'CHAR_LITERAL',
            pos: 0,
            rust: "''".split(''),
        }],
        'Empty char literal'
    );

    deep(
        fn("let a = 'A'; let eAcute = '\\u{c9}';"),
        [
            { kind: 'KEYWORD', pos: 0, rust: [ 'l', 'e', 't' ] },
            spc,
            { kind: 'UNIDENTIFIED', pos: 4, rust: [ 'a' ] },
            { kind: 'WHITESPACE_MOST', rust: [ ' ', '=', ' ' ] },
            { kind: 'CHAR_LITERAL', pos: 8, rust: [ "'", 'A', "'" ] },
            sc,
            spc,
            { kind: 'KEYWORD', pos: 13, rust: [ 'l', 'e', 't' ] },
            spc,
            {
              kind: 'UNIDENTIFIED',
              pos: 17,
              rust: [ 'e', 'A', 'c', 'u', 't', 'e' ]
            },
            { kind: 'WHITESPACE_MOST', rust: [ ' ', '=', ' ' ] },
            {
              kind: 'CHAR_LITERAL',
              pos: 26,
              rust: [
                "'", '\\', 'u',
                '{', 'c',  '9',
                '}', "'"
              ]
            },
            sc
          ],
        'Typical char literals'
    );

    deep(
        fn("let b = 'Not a // line comment'"), // rustc won't accept this
        [
            { kind: 'KEYWORD', pos: 0, rust: [ 'l', 'e', 't' ] },
            spc,
            { kind: 'UNIDENTIFIED', pos: 4, rust: [ 'b' ] },
            { kind: 'WHITESPACE_MOST', rust: [ ' ', '=', ' ' ] },
            {
              kind: 'CHAR_LITERAL',
              pos: 8,
              rust: [
                "'", 'N', 'o', 't', ' ',
                'a', ' ', '/', '/', ' ',
                'l', 'i', 'n', 'e', ' ',
                'c', 'o', 'm', 'm', 'e',
                'n', 't', "'"
              ]
            }
        ],
        'A char literal, not a line comment'
    );

    deep(
        fn("let c = 'Not a /* block */ comment'"), // rustc won't accept this
        [
            { kind: 'KEYWORD', pos: 0, rust: [ 'l', 'e', 't' ] },
            spc,
            { kind: 'UNIDENTIFIED', pos: 4, rust: [ 'c' ] },
            { kind: 'WHITESPACE_MOST', rust: [ ' ', '=', ' ' ] },
            {
              kind: 'CHAR_LITERAL',
              pos: 8,
              rust: [
                "'", 'N', 'o', 't', ' ', 'a',
                ' ', '/', '*', ' ', 'b', 'l',
                'o', 'c', 'k', ' ', '*', '/',
                ' ', 'c', 'o', 'm', 'm', 'e',
                'n', 't', "'"
              ]
            }
        ],
        'A char literal, not a block comment'
    );

    deep(
        fn('""'), // rustc allows `"";` as an expression inside a function
        [{
            kind: 'STRING_LITERAL',
            pos: 0,
            rust: '""'.split(''),
        }],
        'Minimal string literal'
    );

    deep(
        fn('let a = "Can \\\\ contain \\" backslashes";'),
        [
            { kind: 'KEYWORD', pos: 0, rust: [ 'l', 'e', 't' ] },
            spc,
            { kind: 'UNIDENTIFIED', pos: 4, rust: [ 'a' ] },
            { kind: 'WHITESPACE_MOST', rust: [ ' ', '=', ' ' ] },
            {
              kind: 'STRING_LITERAL',
              pos: 8,
              rust: [
                '"',  'C', 'a', 'n', ' ',  '\\',
                '\\', ' ', 'c', 'o', 'n',  't',
                'a',  'i', 'n', ' ', '\\', '"',
                ' ',  'b', 'a', 'c', 'k',  's',
                'l',  'a', 's', 'h', 'e',  's',
                '"'
              ]
            },
            sc
        ],
        'Typical string literal'
    );

    deep(
        fn('let b = "Not a // line comment"'),
        [
            { kind: 'KEYWORD', pos: 0, rust: [ 'l', 'e', 't' ] },
            spc,
            { kind: 'UNIDENTIFIED', pos: 4, rust: [ 'b' ] },
            { kind: 'WHITESPACE_MOST', rust: [ ' ', '=', ' ' ] },
            {
              kind: 'STRING_LITERAL',
              pos: 8,
              rust: [
                '"', 'N', 'o', 't', ' ',
                'a', ' ', '/', '/', ' ',
                'l', 'i', 'n', 'e', ' ',
                'c', 'o', 'm', 'm', 'e',
                'n', 't', '"'
              ]
            }
        ],
        'A string literal, not a line comment'
    );

    deep(
        fn('let c = "Not a /* block */ comment"'),
        [
            { kind: 'KEYWORD', pos: 0, rust: [ 'l', 'e', 't' ] },
            spc,
            { kind: 'UNIDENTIFIED', pos: 4, rust: [ 'c' ] },
            { kind: 'WHITESPACE_MOST', rust: [ ' ', '=', ' ' ] },
            {
              kind: 'STRING_LITERAL',
              pos: 8,
              rust: [
                '"', 'N', 'o', 't', ' ', 'a',
                ' ', '/', '*', ' ', 'b', 'l',
                'o', 'c', 'k', ' ', '*', '/',
                ' ', 'c', 'o', 'm', 'm', 'e',
                'n', 't', '"'
              ]
            }
        ],
        'A string literal, not a block comment'
    );

    console.log('OK: All roughlyParseRust() tests passed!');
}
