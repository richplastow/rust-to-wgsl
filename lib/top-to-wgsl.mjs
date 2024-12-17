import { highlightWGSL } from "./highlight-wgsl.mjs";

const keywordChars = new Set(['l','e','t']);
const isKeywordChar = (char) => keywordChars.has(char);

/** #### 
 * 
 * @param {*} rust 
 * @param {*} options 
 * @returns 
 */
export const topToWGSL = (rust, options) => {
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

    // TODO highlight numbers differently, etc
    return highlightWGSL(wgsl, options, 'TOP');
}
