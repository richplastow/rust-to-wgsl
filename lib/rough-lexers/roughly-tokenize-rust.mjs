import { isCommentAnyBegin } from './is-comment.mjs';
import { isLiteralByteOrCharBegin } from './is-literal-byte-or-char.mjs';
import { isLiteralStringBegin } from './is-literal-string.mjs';
import { tokenizeCommentAny } from './tokenize-comment.mjs';
import { tokenizeLiteralByteOrChar } from './tokenize-literal-byte-or-char.mjs';
import { tokenizeLiteralString } from './tokenize-literal-string.mjs';

// Divides Rust source code into chars, comments, strings and everything else.
// TODO use a cache to speed up the process
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
        if (!lex.nextChar) {
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
}
