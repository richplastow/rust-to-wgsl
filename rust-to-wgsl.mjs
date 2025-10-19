import { highlightWGSL } from './lib/highlight-wgsl/highlight-wgsl.mjs';
import { renderNotice } from './lib/notices/render-notice.mjs';
import { roughlyTokenizeRust } from './lib/rough-lexers/roughly-tokenize-rust.mjs';
import { transformParts } from './lib/transform-parts/transform-parts.mjs';

// Exports used by 'Rust to WGSL Playground' as presets.
export { rust01 } from './examples/code-01.mjs'
export { rust02 } from './examples/code-02.mjs'
export { rust03 } from './examples/code-03.mjs'
export { rust04 } from './examples/code-04.mjs'

const validHighlight = new Set([ 'PLAIN', 'HTML' ]);

/** #### Transforms Rust source code to WebGPU Shading Language (WGSL) source code
 * 
 * @param {string} rust  Rust source code
 * @param {object} [options={}]  Configures the response
 * @returns  WGSL source code, along with an array of error messages
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

    // Divide the Rust source code into tokens such as comments, strings, chars
    // and "to be determined" code blocks.
    const { notices, tokens } = roughlyTokenizeRust(rust);
    for (const notice of notices) {
        errors.push(renderNotice(...notice));
    }

    const {
        errors: transformationErrors,
        parts: transformedParts,
    } = transformParts(tokens, defaultedOptions);
    errors.push(...transformationErrors);

    // TODO maybe find a more elegant way to ensure final newline... this suggests a problem with transformParts() or roughlyTokenizeRust()
    if (rust.endsWith('\n')) {
        const lastPart = transformedParts.at(-1);
        if (!lastPart || !lastPart.wgsl.endsWith('\n')) {
            transformedParts.push({
                kind: 'WHITESPACE_MOST',
                wgsl: '\n',
            });
        }
    }

    const wgslParts = [];
    for (const { kind, wgsl } of transformedParts) {
        wgslParts.push(highlightWGSL(wgsl, kind, defaultedOptions));
    }

    return {
        errors,
        wgsl: wgslParts.join(''),
    };
}
