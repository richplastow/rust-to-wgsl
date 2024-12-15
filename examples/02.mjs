import { rustToWGSL } from '../rust-to-wgsl.mjs';

const rust = `
let a: u32 = 1;
let b: u32 = 2;
let c = a + b;
`;

/** #### 2. Simple variable assignment
 * - In this case, no change is needed to the Rust source code
 * - TODO deal with similar examples which DO need transformation
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
