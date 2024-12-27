import { strictEqual as eq } from 'assert';
import {
    isLiteralStringBegin,
    isLiteralStringAndGetEndPos,
} from './is-literal-string.mjs';

const testIsLiteralStringBegin = () => {
    const cases = [
        ['"', 'h', true, 'Regular string start'],
        ['b', '"', true, 'Byte string start'],
        ['r', '"', true, 'Raw string start'],
        ['r', '#', true, 'Hash raw string start'],
        ['b', 'r', true, 'Raw byte string start'],
        ['x', '"', false, 'Invalid string start'],
        ['b', 'x', false, 'Invalid byte string start'],
    ];
    cases.forEach(([char0, char1, expected, message]) => 
        eq(isLiteralStringBegin(char0, char1), expected, message));
};

const testIsLiteralStringAndGetEndPos = () => {
    const successfulCases = [
        // Regular strings.
        ['"', '"', '""', 0, 2, 'empty string'],
        ['"', 'h', 'let hi = "hello"', 9, 16, 'simple string'],
        ['"', 'e', '"escaped \\" quote"', 0, 18, 'string with escaped quote'],
        // Byte strings.
        ['b', '"', 'b"bytes"', 0, 8, 'simple byte string'],
        ['b', '"', 'b"escape\\\\"', 0, 11, 'byte string with escape'],
        // Raw strings.
        ['r', '"', 'r"raw"', 0, 6, 'simple raw string'],
        ['r', '#', 'start r#"raw"#', 6, 14, 'hash raw string'],
        ['r', '#', 'r##"raw"##', 0, 10, 'double hash raw string'],
        ['r', '#', 'r' + '#'.repeat(255) + '"hashes"' + '#'.repeat(255), 0, 519, 'string with max hashes'],
        // Raw byte strings.
        ['b', 'r', 'br"raw bytes"', 0, 13, 'raw byte string'],
        ['b', 'r', 'br#"raw bytes"#', 0, 15, 'hash raw byte string'],
    ];
    successfulCases.forEach(([char0, char1, source, currPos, expected, text]) => 
        eq(
            isLiteralStringAndGetEndPos(char0, char1, currPos, source),
            expected,
            `${source} should be detected as a literal ${text}`,
        ));

    const unsuccessfulCases = [
        ['"', 'u', '"unclosed'], // unclosed string
        ['"', 'u', '"unclosed\\"'], // unclosed string because final quote is escaped
        ['b', '"', 'b"unclosed'], // unclosed byte string
        ['r', '"', 'r"unclosed'], // unclosed raw string
        ['r', '#', 'r#"unclosed'], // unclosed hash raw string
        ['b', 'r', 'br#"unclosed'], // unclosed raw byte string
        ['r', '#', 'r#"hash"##'], // unbalanced hashes
        ['r', '#', 'r###"hash"##'], // unbalanced hashes
        ['r', '#', 'r' + '#'.repeat(256) + '"hashes"' + '#'.repeat(256)], // too many hashes
    ];
    unsuccessfulCases.forEach(([char0, char1, source]) => 
        eq(
            isLiteralStringAndGetEndPos(char0, char1, 0, source),
            false,
            `${source} should not be detected as a Rust string literal`,
        ));
};

export const testIsLiteralString = () => {
    testIsLiteralStringBegin();
    testIsLiteralStringAndGetEndPos();
    console.log('OK: All isLiteralString*() tests passed!');
};
