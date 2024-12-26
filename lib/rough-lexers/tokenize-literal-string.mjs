import { isStringAndGetEndPos } from './is-string.mjs';

// Tokenizes a string literal.
export const tokenizeLiteralString = (lex) => {
    let { currChar, currPos, nextChar, source, tokens } = lex;

    // If the literal string looks basically valid, tokenize it.
    const endPos = isStringAndGetEndPos(currChar, nextChar, currPos, source);
    if (endPos !== false) {
        const token = {
            kind: 'LITERAL_STRING',
            chars: source.slice(currPos, endPos).split(''),
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
        chars: [currChar],
        start: currPos,
    };
    tokens.push(token);

    // For the special case of characters "br", tokenize them as an identifier.
    // TODO - deal with a false positive for a raw byte string
    if (currChar === 'b' && nextChar === 'r') {
        lex.currChar = source[currPos + 2];
        lex.currPos = currPos + 2;
        lex.nextChar = source[currPos + 3];
        token.chars.push(nextChar);
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

// Tokenizes a literal byte or char.
export const tokenizeLiteralByteOrChar = (lex) => {
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
        chars: [currChar],
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
