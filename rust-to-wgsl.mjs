/** #### Transforms Rust source code to WebGPU Shading Language (WGSL) source code
 * 
 * @param rust  Rust source code
 * @returns  WGSL source code
 */
export const rustToWGSL = (rust) => {
    const wgsl = [];
    for (let i=0; i<rust.length; i++) {
        const char = rust[i];
        wgsl.push(char);
    }
    return wgsl.join('');
}
