import { strictEqual as eq, deepStrictEqual as deep } from 'assert';
import { tokenizeWhitespaceAny, tokenizeWhitespaceMost, tokenizeWhitespaceRare } from './tokenize-whitespace.mjs';

const any = tokenizeWhitespaceAny
const most = tokenizeWhitespaceMost
const rare = tokenizeWhitespaceRare

const testTokenizeWhitespaceMost = () => {
    let lex = {
        currChar: ' ',
        currPos: 3,
        errors: [],
        notices: [],
        source: 'abc xyz',
        tokens: [],
    };
    most(lex);
    deep(lex,
        {
            currChar: 'x',
            currPos: 4,
            errors: [],
            notices: [],
            source: 'abc xyz',
            tokens: [ { kind: 'WHITESPACE_MOST', chars: [ ' ' ], start: 3 } ]
        },
        'Produces a WHITESPACE_MOST token containing a single Space character',
    );

    lex = {
        currChar: '\t',
        currPos: 0,
        errors: [],
        notices: [],
        source: '\t\t   \n\n \t\n XYZ',
        tokens: [],
    };
    most(lex);
    deep(lex,
        {
            currChar: 'X',
            currPos: 11,
            errors: [],
            notices: [],
            source: '\t\t   \n\n \t\n XYZ',
            tokens: [ { kind: 'WHITESPACE_MOST', chars: '\t\t   \n\n \t\n '.split(''), start: 0 } ]
        },
        'Produces a WHITESPACE_MOST token containing multiple spaces, tabs and newlines',
    );

    console.log('OK: All tokenizeWhitespaceMost() tests passed!');
}

const testTokenizeWhitespaceRare = () => {
    let lex = {
        currChar: '\u2009',
        currPos: 6,
        errors: [ 'err' ],
        notices: [ 'prev' ],
        source: 'abcdef\u2009uvwxyz',
        tokens: [],
    };
    rare(lex);
    deep(lex,
        {
            currChar: 'u',
            currPos: 7,
            errors: [ 'err' ],
            notices: [ 'prev', 'Token #1 at position 6 contains 1 ‘rare’ whitespace character. Valid, but discouraged' ],
            source: 'abcdef\u2009uvwxyz',
            tokens: [ { kind: 'WHITESPACE_RARE', chars: [ '\u2009' ], start: 6 } ]
        },
        'Produces a WHITESPACE_RARE token containing a single Thin Space character',
    );

    lex = {
        currChar: '\r',
        currPos: 1,
        errors: [],
        notices: [],
        source: 'X\r\u000B\u000C\r\u0085\u200E\u200F\u2028\u2029\r\r',
        tokens: [ 123 ],
    };
    rare(lex);
    deep(lex,
        {
            currChar: undefined,
            currPos: 12,
            errors: [],
            notices: [ 'Token #2 at position 1 contains 11 ‘rare’ whitespace characters. Valid, but discouraged' ],
            source: 'X\r\u000B\u000C\r\u0085\u200E\u200F\u2028\u2029\r\r',
            tokens: [
                123,
                {
                    kind: 'WHITESPACE_RARE',
                    chars: '\r\u000B\u000C\r\u0085\u200E\u200F\u2028\u2029\r\r'.split(''),
                    start: 1,
                }
            ],
        },
        'Produces a WHITESPACE_RARE token containing multiple ‘rare’ whitespace characters',
    );

    console.log('OK: All tokenizeWhitespaceMost() tests passed!');
};

const testTokenizeWhitespaceAny = () => {
    let lex = {
        currChar: '\n',
        currPos: 4,
        errors: [],
        notices: [],
        source: 'abcd\n\n  \t\n\t\u000B\r\u000C\t \nwxyz \r\u2028',
        tokens: [],
    };
    any(lex);
    deep(
        lex,
        {
            currChar: 'w',
            currPos: 17,
            errors: [],
            notices: [ 'Token #2 at position 11 contains 3 ‘rare’ whitespace characters. Valid, but discouraged' ],
            source: 'abcd\n\n  \t\n\t\u000B\r\u000C\t \nwxyz \r\u2028',
            tokens: [
                {
                    kind: 'WHITESPACE_MOST',
                    chars: '\n\n  \t\n\t'.split(''),
                    start: 4
                },
                {
                    kind: 'WHITESPACE_RARE',
                    chars: [ '\x0B', '\r', '\f' ],
                    start: 11
                },
                {
                    kind: 'WHITESPACE_MOST',
                    chars: [ '\t', ' ', '\n' ],
                    start: 14
                }
            ],
        },
        'Produces WHITESPACE_MOST and WHITESPACE_RARE tokens from the contiguous whitespace',
    );

    console.log('OK: All tokenizeWhitespaceAny() tests passed!');
}

export const testTokenizeWhitespace = () => {
    testTokenizeWhitespaceMost();
    testTokenizeWhitespaceRare();
    testTokenizeWhitespaceAny();
};
