import { deepStrictEqual as deep } from 'assert';
import { rustToWGSL } from '../rust-to-wgsl.mjs';
import { rust04, expectedWGSL04 } from './code-04.mjs';

/** #### 3. Rust strings have no WGSL equivalent */
export const runExample04 = () => rustToWGSL(rust04);

export const testExample04 = () => {
    deep(runExample04(), {
        errors: [
            'Contains a string at pos 8',
            'Contains a string at pos 149',
            'Contains a string at pos 182',
        ],
        wgsl: expectedWGSL04
    }, 'Example 04');
    console.log('OK: example04() passed!');
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
    const { errors, wgsl } = runExample04();
    console.log(`rust:\n${rust04}\nwgsl:\n${wgsl}\nerrors: ${errors.length}`);
}
