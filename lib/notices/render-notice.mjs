const insertUnderscore = (noticeCode) => {
    let str = noticeCode.toString();
    return `${str[0]}_${str.slice(1)}`;
}

export const renderNotice = (...noticeCodeAndValues) => {
    const [ noticeCode, v0, v1, v2 ] = noticeCodeAndValues;
    if (typeof noticeCode !== 'number') throw RangeError(
        `noticeCode '${noticeCode}' is type '${typeof noticeCode}', not 'number'`);
    if (isNaN(noticeCode)) throw RangeError(
        `noticeCode is NaN (not a number)`);
    if ((noticeCode % 1) !== 0) throw RangeError(
        `noticeCode ${noticeCode} is not an integer`);
    if (noticeCode < 1_0000 || noticeCode > 4_9999) throw RangeError(
        `noticeCode ${noticeCode} is not between 1_0000 and 4_9999`);

    switch (noticeCode) {

        // Info.
        case 2_2511: {
            const [ tokenIndex, currPos, len ] = [ v0, v1, v2 ];
            return `Token #${tokenIndex} at position ${currPos} contains ${len} `
                + `‘rare’ whitespace character${len === 1 ? '' : 's'}. `
                + 'Valid, but discouraged';
        }

        // Error.
        case 4_6177: return 'Unterminated block comment';
        case 4_8591: return 'Unterminated char literal';
        case 4_9122: return 'Unterminated string literal';

        // Not recognised.
        default: throw RangeError(
            `noticeCode ${insertUnderscore(noticeCode)} not recognised`);
    }
};
