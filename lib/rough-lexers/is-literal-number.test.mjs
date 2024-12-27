
import { strictEqual as eq } from 'assert';
import {
    isLiteralNumberBegin,
    isLiteralNumberAndGetEndPos,
} from './is-literal-number.mjs';

const testIsLiteralNumberBegin = () => {
    const cases = [
        ['1', true, 'Regular number start'],
        ['0', true, 'Zero start'],
        ['x', false, 'Invalid number start'],
    ];
    cases.forEach(([char0, expected, message]) => 
        eq(isLiteralNumberBegin(char0), expected, message));
};

const testIsLiteralNumberAndGetEndPos = () => {
    const successfulCases = [
        // Integer.
        ['1', '2', 'let i = 123; // ok', 8, 11, 'a simple integer'],
        ['9', undefined, '9', 0, 1, 'an integer', 'with a single decimal digit'],
        ['0', 'B', '0B1', 0, 1, 'an integer', '(capital "B", so not a binary)'],
        ['0', 'O', '0O7', 0, 1, 'an integer', '(capital "O", so not an octal)'],
        ['0', 'X', '0Xf', 0, 1, 'an integer', '(capital "X", so not a hexadecimal)'],
        // Binary.
        ['0', 'b', 'ok 0b0 ', 3, 6, 'a minimal binary', 'and trailing space'],
        ['0', 'b', '0b1010', 0, 6, 'a short binary'],
        ['0', 'b', '0b__1010_1010____1010_1010', 0, 26, 'a long binary', 'with many underscores'],
        // Octal.
        ['0', 'o', '0o0', 0, 3, 'a minimal octal'],
        ['0', 'o', 'const oct = 0o755usize;', 12, 17, 'a short octal', 'with a suffix'],
        ['0', 'o', '0o012_345_670', 0, 13, 'a long octal', 'with underscores'],
        // Hexadecimal.
        ['0', 'x', 'ok 0x0i32', 3, 6, 'a minimal hexadecimal', 'with a suffix'],
        ['0', 'x', 'start 0x1f end', 6, 10, 'a short hexadecimal'],
        ['0', 'x', '0x___1f_2e_3___d4c', 0, 18, 'a long hexadecimal', 'with many underscores'],
        ['0', 'x', '0x0123456789abcdefABCDEF', 0, 24, 'a long mixed case hexadecimal'],
        ['0', 'x', '0x1a_2B_3c_4D', 0, 13, 'a long mixed-case hexadecimal', 'with underscores'],
        // Floating-point.
        ['1', '.', '1.23', 0, 4, 'a short floating-point'],
        ['0', '.', '0.', 0, 2, 'a single digit floating-point', 'with missing decimal part'],
        ['1', '.', '1.2.3', 0, 3, 'floating-point', 'followed by a dot'],
        ['1', '.', '1._23', 0, 5, 'floating-point', 'with an underscore'],
        ['0', '_', '0_123__45_.___678_90f32', 0, 20, 'floating-point', 'with many underscores'],
        // Exponential.
        // TODO - add more tests
    ];
    successfulCases.forEach(([char0, char1, source, currPos, expected, text0, text1]) => 
        eq(
            isLiteralNumberAndGetEndPos(char0, char1, currPos, source),
            expected,
            `${source} should be detected as ${text0} number literal${text1 ? ' ' + text1 : ''}`,
        ));

    const unsuccessfulCases = [
        // Nothing like a number.
        ['x', 'y', 'xyz'],
        ['a', undefined, 'a'],
        // Integer.
        ['_', '1', '_1'],
        // Binary.
        ['0', 'b', '0b'],
        ['0', 'b', '0b_'],
        ['0', 'b', '0b2'],
        // Octal.
        ['0', 'o', '0o'],
        ['0', 'b', '0o_____'],
        ['0', 'o', '0o8'],
        // Hexadecimal.
        ['0', 'x', '0x'],
        ['0', 'b', '0x__'],
        ['0', 'x', '0xg'],
        // Floating-point.
        ['.', undefined, '.'],
        ['.', '1', '.1'],
        ['_', '1', '_1.1'],
        // TODO - add more tests
        // Exponential.
        // TODO - add more tests
    ];
    unsuccessfulCases.forEach(([char0, char1, source]) => 
        eq(
            isLiteralNumberAndGetEndPos(char0, char1, 0, source),
            false,
            `${source} should not be detected as a Rust number literal`,
        ));
};

export const testIsLiteralNumber = () => {
    testIsLiteralNumberBegin();
    testIsLiteralNumberAndGetEndPos();
    console.log('OK: All isLiteralNumber*() tests passed!');
};