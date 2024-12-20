import { testExample01 } from './examples/run-01.mjs';
import { testExample02 } from './examples/run-02.mjs';
import { testExample03 } from './examples/run-03.mjs';
import { testExample04 } from './examples/run-04.mjs';

import { testTokenizeWhitespace } from './lib/rough-lexers/tokenize-whitespace.test.mjs';

import { testPunctDelimDetection } from './lib/roughly-parse-rust/is-punct-delim.test.mjs';
import { testWhitespaceDetection } from './lib/roughly-parse-rust/is-whitespace.test.mjs';
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

// Rough Lexers.
testTokenizeWhitespace();

// Library.
testPunctDelimDetection();
testWhitespaceDetection();
testHighlightWGSL();
testRoughlyParseRust();
testRoughlyTokenizeRust();
testTransformParts();

// End to end.
testRustToWGSL();
