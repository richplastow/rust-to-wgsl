import { deepStrictEqual as deep, throws } from 'assert';
import { rustToWGSL as fn } from './rust-to-wgsl.mjs';

export const testRustToWGSL = () => {
    const pfx = 'rustToWGSL(): Invalid'; // error prefix

    throws(
        () => fn(123),
        new RangeError(pfx + " rust argument type 'number', should be 'string'"),
        'Invalid `rust` argument type'
    );
    throws(
        () => fn('', 123),
        new RangeError(pfx + " options type 'number', should be 'object', if present"),
        'Invalid `options` argument type'
    );
    throws(
        () => fn('', { highlight: true }),
        new RangeError(pfx + " options.highlight 'true', use 'PLAIN' or 'HTML'"),
        'Invalid `options.highlight` value'
    );

    deep(
        fn('', null), // `options` can be null
        {
            errors: [],
            wgsl: '',
        },
        'Empty string'
    );

    deep(
        fn('/*', void 0), // `options` can be undefined
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
        fn("'"),
        {
            errors: [
                'Contains a char at pos 0',
                'Unterminated char literal',
            ],
            wgsl: "'",
        },
        'Minimal unterminated char literal'
    );

    deep(
        fn('"'),
        {
            errors: [
                'Contains a string at pos 0',
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
                'Contains a string at pos 6',
                'Contains a string at pos 18',
                'Unterminated string literal',
            ],
            wgsl: 'start "ok string" " \\" end',
        },
        'Typical unterminated string literal'
    );

    console.log('OK: All rustToWGSL() tests passed!');
}
