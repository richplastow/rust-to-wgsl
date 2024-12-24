// Set of the most commonly encountered Pattern_White_Space characters.
const whitespaceMostChars = new Set([
    '\t',    // U+0009 Horizontal Tab
    '\n',    // U+000A Line Feed, aka Newline
    ' ',     // U+0020 Space
]);

// Set of the less common Pattern_White_Space characters, which Rust treats the
// same as space, tab and newline.
const whitespaceRareChars = new Set([
    '\u000B',// U+000B Vertical Tab
    '\u000C',// U+000C Form Feed
    '\r',    // U+000D Carriage Return
    '\u0085',// U+0085 Next Line
    '\u200E',// U+200E Left-to-Right Mark
    '\u200F',// U+200F Right-to-Left Mark
    '\u2028',// U+2028 Line Separator
    '\u2029' // U+2029 Paragraph Separator
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
export const isWhitespaceAny = (char) => isWhitespaceMost(char) || isWhitespaceRare(char);
