const classNames = new Map();
classNames.set('TOP', 'top');
classNames.set('BLOCK_COMMENT', 'comment');
classNames.set('INLINE_COMMENT', 'comment');
classNames.set('CHAR_LITERAL', 'char-or-string');
classNames.set('STRING_LITERAL', 'char-or-string');

/** #### Adds syntax highlighting to WGSL source code
 * 
 * @param {string[]} wgslChars  The WGSL source code, as an array of characters
 * @param {object} options  A validated `options` argument, with all fallbacks
 * @param {string} kind  'BLOCK_COMMENT', 'STRING_LITERAL', etc
 * @returns {string}  The WGSL source code as a string, highlighted appropriately
 */
export const highlightWGSL = (wgslChars, options, kind) => {
    const { classPrefix, highlight } = options;

    // Plain text can be returned immediately.
    const wgslStr = wgslChars.join('');
    if (highlight === 'PLAIN') return wgslStr;

    // If the last characters are newlines, it’s better to place the "<br />"
    // code after the closing `</span>` tag, not before it.
    let trailingNLs = 0;
    for (let i=wgslStr.length-1; i>=0; i--) {
        if (wgslStr[i] !== '\n') break; // found the last non-newline character
        trailingNLs++;
    }
    const wgslTrimmed = trailingNLs ? wgslStr.slice(0, -trailingNLs) : wgslStr;

    // Add syntax highlighting for HTML. Note, ANSI may be supported in future.
    const className = `${classPrefix}${classNames.get(kind)}`;
    const htmlStr = wgslTrimmed.replace(/</g, '&lt;').replace(/\n/g, '<br />');
    const trailingNLsHTML = '<br />'.repeat(trailingNLs);
    return `<span class="${className}">${htmlStr}</span>${trailingNLsHTML}`;
};
