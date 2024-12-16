import { rustToWGSL } from '../rust-to-wgsl.mjs';

const rust = `
let a: u32 = 1;
let b: u32 = 2;
let c = a + b;
// let d: u32 = 4;
`;

export const expectedWGSL = `
var a: u32 = 1;
var b: u32 = 2;
var c = a + b;
// let d: u32 = 4;
`;

/** #### 2. Simple variable assignment
 * - Rust’s `let` is equivalent to WGSL’s `var`
 * - TODO deal with similar variable-assignment transformations
 */
export const example_02 = () => rustToWGSL(rust);

// Run and log the example immediately, if this file was called directly by Node.js.
if (
    typeof process === 'object' && // is probably Node
    process.argv[1] && // has a 2nd item...
    process.argv[1][0] === '/' && // ...which starts "/"
    import.meta.url && // has a current filename...
    import.meta.url.slice(0, 8) === 'file:///' && // ...which starts "file:///"
    process.argv[1] === decodeURIComponent(import.meta.url).slice(7) // 
) console.log(`rust:\n${rust}\nwgsl:\n${example_02()}\n`);
