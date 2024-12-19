import { deepStrictEqual as deep } from 'assert';
import { transformParts } from './transform-parts.mjs';

const fn = (parsedParts) => transformParts(parsedParts).parts;

export const testTransformParts = () => {
    deep(
        fn([]),
        [],
        'Empty WGSL, PLAIN'
    );

    deep(
        fn([{ kind: 'WHITESPACE_MOST', rust: '  \t\n\t '.split('') }]),
        [{ kind: 'WHITESPACE_MOST', wgsl: '  \t\n\t ' }],
        'Just commonly encountered whitespace'
    );

    deep(
        fn([{ kind: 'KEYWORD', pos: 13, rust: [ 'l', 'e', 't' ] }]),
        [{ kind: 'KEYWORD', wgsl: 'var' }],
        'Just commonly encountered whitespace'
    );

    console.log('OK: All transformParts() tests passed!');
}
