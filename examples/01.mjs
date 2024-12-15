import { rustToWGSL } from '../rust-to-wgsl.mjs';

const rust = `
// Inline comment
/* Block
   comment */
`;

/** #### 1. Inline and block comments
 * - Comments are basically the same in Rust and WGSL
 * - TODO deal with nested block comments (allowed in rs, but probably not WGSL)
 */
export const example_01 = () => rustToWGSL(rust);

// Run and log the example immediately, if this file was called directly by Node.js.
if (
    typeof process === 'object' && // is probably Node
    process.argv[1] && // has a 2nd item...
    process.argv[1][0] === '/' && // ...which starts "/"
    import.meta.url && // has a current filename...
    import.meta.url.slice(0, 8) === 'file:///' && // ...which starts "file:///"
    process.argv[1] === decodeURIComponent(import.meta.url).slice(7) // 
) console.log(`rust:\n${rust}\nwgsl:\n${example_01()}\n`);
