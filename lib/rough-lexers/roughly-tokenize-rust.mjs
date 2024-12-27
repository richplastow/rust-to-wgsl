import { isCommentAnyBegin } from './is-comment.mjs';
import { isLiteralByteOrCharBegin } from './is-literal-byte-or-char.mjs';
import { isLiteralStringBegin } from './is-literal-string.mjs';
import { tokenizeCommentAny } from './tokenize-comment.mjs';
import { tokenizeLiteralByteOrChar } from './tokenize-literal-byte-or-char.mjs';
import { tokenizeLiteralString } from './tokenize-literal-string.mjs';

// TODO divide into strings, comments and everything else - and then use a cache to speed up the process
export const roughlyTokenizeRust = (source) => {
    // Create the `lex` object, to store the state of the lexer.
    let currChar = source[0]
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

    // Divide into chars, comments, strings and everything else.
    // TODO use cached tokens to speed up the process
    while (currPos < source.length) {
        currChar = lex.currChar;
        currPos = lex.currPos;
        nextChar = lex.nextChar;
        if (isLiteralByteOrCharBegin(currChar, nextChar)) {
            tokenizeLiteralByteOrChar(lex);
        } else if (isCommentAnyBegin(currChar, nextChar)) {
            tokenizeCommentAny(lex);
        } else if (isLiteralStringBegin(currChar, nextChar)) {
            tokenizeLiteralString(lex);
        } else {
            // TODO - capture everything else in a token with kind 'TBD'
            lex.currChar = source[currPos + 1];
            lex.nextChar = source[currPos + 2];
            lex.currPos++;
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
