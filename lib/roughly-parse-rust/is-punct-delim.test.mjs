import {
    isPunctuationFollowable,
    isPunctuationSolo,
    isDelimiter,
    isPunctDelim,
} from './is-punct-delim.mjs';
import { strictEqual as eq } from 'assert';

const punctuationFollowableChars = [
    { char: '-', name: 'Minus' },
    { char: ':', name: 'Colon' },
    { char: '!', name: 'Not' },
    { char: '.', name: 'Dot' },
    { char: '*', name: 'Star' },
    { char: '/', name: 'Slash' },
    { char: '&', name: 'And' },
    { char: '%', name: 'Percent' },
    { char: '^', name: 'Caret' },
    { char: '+', name: 'Plus' },
    { char: '<', name: 'Lt' },
    { char: '=', name: 'Eq' },
    { char: '>', name: 'Gt' },
    { char: '|', name: 'Or' },
];

const punctuationSoloChars = [
    { char: '_', name: 'Underscore' },
    { char: ',', name: 'Comma' },
    { char: ';', name: 'Semi' },
    { char: '?', name: 'Question' },
    { char: '@', name: 'At' },
    { char: '#', name: 'Pound' },
    { char: '~', name: 'Tilde' },
    { char: '$', name: 'Dollar' },
];

const delimiterChars = [
    { char: '(', name: 'BracketRoundOpen' },
    { char: ')', name: 'BracketRoundClose' },
    { char: '[', name: 'BracketSquareOpen' },
    { char: ']', name: 'BracketSquareClose' },
    { char: '{', name: 'BracketCurlyOpen' },
    { char: '}', name: 'BracketCurlyClose' },
];

const nonPunctuationChars = [
    { char: 'a', name: 'Lowercase "a"' },
    { char: ' ', name: 'Space' },
    { char: '\t', name: 'Tab' },
    { char: '\n', name: 'Newline' },
    { char: '\u0000', name: 'Null' },
    { char: '\u000A', name: 'Line Feed' },
    { char: '\u000B', name: 'Vertical Tab' },
    { char: '\u000C', name: 'Form Feed' },
    { char: '\u000D', name: 'Carriage Return' },
    { char: '\u001B', name: 'Escape' },
    { char: '\u001C', name: 'File Separator' },
    { char: '\u001F', name: 'Unit Separator' },
    { char: '`', name: 'Backtick' },
    { char: '"', name: 'Double Quote' },
    { char: "'", name: 'Single Quote' },
    { char: '\\', name: 'Backslash' },
    { char: '\u007F', name: 'Delete' },
    { char: '\u00A0', name: 'Non-Breaking Space' }, // Latin-1 Supplement
    { char: '\u2009', name: 'Thin Space' }, // General Punctuation
    { char: '\u2028', name: 'Line Separator' }, // General Punctuation
    { char: '‐', name: 'Hyphen' }, // General Punctuation
    { char: '‒', name: 'Figure Dash' }, // General Punctuation
    { char: '–', name: 'En Dash' }, // General Punctuation
    { char: '—', name: 'Em Dash' }, // General Punctuation
    { char: '―', name: 'Horizontal Bar' }, // General Punctuation
    { char: '¡', name: 'Inverted Exclamation Mark' }, // Latin-1 Supplement
    { char: '¿', name: 'Inverted Question Mark' }, // Latin-1 Supplement
    { char: '…', name: 'Horizontal Ellipsis' }, // General Punctuation
    { char: '‹', name: 'Single Left-Pointing Angle Quotation Mark' }, // General Punctuation
    { char: '«', name: 'Left-Pointing Double Angle Quotation Mark' }, // Latin-1 Supplement
    { char: '»', name: 'Right-Pointing Double Angle Quotation Mark' }, // Latin-1 Supplement
    { char: '‖', name: 'Double Vertical Line' }, // General Punctuation
];

const testIsPunctuationFollowable = () => {
    punctuationFollowableChars.forEach(({ char, name }) => {
        eq(
            isPunctuationFollowable(char),
            true,
            `${name} should be detected as punctuation followed by another character`
        );
    });

    [...punctuationSoloChars, ...delimiterChars, ...nonPunctuationChars]
        .forEach(({ char, name }) => {
        eq(
            isPunctuationFollowable(char),
            false,
            `${name} should not be detected as punctuation followed by another character`
        );
    });

    console.log('OK: All isPunctuationFollowable() tests passed!');
}

const testIsPunctuationSolo = () => {
    punctuationSoloChars.forEach(({ char, name }) => {
        eq(
            isPunctuationSolo(char),
            true,
            `${name} should be detected as punctuation not followed by another character`
        );
    });

    [...punctuationFollowableChars, ...delimiterChars, ...nonPunctuationChars]
        .forEach(({ char, name }) => {
        eq(
            isPunctuationSolo(char),
            false,
            `${name} should not be detected as punctuation not followed by another character`
        );
    });

    console.log('OK: All isPunctuationSolo() tests passed!');
}

const testIsDelimiter = () => {
    delimiterChars.forEach(({ char, name }) => {
        eq(
            isDelimiter(char),
            true,
            `${name} should be detected as a delimiter`
        );
    });

    [...punctuationFollowableChars, ...punctuationSoloChars, ...nonPunctuationChars]
        .forEach(({ char, name }) => {
        eq(
            isDelimiter(char),
            false,
            `${name} should not be detected as a delimiter`
        );
    });

    console.log('OK: All isDelimiter() tests passed!');
}

const testIsPunctDelim = () => {
    [
        ...punctuationFollowableChars,
        ...punctuationSoloChars,
        ...delimiterChars,
    ].forEach(({ char, name }) => {
        eq(
            isPunctDelim(char),
            true,
            `${name} should be detected as a punctuation or delimiter character`
        );
    });

    nonPunctuationChars.forEach(({ char, name }) => {
        eq(
            isPunctDelim(char),
            false,
            `${name} should not be detected as a punctuation or delimiter character`
        );
    });

    console.log('OK: All isPunctDelim() tests passed!');
}

export const testPunctDelimDetection = () => {
    testIsPunctuationFollowable();
    testIsPunctuationSolo();
    testIsDelimiter();
    testIsPunctDelim();

};
