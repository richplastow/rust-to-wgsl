import { deepStrictEqual as deep } from 'assert';
import { rustToWGSL } from '../rust-to-wgsl.mjs';
import { rust02, expectedWGSL02 } from './code-02.mjs';

/** #### 2. Rust’s `let` is equivalent to WGSL’s `var`
 * - TODO deal with similar variable-assignment transformations
 */
export const runExample02 = () => rustToWGSL(rust02);

export const testExample02 = () => {
    deep(runExample02(), { errors: [], wgsl: expectedWGSL02 }, 'Example 02');
    console.log('OK: example02() passed!');
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
    const { errors, wgsl } = runExample02();
    console.log(`rust:\n${rust02}\nwgsl:\n${wgsl}\nerrors: ${errors.length}`);
}
