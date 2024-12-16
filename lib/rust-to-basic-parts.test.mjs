import { deepStrictEqual as deep } from 'assert';
import { rustToBasicParts as fn } from './rust-to-basic-parts.mjs';

export const testRustToBasicParts = () => {
    deep(
        fn(''),
        [{
            kind: 'TOP',
            rust: [],
        }],
        'Empty string'
    );

    deep(
        fn('  \t\n\t '),
        [{
            kind: 'TOP',
            rust: '  \t\n\t '.split(''),
        }],
        'Just whitespace'
    );

    deep(
        fn('//'),
        [{
            kind: 'TOP',
            rust: [],
        },{
            kind: 'INLINE_COMMENT',
            rust: '//'.split(''),
        }],
        'Minimal inline comment'
    );

    deep(
        fn(`abc // "def" 'G'`,
           'hij'),
        [{
            kind: 'TOP',
            rust: 'abc '.split(''),
        },{
            kind: 'INLINE_COMMENT',
            rust: `// "def" 'G'\n`.split(''),
        },{
            kind: 'TOP',
            rust: 'hij'.split(''),
        }],
        'An inline comment, not a string or char literal'
    );

    deep(
        fn('/**/'),
        [{
            kind: 'TOP',
            rust: [],
        },{
            kind: 'BLOCK_COMMENT',
            rust: '/**/'.split(''),
        },{
            kind: 'TOP',
            rust: [],
        }],
        'Minimal block comment'
    );

    deep(
        fn(`start /* "not a string" 'x' */ end`),
        [{
            kind: 'TOP',
            rust: 'start '.split(''),
        },{
            kind: 'BLOCK_COMMENT',
            rust: `/* "not a string" 'x' */`.split(''),
        },{
            kind: 'TOP',
            rust: ' end'.split(''),
        }],
        'A block comment, not a string or char literal'
    );

    deep(
        fn('start /* outer /* mid /* inner */\n \t*/*/ end'),
        [{
            kind: 'TOP',
            rust: 'start '.split(''),
        },{
            kind: 'BLOCK_COMMENT',
            rust: '/* outer /* mid /* inner */\n \t*/*/'.split(''),
        },{
            kind: 'TOP',
            rust: ' end'.split(''),
        }],
        'Nested block comment'
    );

    deep(
        fn("''"), // rustc: `error: empty character literal`
        [{
            kind: 'TOP',
            rust: [],
        },{
            kind: 'CHAR_LITERAL',
            pos: 0,
            rust: "''".split(''),
        },{
            kind: 'TOP',
            rust: [],
        }],
        'Empty char literal (not valid Rust)'
    );

    deep(
        fn("let a = 'A'; let eAcute = '\\u{c9}';"),
        [{
            kind: 'TOP',
            rust: 'let a = '.split(''),
        },{
            kind: 'CHAR_LITERAL',
            pos: 8,
            rust: "'A'".split(''),
        },{
            kind: 'TOP',
            rust: '; let eAcute = '.split(''),
        },{
            kind: 'CHAR_LITERAL',
            pos: 26,
            rust: "'\\u{c9}'".split(''),
        },{
            kind: 'TOP',
            rust: [';'],
        }],
        'Typical char literals'
    );

    deep(
        fn("let b = 'Not an // inline comment'"), // rustc won't accept this
        [{
            kind: 'TOP',
            rust: 'let b = '.split(''),
        },{
            kind: 'CHAR_LITERAL',
            pos: 8,
            rust: "'Not an // inline comment'".split(''),
        },{
            kind: 'TOP',
            rust: [],
        }],
        'A char literal, not an inline comment'
    );

    deep(
        fn("let c = 'Not a /* block */ comment'"), // rustc won't accept this
        [{
            kind: 'TOP',
            rust: 'let c = '.split(''),
        },{
            kind: 'CHAR_LITERAL',
            pos: 8,
            rust: "'Not a /* block */ comment'".split(''),
        },{
            kind: 'TOP',
            rust: [],
        }],
        'A char literal, not a block comment'
    );

    deep(
        fn('""'), // rustc allows `"";` as an expression inside a function
        [{
            kind: 'TOP',
            rust: [],
        },{
            kind: 'STRING_LITERAL',
            pos: 0,
            rust: '""'.split(''),
        },{
            kind: 'TOP',
            rust: [],
        }],
        'Minimal string literal'
    );

    deep(
        fn('let a = "Can \\\\ contain \\" backslashes";'),
        [{
            kind: 'TOP',
            rust: 'let a = '.split(''),
        },{
            kind: 'STRING_LITERAL',
            pos: 8,
            rust: '"Can \\\\ contain \\" backslashes"'.split(''),
        },{
            kind: 'TOP',
            rust: [';'],
        }],
        'Typical string literal'
    );

    deep(
        fn('let b = "Not an // inline comment"'),
        [{
            kind: 'TOP',
            rust: 'let b = '.split(''),
        },{
            kind: 'STRING_LITERAL',
            pos: 8,
            rust: '"Not an // inline comment"'.split(''),
        },{
            kind: 'TOP',
            rust: [],
        }],
        'A string literal, not an inline comment'
    );

    deep(
        fn('let c = "Not a /* block */ comment"'),
        [{
            kind: 'TOP',
            rust: 'let c = '.split(''),
        },{
            kind: 'STRING_LITERAL',
            pos: 8,
            rust: '"Not a /* block */ comment"'.split(''),
        },{
            kind: 'TOP',
            rust: [],
        }],
        'A string literal, not a block comment'
    );

    console.log('OK: All rustToBasicParts() tests passed!');
}
