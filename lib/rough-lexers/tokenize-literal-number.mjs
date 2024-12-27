import { isLiteralNumberAndGetEndPos } from './is-literal-number.mjs';

// Tokenizes a number literal.
export const tokenizeLiteralNumber = (lex) => {
    const { currChar, currPos, nextChar, source, tokens } = lex;

    // If the literal number looks basically valid, tokenize it.
    const endPos = isLiteralNumberAndGetEndPos(currChar, nextChar, currPos, source);
    if (endPos !== false) {
        const token = {
            kind: 'LITERAL_NUMBER',
            chars: source.slice(currPos, endPos).split(''),
            start: currPos,
        };
        tokens.push(token);
        lex.currChar = source[endPos];
        lex.currPos = endPos;
        lex.nextChar = source[endPos + 1];
        return;
    }

    // Otherwise, mark this as a non-number token, and let the caller move on to
    // the next character.
    const token = {
        chars: [currChar],
        start: currPos,
    };
    tokens.push(token);

    lex.currChar = source[currPos + 1];
    lex.currPos = currPos + 1;
    lex.nextChar = source[currPos + 2];
    token.kind = 'IDENTIFIER';
};
