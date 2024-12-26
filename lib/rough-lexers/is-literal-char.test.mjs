import { strictEqual as eq } from 'assert';
import { isLiteralCharBegin, isLiteralCharEnd } from './is-literal-char.mjs';

const testIsLiteralCharBegin = () => {
    eq(
        isLiteralCharBegin("'", "H"),
        true,
        `"'" and "H" should be detected as a Rust character literal beginning`,
    );
    eq(
        isLiteralCharBegin("b", "'"),
        true,
        `"b" and "'" should be detected as a Rust character literal (byte) beginning`,
    );
    eq(
        isLiteralCharBegin("b", "H"),
        false,
        `"b" and "H" should not be detected as a Rust character literal beginning`,
    );
    eq(
        isLiteralCharBegin("B", "'"),
        false,
        `Capital "B" and "'" should not be detected as a Rust character literal beginning`,
    );
    eq(
        isLiteralCharBegin("b"),
        false,
        `"b" should not be detected as a Rust character literal beginning`,
    );
}

const testIsLiteralCharEnd = () => {
    eq(
        isLiteralCharEnd("'"),
        true,
        `"'" should be detected as a Rust character literal ending`,
    );
    eq(
        isLiteralCharEnd("H"),
        false,
        `"H" should not be detected as a Rust character literal ending`,
    );
};        

export const testIsLiteralChar = () => {
    testIsLiteralCharBegin();
    testIsLiteralCharEnd();
    console.log('OK: All isLiteralChar*() tests passed!');
};
