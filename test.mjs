import { testExample01 } from './examples/run-01.mjs';
import { testExample02 } from './examples/run-02.mjs';
import { testExample03 } from './examples/run-03.mjs';
import { testExample04 } from './examples/run-04.mjs';

import { testCategoriseCharacter } from './lib/roughly-parse-rust/categorise-character.test.mjs';
import { testHighlightWGSL } from './lib/highlight-wgsl/highlight-wgsl.test.mjs';
import { testRoughlyParseRust } from './lib/roughly-parse-rust/roughly-parse-rust.test.mjs';
import { testTransformParts } from './lib/transform-parts/transform-parts.test.mjs';

import { testRustToWGSL } from './rust-to-wgsl.test.mjs';

// Examples.
testExample01();
testExample02();
testExample03();
testExample04();

// Library.
testCategoriseCharacter();
testHighlightWGSL();
testRoughlyParseRust();
testTransformParts();

// End to end.
testRustToWGSL();
