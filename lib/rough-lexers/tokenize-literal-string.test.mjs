import { deepEqual as deep } from 'assert';
import { tokenizeLiteralString } from './tokenize-literal-string.mjs';

export const testTokenizeLiteralString = () => {
    let lex = {
        currChar: '"',
        currPos: 0,
        nextChar: 'h',
        notices: [],
        source: '"hello"',
        tokens: []
    };
    tokenizeLiteralString(lex);
    deep(lex,
        {
            currChar: undefined,
            currPos: 7,
            nextChar: undefined,
            notices: [],
            source: '"hello"',
            tokens: [ { kind: 'LITERAL_STRING', chars: '"hello"', start: 0 } ],
        },
        `Just "hello" produces a LITERAL_STRING token`,
    );

    lex = {
        currChar: 'b',
        currPos: 9,
        nextChar: 'r',
        notices: [],
        source: 'let hi = br"hello"; // ok',
        tokens: []
    };
    tokenizeLiteralString(lex);
    deep(lex,
        {
            currChar: ';',
            currPos: 18,
            nextChar: ' ',
            notices: [],
            source: 'let hi = br"hello"; // ok',
            tokens: [ { kind: 'LITERAL_STRING', chars: 'br"hello"', start: 9 } ],
        },
        `A raw byte string br"hello" produces a LITERAL_STRING token`,
    );

    lex = {
        currChar: 'b',
        currPos: 0,
        nextChar: 'r',
        notices: [],
        source: 'br###"mismatch"##',
        tokens: []
    };
    tokenizeLiteralString(lex);
    deep(lex,
        {
            currChar: '#',
            currPos: 2,
            nextChar: '#',
            notices: [],
            source: 'br###"mismatch"##',
            tokens: [ { kind: 'IDENTIFIER', chars: 'br', start: 0 } ],
        },
        `Mismatched raw hashes produces a 'br' IDENTIFIER token`,
    );

    lex = {
        currChar: 'r',
        currPos: 6,
        nextChar: '#',
        notices: [],
        source: 'start r#"mismatch"## end',
        tokens: []
    };
    tokenizeLiteralString(lex);
    deep(lex,
        {
            currChar: '#',
            currPos: 7,
            nextChar: '"',
            notices: [],
            source: 'start r#"mismatch"## end',
            tokens: [ { kind: 'IDENTIFIER', chars: 'r', start: 6 } ],
        },
        `Mismatched raw hashes produces an 'r' IDENTIFIER token`,
    );

    lex = {
        currChar: '"',
        currPos: 0,
        nextChar: 'h',
        notices: [],
        source: '"hello',
        tokens: []
    };
    tokenizeLiteralString(lex);
    deep(lex,
        {
            currChar: 'h',
            currPos: 1,
            nextChar: 'e',
            notices: [],
            source: '"hello',
            tokens: [ { kind: 'PUNCTUATION', chars: '"', start: 0 } ],
        },
        `A missing closing quote produces a PUNCTUATION token`,
    );

    console.log('OK: All tokenizeLiteralString() tests passed!');
};
