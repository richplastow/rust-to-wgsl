import { strictEqual as eq } from 'assert';
import { isWhitespaceMost, isWhitespaceRare, isWhitespaceAny } from './is-whitespace.mjs';

const whitespaceMostChars = [
    { char: ' ', name: 'Space' },
    { char: '\t', name: 'Tab' },
    { char: '\n', name: 'Newline' },
];

const whitespaceRareChars = [
    { char: '\u000B', name: 'Vertical Tab' },
    { char: '\u000C', name: 'Form Feed' },
    { char: '\r', name: 'Carriage Return' },
    { char: '\u0085', name: 'Next Line' },
    { char: '\u200E', name: 'Left-to-Right Mark' },
    { char: '\u200F', name: 'Right-to-Left Mark' },
    { char: '\u2028', name: 'Line Separator' },
    { char: '\u2029', name: 'Paragraph Separator' },
];

const nonRustWhitespaceChars = [
    { char: '\u00A0', name: 'Non-Breaking Space' },
    { char: '\u1680', name: 'Ogham Space Mark' },
    { char: '\u2000', name: 'En Quad' },
    { char: '\u2001', name: 'Em Quad' },
    { char: '\u2002', name: 'En Space' },
    { char: '\u2003', name: 'Em Space' },
    { char: '\u2004', name: 'Three-Per-Em Space' },
    { char: '\u2005', name: 'Four-Per-Em Space' },
    { char: '\u2006', name: 'Six-Per-Em Space' },
    { char: '\u2007', name: 'Figure Space' },
    { char: '\u2008', name: 'Punctuation Space' },
    { char: '\u2009', name: 'Thin Space' },
    { char: '\u200A', name: 'Hair Space' },
    { char: '\u202F', name: 'Narrow No-Break Space' },
    { char: '\u205F', name: 'Medium Mathematical Space' },
    { char: '\u3000', name: 'Ideographic Space' },
];

const nonWhitespaceChars = [
    { char: 'a', name: 'Lowercase "a"' },
    { char: '_', name: 'Underscore' },
    { char: '-', name: 'Hyphen' },
];

const testIsWhitespaceMost = () => {
    whitespaceMostChars.forEach(({ char, name }) => {
        eq(
            isWhitespaceMost(char),
            true,
            `${name} should be detected as commonly encountered whitespace`
        );
    });

    [...whitespaceRareChars, ...nonRustWhitespaceChars, ...nonWhitespaceChars]
        .forEach(({ char, name }) => {
        eq(
            isWhitespaceMost(char),
            false,
            `${name} should not be detected as commonly encountered whitespace`
        );
    });
};

const testIsWhitespaceRare = () => {
    whitespaceRareChars.forEach(({ char, name }) => {
        eq(
            isWhitespaceRare(char),
            true,
            `${name} should be detected as rare whitespace`
        );
    });

    [...whitespaceMostChars, ...nonRustWhitespaceChars, ...nonWhitespaceChars]
        .forEach(({ char, name }) => {
        eq(
            isWhitespaceRare(char),
            false,
            `${name} should not be detected as rare whitespace`
        );
    });
};

const testIsWhitespaceAny = () => {
    [...whitespaceMostChars, ...whitespaceRareChars]
        .forEach(({ char, name }) => {
        eq(
            isWhitespaceAny(char),
            true,
            `${name} should be detected as whitespace`
        );
    });

    [...nonRustWhitespaceChars, ...nonWhitespaceChars]
        .forEach(({ char, name }) => {
        eq(
            isWhitespaceAny(char),
            false,
            `${name} should not be detected as whitespace`
        );
    });
};

export const testIsWhitespace = () => {
    testIsWhitespaceMost();
    testIsWhitespaceRare();
    testIsWhitespaceAny();
    console.log('OK: All isWhitespace*() tests passed!');
};
