/** #### Returns true if two characters could start a Rust string literal
 *
 * @param {string} char0  The first character, eg `"` in `"hello"`
 * @param {string} char1  The second character, eg `h` in `"hello"`
 * @returns {boolean}  `true` if the pair of chars could start a literal string
 */
export const isStringBegin = (char0, char1) => {
    switch (true) {
        case char0 === '"': // normal string "..."
        case char0 === 'b' && char1 === '"': // byte string b"..."
        case char0 === 'r' && char1 === '"': // raw string r"..."
        case char0 === 'r' && char1 === '#': // raw string with hashes r#"..."#
        case char0 === 'b' && char1 === 'r': // raw byte string br"..." or br#"..."#
            return true;
        default:
            return false;
    }
};

/** #### Determines whether a substring is a complete Rust string literal
 *
 * @param {string} char0  The first character, eg `"` in `"hello"`
 * @param {string} char1  The second character, eg `h` in `"hello"`
 * @param {number} currPos  The current position in the source code, at `char0`
 * @param {string} source  The Rust source code
 * @returns {number|false}  The string’s end position, or `false` if invalid
 */
export const isStringAndGetEndPos = (char0, char1, currPos, source) => {
    if (!isStringBegin(char0, char1)) return false;

    let pos = currPos;

    // Handle different string prefix types.
    if (char0 === 'b' && char1 === 'r') {
        pos += 2;
    } else if (char0 === 'b' || char0 === 'r') {
        pos += 1;
    }

    // Count start hashes for raw strings (max 255).
    let hashesBefore = 0;
    while (source[pos] === '#' && hashesBefore < 255) {
        hashesBefore++;
        pos++;
    }
    if (source[pos] !== '"') return false;

    pos++;

    // Raw strings (including raw byte strings).
    if (hashesBefore > 0) {
        while (pos < source.length) {
            if (source[pos] === '"') {
                let hashesAfter = 0;
                pos++;
                while (source[pos] === '#' && hashesAfter < 255) {
                    hashesAfter++;
                    pos++;
                }
                if (hashesBefore === hashesAfter) return pos;
            }
            pos++;
        }
        return false;
    }

    // Regular strings and byte strings.
    while (pos < source.length) {
        if (source[pos] === '\\') {
            pos += 2;
            continue;
        }
        if (source[pos] === '"') return pos + 1;
        pos++;
    }

    return false;
};
