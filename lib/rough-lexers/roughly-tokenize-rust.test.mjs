import { strictEqual as eq, deepStrictEqual as deep } from 'assert';
import { roughlyTokenizeRust } from './roughly-tokenize-rust.mjs';

// Helper function which calls roughlyTokenizeRust() when we don’t expect any
// errors or notices.
const ok = (source) => {
    const { errors, notices, tokens } = roughlyTokenizeRust(source);
    eq(errors.length, 0, `There should be no errors, not ${errors.length}`);
    eq(notices.length, 0, `There should be no notices, not ${notices.length}`);
    return tokens;
}

// Helper function which calls roughlyTokenizeRust() when we expect notices but
// no errors.
const notice = (source, ...expectedNotices) => {
    const { errors, notices, tokens } = roughlyTokenizeRust(source);
    eq(errors.length, 0, `There should be no errors, not ${errors.length}`);
    eq(
        notices.length,
        expectedNotices.length,
        `There should be ${expectedNotices.length} notice(s), not ${notices.length}`
    );
    for (const notice of expectedNotices) {
        eq(notices.includes(notice), true, `Notice "${notice}" not found`);
    }
    return tokens;
}

export const testRoughlyTokenizeRust = () => {
    deep(
        ok(''),
        [],
        'An empty string produces no tokens'
    );

    deep(
        notice(
            '\n\n  \t\n\t\u000B\r\u000C\t \nwxyz \r\u2028',
            'Token #2 at position 7 contains 3 ‘rare’ whitespace characters. Valid, but discouraged',
        ),
        [
            {
                kind: 'WHITESPACE_MOST',
                chars: '\n\n  \t\n\t'.split(''),
                start: 0
            },
            {
                kind: 'WHITESPACE_RARE',
                chars: [ '\x0B', '\r', '\f' ],
                start: 7
            },
            {
                kind: 'WHITESPACE_MOST',
                chars: [ '\t', ' ', '\n' ],
                start: 10
            }
        ],
        'Produces WHITESPACE_MOST and WHITESPACE_RARE tokens from the contiguous whitespace',
    );

    console.log('OK: All roughlyTokenizeRust() tests passed!');
}
