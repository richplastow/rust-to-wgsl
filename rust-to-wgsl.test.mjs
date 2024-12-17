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
    throws(
        () => fn('', { classPrefix: {} }),
        new RangeError(pfx + " options.classPrefix type 'object', should be 'string'"),
        'Invalid `options.classPrefix` value'
    );

    deep(
        fn('', null), // `rust` can be an empty string, and `options` can be null
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
        fn('start /* middle */ end', { highlight: 'HTML' }),
        {
            errors: [],
            wgsl: '<span class="top">start </span><span class="comment">/* '
                + 'middle */</span><span class="top"> end</span>',
        },
        'Typical block comment, with HTML highlighting'
    );

    deep(
        fn('start // middle\nend', { classPrefix: 'wgsl-', highlight: 'HTML' }),
        {
            errors: [],
            wgsl: '<span class="wgsl-top">start </span><span class="wgsl-comment">'
                + '// middle</span><br /><span class="wgsl-top">end</span>',
        },
        'Typical inline comment, with class-prefix and HTML highlighting'
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
        fn("start '<' end", { highlight: 'HTML' }), // '<' becomes '&lt;'
        {
            errors: [ 'Contains a char at pos 6' ],
            wgsl: '<span class="top">start </span><span class="char-or-string">'
                + `'&lt;'</span><span class="top"> end</span>`,
        },
        'Typical char literal, with HTML highlighting'
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

    deep(
        fn('start "middle" end', { classPrefix: 'PREFIX', highlight: 'HTML' }),
        {
            errors: [ 'Contains a string at pos 6' ],
            wgsl: '<span class="PREFIXtop">start </span><span '
                + 'class="PREFIXchar-or-string">"middle"</span><span '
                + 'class="PREFIXtop"> end</span>',
        },
        'Typical string literal, with class-prefix and HTML highlighting'
    );

    console.log('OK: All rustToWGSL() tests passed!');
}
