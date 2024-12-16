import { testExample01 } from './examples/run-01.mjs';
import { testExample02 } from './examples/run-02.mjs';
import { testRustToThreeParts } from './lib/rust-to-three-parts.test.mjs';
import { testRustToWGSL } from './rust-to-wgsl.test.mjs';

// Examples.
testExample01();
testExample02();

// Library.
testRustToThreeParts();

// End to end.
testRustToWGSL();