import { deepStrictEqual as deep } from 'assert';
import {
    tokenizeCommentAny,
    tokenizeCommentBlock,
    tokenizeCommentLine
} from './tokenize-comment.mjs';

const any = tokenizeCommentAny;
const block = tokenizeCommentBlock;
const line = tokenizeCommentLine;

const testTokenizeCommentBlock = () => {
    let lex = {
        currChar: '/',
        currPos: 0,
        nextChar: '*',
        notices: [],
        source: '/**/',
        tokens: [],
    };
    block(lex);
    deep(lex,
        {
            currChar: undefined,
            currPos: 4,
            nextChar: undefined,
            notices: [],
            source: '/**/',
            tokens: [ { kind: 'COMMENT_BLOCK', chars: '/**/', start: 0 } ],
        },
        'Just "/**/" produces a COMMENT_BLOCK token with no chars between "/*" and "*/"',
    );

    lex = {
        currChar: '/',
        currPos: 3,
        nextChar: '*',
        notices: [],
        source: 'abc/**/xyz',
        tokens: [],
    };
    block(lex);
    deep(lex,
        {
            currChar: 'x',
            currPos: 7,
            nextChar: 'y',
            notices: [],
            source: 'abc/**/xyz',
            tokens: [ { kind: 'COMMENT_BLOCK', chars: '/**/', start: 3 } ],
        },
        '"abc/**/xyz" produces a COMMENT_BLOCK token with no chars between "/*" and "*/"',
    );

    lex = {
        currChar: '/',
        currPos: 6,
        nextChar: '*',
        notices: [],
        source: `start /* "not a string" 'x' */ end`,
        tokens: [],
    };
    block(lex);
    deep(lex,
        {
            currChar: ' ',
            currPos: 30,
            nextChar: 'e',
            notices: [],
            source: `start /* "not a string" 'x' */ end`,
            tokens: [ { kind: 'COMMENT_BLOCK', chars: `/* "not a string" 'x' */`, start: 6 } ],
        },
        'A block comment containing quotes produces a single COMMENT_BLOCK (not string or char) token',
    );

    lex = {
        currChar: '/',
        currPos: 6,
        nextChar: '*',
        notices: [],
        source: 'start /* outer /* mid /* inner */\n \t*/*/ end',
        tokens: [],
    };
    block(lex);
    deep(lex,
        {
            currChar: ' ',
            currPos: 40,
            nextChar: 'e',
            notices: [],
            source: 'start /* outer /* mid /* inner */\n \t*/*/ end',
            tokens: [ { kind: 'COMMENT_BLOCK', chars: '/* outer /* mid /* inner */\n \t*/*/', start: 6 } ],
        },
        'A nested block comment produces a single COMMENT_BLOCK token correctly',
    );
}

const testTokenizeCommentLine = () => {
    let lex = {
        currChar: '/',
        currPos: 0,
        nextChar: '/',
        notices: [ 'prev' ],
        source: '//',
        tokens: [],
    };
    line(lex);
    deep(lex,
        {
            currChar: undefined,
            currPos: 2,
            nextChar: undefined,
            notices: [ 'prev' ],
            source: '//',
            tokens: [ { kind: 'COMMENT_LINE', chars: '//', start: 0 } ],
        },
        'Just "//" produces a COMMENT_LINE token with no other tokens or chars',
    );

    lex = {
        currChar: '/',
        currPos: 3,
        nextChar: '/',
        notices: [],
        source: 'abc//\nxyz',
        tokens: [],
    };
    line(lex);
    deep(lex,
        {
            currChar: 'x',
            currPos: 6,
            nextChar: 'y',
            notices: [],
            source: 'abc//\nxyz',
            tokens: [ { kind: 'COMMENT_LINE', chars: '//\n', start: 3 } ],
        },
        '"abc//[NEWLINE]xyz" produces a COMMENT_LINE token with no chars between "//" and the newline',
    );

    lex = {
        currChar: '/',
        currPos: 4,
        nextChar: '/',
        notices: [],
        source: `abc // "def" 'G'`,
        tokens: [ 123 ],
    };
    line(lex);
    deep(lex,
        {
            currChar: undefined,
            currPos: 16,
            nextChar: undefined,
            notices: [],
            source: `abc // "def" 'G'`,
            tokens: [
                123,
                {
                    kind: 'COMMENT_LINE',
                    chars: `// "def" 'G'`,
                    start: 4,
                }
            ],
        },
        'A line comment containing quotes produces a single COMMENT_LINE (not string or char) token',
    );

};

const testTokenizeCommentAny = () => {

    let lex = {
        currChar: '/',
        currPos: 0,
        nextChar: '*',
        notices: [],
        source: '/**//**//**/',
        tokens: [],
    };
    any(lex);
    deep(lex,
        {
            currChar: undefined,
            currPos: 12,
            nextChar: undefined,
            notices: [],
            source: '/**//**//**/',
            tokens: [
                { kind: 'COMMENT_BLOCK', chars: '/**/', start: 0 },
                { kind: 'COMMENT_BLOCK', chars: '/**/', start: 4 },
                { kind: 'COMMENT_BLOCK', chars: '/**/', start: 8 },
            ],
        },
        'Three "/**/" in a row produces three COMMENT_BLOCK tokens',
    );

    lex = {
        currChar: '/',
        currPos: 0,
        nextChar: '/',
        notices: [],
        source: '//\n//\n//\n',
        tokens: [],
    };
    any(lex);
    deep(lex,
        {
            currChar: undefined,
            currPos: 9,
            nextChar: undefined,
            notices: [],
            source: '//\n//\n//\n',
            tokens: [
                { kind: 'COMMENT_LINE', chars: '//\n', start: 0 },
                { kind: 'COMMENT_LINE', chars: '//\n', start: 3 },
                { kind: 'COMMENT_LINE', chars: '//\n', start: 6 },
            ],
        },
        'Three "//[NEWLINE]" in a row produces three COMMENT_LINE tokens',
    );

    lex = {
        currChar: '/',
        currPos: 0,
        nextChar: '/',
        notices: [],
        source: '//\n/**//**///',
        tokens: [],
    };
    any(lex);
    deep(lex,
        {
            currChar: undefined,
            currPos: 13,
            nextChar: undefined,
            notices: [],
            source: '//\n/**//**///',
            tokens: [
                { kind: 'COMMENT_LINE', chars: '//\n', start: 0 },
                { kind: 'COMMENT_BLOCK', chars: '/**/', start: 3 },
                { kind: 'COMMENT_BLOCK', chars: '/**/', start: 7 },
                { kind: 'COMMENT_LINE', chars: '//', start: 11 },
            ],
        },
        'A mix of "/**/" and "//[NEWLINE]" produces COMMENT_BLOCK and COMMENT_LINE tokens',
    );

    lex = {
        currChar: '/',
        currPos: 4,
        nextChar: '/',
        notices: [],
        source: `abc // "def" 'G'\n/** "hij" 'K' */ xyz`,
        tokens: [],
    };
    any(lex);
    deep(
        lex,
        {
            currChar: ' ',
            currPos: 33,
            nextChar: 'x',
            notices: [],
            source: `abc // "def" 'G'\n/** "hij" 'K' */ xyz`,
            tokens: [
                {
                    kind: 'COMMENT_LINE',
                    chars: `// "def" 'G'\n`,
                    start: 4
                },
                {
                    kind: 'COMMENT_BLOCK',
                    chars: `/** "hij" 'K' */`,
                    start: 17
                }
            ],
        },
        'String and char literals inside comments just produce COMMENT_LINE and COMMENT_BLOCK tokens',
    );

}

export const testTokenizeComment = () => {
    testTokenizeCommentBlock();
    testTokenizeCommentLine();
    testTokenizeCommentAny();
    console.log('OK: All tokenizeComment*() tests passed!');
};
