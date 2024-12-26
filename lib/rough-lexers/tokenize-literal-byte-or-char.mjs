import {
    isLiteralByteAndGetEndPos,
    isLiteralCharAndGetEndPos,
} from './is-literal-byte-or-char.mjs';

const tokenize = (lex, endPos, kind) => {
    const { currPos, source, tokens } = lex;
    const token = {
        kind,
        chars: source.slice(currPos, endPos).split(''),
        start: currPos,
    };
    tokens.push(token);
    lex.currChar = source[endPos];
    lex.currPos = endPos;
    lex.nextChar = source[endPos + 1];
};

// Tokenizes a literal byte or char.
export const tokenizeLiteralByteOrChar = (lex) => {
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
