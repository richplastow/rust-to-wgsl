import { deepStrictEqual as deep } from 'assert';
import { tokenizeLiteralByteOrChar } from './tokenize-literal-byte-or-char.mjs';

export const testTokenizeLiteralByteOrChar = () => {
    let lex = {
        currChar: "'",
        currPos: 0,
        nextChar: 'H',
        notices: [],
        source: "'H'",
        tokens: [],
    };
    tokenizeLiteralByteOrChar(lex);
    deep(lex,
        {
            currChar: undefined,
            currPos: 3,
            nextChar: undefined,
            notices: [],
            source: "'H'",
            tokens: [ { kind: 'LITERAL_CHAR', chars: "'H'", start: 0 } ],
        },
        `Just "'H'" produces a LITERAL_CHAR token`,
    );

    lex = {
        currChar: 'b',
        currPos: 11,
        nextChar: "'",
        notices: [],
        source: "let byte = b'\\xFE'; // 254",
        tokens: [],
    };
    tokenizeLiteralByteOrChar(lex);
    deep(lex,
        {
            currChar: ';',
            currPos: 18,
            nextChar: ' ',
            notices: [],
            source: "let byte = b'\\xFE'; // 254",
            tokens: [ { kind: 'LITERAL_BYTE', chars: "b'\\xFE'", start: 11 } ],
        },
        `"let byte = b'\\xFE'; // 254" produces a LITERAL_BYTE token`,
    );

    lex = {
        currChar: "'",
        currPos: 7,
        nextChar: "a",
        notices: [],
        source: "struct 'abc",
        tokens: [],
    };
    tokenizeLiteralByteOrChar(lex);
    deep(lex,
        {
            currChar: "a",
            currPos: 8,
            nextChar: "b",
            notices: [],
            source: "struct 'abc",
            tokens: [ { kind: 'LIFETIME_MARKER', chars: "'", start: 7 } ],
        },
        `"struct 'abc" produces a LIFETIME_MARKER token`,
    );

    lex = {
        currChar: 'b',
        currPos: 4,
        nextChar: "'",
        notices: [],
        source: "abc b'\\xFg'; // g is not a valid hex digit",
        tokens: [],
    };
    tokenizeLiteralByteOrChar(lex);
    deep(lex,
        {
            currChar: "'",
            currPos: 5,
            nextChar: '\\',
            notices: [],
            source: "abc b'\\xFg'; // g is not a valid hex digit",
            tokens: [ { kind: 'IDENTIFIER', chars: 'b', start: 4 } ],
        },
        `A literal byte with an invalid hex digit produces a "b" IDENTIFIER token`,
    );

    console.log('OK: All tokenizeLiteralByteOrChar() tests passed!');
}
