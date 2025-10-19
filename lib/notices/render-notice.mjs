const insertUnderscore = (noticeCode) => {
    let str = noticeCode.toString();
    return `${str[0]}_${str.slice(1)}`;
}

/** #### Converts a notice code (and optional values) to a human-readable string
 * @param {number} noticeCode  error (4_), warning (3_), info (2_) and debug (1_)
 * @param {...(boolean | number | string)} noticeValues
 * @returns {string}
*/
export const renderNotice = (noticeCode, ...noticeValues) => {
    if (typeof noticeCode !== 'number') throw RangeError(
        `noticeCode '${noticeCode}' is type '${typeof noticeCode}', not 'number'`);
    if (isNaN(noticeCode)) throw RangeError(
        `noticeCode is NaN (not a number)`);
    if ((noticeCode % 1) !== 0) throw RangeError(
        `noticeCode ${noticeCode} is not an integer`);
    if (noticeCode < 1_0000 || noticeCode > 4_9999) throw RangeError(
        `noticeCode ${noticeCode} is not between 1_0000 and 4_9999`);

    // TODO validate that all values are of expected type for each noticeCode
    const [ v0, v1, v2 ] = noticeValues;

    switch (noticeCode) {

        // Error.
        case 4_6177: return 'Unterminated block!!! comment';
        case 4_8591: return 'Unterminated char!!! literal'; // TODO NEXT
        case 4_9122: return 'Unterminated string!!! literal'; // TODO NEXT

        // Warning.
        // (none yet)

        // Info.
        case 2_2511: {
            const [ tokenIndex, currPos, len ] = [ v0, v1, v2 ];
            return `Token #${tokenIndex} at position ${currPos} contains ${len} `
                + `‘rare’ whitespace character${len === 1 ? '' : 's'}. `
                + 'Valid, but discouraged';
        }

        // Debug.
        // (none yet)

        // Not recognised.
        default: throw RangeError(
            `noticeCode ${insertUnderscore(noticeCode)} not recognised`);
    }
};
