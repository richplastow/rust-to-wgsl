/** #### Detects the pair of characters which begin a Rust byte literal
 *
 * @param {string} char0  The first character - the "b" in `b'H'`
 * @param {string} char1  The second character - the first "'" in `b'H'`
 * @returns {boolean}  `true` if the pair of characters begins a literal char
 */
export const isLiteralByteBegin = (char0, char1) =>
    char0 === 'b' && char1 === "'";

/** #### Detects the single-quote character (begins a Rust char literal)
 *
 * @param {string} char0  The character - must be a single-quote "'"
 * @returns {boolean}  `true` if the character begins a char literal
 */
export const isLiteralCharBegin = (char0) =>
    char0 === "'";

/** #### Detects a pair of characters which begin a Rust byte or char literal
 *
 * In Rust, `b'H'` is a byte literal, `'H'` is a char literal.
 *
 * @param {string} char0  The first character - the "'" in `'H'` or "b" in `b'H'`
 * @param {string} char1  The second character - the first "'" in `b'H'`
 * @returns {boolean}  `true` if the pair of characters begins a literal char
 */
export const isLiteralByteOrCharBegin = (char0, char1) =>
    isLiteralCharBegin(char0) || isLiteralByteBegin(char0, char1);

/** #### Detects the single-quote character (ends a Rust byte or char literal)
 *
 * @param {string} char0  The character - must be a single-quote "'"
 * @returns {boolean}  `true` if the character ends a byte or char literal
 */
export const isLiteralByteOrCharEnd = (char0) =>
    char0 === "'";

/** #### Detects a Rust byte or char literal, and returns its end position
 *
 * @param {string} char0  The first character - the "'" in `'H'` or "b" in `b'H'`
 * @param {string} char1  The second character - the first "'" in `b'H'`
 * @param {string} source  The Rust source code
 * @param {number} currPos  The current position in the source code, at `char0`
 * @returns {number|boolean}  The end position if a byte or char, or otherwise `false`
 */
export const isLiteralByteOrCharAndGetEndPos = (char0, char1, source, currPos) => {
    if (isLiteralCharBegin(char0))
        return isLiteralCharAndGetEndPos(char0, currPos, source);

    if (isLiteralByteBegin(char0, char1))
        return isLiteralByteAndGetEndPos(char0, char1, currPos, source);

    return false;
}

/** #### Detects a Rust byte literal, and returns its end position
 * 
 * @param {string} char0  The first character - the "b" in `b'H'`
 * @param {string} char1  The second character - the first "'" in `b'H'`
 * @param {number} currPos  The current position in the source code, at `char0`
 * @param {string} source  The Rust source code
 * @returns {number|boolean}  The end position if a byte, or otherwise `false`
 */
export const isLiteralByteAndGetEndPos = (char0, char1, currPos, source) => {

    // Verify that char0 is "b" and char1 is "'".
    if (!isLiteralByteBegin(char0, char1)) return false;

    const char2 = source[currPos + 2];
    const char3 = source[currPos + 3];
    if (!char3) return false; // source too short to be a byte

    // Deal with the most typical case first - a simple byte, like `b'H'`.
    if (char2 !== '\\') {
        return char3 === "'" ? currPos + 4 : false;
    }

    // `char2` is a backslash, so the byte must be an escaped character.
    // Deal with a less typical case - an 8-bit ‘byte escape’, eg `b'\xFF'`.
    if (char3 === 'x') {
        if (!source[currPos + 6]) return false; // too short for a byte escape
        const chars4To6 = source.slice(currPos + 4, currPos + 7);
        if (!/^[0-9a-fA-F]{2}'$/.test(chars4To6)) return false;
        return currPos + 7;
    }

    // Deal with non-hex escaped characters, eg `b'\n'` or `b'\"'`.
    // https://doc.rust-lang.org/reference/tokens.html#byte-escapes
    // https://doc.rust-lang.org/reference/tokens.html#quote-escapes
    const char4 = source[currPos + 4];
    if (!char4) return false; // source too short
    switch (char3) {
        case 'n': case 'r': case 't': case '\\': case '0': case "'": case '"':
            if (char4 === "'") return currPos + 5;
    }

    return false;
}

/** #### Detects a Rust char literal, and returns its end position
 * 
 * @param {string} char0  The character - must be a single-quote "'"
 * @param {number} currPos  The current position in the source code, at `char0`
 * @param {string} source  The Rust source code
 * @returns {number|boolean}  The end position if a char, or otherwise `false`
 */
export const isLiteralCharAndGetEndPos = (char0, currPos, source) => {
    if (!isLiteralCharBegin(char0)) return false;

    const char1 = source[currPos + 1];
    const char2 = source[currPos + 2];
    if (!char2) return false; // source too short

    // Deal with the most typical case first - a simple char, like `'H'`.
    if (char1 !== '\\')
        return char2 === "'" ? currPos + 3 : false;

    // `char1` is a backslash, so the char must be an escaped character.
    // Deal with a less typical case - a 7-bit ‘ASCII escape’, eg `b'\x7F'`.
    if (char2 === 'x') {
        if (!source[currPos + 5]) return false; // too short for a byte escape
        const chars3To5 = source.slice(currPos + 3, currPos + 6);
        if (!/^[0-7][0-9a-fA-F]'$/.test(chars3To5)) return false;
        return currPos + 6;
    }

    // Deal with non-hex escaped characters, eg `'\n'` or `'\"'`.
    // https://doc.rust-lang.org/reference/tokens.html#byte-escapes
    // https://doc.rust-lang.org/reference/tokens.html#quote-escapes
    const char3 = source[currPos + 3];
    if (!char3) return false; // source too short
    switch (char2) {
        case 'n': case 'r': case 't': case '\\': case '0': case "'": case '"':
            if (char3 === "'") return currPos + 4;
    }

    // Deal with unicode escapes like `'\u{1F600}'`. Note that chars like
    // `'\u{}'` `'\u{XYZ}'` and `'\u{110000}'` are invalid.
    if (char2 === 'u' && char3 === '{') {
        let pos = currPos + 4;
        let char = source[pos];
        while (char && char !== '}') {
            char = source[++pos];
            // TODO handle invalid unicode escapes
        }
        if (char === '}' && source[pos + 1] === "'") return pos + 2;
    }

    return false;
}