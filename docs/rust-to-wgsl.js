var RUST_TO_WGSL = (function (exports) {
    'use strict';

    const classNames = new Map();
    classNames.set('BLOCK_COMMENT', 'comment');
    classNames.set('CHAR_LITERAL', 'char-or-string');
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
    classNames.set('UNIDENTIFIED', 'unidentified');
    classNames.set('WHITESPACE_MOST', 'whitespace-most');
    classNames.set('WHITESPACE_RARE', 'whitespace-rare');

    /** #### Adds syntax highlighting to WGSL source code
     * 
     * @param {string} wgsl  The WGSL source code, as an array of characters
     * @param {string} kind  'BLOCK_COMMENT', 'STRING_LITERAL', etc
     * @param {object} options  A validated `options` argument, with all fallbacks
     * @returns {string}  The WGSL source code as a string, highlighted appropriately
     */
    const highlightWGSL = (wgsl, kind, options) => {
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

    const insertUnderscore = (noticeCode) => {
        let str = noticeCode.toString();
        return `${str[0]}_${str.slice(1)}`;
    };

    const renderNotice = (...noticeCodeAndValues) => {
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
            case 4_8591: return 'Unterminated char!!! literal'; // TODO NEXT
            case 4_9122: return 'Unterminated string literal'; // TODO NEXT

            // Not recognised.
            default: throw RangeError(
                `noticeCode ${insertUnderscore(noticeCode)} not recognised`);
        }
    };

    /** #### Detects a pair of characters which begin a block comment
     * 
     * @param {string} char0  The first character - must be the '/' in '/*'
     * @param {string} char1  The second character - must be the '*' in '/*'
     * @returns {boolean}  `true` if the pair of characters begins a block comment
     */
    const isCommentBlockBegin = (char0, char1) =>
        char0 === '/' && char1 === '*';

    /** #### Detects a pair of characters which end a block comment
     * 
     * @param {string} char0  The first character - must be '*'
     * @param {string} char1  The second character - must be '/'
     * @returns {boolean}  `true` if the pair of characters begins a block comment
     */
    const isCommentBlockEnd = (char0, char1) =>
        char0 === '*' && char1 === '/';

    /** #### Detects a pair of characters which begin a line comment
     * 
     * @param {string} char0  The first character - must be the first '/' in '//'
     * @param {string} char1  The second character - must be the second '/' in '//'
     * @returns {boolean}  `true` if the pair of characters begins a line comment
     */
    const isCommentLineBegin = (char0, char1) =>
        char0 === '/' && char1 === '/';

    /** #### Detects a character which ends a line comment
     * 
     * In Rust, only a newline character or the end of the file ends a line comment.
     * 
     * @param {string} char0  The character - must be a newline
     * @returns {boolean}  `true` if the character ends a line comment
     */
    const isCommentLineEnd = (char0) =>
        char0 === '\n';

    /** #### Detects a pair of characters which begin a comment
     * 
     * @param {string} char0  The first character - must be '/' in '/*' or '//'
     * @param {string} char1  The second character - must be '*' in '/*' or '/' in '//'
     * @returns {boolean}  `true` if the pair of characters begins a comment
     */
    const isCommentAnyBegin = (char0, char1) =>
        (char0 === '/' && char1 === '*') || (char0 === '/' && char1 === '/');

    /** #### Detects the pair of characters which begin a Rust byte literal
     *
     * @param {string} char0  The first character - the "b" in `b'H'`
     * @param {string} char1  The second character - the first "'" in `b'H'`
     * @returns {boolean}  `true` if the pair of chars could start a literal char
     */
    const isLiteralByteBegin = (char0, char1) =>
        char0 === 'b' && char1 === "'";

    /** #### Detects the single-quote character (begins a Rust char literal)
     *
     * @param {string} char0  The character - must be a single-quote "'"
     * @returns {boolean}  `true` if the character could start a literal char
     */
    const isLiteralCharBegin = (char0) =>
        char0 === "'";

    /** #### Detects a pair of characters which begin a Rust byte or char literal
     *
     * In Rust, `b'H'` is a byte literal, `'H'` is a char literal.
     *
     * @param {string} char0  The first character - the "'" in `'H'` or "b" in `b'H'`
     * @param {string} char1  The second character - the first "'" in `b'H'`
     * @returns {boolean}  `true` if the pair of chars begins a literal byte or char
     */
    const isLiteralByteOrCharBegin = (char0, char1) =>
        isLiteralCharBegin(char0) || isLiteralByteBegin(char0, char1);

    /** #### Detects a Rust byte literal, and returns its end position
     * 
     * @param {string} char0  The first character - the "b" in `b'H'`
     * @param {string} char1  The second character - the first "'" in `b'H'`
     * @param {number} currPos  The current position in the source code, at `char0`
     * @param {string} source  The Rust source code
     * @returns {number|false}  The end position if a byte, or otherwise `false`
     */
    const isLiteralByteAndGetEndPos = (char0, char1, currPos, source) => {

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
    };

    /** #### Detects a Rust char literal, and returns its end position
     * 
     * @param {string} char0  The character - must be a single-quote "'"
     * @param {number} currPos  The current position in the source code, at `char0`
     * @param {string} source  The Rust source code
     * @returns {number|false}  The end position if a char, or otherwise `false`
     */
    const isLiteralCharAndGetEndPos = (char0, currPos, source) => {
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
    };

    /** #### Returns true if two characters could start a Rust string literal
     *
     * @param {string} char0  The first character, eg `"` in `"hello"`
     * @param {string} char1  The second character, eg `h` in `"hello"`
     * @returns {boolean}  `true` if the pair of chars could start a literal string
     */
    const isLiteralStringBegin = (char0, char1) => {
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

    /** #### Detects a Rust string literal, and returns its end position
     *
     * @param {string} char0  The first character, eg `"` in `"hello"`
     * @param {string} char1  The second character, eg `h` in `"hello"`
     * @param {number} currPos  The current position in the source code, at `char0`
     * @param {string} source  The Rust source code
     * @returns {number|false}  The string’s end position, or `false` if invalid
     */
    const isLiteralStringAndGetEndPos = (char0, char1, currPos, source) => {
        if (!isLiteralStringBegin(char0, char1)) return false;

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

    // Tokenizes a block or line comment.
    const tokenizeCommentAny = (lex) => {
        let { currChar, currPos, nextChar, source } = lex;
        while (currPos < source.length) {
            if (isCommentBlockBegin(currChar, nextChar)) {
                tokenizeCommentBlock(lex);
                currChar = lex.currChar;
                currPos = lex.currPos;
                nextChar = lex.nextChar;
                continue;
            }
            if (isCommentLineBegin(currChar, nextChar)) {
                tokenizeCommentLine(lex);
                currChar = lex.currChar;
                currPos = lex.currPos;
                nextChar = lex.nextChar;
                continue;
            }
            break; // not whitespace
        }
    };

    // Tokenizes a block comment.
    const tokenizeCommentBlock = (lex) => {
        const { currChar, currPos, nextChar, notices, source, tokens } = lex;
        const token = {
            kind: 'COMMENT_BLOCK',
            start: currPos,
        };
        tokens.push(token);

        let pos = currPos + 1;
        let c0 = source[++pos]; // the character after the '*' of '/*'...
        let c1 = source[++pos]; // ...and the character after that
        let depth = 1;
        const chars = [currChar, nextChar];

        while (pos < source.length) {
            if (isCommentBlockEnd(c0, c1)) {
                chars.push(c0, c1);
                if (depth === 1) {
                    break;
                } else {
                    depth -= 1;
                    c0 = source[++pos];
                    c1 = source[++pos];
                    continue;
                }
            } else if (isCommentBlockBegin(c0, c1)) {
                chars.push(c0, c1);
                depth += 1;
                c0 = source[++pos];
                c1 = source[++pos];
                continue;
            }
            chars.push(c0);
            c0 = c1;
            c1 = source[++pos];
        }

        if (depth > 0 && pos >= source.length) {
            notices.push([4_6177]);
            chars.push(c0);
        }

        token.chars = chars.join('');
        lex.currPos = ++pos;
        lex.currChar = source[pos];
        lex.nextChar = source[pos + 1];
    };

    // Tokenizes a line comment.
    const tokenizeCommentLine = (lex) => {
        const { currChar, currPos, nextChar, source, tokens } = lex;
        const token = {
            kind: 'COMMENT_LINE',
            start: currPos,
        };
        tokens.push(token);

        let pos = currPos + 2;
        let c0 = source[pos]; // the character after the second '/' of '//'
        const chars = [currChar, nextChar];

        while (pos < source.length) {
            if (isCommentLineEnd(c0)) {
                chars.push(c0); // the newline at the end of the line comment
                pos += 1;
                break;
            }
            chars.push(c0);
            c0 = source[++pos];
        }

        token.chars = chars.join('');
        lex.currPos = pos;
        lex.currChar = source[pos];
        lex.nextChar = source[pos + 1];
    };

    const tokenize = (lex, endPos, kind) => {
        const { currPos, source, tokens } = lex;
        const token = {
            kind,
            chars: source.slice(currPos, endPos),
            start: currPos,
        };
        tokens.push(token);
        lex.currChar = source[endPos];
        lex.currPos = endPos;
        lex.nextChar = source[endPos + 1];
    };

    // Tokenizes a literal byte or char.
    const tokenizeLiteralByteOrChar = (lex) => {
        let { currChar, currPos, nextChar, source, tokens } = lex;

        // If the literal char or byte looks basically valid, tokenize it.
        const endPosChar = isLiteralCharAndGetEndPos(currChar, currPos, source);
        if (endPosChar !== false) {
            tokenize(lex, endPosChar, 'LITERAL_CHAR');
            return;
        }
        const endPosByte = isLiteralByteAndGetEndPos(currChar, nextChar, currPos, source);
        if (endPosByte !== false) {
            tokenize(lex, endPosByte, 'LITERAL_BYTE');
            return;
        }

        // Otherwise, mark this as a single-character token, and let the caller move
        // on to the next character.
        const token = {
            chars: currChar,
            start: currPos,
        };
        tokens.push(token);
        lex.currChar = nextChar;
        lex.currPos = currPos + 1;
        lex.nextChar = source[currPos + 2];
        if (currChar === "'") {
            token.kind = 'LIFETIME_MARKER';
        } else {
            token.kind = 'IDENTIFIER';
        }
    };

    // Tokenizes a string literal.
    const tokenizeLiteralString = (lex) => {
        let { currChar, currPos, nextChar, source, tokens } = lex;

        // If the literal string looks basically valid, tokenize it.
        const endPos = isLiteralStringAndGetEndPos(currChar, nextChar, currPos, source);
        if (endPos !== false) {
            const token = {
                kind: 'LITERAL_STRING',
                chars: source.slice(currPos, endPos),
                start: currPos,
            };
            tokens.push(token);
            lex.currChar = source[endPos];
            lex.currPos = endPos;
            lex.nextChar = source[endPos + 1];
            return;
        }

        // Otherwise, mark this as a non-string token, and let the caller move on to
        // the next character.
        const token = {
            chars: currChar,
            start: currPos,
        };
        tokens.push(token);

        // For the special case of characters "br", tokenize them as an identifier.
        // TODO - deal with a false positive for a raw byte string
        if (currChar === 'b' && nextChar === 'r') {
            lex.currChar = source[currPos + 2];
            lex.currPos = currPos + 2;
            lex.nextChar = source[currPos + 3];
            token.chars = 'br';
            token.kind = 'IDENTIFIER';
            return;
        }

        // For all other cases, mark this as a single-character token.
        lex.currChar = nextChar;
        lex.currPos = currPos + 1;
        lex.nextChar = source[currPos + 2];
        if (currChar === '"') {
            token.kind = 'PUNCTUATION'; // TODO - deal with this false positive
        } else { // "b" or "r"
            token.kind = 'IDENTIFIER';
        }
    };

    // Divides Rust source code into chars, comments, strings and everything else.
    // TODO use a cache to speed up the process
    const roughlyTokenizeRust = (source) => {
        // Create the `lex` object, to store the state of the lexer.
        let currChar = source[0];
        let currPos = 0;
        let nextChar = source[1];
        const lex = {
            currChar,
            currPos,
            nextChar,
            notices: [], // error (4_), warning (3_), info (2_) and debug (1_)
            source,
            tokens: [],
        };

        const finalizeTbdChars = () => {
            if (tbdChars) {
                lex.tokens.at(-1).chars = tbdChars.join('');
                tbdChars = false;
            }
        };

        // Divide into chars, comments, strings and everything else.
        // TODO use cached tokens to speed up the process
        let tbdChars = false;
        while (currPos < source.length) {
            currChar = lex.currChar;
            currPos = lex.currPos;
            nextChar = lex.nextChar;
            if (isLiteralByteOrCharBegin(currChar, nextChar)) {
                finalizeTbdChars();
                tokenizeLiteralByteOrChar(lex);
            } else if (isCommentAnyBegin(currChar, nextChar)) {
                finalizeTbdChars();
                tokenizeCommentAny(lex);
            } else if (isLiteralStringBegin(currChar, nextChar)) {
                finalizeTbdChars();
                tokenizeLiteralString(lex);
            } else {
                if (tbdChars) {
                    tbdChars.push(currChar);
                } else {
                    tbdChars = [currChar];
                    lex.tokens.push({
                        kind: 'TBD',
                        chars: tbdChars,
                        start: currPos,
                    });
                }
                lex.currChar = lex.nextChar;
                lex.currPos++;
                lex.nextChar = source[lex.currPos + 1];
            }
            if (lex.currPos >= source.length) {
                finalizeTbdChars();
                break;
            }
        }

        // TODO - restore whitespace tokenization
        // if (isWhitespaceAny(lex.currChar)) {
        //     tokenizeWhitespaceAny(lex);
        // } else if (isCommentAnyBegin(lex.currChar, lex.nextChar)) {
        //     tokenizeCommentAny(lex);
        // } else if (isLiteralByteOrCharBegin(lex.currChar, lex.nextChar)) {
        //     tokenizeLiteralByteOrChar(lex);
        // }

        // Add an error if a block comment, char or string did not end.
        // const lastToken = lex.tokens.at(-1) || { kind: '' };
        // switch (lastToken.kind) {
        //     case 'COMMENT_BLOCK':
        //         notices.push([4_6177]);
        //         break;
        //     case 'CHAR_LITERAL':
        //         notices.push([4_8591]);
        //         break;
        //     case 'STRING_LITERAL':
        //         notices.push([4_9122]);
        //         break;
        // }

        return {
            notices: lex.notices,
            tokens: lex.tokens,
        };
    };

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
    const isWhitespaceMost = (char) => whitespaceMostChars.has(char);

    /** #### Detects the less commonly encountered ‘Pattern_White_Space’ characters
     * 
     * Although these can be passed directly to WGSL without any transformation,
     * special syntax highlighting may be useful.
     * 
     * @param {string} char  A single character
     * @returns {boolean}  `true` if the character is a rare whitespace character
     */
    const isWhitespaceRare = (char) => whitespaceRareChars.has(char);

    const toString = (value) => {
        if (typeof value === 'string') return value;
        if (Array.isArray(value)) return value.join('');
        return '';
    };

    const transformCode = (segment) => segment.replace(/\blet\b/g, 'var');

    const pushPart = (parts, kind, wgsl) => {
        if (!wgsl.length) return;
        parts.push({ kind, wgsl });
    };

    const segmentTbd = (text, parts) => {
        let currentKind = null;
        let buffer = '';

        const flush = () => {
            if (!buffer) return;
            if (currentKind === 'CODE') {
                pushPart(parts, 'UNIDENTIFIED', transformCode(buffer));
            } else {
                pushPart(parts, currentKind, buffer);
            }
            buffer = '';
        };

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            let kind;
            if (isWhitespaceMost(char)) {
                kind = 'WHITESPACE_MOST';
            } else if (isWhitespaceRare(char)) {
                kind = 'WHITESPACE_RARE';
            } else {
                kind = 'CODE';
            }

            if (kind !== currentKind) {
                flush();
                currentKind = kind;
            }

            buffer += char;
        }

        flush();
    };

    const transformParts = (tokens, options = {}) => {
        const errors = [];
        const parts = [];

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (!token) continue;

            const raw = toString(token.chars);
            const { kind, start = 0 } = token;

            switch (kind) {
                case 'COMMENT_BLOCK':
                    pushPart(parts, 'BLOCK_COMMENT', raw);
                    break;
                case 'COMMENT_LINE':
                    pushPart(parts, 'INLINE_COMMENT', raw);
                    break;
                case 'LITERAL_STRING':
                    errors.push(`Contains a string at pos ${start}`);
                    pushPart(parts, 'STRING_LITERAL', raw);
                    break;
                case 'LITERAL_CHAR':
                    errors.push(`Contains a char at pos ${start}`);
                    pushPart(parts, 'CHAR_LITERAL', raw);
                    break;
                case 'LITERAL_BYTE':
                    errors.push(`Contains a char at pos ${start}`);
                    pushPart(parts, 'CHAR_LITERAL', raw);
                    break;
                case 'LIFETIME_MARKER': {
                    if (raw === "'") {
                        const next = tokens[i + 1];
                        const isLifetime =
                            next && next.start === start + raw.length && next.kind === 'IDENTIFIER';
                        if (isLifetime) {
                            pushPart(parts, 'UNIDENTIFIED', transformCode(raw));
                        } else {
                            errors.push(`Contains a char at pos ${start}`);
                            errors.push('Unterminated char literal');
                            pushPart(parts, 'CHAR_LITERAL', raw);
                        }
                    } else {
                        pushPart(parts, 'UNIDENTIFIED', transformCode(raw));
                    }
                    break;
                }
                case 'PUNCTUATION':
                    if (raw === '"') {
                        const prev = tokens[i - 1];
                        const prevRaw = toString(prev?.chars);
                        const escaped = prevRaw.endsWith('\\');
                        if (!escaped) {
                            errors.push(`Contains a string at pos ${start}`);
                            errors.push('Unterminated string literal');
                        }
                        pushPart(parts, 'STRING_LITERAL', raw);
                    } else {
                        pushPart(parts, 'UNIDENTIFIED', transformCode(raw));
                    }
                    break;
                case 'TBD':
                    segmentTbd(raw, parts);
                    break;
                default:
                    pushPart(parts, 'UNIDENTIFIED', transformCode(raw));
                    break;
            }
        }

        return { errors, parts };
    };

    const rust01 =
`// Line comment
/* Block
   comment */
/* Nested /* comment */ */
`;

    const rust02 =
`let a: u32 = 1;
let b: u32 = 2;
let c = a + b;
// let d: u32 = 4;
/** /*/* let e: u32 = 5; */*/ let f: u32 = 5; */
`;

    const rust03 =
`let a = 'A';
// let b = 'B'; commented-out with a line comment
/* let c = 'C'; commented-out with a block comment */
let eAcute = '\\u{c9}';
`;

    const rust04 =
`let a = "Can \\\\ contain \\" backslashes";
// let b = "Commented-out with a line comment";
/* let c = "Commented-out with a block comment"; */
let d = "Not a // line comment";
let e = "Not a /* block */ comment";
`;

    const validHighlight = new Set([ 'PLAIN', 'HTML' ]);

    /** #### Transforms Rust source code to WebGPU Shading Language (WGSL) source code
     * 
     * @param {string} rust  Rust source code
     * @param {object} [options={}]  Configures the response
     * @returns  WGSL source code, along with an array of error messages
     */
    const rustToWGSL = (rust, options = {}) => {
        const xpx = 'rustToWGSL(): Invalid'; // exception prefix

        // Validate argument types.
        if (typeof rust !== 'string') throw RangeError(
            `${xpx} rust argument type '${typeof rust}', should be 'string'`);
        if (typeof options !== 'object') throw RangeError(
            `${xpx} options type '${typeof options}', should be 'object', if present`);

        // Validate `options`, and fall back to defaults.
        const defaultedOptions = {
            classPrefix: '',
            highlight: 'PLAIN',
            ...options,
        };
        const { classPrefix, highlight } = defaultedOptions;
        if (typeof classPrefix !== 'string') throw RangeError(
            `${xpx} options.classPrefix type '${typeof classPrefix}', should be 'string'`);
        if (!validHighlight.has(highlight)) throw RangeError(
            `${xpx} options.highlight '${highlight}', use 'PLAIN' or 'HTML'`);

        const errors = [];

        // Divide the Rust source code into tokens such as comments, strings, chars
        // and "to be determined" code blocks.
        const { notices, tokens } = roughlyTokenizeRust(rust);
        for (const notice of notices) {
            errors.push(renderNotice(...notice));
        }

        const {
            errors: transformationErrors,
            parts: transformedParts
        } = transformParts(tokens, defaultedOptions);
        errors.push(...transformationErrors);

        // TODO maybe find a more elegant way to ensure final newline... this suggests a problem with transformParts() or roughlyTokenizeRust()
        if (rust.endsWith('\n')) {
            const lastPart = transformedParts.at(-1);
            if (!lastPart || !lastPart.wgsl.endsWith('\n')) {
                transformedParts.push({
                    kind: 'WHITESPACE_MOST',
                    wgsl: '\n',
                });
            }
        }

        const wgslParts = [];
        for (const { kind, wgsl } of transformedParts) {
            wgslParts.push(highlightWGSL(wgsl, kind, defaultedOptions));
        }

        return {
            errors,
            wgsl: wgslParts.join(''),
        };
    };

    exports.rust01 = rust01;
    exports.rust02 = rust02;
    exports.rust03 = rust03;
    exports.rust04 = rust04;
    exports.rustToWGSL = rustToWGSL;

    return exports;

})({});
