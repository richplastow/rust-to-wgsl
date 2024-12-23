import { strictEqual as eq, throws } from 'assert';
import { renderNotice } from './render-notice.mjs';

export const testRenderNotice = () => {

    // Exceptions.
    throws(
        () => renderNotice('foo'),
        RangeError("noticeCode 'foo' is type 'string', not 'number'"),
    );
    throws(
        () => renderNotice(NaN),
        RangeError("noticeCode is NaN (not a number)"),
    );
    throws(
        () => renderNotice(12345.6789),
        RangeError('noticeCode 12345.6789 is not an integer'),
    );
    throws(
        () => renderNotice(9999),
        RangeError('noticeCode 9999 is not between 1_0000 and 4_9999'),
    );
    throws(
        () => renderNotice(50000),
        RangeError('noticeCode 50000 is not between 1_0000 and 4_9999'),
    );

    // Info.
    eq(
        renderNotice(2_2511, 4, 55, 1),
        'Token #4 at position 55 contains 1 ‘rare’ whitespace character. Valid, but discouraged',
    );
    eq(
        renderNotice(2_2511, 7, 100, 2),
        'Token #7 at position 100 contains 2 ‘rare’ whitespace characters. Valid, but discouraged',
    );

    // Error.
    eq(
        renderNotice(4_6177),
        'Unterminated block comment',
    );
    eq(
        renderNotice(4_8591, 123, null, 'abc'), // extra values are ignored
        'Unterminated char literal',
    );
    eq(
        renderNotice(4_9122),
        'Unterminated string literal',
    );

    console.log('OK: All renderNotice() tests passed!');
};
