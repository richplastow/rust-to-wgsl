import { deepStrictEqual as deep } from 'assert';
import { rustToThreeParts as fn } from './rust-to-three-parts.mjs';

export const testRustToThreeParts = () => {
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
        fn('abc // "def"',
           'ghi'),
        [{
            kind: 'TOP',
            rust: 'abc '.split(''),
        },{
            kind: 'INLINE_COMMENT',
            rust: '// "def"\n'.split(''),
        },{
            kind: 'TOP',
            rust: 'ghi'.split(''),
        }],
        'An inline comment, not a string literal'
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
        fn('start /* "not a string" */ end'),
        [{
            kind: 'TOP',
            rust: 'start '.split(''),
        },{
            kind: 'BLOCK_COMMENT',
            rust: '/* "not a string" */'.split(''),
        },{
            kind: 'TOP',
            rust: ' end'.split(''),
        }],
        'A block comment, not a string literal'
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

    console.log('OK: All rustToThreeParts() tests passed!');
}
