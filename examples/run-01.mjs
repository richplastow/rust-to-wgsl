import { deepStrictEqual as deep } from 'assert';
import { rustToWGSL } from '../rust-to-wgsl.mjs';
import { rust01, expectedWGSL01 } from './code-01.mjs';

/** #### 1. Inline and block comments
 * - Comments are basically the same in Rust and WGSL
 * - TODO double check that nested block comments are allowed in WGSL
 */
export const runExample01 = () => rustToWGSL(rust01);

export const testExample01 = () => {
    deep(runExample01(), { errors: [], wgsl: expectedWGSL01}, 'Example 01');
    console.log('OK: example01() passed!');
};

// Run and log the example immediately, if this file was called directly by Node.js.
if (
    typeof process === 'object' && // is probably Node
    process.argv[1] && // has a 2nd item...
    process.argv[1][0] === '/' && // ...which starts "/"
    import.meta.url && // has a current filename...
    import.meta.url.slice(0, 8) === 'file:///' && // ...which starts "file:///"
    process.argv[1] === decodeURIComponent(import.meta.url).slice(7) // they match
) {
    const { errors, wgsl } = runExample01();
    console.log(`rust:\n${rust01}\nwgsl:\n${wgsl}\nerrors: ${errors.length}`);
}
