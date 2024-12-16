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
        'Simple inline comment'
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

    console.log('OK: All rustToThreeParts() tests passed!');
}
