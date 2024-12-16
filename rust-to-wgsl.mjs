import { determineCommentsAndStrings } from './lib/determine-comments-and-strings.mjs';

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
    const wgsl = [];

    const rustParts = determineCommentsAndStrings(rust);

    for (const { kind, rust } of rustParts) {
        switch (kind) {
            case 'TOP':
                wgsl.push(topToWGSL(rust));
                break;
            case 'INLINE_COMMENT':
                wgsl.push(rust.join(''));
                break;
        }
    }

    return wgsl.join('');
}
