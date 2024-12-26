import { strictEqual as eq } from 'assert';
import {
    isLiteralByteBegin,
    isLiteralCharBegin,
    isLiteralByteOrCharBegin,
    isLiteralByteOrCharEnd,
    isLiteralByteAndGetEndPos,
    isLiteralCharAndGetEndPos,
    isLiteralByteOrCharAndGetEndPos,
} from './is-literal-byte-or-char.mjs';

const testIsLiteralByteBegin = () => {
    eq(
        isLiteralByteBegin("b", "'"),
        true,
        `"b" and "'" should be detected as a Rust byte literal beginning`,
    );
    eq(
        isLiteralByteBegin("B", "'"),
        false,
        `"B" and "'" should not be detected as a Rust byte literal beginning`,
    );
    eq(
        isLiteralByteBegin("'", "b"),
        false,
        `"'" and "b" should not be detected as a Rust byte literal beginning`,
    );
};

const testIsLiteralCharBegin = () => {
    eq(
        isLiteralCharBegin("'"),
        true,
        `"'" should be detected as a Rust char literal beginning`,
    );
    eq(
        isLiteralCharBegin("b"),
        false,
        `"b" should not be detected as a Rust char literal beginning`,
    );
    eq(
        isLiteralCharBegin('"'),
        false,
        `'"' should not be detected as a Rust char literal beginning`,
    );
};

const testIsLiteralByteOrCharBegin = () => {
    eq(
        isLiteralByteOrCharBegin("'", "H"),
        true,
        `"'" and "H" should be detected as a Rust byte or char literal beginning`,
    );
    eq(
        isLiteralByteOrCharBegin("b", "'"),
        true,
        `"b" and "'" should be detected as a Rust byte or char literal (byte) beginning`,
    );
    eq(
        isLiteralByteOrCharBegin("b", "H"),
        false,
        `"b" and "H" should not be detected as a Rust byte or char literal beginning`,
    );
    eq(
        isLiteralByteOrCharBegin("B", "'"),
        false,
        `Capital "B" and "'" should not be detected as a Rust byte or char literal beginning`,
    );
    eq(
        isLiteralByteOrCharBegin("b"),
        false,
        `"b" should not be detected as a Rust byte or char literal beginning`,
    );
};

const testIsLiteralByteOrCharEnd = () => {
    eq(
        isLiteralByteOrCharEnd("'"),
        true,
        `"'" should be detected as a Rust character literal ending`,
    );
    eq(
        isLiteralByteOrCharEnd("H"),
        false,
        `"H" should not be detected as a Rust character literal ending`,
    );
};        

const testIsLiteralByteAndGetEndPos = () => {

    const successfulCases = [
        { source: "b'H'", currPos: 0, expected: 4, text: 'byte H' },
        { source: "b'\\x00'", currPos: 0, expected: 7, text: 'hex byte zero' },
        { source: "foo b'\\xFF'", currPos: 4, expected: 11, text: 'hex byte 255' },
        { source: "b'\\x7f'", currPos: 0, expected: 7, text: 'hex byte 127' },
        { source: "b'\\n'", currPos: 0, expected: 5, text: 'newline byte' },
        { source: "b'\\r'", currPos: 0, expected: 5, text: 'carriage-return byte' },
        { source: "let h = b'\\t'", currPos: 8, expected: 13, text: 'tab byte' },
        { source: "start b'\\\\'", currPos: 6, expected: 11, text: 'backslash byte' },
        { source: "b'\\0'", currPos: 0, expected: 5, text: 'null byte' },
        { source: "let h = b'\\''", currPos: 8, expected: 13, text: 'single-quote byte' },
        { source: "b'\\\"'", currPos: 0, expected: 5, text: 'double-quote byte' },
    ];
    successfulCases.forEach(({ source, currPos, expected, text }) => {
        eq(
            isLiteralByteAndGetEndPos("b", "'", currPos, source),
            expected,
            `${source} should be detected as a literal ${text}`,
        );
    });

    const unsuccessfulCases = [
        { source: "b'" },
        { source: "b''" },
        { source: "b'H" },
        { source: "b'\\'" },
        { source: "b'\\\\" },
        { source: "b'\\n" },
        { source: "b'\\a'" },
        { source: "b'\\u{1F600}'" },
    ];
    unsuccessfulCases.forEach(({ source }) => {
        eq(
            isLiteralByteAndGetEndPos("b", "'", 0, source),
            false,
            `${source} should not be detected as a Rust byte literal`,
        );
    });
};

const testIsLiteralByteOrCharAndGetEndPos = () => {

    const successfulCases = [
        { char0: "'", char1: '"',  source: `a = '"'`, currPos: 4, expected: 7, text: 'double-quote char' },
        { char0: "b", char1: "'",  source: "b'H'", currPos: 0, expected: 4, text: 'byte H' },
        { char0: "'", char1: "\\", source: "'\\''", currPos: 0, expected: 4, text: 'single-quote char' },
        { char0: "'", char1: "\\", source: `abc'\\"'`, currPos: 3, expected: 7, text: 'double-quote char' },
        { char0: "'", char1: "\\", source: "'\\\\'", currPos: 0, expected: 4, text: 'backslash char' },
        { char0: "b", char1: "'",  source: "let h = b'\\''", currPos: 8, expected: 13, text: 'single-quote byte' },
        { char0: "b", char1: "'",  source: "let h = b'\\t'", currPos: 8, expected: 13, text: 'tab byte' },
        { char0: "b", char1: "'",  source: "start b'\\\\'", currPos: 6, expected: 11, text: 'backslash byte' },
        { char0: "'", char1: "\\", source: "'\\u{}'", currPos: 0, expected: 6, text: 'empty unicode char' },
        { char0: "'", char1: "\\", source: "'\\u{\n\r\tX}'", currPos: 0, expected: 10, text: 'invalid unicode char' },
    ];
    successfulCases.forEach(({ char0, char1, source, currPos, expected, text }) => {
        eq(
            isLiteralByteOrCharAndGetEndPos(char0, char1, currPos, source),
            expected,
            `${source} should be detected as a literal ${text}`,
        );
    });

    const unsuccessfulCases = [
        { char0: "'", char1: undefined, source: "'" },
        { char0: 'b', char1: "'",       source: "b'" },
        { char0: "'", char1: "'",       source: "''" },
        { char0: 'b', char1: "'",       source: "b''" },
        { char0: "'", char1: 'H',       source: "'H" },
        { char0: 'b', char1: "'",       source: "b'H" },
        { char0: "'", char1: '\\',      source: "'\\'" },
        { char0: 'b', char1: "'",       source: "b'\\'" },
        { char0: "'", char1: '\\',      source: "'\\\\" },
        { char0: 'b', char1: "'",       source: "b'\\\\" },
        { char0: "'", char1: '\\',      source: "'\\n" },
        { char0: 'b', char1: "'",       source: "b'\\n" },
        { char0: "'", char1: '\\',      source: "'\\a'" },
        { char0: 'b', char1: "'",       source: "b'\\a'" },
        { char0: "'", char1: "\\",      source: "'\\u" },
        { char0: "'", char1: "\\",      source: "'\\u{" },
        { char0: "'", char1: "\\",      source: "'\\u{}" },
        { char0: "'", char1: "\\",      source: "'\\u{'" },
        { char0: "'", char1: "\\",      source: "'\\u}'" },
        { char0: "'", char1: "\\",      source: "'\\U{}'" },
        { char0: "'", char1: "\\",      source: "'\\ u{}'" },
        { char0: "'", char1: "\\",      source: "'\\u{} '" },
        { char0: "b", char1: "'",       source: "b'\\u" },
        { char0: "b", char1: "'",       source: "b'\\u{}'" },
        { char0: "b", char1: "'",       source: "b'\\u{110000}'" },
    ];
    unsuccessfulCases.forEach(({ char0, char1, source }) => {
        eq(
            isLiteralByteOrCharAndGetEndPos(char0, char1, 0, source),
            false,
            `${source} should not be detected as a Rust character literal`,
        );
    });
};

const testIsLiteralCharAndGetEndPos = () => {
    const successfulCases = [
        { source: "'H'", currPos: 0, expected: 3, text: 'char H' },
        { source: "'\\x00'", currPos: 0, expected: 6, text: 'hex char zero' },
        { source: "foo '\\x7f'", currPos: 4, expected: 10, text: 'hex char 127' },
        { source: "'\\n'", currPos: 0, expected: 4, text: 'newline char' },
        { source: "'\\r'", currPos: 0, expected: 4, text: 'carriage-return char' },
        { source: "let h = '\\t'", currPos: 8, expected: 12, text: 'tab char' },
        { source: "start '\\\\'", currPos: 6, expected: 10, text: 'backslash char' },
        { source: "'\\0'", currPos: 0, expected: 4, text: 'null char' },
        { source: "let h = '\\''", currPos: 8, expected: 12, text: 'single-quote char' },
        { source: "'\\\"'", currPos: 0, expected: 4, text: 'double-quote char' },
        { source: "'\\u{1F600}'", currPos: 0, expected: 11, text: 'unicode char' },
        { source: "'\\u{0}'", currPos: 0, expected: 7, text: 'unicode zero' },
        { source: "abc '\\u{10FFFF}'", currPos: 4, expected: 16, text: 'max unicode' },
    ];
    successfulCases.forEach(({ source, currPos, expected, text }) => {
        eq(
            isLiteralCharAndGetEndPos("'", currPos, source),
            expected,
            `${source} should be detected as a literal ${text}`,
        );
    });

    const unsuccessfulCases = [
        { source: "'" },
        { source: "''" },
        { source: "'H" },
        { source: "'\\'" },
        { source: "'\\\\" },
        { source: "'\\n" },
        { source: "'\\a'" },
        { source: "'\\x80'" },
        { source: "'\\u" },
        { source: "'\\u'" },
        { source: "'\\u{" },
        { source: "'\\u{'" },
        { source: "'\\u}'" },
        { source: "'\\U{}'" },
        { source: "'\\ u{}'" },
        { source: "'\\u{} '" },
        // { source: "'\\u{}'" }, TODO validate unicode escapes
        // { source: "'\\u{110000}'" }, TODO validate unicode escapes
    ];
    unsuccessfulCases.forEach(({ source }) => {
        eq(
            isLiteralCharAndGetEndPos("'", 0, source),
            false,
            `${source} should not be detected as a Rust char literal`,
        );
    });
};

export const testIsLiteralByteOrChar = () => {
    testIsLiteralByteBegin();
    testIsLiteralCharBegin();
    testIsLiteralByteOrCharBegin();
    testIsLiteralByteOrCharEnd();
    testIsLiteralByteAndGetEndPos();
    testIsLiteralCharAndGetEndPos();
    testIsLiteralByteOrCharAndGetEndPos();
    console.log('OK: All isLiteralByteOrChar*() tests passed!');
};
