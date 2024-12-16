import { rustToThreeParts } from './lib/rust-to-three-parts.mjs';

export { rust01 } from './examples/code-01.mjs'
export { rust02 } from './examples/code-02.mjs'

const keywordChars = new Set(['l','e','t']);
const isKeywordChar = (char) => keywordChars.has(char);

const topToWGSL = (rust) => {
    const wgsl = [];
    let token = []; // characters building the current token

    for (let i=0; i<rust.length; i++) {
        const char = rust[i];

        if (isKeywordChar(char)) {
            token.push(char);
        } else {
            token = token.join('');
            switch (token) {
                case 'let':
                    wgsl.push('var');
                    break;
                default: // not a recognised keyword
                    wgsl.push(token);
            }
            token = [];
            wgsl.push(char);
        }
    }

    return wgsl.join('');
}

/** #### Transforms Rust source code to WebGPU Shading Language (WGSL) source code
 * 
 * @param rust  Rust source code
 * @returns  WGSL source code
 */
export const rustToWGSL = (rust) => {
    const errors = [];
    const wgsl = [];

    const rustParts = rustToThreeParts(rust);

    for (const { depth, kind, rust } of rustParts) {
        switch (kind) {
            case 'TOP':
                wgsl.push(topToWGSL(rust));
                break;
            case 'BLOCK_COMMENT':
                if (depth) errors.push('Unterminated block comment');
                // TODO identify the block
            case 'INLINE_COMMENT':
                wgsl.push(rust.join(''));
                break;
        }
    }

    return {
        errors,
        wgsl: wgsl.join(''),
    };
}
