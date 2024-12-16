import { deepStrictEqual as deep } from 'assert';
import { rustToWGSL } from '../rust-to-wgsl.mjs';
import { rust03, expectedWGSL03 } from './code-03.mjs';

/** #### 3. Rust strings and chars have no WGSL equivalent */
export const runExample03 = () => rustToWGSL(rust03);

export const testExample03 = () => {
    deep(runExample03(), {
        errors: [
            'Contains a string at char 8',
            'Contains a string at char 70',
            'Contains a string at char 106',
        ],
        wgsl: expectedWGSL03
    }, 'Example 03');
    console.log('OK: example03() passed!');
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
    const { errors, wgsl } = runExample03();
    console.log(`rust:\n${rust03}\nwgsl:\n${wgsl}\nerrors: ${errors.length}`);
}
