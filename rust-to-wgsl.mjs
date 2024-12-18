import { roughlyParseRust } from './lib/roughly-parse-rust.mjs';
import { highlightWGSL } from './lib/highlight-wgsl.mjs';
import { transformParts } from './lib/transform-parts.mjs';

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

    // Divide the Rust source code into parts of different kinds, for example
    // 'BLOCK_COMMENT', 'KEYWORD' and 'NUM_HEX'.
    const {
        errors: parseErrors,
        parts: parsedParts
    } = roughlyParseRust(rust);
    errors.push(...parseErrors);

    const {
        errors: transformationErrors,
        parts: transformedParts
    } = transformParts(parsedParts, defaultedOptions);
    errors.push(...transformationErrors);

    const wgslParts = [];
    for (const { kind, wgsl } of transformedParts) {
        wgslParts.push(highlightWGSL(wgsl, defaultedOptions, kind));
    }

    // Add an error if a block comment, char or string was not ended correctly.
    if (transformedParts.length)
        switch (transformedParts.at(-1).kind) {
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
        wgsl: wgslParts.join(''),
    };
}
