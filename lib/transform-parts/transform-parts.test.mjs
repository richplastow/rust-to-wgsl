import { deepStrictEqual as deep } from 'node:assert';
import { transformParts as fn } from './transform-parts.mjs';

export const testTransformParts = () => {
    deep(
        fn([]),
        { errors: [], parts: [] },
        'Empty tokens'
    );

    deep(
        fn([{ kind: 'TBD', chars: '  \t\n\t ', start: 0 }]),
        { errors: [], parts: [{ kind: 'WHITESPACE_MOST', wgsl: '  \t\n\t ' }] },
        'Whitespace inside TBD token'
    );

    deep(
        fn([{ kind: 'TBD', chars: 'let', start: 0 }]),
        { errors: [], parts: [{ kind: 'UNIDENTIFIED', wgsl: 'var' }] },
        'Keyword transformation within TBD token'
    );

    deep(
        fn([{ kind: 'LITERAL_CHAR', chars: "'A'", start: 5 }]),
        {
            errors: ['Contains a char at pos 5'],
            parts: [{ kind: 'CHAR_LITERAL', wgsl: "'A'" }]
        },
        'Char literal detection'
    );

    console.log('OK: All transformParts() tests passed!');
}
