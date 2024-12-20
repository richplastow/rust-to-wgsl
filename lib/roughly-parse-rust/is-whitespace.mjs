// Set of the most commonly encountered Pattern_White_Space characters.
const whitespaceMostChars = new Set([
    '\t',    // U+0009 (horizontal tab)
    '\n',    // U+000A (line feed, aka newline)
    ' ',     // U+0020 (space)
]);

// Set of the less common Pattern_White_Space characters, which Rust treats the
// same as space, tab and newline.
const whitespaceRareChars = new Set([
    '\u000B',// U+000B (vertical tab)
    '\u000C',// U+000C (form feed)
    '\r',    // U+000D (carriage return)
    '\u0085',// U+0085 (next line)
    '\u200E',// U+200E (left-to-right mark)
    '\u200F',// U+200F (right-to-left mark)
    '\u2028',// U+2028 (line separator)
    '\u2029' // U+2029 (paragraph separator)
]);

/** #### Detects the most commonly encountered ‘Pattern_White_Space’ characters
 * 
 * These can be passed directly to WGSL without any transformation or special
 * syntax highlighting.
 * 
 * @todo maybe a simple conditional would be more performant?
 * 
 * @param {string} char  A single character
 * @returns {boolean}  `true` if the character is a space, tab or newline
 */
export const isWhitespaceMost = (char) => whitespaceMostChars.has(char);

/** #### Detects the less commonly encountered ‘Pattern_White_Space’ characters
 * 
 * Although these can be passed directly to WGSL without any transformation,
 * special syntax highlighting may be useful.
 * 
 * @param {string} char  A single character
 * @returns {boolean}  `true` if the character is a rare whitespace character
 */
export const isWhitespaceRare = (char) => whitespaceRareChars.has(char);

/** #### Detects any ‘Pattern_White_Space’ character
 * 
 * @param {string} char  A single character
 * @returns {boolean}  `true` if the character is a whitespace character
 */
export const isWhitespace = (char) => isWhitespaceMost(char) || isWhitespaceRare(char);
