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
        fn([{ kind: 'WHITESPACE', rust: '  \t\n\t '.split('') }]),
        [{ kind: 'WHITESPACE', wgsl: '  \t\n\t ' }],
        'Just whitespace'
    );

    deep(
        fn([{ kind: 'KEYWORD', pos: 13, rust: [ 'l', 'e', 't' ] }]),
        [{ kind: 'KEYWORD', wgsl: 'var' }],
        'Just whitespace'
    );

    console.log('OK: All transformParts() tests passed!');
}
