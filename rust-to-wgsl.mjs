import { rustToBasicParts } from './lib/rust-to-basic-parts.mjs';
import { highlightWGSL } from './lib/highlight-wgsl.mjs';
import { topToWGSL } from './lib/top-to-wgsl.mjs';

// Exports used by 'Rust to WGSL Playground' as presets.
export { rust01 } from './examples/code-01.mjs'
export { rust02 } from './examples/code-02.mjs'
export { rust03 } from './examples/code-03.mjs'
export { rust04 } from './examples/code-04.mjs'

const validHighlight = new Set([ 'PLAIN', 'HTML' ]);

/** #### Transforms Rust source code to WebGPU Shading Language (WGSL) source code
 * 
 * @param rust  Rust source code
 * @param options  Configures the response
 * @returns  WGSL source code
 */
export const rustToWGSL = (rust, options = {}) => {
    const xpx = 'rustToWGSL(): Invalid'; // exception prefix

    // Validate argument types.
    if (typeof rust !== 'string') throw RangeError(
        `${xpx} rust argument type '${typeof rust}', should be 'string'`);
    if (typeof options !== 'object') throw RangeError(
        `${xpx} options type '${typeof options}', should be 'object', if present`);

    // Validate `options`, and fall back to defaults.
    const defaultedOptions = {
        classPrefix: '',
        highlight: 'PLAIN',
        ...options,
    };
    const { classPrefix, highlight } = defaultedOptions;
    if (typeof classPrefix !== 'string') throw RangeError(
        `${xpx} options.classPrefix type '${typeof classPrefix}', should be 'string'`);
    if (!validHighlight.has(highlight)) throw RangeError(
        `${xpx} options.highlight '${highlight}', use 'PLAIN' or 'HTML'`);

    const errors = [];
    const wgsl = [];

    // Find comments, chars and strings in the raw Rust source code. Other code
    // is lumped together and given the "TOP" kind.
    const rustParts = rustToBasicParts(rust);

    for (const { kind, pos, rust } of rustParts) {

        // Comments, chars and strings can be sent for syntax highlighting
        // straight away. Other code will need to be parsed and highlighted
        // in more detail using topToWGSL().
        if (kind === 'TOP') {
            wgsl.push(topToWGSL(rust, defaultedOptions));
        } else {
            wgsl.push(highlightWGSL(rust, defaultedOptions, kind));
        }

        // Chars and strings are not allowed in WGSL, so add an error.
        if (kind === 'CHAR_LITERAL') {
            errors.push(`Contains a char at pos ${pos}`);
        } else if (kind === 'STRING_LITERAL') {
            errors.push(`Contains a string at pos ${pos}`);
        }
    }

    // Add an error if a block comment, char or string was not ended correctly.
    switch (rustParts[rustParts.length-1].kind) {
        case 'BLOCK_COMMENT':
            errors.push('Unterminated block comment');
            break;
        case 'CHAR_LITERAL':
            errors.push('Unterminated char literal');
            break;
        case 'STRING_LITERAL':
            errors.push('Unterminated string literal');
            break;
    }

    return {
        errors,
        wgsl: wgsl.join(''),
    };
}
