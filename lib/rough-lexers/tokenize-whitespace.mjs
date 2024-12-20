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
        chars: [currChar],
        start: currPos,
    };
    tokens.push(token);

    let pos = currPos;
    let c0 = source[++pos];
    while (pos < source.length) {
        if (!isWhitespaceMost(c0)) break;
        token.chars.push(c0);
        c0 = source[++pos];
    }

    lex.currPos = pos;
    lex.currChar = c0;
};

// Collects a sequence of one or more of the 8 ‘rare’ whitespace characters.
export const tokenizeWhitespaceRare = (lex) => {
    const { currChar, currPos, notices, source, tokens } = lex;
    const token = {
        kind: 'WHITESPACE_RARE',
        chars: [currChar],
        start: currPos,
    };
    tokens.push(token);

    let pos = currPos;
    let c0 = source[++pos];
    while (pos < source.length) {
        if (!isWhitespaceRare(c0)) break;
        token.chars.push(c0);
        c0 = source[++pos];
    }

    const len = token.chars.length;
    notices.push(`Token #${tokens.length} at position ${currPos} contains `
        + `${len} ‘rare’ whitespace character${len === 1 ? '' : 's'}. `
        + `Valid, but discouraged`);

    lex.currPos = pos;
    lex.currChar = c0;
};
