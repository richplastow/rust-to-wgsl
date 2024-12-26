import { testExample01 } from './examples/run-01.mjs';
import { testExample02 } from './examples/run-02.mjs';
import { testExample03 } from './examples/run-03.mjs';
import { testExample04 } from './examples/run-04.mjs';

import { testRenderNotice } from './lib/notices/render-notice.test.mjs';

import { testIsComment } from './lib/rough-lexers/is-comment.test.mjs';
import { testIsLiteralByteOrChar } from './lib/rough-lexers/is-literal-byte-or-char.test.mjs';
import { testIsString } from './lib/rough-lexers/is-string.test.mjs';
import { testIsWhitespace } from './lib/rough-lexers/is-whitespace.test.mjs';
import { testTokenizeComment } from './lib/rough-lexers/tokenize-comment.test.mjs';
import { testTokenizeLiteralByteOrChar } from './lib/rough-lexers/tokenize-literal-byte-or-char.test.mjs';
import { testTokenizeLiteralString } from './lib/rough-lexers/tokenize-literal-string.test.mjs';
import { testTokenizeWhitespace } from './lib/rough-lexers/tokenize-whitespace.test.mjs';

import { testPunctDelimDetection } from './lib/roughly-parse-rust/is-punct-delim.test.mjs';
import { testHighlightWGSL } from './lib/highlight-wgsl/highlight-wgsl.test.mjs';
import { testRoughlyParseRust } from './lib/roughly-parse-rust/roughly-parse-rust.test.mjs';
import { testRoughlyTokenizeRust } from './lib/rough-lexers/roughly-tokenize-rust.test.mjs';
import { testTransformParts } from './lib/transform-parts/transform-parts.test.mjs';

import { testRustToWGSL } from './rust-to-wgsl.test.mjs';

// Examples.
testExample01();
testExample02();
testExample03();
testExample04();

// Notices.
testRenderNotice();

// Rough Lexers.
testIsComment();
testIsLiteralByteOrChar();
testIsString();
testIsWhitespace();
testTokenizeComment();
testTokenizeLiteralByteOrChar();
testTokenizeLiteralString();
testTokenizeWhitespace();

// Library.
testPunctDelimDetection();
testHighlightWGSL();
testRoughlyParseRust();
testRoughlyTokenizeRust();
testTransformParts();

// End to end.
testRustToWGSL();
