import { deepEqual as deep } from 'assert';
import { tokenizeLiteralNumber } from './tokenize-literal-number.mjs';

export const testTokenizeLiteralNumber = () => {
    let lex = {
        currChar: '1',
        currPos: 0,
        nextChar: '2',
        notices: [],
        source: '123',
        tokens: []
    };
    tokenizeLiteralNumber(lex);
    deep(lex,
        {
            currChar: undefined,
            currPos: 3,
            nextChar: undefined,
            notices: [],
            source: '123',
            tokens: [ { kind: 'LITERAL_NUMBER', chars: '123'.split(''), start: 0 } ],
        },
        `Just "123" produces a LITERAL_NUMBER token`,
    );

    lex = {
        currChar: '0',
        currPos: 6,
        nextChar: 'x',
        notices: [],
        source: 'start 0x1f end',
        tokens: []
    };
    tokenizeLiteralNumber(lex);
    deep(lex,
        {
            currChar: ' ',
            currPos: 10,
            nextChar: 'e',
            notices: [],
            source: 'start 0x1f end',
            tokens: [ { kind: 'LITERAL_NUMBER', chars: '0x1f'.split(''), start: 6 } ],
        },
        `A hexadecimal number 0x1f produces a LITERAL_NUMBER token`,
    );

    lex = {
        currChar: '0',
        currPos: 0,
        nextChar: 'b',
        notices: [],
        source: '0b_010',
        tokens: []
    };
    tokenizeLiteralNumber(lex);
    deep(lex,
        {
            currChar: undefined,
            currPos: 6,
            nextChar: undefined,
            notices: [],
            source: '0b_010',
            tokens: [ { kind: 'LITERAL_NUMBER', chars: '0b_010'.split(''), start: 0 } ],
        },
        `A binary number 0b_010 produces a LITERAL_NUMBER token`,
    );

    lex = {
        currChar: '0',
        currPos: 12,
        nextChar: 'o',
        notices: [],
        source: 'const oct = 0o755usize;',
        tokens: []
    };
    tokenizeLiteralNumber(lex);
    deep(lex,
        {
            currChar: 'u',
            currPos: 17,
            nextChar: 's',
            notices: [],
            source: 'const oct = 0o755usize;',
            tokens: [ { kind: 'LITERAL_NUMBER', chars: '0o755'.split(''), start: 12 } ],
        },
        `An octal number 0o755 with a type-suffix produces a LITERAL_NUMBER token`,
    );

    lex = {
        currChar: '1',
        currPos: 0,
        nextChar: '.',
        notices: [],
        source: '1.23',
        tokens: []
    };
    tokenizeLiteralNumber(lex);
    deep(lex,
        {
            currChar: undefined,
            currPos: 4,
            nextChar: undefined,
            notices: [],
            source: '1.23',
            tokens: [ { kind: 'LITERAL_NUMBER', chars: '1.23'.split(''), start: 0 } ],
        },
        `A floating-point number 1.23 produces a LITERAL_NUMBER token`,
    );

    console.log('OK: All tokenizeLiteralNumber() tests passed!');
};
