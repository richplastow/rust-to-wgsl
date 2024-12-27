/** #### Returns true if the character could start a Rust number literal
 *
 * @param {string} char0  The character, eg `1` in `123`
 * @returns {boolean}  `true` if the character could start a number literal
 */
export const isLiteralNumberBegin = (char0) => {
    return char0 >= '0' && char0 <= '9'; // faster than regexp
};

/** #### Detects a Rust number literal, and returns its end position
 *
 * @param {string} char0  The first character, eg `1` in `123`
 * @param {string} char1  The second character, eg `2` in `123`
 * @param {number} currPos  The current position in the source code, at `char0`
 * @param {string} source  The Rust source code
 * @returns {number|false}  The number’s end position, or `false` if invalid
 */
export const isLiteralNumberAndGetEndPos = (char0, char1, currPos, source) => {
    if (!isLiteralNumberBegin(char0)) return false;

    // Deal with the edge case where `char0` is the source’s last character.
    if (char1 === void 0) return currPos + 1;

    // Detect a binary, octal or hexadecimal number.
    let pos;
    if (char0 === '0') {
        const tests = {
            b: (c) => c === '_' || c === '0' || c === '1',
            o: (c) => c === '_' || (c >= '0' && c <= '7'),
            x: (c) => c === '_' || (c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F')
        };
        const test = tests[char1];
        if (test) {
            pos = currPos + 2;
            let ch = source[pos];
            const digits = [];
            while (test(ch)) {
                digits.push(ch);
                ch = source[++pos]; // will be undefined when the source ends
            }
            if (digits.length === 0) return false; // no digits
            if (digits.every(digit => digit === '_')) return false; // only underscores
            return pos;
        }
    }

    // Detect a decimal number.
    // TODO - exponential notation
    pos = currPos;
    let hasDot = false;
    while (pos < source.length) {
        const char = source[pos];
        if ((char >= '0' && char <= '9') || char === '_') { // faster than regexp
            pos++;
        } else if (char === '.' && !hasDot) {
            hasDot = true;
            pos++;
        } else {
            break;
        }
    }

    return pos;
};
