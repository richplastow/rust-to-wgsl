/** #### Detects a pair of characters which begin a Rust character literal
 *
 * In Rust, `b'H'` is a byte literal, `'H'` is a char literal.
 *
 * @param {string} char0  The first character - the "'" in `'H'` or "b" in `b'H'`
 * @param {string} char1  The second character - the first "'" in `b'H'`
 * @returns {boolean}  `true` if the pair of characters begins a literal char
 */
export const isLiteralCharBegin = (char0, char1) =>
    char0 === "'" || (char0 === 'b' && char1 === "'");

/** #### Detects the single-quote character, which ends a Rust character literal
 *
 * @param {string} char0  The character - must be a single-quote "'"
 * @returns {boolean}  `true` if the character ends a literal char
 */
export const isLiteralCharEnd = (char0) =>
    char0 === "'";
