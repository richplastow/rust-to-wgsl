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

    console.log('OK: All rustToWGSL() tests passed!');
}
