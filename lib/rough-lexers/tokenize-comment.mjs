import { isCommentBlockBegin, isCommentBlockEnd, isCommentLineBegin, isCommentLineEnd } from "./is-comment.mjs";

// Tokenizes a block or line comment.
export const tokenizeCommentAny = (lex) => {
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
export const tokenizeCommentBlock = (lex) => {
    const { currChar, currPos, nextChar, source, tokens } = lex;
    const token = {
        kind: 'COMMENT_BLOCK',
        chars: [currChar, nextChar],
        start: currPos,
    };
    tokens.push(token);

    let pos = currPos + 1;
    let c0 = source[++pos]; // the character after the '*' of '/*'...
    let c1 = source[++pos]; // ...and the character after that
    let depth = 1;
    while (pos < source.length) {
        if (isCommentBlockEnd(c0, c1)) {
            token.chars.push(c0, c1);
            if (depth === 1) {
                break;
            } else {
                depth -= 1;
                c0 = source[++pos];
                c1 = source[++pos];
                continue;
            }
        } else if (isCommentBlockBegin(c0, c1)) {
            token.chars.push(c0, c1);
            depth += 1;
            c0 = source[++pos];
            c1 = source[++pos];
            continue;
        }
        token.chars.push(c0);
        c0 = c1;
        c1 = source[++pos];
    }

    lex.currPos = ++pos;
    lex.currChar = source[pos];
    lex.nextChar = source[pos + 1];
};

// Tokenizes a line comment.
export const tokenizeCommentLine = (lex) => {
    const { currChar, currPos, nextChar, source, tokens } = lex;
    const token = {
        kind: 'COMMENT_LINE',
        chars: [currChar, nextChar],
        start: currPos,
    };
    tokens.push(token);

    let pos = currPos + 2;
    let c0 = source[pos]; // the character after the second '/' of '//'

    // Deal with source code that ends with "... //" and no trailing newline.
    if (pos >= source.length) {
        lex.currPos = pos;
        lex.currChar = undefined;
        lex.nextChar = undefined;
        return;
    }

    while (pos < source.length) {
        if (isCommentLineEnd(c0)) {
            token.chars.push(c0); // the newline at the end of the line comment
            pos += 1;
            break;
        }
        token.chars.push(c0);
        c0 = source[++pos];
    }

    lex.currPos = pos;
    lex.currChar = source[pos];
    lex.nextChar = source[pos + 1];
};
