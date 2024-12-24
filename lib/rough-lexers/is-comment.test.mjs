import { strictEqual as eq } from 'assert';
import {
    isCommentBlockBegin,
    isCommentBlockEnd,
    isCommentLineBegin,
    isCommentLineEnd,
    isCommentAnyBegin,
} from './is-comment.mjs';

const testIsCommentBlockBegin = () => {
    eq(
        isCommentBlockBegin('/', '*'),
        true,
        '"/", "*" should be detected as a block comment beginning',
    );
    eq(
        isCommentBlockBegin('/', '/'),
        false,
        '"/", "/" should not be detected as a block comment beginning',
    );
    eq(
        isCommentBlockBegin('*', '/'),
        false,
        '"*", "/" should not be detected as a block comment beginning',
    );
    eq(
        isCommentBlockBegin('/'),
        false,
        '"/" should not be detected as a block comment beginning',
    );
}

const testIsCommentBlockEnd = () => {
    eq(
        isCommentBlockEnd('*', '/'),
        true,
        '"*", "/" should be detected as a block comment ending',
    );
    eq(
        isCommentBlockEnd('/', '*'),
        false,
        '"/", "*" should not be detected as a block comment ending',
    );
    eq(
        isCommentBlockEnd('/', '/'),
        false,
        '"/", "/" should not be detected as a block comment ending',
    );
    eq(
        isCommentBlockEnd('/'),
        false,
        '"/" should not be detected as a block comment ending',
    );
}

const testIsCommentLineBegin = () => {
    eq(
        isCommentLineBegin('/', '/'),
        true,
        '"/", "/" should be detected as a line comment beginning',
    );
    eq(
        isCommentLineBegin('/', '*'),
        false,
        '"/", "*" should not be detected as a line comment beginning',
    );
    eq(
        isCommentAnyBegin('\n'),
        false,
        'A single newline character should not be detected as a line comment beginning',
    );
    eq(
        isCommentLineBegin('/'),
        false,
        '"/" should not be detected as a line comment beginning',
    );
}

const testIsCommentLineEnd = () => {
    eq(
        isCommentLineEnd('\n'),
        true,
        'A single newline character should be detected as a line comment ending',
    );
    eq(
        isCommentLineEnd('\r'),
        false,
        'A carriage return should not be detected as a line comment ending',
    );
    eq(
        isCommentLineEnd(''),
        false,
        'An empty string should not be detected as a line comment ending',
    );
}
const testIsCommentAnyBegin = () => {
    eq(
        isCommentAnyBegin('/', '*'),
        true,
        '"/", "*" should be detected as a comment beginning (a block)',
    );
    eq(
        isCommentAnyBegin('/', '/'),
        true,
        '"/", "/" should be detected as a comment beginning (a line)',
    );
    eq(
        isCommentAnyBegin('*', '/'),
        false,
        '"*", "/" should not be detected as a comment beginning',
    );
    eq(
        isCommentAnyBegin('\n'),
        false,
        'A single newline character should not be detected as a comment beginning',
    );
    eq(
        isCommentAnyBegin('/'),
        false,
        '"/" should not be detected as a comment beginning',
    );
}

export const testIsComment = () => {
    testIsCommentBlockBegin();
    testIsCommentBlockEnd();
    testIsCommentLineBegin();
    testIsCommentLineEnd();
    testIsCommentAnyBegin();
    console.log('OK: All isComment*() tests passed!');
};
