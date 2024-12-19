const classNames = new Map();
classNames.set('BLOCK_COMMENT', 'comment');
classNames.set('CHAR_LITERAL', 'char-or-string');
classNames.set('UNIDENTIFIED', 'unidentified');
classNames.set('INLINE_COMMENT', 'comment');
classNames.set('KEYWORD', 'keyword');
classNames.set('NUM_BINARY', 'number');
classNames.set('NUM_DECIMAL_FLOAT', 'number');
classNames.set('NUM_DECIMAL_INTEGER', 'number');
classNames.set('NUM_HEX', 'number');
classNames.set('NUM_OCTAL', 'number');
classNames.set('STRING_LITERAL', 'char-or-string');
classNames.set('TYPE_BOTH', 'type-both');
classNames.set('TYPE_RUST', 'type-rust');
classNames.set('TYPE_WGSL', 'type-wgsl');
classNames.set('WHITESPACE', 'whitespace');

/** #### Adds syntax highlighting to WGSL source code
 * 
 * @param {string} wgsl  The WGSL source code, as an array of characters
 * @param {string} kind  'BLOCK_COMMENT', 'STRING_LITERAL', etc
 * @param {object} options  A validated `options` argument, with all fallbacks
 * @returns {string}  The WGSL source code as a string, highlighted appropriately
 */
export const highlightWGSL = (wgsl, kind, options) => {
    const { classPrefix, highlight } = options;

    // Plain text can be returned immediately.
    if (highlight === 'PLAIN') return wgsl;

    // If the last characters are newlines, it’s better to place the "<br />"
    // code after the closing `</span>` tag, not before it.
    let trailingNLs = 0;
    for (let i=wgsl.length-1; i>=0; i--) {
        if (wgsl[i] !== '\n') break; // found the last non-newline character
        trailingNLs++;
    }
    const wgslTrimmed = trailingNLs ? wgsl.slice(0, -trailingNLs) : wgsl;

    // Add syntax highlighting for HTML. Note, ANSI may be supported in future.
    const className = `${classPrefix}${classNames.get(kind)}`;
    const htmlStr = wgslTrimmed.replace(/</g, '&lt;').replace(/\n/g, '<br />');
    const trailingNLsHTML = '<br />'.repeat(trailingNLs);
    return `<span class="${className}">${htmlStr}</span>${trailingNLsHTML}`;
};
