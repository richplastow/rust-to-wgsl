import assert, { strictEqual as eq, deepStrictEqual as deep } from 'assert';
import { renderNotice } from '../notices/render-notice.mjs';
import { roughlyTokenizeRust } from './roughly-tokenize-rust.mjs';

// Calls roughlyTokenizeRust() when no notices are expected.
const ok = (source) => {
    const { notices, tokens } = roughlyTokenizeRust(source);
    eq(notices.length, 0, `There should be no notices, not ${notices.length}`);
    return tokens;
};

// Calls roughlyTokenizeRust() when one or more notices are expected.
const notice = (source, ...expectedNotices) => {
    const { notices, tokens } = roughlyTokenizeRust(source);
    eq(
        notices.length,
        expectedNotices.length,
        `Should be ${expectedNotices.length} notice(s), not ${notices.length}`
    );
    for (const notice of notices) {
        const renderedNotice = renderNotice(...notice);
        assert(
            expectedNotices.includes(renderedNotice),
            `Notice "${renderedNotice}" not found`
        );
    }
    return tokens;
};

export const testRoughlyTokenizeRust = () => {
    deep(
        ok(''),
        [],
        'An empty string produces no tokens'
    );

    deep(
        ok(' '),
        [ { kind: 'TBD', chars: ' ', start: 0 } ],
        'A single space character produces a TBD token'
    );

    deep(
        ok(
            `b'B'"Simple string"'C'/** Block comment */"Another string"// Line comment`,
        ),
        [
            { kind: 'LITERAL_BYTE', chars: "b'B'", start: 0 },
            { kind: 'LITERAL_STRING', chars: '"Simple string"', start: 4 },
            { kind: 'LITERAL_CHAR', chars: "'C'", start: 19 },
            { kind: 'COMMENT_BLOCK', chars: '/** Block comment */', start: 22 },
            { kind: 'LITERAL_STRING', chars: '"Another string"', start: 42 },
            { kind: 'COMMENT_LINE', chars: '// Line comment', start: 58 },
        ],
        'Produces LITERAL_* and COMMENT_* tokens from bytes, chars, comments and strings (no TBD code)',
    );

    deep(
        ok(
            `"String"/* comment */ let x = 42; "Another string" \n\t // line comment`
        ),
        [
            { kind: 'LITERAL_STRING', chars: '"String"', start: 0 },
            { kind: 'COMMENT_BLOCK', start: 8, chars: '/* comment */' },
            { kind: 'TBD', chars: ' let x = 42; ', start: 21 },
            { kind: 'LITERAL_STRING', chars: '"Another string"', start: 34 },
            { kind: 'TBD', chars: ' \n\t ', start: 50 },
            { kind: 'COMMENT_LINE', start: 54, chars: '// line comment' }
        ],
        'Produces LITERAL_STRING, COMMENT_* and TBD tokens'
    );
    // TODO - restore this test when the code is ready
    // deep(
    //     notice(
    //         '\n\n  \t\n\t\u000B\r\u000C\t \nwxyz \r\u2028',
    //         'Token #2 at position 7 contains 3 ‘rare’ whitespace characters. Valid, but discouraged',
    //     ),
    //     [
    //         {
    //             kind: 'WHITESPACE_MOST',
    //             chars: '\n\n  \t\n\t',
    //             start: 0
    //         },
    //         {
    //             kind: 'WHITESPACE_RARE',
    //             chars: '\x0B\r\f',
    //             start: 7
    //         },
    //         {
    //             kind: 'WHITESPACE_MOST',
    //             chars: '\t \n',
    //             start: 10
    //         }
    //     ],
    //     'Produces WHITESPACE_MOST and WHITESPACE_RARE tokens from the contiguous whitespace',
    // );

    deep(
        notice(
            '/* unterminated block comment',
            'Unterminated block comment'
        ),
        [
            { kind: 'COMMENT_BLOCK', chars: '/* unterminated block comment', start: 0 }
        ],
        'An unterminated block comment produces error notice 4_6177'
    );

    deep(
        notice(
            'let x = 42; /* block comment with\n no terminator',
            'Unterminated block comment'
        ),
        [
            { kind: 'TBD', chars: 'let x = 42; ', start: 0 },
            { kind: 'COMMENT_BLOCK', chars: '/* block comment with\n no terminator', start: 12 }
        ],
        'An unterminated block comment after code produces error notice 4_6177'
    );
    
    console.log('OK: All roughlyTokenizeRust() tests passed!');
};
