import { isCommentAnyBegin } from './is-comment.mjs';
import { isWhitespaceAny } from './is-whitespace.mjs';
import { tokenizeCommentAny } from './tokenize-comment.mjs';
import { tokenizeWhitespaceAny } from './tokenize-whitespace.mjs';

export const roughlyTokenizeRust = (source) => {
    // Create the `lex` object, to store the state of the lexer.
    const lex = {
        currChar: source[0],
        currPos: 0,
        nextChar: source[1],
        notices: [], // error (4_), warning (3_), info (2_) and debug (1_)
        source: source,
        tokens: [],
    };

    if (isWhitespaceAny(lex.currChar)) {
        tokenizeWhitespaceAny(lex);
    } else if (isCommentAnyBegin(lex.currChar, lex.nextChar)) {
        tokenizeCommentAny(lex);
    }

    // Add an error if a block comment, char or string did not end.
    const lastToken = lex.tokens.at(-1) || { kind: '' };
    switch (lastToken.kind) {
        case 'BLOCK_COMMENT':
            notices.push([4_6177]);
            break;
        case 'CHAR_LITERAL':
            notices.push([4_8591]);
            break;
        case 'STRING_LITERAL':
            notices.push([4_9122]);
            break;
    }

    return {
        notices: lex.notices,
        tokens: lex.tokens,
    };
}