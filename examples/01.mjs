import { equal } from 'assert';
import { rustToWGSL } from '../rust-to-wgsl.mjs';

const rust = `
// Inline comment
/* Block
   comment */
/* Nested /* comment */ */
`;

export const expectedWGSL = rust;

/** #### 1. Inline and block comments
 * - Comments are basically the same in Rust and WGSL
 * - TODO double check that nested block comments are allowed in WGSL
 */
export const example01 = () => rustToWGSL(rust);

export const testExample01 = () => {
    equal(example01(), expectedWGSL, 'Example 01');
    console.log('OK: example01() passed!');
};

// Run and log the example immediately, if this file was called directly by Node.js.
if (
    typeof process === 'object' && // is probably Node
    process.argv[1] && // has a 2nd item...
    process.argv[1][0] === '/' && // ...which starts "/"
    import.meta.url && // has a current filename...
    import.meta.url.slice(0, 8) === 'file:///' && // ...which starts "file:///"
    process.argv[1] === decodeURIComponent(import.meta.url).slice(7) // 
) console.log(`rust:\n${rust}\nwgsl:\n${example01()}\n`);
