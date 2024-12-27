import { isWhitespaceMost, isWhitespaceRare } from './is-whitespace.mjs';

// Tokenizes a sequence of any whitespace characters, common or rare.
export const tokenizeWhitespaceAny = (lex) => {
    let { currChar, currPos, source } = lex;
    while (currPos < source.length) {
        if (isWhitespaceMost(currChar)) {
            tokenizeWhitespaceMost(lex);
            currChar = lex.currChar;
            currPos = lex.currPos;
            continue;
        }
        if (isWhitespaceRare(currChar)) {
            tokenizeWhitespaceRare(lex);
            currChar = lex.currChar;
            currPos = lex.currPos;
            continue;
        }
        break; // not whitespace
    }
};

// Collects a sequence of one or more of the 3 most common whitespace characters
// (space, tab and newline) into a 'WHITESPACE_MOST' token.
export const tokenizeWhitespaceMost = (lex) => {
    const { currChar, currPos, source, tokens } = lex;
    const token = {
        kind: 'WHITESPACE_MOST',
        start: currPos,
    };
    tokens.push(token);

    let pos = currPos;
    let c0 = source[++pos];
    const chars = [currChar];

    while (pos < source.length) {
        if (!isWhitespaceMost(c0)) break;
        chars.push(c0);
        c0 = source[++pos];
    }

    token.chars = chars.join('');
    lex.currChar = c0;
    lex.currPos = pos;
    lex.nextChar = source[lex.currPos + 1];
};

// Collects a sequence of one or more of the 8 ‘rare’ whitespace characters.
export const tokenizeWhitespaceRare = (lex) => {
    const { currChar, currPos, notices, source, tokens } = lex;
    const token = {
        kind: 'WHITESPACE_RARE',
        start: currPos,
    };
    tokens.push(token);

    let pos = currPos;
    let c0 = source[++pos];
    const chars = [currChar];

    while (pos < source.length) {
        if (!isWhitespaceRare(c0)) break;
        chars.push(c0);
        c0 = source[++pos];
    }

    const len = chars.length;
    notices.push([2_2511, tokens.length, currPos, len])

    token.chars = chars.join('');
    lex.currChar = c0;
    lex.currPos = pos;
    lex.nextChar = source[lex.currPos + 1];
};
