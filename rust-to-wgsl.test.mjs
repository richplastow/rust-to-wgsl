import { deepStrictEqual as deep } from 'assert';
import { rustToWGSL as fn } from './rust-to-wgsl.mjs';

export const testRustToWGSL = () => {
    deep(
        fn(''),
        {
            errors: [],
            wgsl: '',
        },
        'Empty string'
    );

    deep(
        fn('/*'),
        {
            errors: [ 'Unterminated block comment' ],
            wgsl: '/*',
        },
        'Minimal unterminated block comment'
    );

    deep(
        fn('start /* ok */ mid /* outer /* inner */ end'),
        {
            errors: [ 'Unterminated block comment' ],
            wgsl: 'start /* ok */ mid /* outer /* inner */ end',
        },
        'Typical unterminated block comment'
    );

    deep(
        fn('"'),
        {
            errors: [
                'Contains a string at char 0',
                'Unterminated string literal',
            ],
            wgsl: '"',
        },
        'Minimal unterminated string literal'
    );

    deep(
        fn('start "ok string" " \\" end'),
        {
            errors: [
                'Contains a string at char 6',
                'Contains a string at char 18',
                'Unterminated string literal',
            ],
            wgsl: 'start "ok string" " \\" end',
        },
        'Typical unterminated string literal'
    );

    console.log('OK: All rustToWGSL() tests passed!');
}
