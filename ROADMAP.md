## Roadmap

The rust-to-wgsl repo focuses on language-level, syntax and data-type transpilation.

- Developers are expected to write Rust code with the intention that it will be transpiled to WGSL. They will probably re-run rust-to-wgsl constantly during development.
- rust-to-wgsl is not expected to be used on general, arbitrary Rust code.
- The transpiled WGSL will not be ready to immediately run as a shader, because it won’t have any `@binding` etc. Other, downstream utilities have the job of inserting GPU entry-points etc — that’s not a job for rust-to-wgsl.

* [ ] **PHASE 1: Lexer and punctuation handling (Known Bugs and Gaps)**
   * [ ] Implement proper handling for the closing brace `}` and other punctuation. Ensuring every opened `{`/`(` is tokenized with a matching `}`/`)` token (and similarly for commas, etc.) will prevent malformed outputs. This is a relatively small fix in the lexer that will improve reliability.
   * [ ] Complete the `WHITESPACE_RARE` handling and related TODOs. Finalize the logic to tokenize rare whitespace (or decide to normalize/ignore them) so that code with form-feed or vertical tabs doesn’t break the parser. Remove or implement the other small TODOs (like using full Unicode identifier sets) to make the lexer fully robust.
* [ ] **PHASE 2: Unsupported constructs and diagnostics**
   * [ ] Filter out or flag unsupported Rust keywords. In the transform phase, add cases to drop keywords like `mut`, `ref`, `crate`, etc., or at least produce a clear error if they appear.
   * [ ] Add an explicit error for unsupported Rust types (or auto-convert where possible). For instance, if the input contains a variable of type `f64`, push an error like “`f64` not supported, use `f32`” (and optionally default to `f32`). Similarly, smaller ints (`i16`, `i8`, etc.) could default to `i32` or error out.
   * [ ] Improve error messaging for literals. Rephrase errors to be more descriptive (e.g. “Rust string literal is not supported in WGSL”) and include the literal where helpful.
* [ ] **PHASE 3: Functions and scopes**
   * [ ] Implement parsing of function definitions (`fn`) and their bodies. Recognize `fn name(...){...}` blocks and ensure balanced braces.
   * [ ] Omit visibility/lifetime modifiers; ensure parameter and return types use only WGSL-compatible types.
* [ ] **PHASE 4: Control flow statements**
   * [ ] Support `if`/`else` translation (copy largely as-is, preserving blocks and chains).
   * [ ] Map `loop` and `while` to WGSL loop forms; disallow Rust `for x in 0..N` sugar initially (or transform to an indexed loop if/when supported).
   * [ ] Ensure explicit `return` for non-void functions (or enforce explicit returns if Rust’s implicit last-expression return is used).
* [ ] **PHASE 5: Structs and other types**
   * [ ] Transpile `struct` definitions; strip `pub`; map/validate field types to WGSL equivalents.
   * [ ] Transpile enums and tuples.
   * [ ] Recognize and preserve WGSL vector/matrix keywords (`vecN<f32>`, `matMxN<f32>`).
   * [ ] Decide on policy for aliases (defer or define minimal mappings), while ensuring unsupported types are rejected with clear errors.
* [ ] **PHASE 6: Module imports**
   * [ ] Remove top-level `mod`/`use` ‘boilerplate’ imports.
   * [ ] Recognize top-level `mod`/`use` that import other `.rs` files that will *also* need to be transpiled, and convert them to Bevy-style WESL `#import` statements **without resolving them**.
* [ ] **PHASE 7: Documentation and tidying**
   * [ ] Document the supported Rust subset and coding conventions for writing Rust that will successfully transpile to WGSL.
   * [ ] Clarify how to denote entry points and bindings (e.g., using raw WGSL attributes in Rust code).
   * [ ] Update the README or wiki accordingly.

===

> *Below is an AI-assisted analysis of this project, mid October 2025*

## GitHub CoPilot in VS Code

I am returning to this project after nearly a year, so I don’t remember clearly how far it has progressed, or what the next steps are.

Please analyse this repo, and tell me about:
1. Any bugs or problems you find
2. What seems to be the most recently completed parts
3. What you think a logical, prioritised roadmap would be

Here is some background, to give you a broader context, and help you understand the purpose of `rust-to-wgsl`;

---

I am building a new game engine called 'Undoiverse' for web browsers which will use:

1. WebGPU WGSL shaders
2. Ray Marching and SDFs (fragment shader)
3. Compute shader for culling and some simulation
4. WebAssembly WASM from Rust, for scene orchestration and other simulation, and also for realtime audio synthesis
5. TypeScript to glue everything together, handle UI and network interactions, display text overlays, etc

My current problem is that, even at a very early stage, the shader files are getting too large and unwieldy. I need to start using a proper modular architecture.

I have looked at WESL as way to `#import` modules, which does help a little, but **I have decided not to use WESL.**

I would really like to be able to unit-test individual, small WGSL functions. I also want to compare before/after performance when I refactor small sections of WGSL code.

I have observed that Rust and WGSL have similar syntax, and if I defined types like `vec3f` and `mat4x4f` in a Rust app, then Rust code could become *almost* a superset of WGSL.

**To be clear:**
- There would be a Rust app which fully compiles and runs entirely on the CPU (not GPU).
- Its 'core' functionality would be a few dozen .rs files which only use some subset of Rust syntax (a subset that can be easily transpiled to .wgsl syntax)
- These 'core' .rs files would never use 3rd party dependencies
- That ‘core’ of .rs files would be supported by boilerplate Rust (not needed in the .wgsl output), to provide types like `vec3f` and `mat4x4f`. Other supporting boilerplate could provide some way of rendering a frame to a PNG.
- There would be a Node TypeScript utility which uses `rust-to-wgsl`:
  1. Ignores the 'boilerplate' .rs files
  2. Assembles the 'core' .rs files by parsing their `mod` imports
  3. Deletes boilerplate-specific `mod` imports
  4. Uses `rust-to-wgsl` to transpile the assembled Rust code to WGSL
  5. Outputs a single .wgsl file

By the way, an extra advantage to this approach is that we will end up with many functions which will run on the CPU (via WASM) or the GPU (in a WGSL 'compute' shader). That will add an extra layer of flexibility, and could help improve overall performance.

===

### Claude Sonnet 4.5

I'll analyze the repository to understand its current state, identify any issues, and suggest a roadmap. Let me start by examining the codebase systematically. 

...

Now let me create a comprehensive analysis document:

Based on my examination of the codebase, here's a comprehensive assessment:

---

#### 1. **Bugs and Problems Found**

##### Critical Issues:
- **No actual Rust-to-WGSL transformation yet**: The project currently only handles trivial transformations:
  - ✅ `let` → `var` (the only transformation implemented)
  - ✅ Comments are preserved
  - ⚠️ Chars and strings generate errors (intentional, as they have no WGSL equivalent)
  - ❌ No function signatures (`fn` → function declarations)
  - ❌ No struct handling
  - ❌ No control flow (`if`, `for`, `while`, `match`)
  - ❌ No operators or expressions beyond basic parsing
  - ❌ No type transformations beyond detection

##### Minor Issues:
1. **Incomplete Unicode support**: TODOs indicate missing XID_Start/XID_Continue character sets for proper identifier parsing
2. **`macro_rules!` and `'static`** not properly detected by the identifier parser (noted in TODOs)
3. **Duplicate lexer systems**: There's both `roughlyParseRust()` and `roughlyTokenizeRust()` - appears to be mid-refactor
4. **Unused `pos` fields**: Many parsed parts track position but it's marked as potentially unused
5. **No semicolon handling**: While detected, semicolons aren't explicitly handled in transformations
6. **Limited error messages**: Errors for chars/strings just report position, not helpful context

##### Documentation Issues:
- Minimal JSDoc comments (many are empty or incomplete)
- `transformParts()` has no meaningful documentation
- No architecture documentation explaining the pipeline

---

#### 2. **Most Recently Completed Parts**

Based on git history (December 2024 - October 2025):

##### Latest work (Oct 2025):
- ✅ **Playground refinements** - interactive demo with button state management
- ✅ **Unterminated block comment detection**

##### Foundation (Dec 2024 - Jan 2025):
- ✅ **Comprehensive lexer infrastructure**:
  - Comment detection (inline `//` and nested block `/* */`)
  - String literal parsing with escape sequences
  - Number literal parsing (decimal, hex `0x`, octal `0o`, binary `0b`)
  - Character literal detection
  - Whitespace categorization
  - Punctuation and delimiter detection

- ✅ **Type system awareness**:
  - Rust types: `char`, `str`, `String`, `Vec`, `Option`, `Box`, plus integer/float types
  - WGSL types: vectors (`vec2f`, `vec3i`), matrices (`mat4x4f`), atomic types
  - Shared types: `bool`, `f32`, `i32`, `u32`

- ✅ **Keyword recognition**: Full Rust keyword set (55+ keywords)

- ✅ **Error handling framework**: Notice system with severity levels

- ✅ **Comprehensive test suite**: Unit tests for all lexer components

---

#### 3. **Logical, Prioritized Roadmap**

Given your goal of transpiling modular Rust "core" files to WGSL for Undoiverse, here's what I recommend:

##### **Phase 1: Core Language Features** (Foundation - 2-3 months)

**Priority 1A - Function Declarations** (CRITICAL)
- [ ] Transform `fn func_name(a: f32, b: vec3f) -> vec3f { }` to WGSL function syntax
- [ ] Handle function parameters and return types
- [ ] Transform function bodies (basic statements first)
- [ ] Add unit tests for simple functions
- **Why first**: Functions are the atomic unit of reusable GPU code

**Priority 1B - Basic Expressions & Operators**
- [ ] Arithmetic operators: `+`, `-`, `*`, `/`, `%`
- [ ] Comparison operators: `==`, `!=`, `<`, `>`, `<=`, `>=`
- [ ] Logical operators: `&&`, `||`, `!`
- [ ] Assignment: `=`, `+=`, `-=`, etc.
- [ ] Member access: `.x`, `.rgb`, array indexing `[i]`
- **Why second**: Functions need expressions to be useful

**Priority 1C - Control Flow**
- [ ] `if`/`else` statements
- [ ] `for` loops (especially important for shaders)
- [ ] `while` loops
- [ ] `return` statements
- [ ] `break` and `continue`
- **Why third**: Enables actual shader logic

##### **Phase 2: Type System & Data Structures** (3-4 weeks)

**Priority 2A - Struct Definitions**
- [ ] Transform `struct MyStruct { field: f32 }` to WGSL struct syntax
- [ ] Handle struct methods → standalone functions (WGSL has no methods)
- [ ] Struct initialization syntax
- **Critical for**: Uniform buffers, vertex inputs, fragment outputs

**Priority 2B - Type Transformations**
- [ ] Map Rust types that have no WGSL equivalent (decide on strategy)
- [ ] Transform Rust-specific integer types (`i64`, `u64`, `i128`) - generate warnings
- [ ] Handle generic type parameters where possible
- **Important for**: Ensuring type safety across the boundary

##### **Phase 3: Rust Module System → WGSL Assembly** (3-4 weeks)

**Priority 3A - Module Parser** (Node.js/TypeScript utility)
- [ ] Parse Rust `mod` and `use` statements
- [ ] Build dependency graph of .rs files
- [ ] Identify "core" vs "boilerplate" files
- [ ] Topological sort for correct ordering
- **This is essential**: Your stated goal requires assembling multiple files

**Priority 3B - Boilerplate Filtering**
- [ ] Remove `use` statements for boilerplate modules
- [ ] Strip out CPU-specific helper code
- [ ] Keep only transpilable Rust subset
- **Enables**: Clean WGSL output without Rust helpers

**Priority 3C - Output Generation**
- [ ] Assemble all transformed functions into single .wgsl file
- [ ] Add header comments with metadata
- [ ] Optional: Generate source maps for debugging
- **Completes**: The full transpilation pipeline

##### **Phase 4: Advanced Features** (As needed)

**Priority 4A - WGSL-Specific Attributes**
- [ ] `@vertex`, `@fragment`, `@compute` function attributes
- [ ] `@binding`, `@group` for uniforms/storage
- [ ] `@location` for input/output
- [ ] `@builtin` for shader inputs (position, vertex_index, etc.)
- **How**: Use Rust attributes or comments to specify these
- **Critical for**: Actually running the shaders

**Priority 4B - Built-in Functions**
- [ ] Math functions: `sin`, `cos`, `sqrt`, `pow`, etc.
- [ ] Vector operations: `dot`, `cross`, `normalize`, `length`
- [ ] Matrix operations: `transpose`, matrix multiplication
- [ ] Texture sampling (if needed)
- **Most of these**: Can probably pass through unchanged

**Priority 4C - Optimizations**
- [ ] Dead code elimination
- [ ] Constant folding
- [ ] Inline small functions
- **For**: Keeping shader size manageable

##### **Phase 5: Developer Experience** (Ongoing)

**Priority 5A - Error Messages**
- [ ] Improve error reporting with line numbers and context
- [ ] Suggest fixes for common mistakes
- [ ] Warn about unsupported Rust features
- **For**: Faster development iteration

**Priority 5B - Testing Infrastructure**
- [ ] Integration tests with real shader examples
- [ ] Performance benchmarks
- [ ] Visual regression tests (render to image, compare)
- **For**: Confidence in refactoring

**Priority 5C - Documentation**
- [ ] Write guide on supported Rust subset
- [ ] Document the "boilerplate" pattern
- [ ] Provide example project structure
- [ ] API documentation
- **For**: Making this usable by others (including future you)

---

#### **Immediate Next Steps** (What to do first)

1. **Define the target Rust subset** (1-2 days)
   - Write a concrete example of "core" Rust code you want to transpile
   - Document what's allowed vs. forbidden
   - Create example .rs files with all supported patterns

2. **Implement function transformation** (1 week)
   - Start with simplest case: `fn add(a: f32, b: f32) -> f32 { a + b }`
   - Incrementally add parameter types, return types, body statements
   - Test against WGSL compiler (Tint)

3. **Build end-to-end example** (3-4 days)
   - Create a minimal raymarching shader in your Rust subset
   - Transpile it manually first to verify it's possible
   - Implement just enough transformation to make it work
   - This validates the entire approach before investing more time

4. **Implement expressions** (1-2 weeks)
   - Start with arithmetic: `a + b * c`
   - Add comparisons and logical operators
   - Test thoroughly with complex nested expressions

5. **Add control flow** (1 week)
   - `if`/`else` first (most common)
   - Then `for` loops (essential for shaders)
   - `while` and others as needed

---

#### **Key Decision Points**

Before proceeding, you should decide:

1. **How to handle unsupported types**: 
   - Error? Warning? Silent omission? Type substitution?
   - Example: What happens if someone uses `String` or `Vec`?

2. **Method handling strategy**:
   - Transform `vec.normalize()` → `normalize(vec)`?
   - Generate helper functions? Inline?

3. **Macro handling**:
   - Ignore them? Expand them? Error?
   - `println!` should probably be stripped/ignored

4. **Comments preservation**:
   - Keep all? Strip? Configurable?

5. **Attribute syntax**:
   - Use Rust attributes: `#[vertex]`?
   - Use special comments: `// @vertex`?
   - External configuration file?

---

#### **Summary**

**Current State**: The project has excellent lexer infrastructure but minimal transformation logic. It's ~5% complete for your stated goals.

**Biggest Gap**: No function, struct, or expression transformation yet - the core of what you need.

**Recommended Focus**: Build Phase 1 (functions, expressions, control flow) first. This gives you something immediately usable for simple shaders. Then add the module system (Phase 3) to handle your multi-file use case.

**Estimated Timeline to MVP**: 2-3 months of focused work to get a usable transpiler for simple raymarching shaders.

The foundation is solid - you just need to build the actual transformation layer on top of the excellent parsing infrastructure you've created!

===

A great answer thank you Claude Sonnet 4.5!

It’s an important question, so I would like an alternative opinion from GPT-5-Codex. Please read my previous prompt (pay attention to points to "tell me about" 1, 2 and 3). Please also read Claude Sonnet 4.5’s response, which looks very good to me. But I would value a different take from Claude, please.

===

### GPT-5-Codex (Preview)

**Key Findings**  
- rust-to-wgsl.mjs still only remaps `let`→`var`; everything else passes through untouched, so any non-trivial Rust (functions, control flow, type annotations) currently produces WGSL that is still Rust (transform-parts.mjs).  
- Chars and strings are treated as hard errors because `roughly-parse-rust` emits `errors.push("Contains a char…")`; for actual shader kernels you’ll hit those constantly unless there’s an escape hatch (roughly-parse-rust.mjs).  
- There are two parallel front-ends—`roughlyTokenizeRust` and `roughlyParseRust`—with overlapping responsibilities but no shared IR; the duplication is already causing TODO debt (for example whitespace/token caching) and will slow future changes (roughly-tokenize-rust.mjs).  
- The current test suite only exercises scalar snippets; there’s no coverage of module assembly, struct declarations, or control flow, so regressions in those future areas would go unnoticed (test.mjs runs small literals-only fixtures).

**Recent Progress**  
- The most recent work tightened the Playground UX and added accurate diagnostics for unterminated block comments, showing attention to tooling polish (index.html, commit `ae7c395`).  
- Early 2025 commits laid down a comprehensive literal/whitespace classifier and notice system, demonstrating a strong foundation for lexical accuracy (series from `13f59d2` through `bf22695`).  
- Number parsing now understands exponential notation and suffixed integers, suggesting the lexer is nearing parity with Rust numerics (is-literal-number.mjs).  
- Tests for each lexer helper function are in place and passing, so the low-level scaffolding is reliable (see `lib/rough-lexers/*/*.test.mjs` outputs referencing “OK: All … tests passed!”).

**Suggested Roadmap**  
1. **Consolidate the frontend**: choose one pipeline (`roughlyParseRust` vs `roughlyTokenizeRust`) and produce a single typed AST; without that, higher-level transforms will remain brittle.  
2. **Define the supported Rust subset**: capture it in fixture `.rs` files and failing tests so the transformation contract is explicit (start with functions, struct definitions, loop/control flow).  
3. **Implement function + block lowering**: translate `fn` signatures, statements, and basic expressions into WGSL equivalents, with round-trip tests comparing against Tint output.  
4. **Handle type mapping and diagnostics**: introduce a mapper for allowed Rust→WGSL types, emit structured warnings for unsupported forms, and decide policy for chars/strings (convert, shim, or block).  
5. **Build the module assembler**: create the Node/TS utility that resolves `mod` graphs, filters boilerplate, and feeds concatenated “core” code into the transpiler, yielding a single `.wgsl`.  
6. **Add shader metadata hooks**: design how Rust attributes (or comments) map to WGSL annotations (`@group`, `@binding`, `@stage`), ensuring generated code is ready for Undoiverse integration.

Natural next steps: break ground on the frontend consolidation (#1) and draft the Rust subset spec (#2); these unlock the rest of the roadmap.

===

## https://chatgpt.com/

What do you think of this project?

https://github.com/richplastow/rust-to-wgsl
https://richplastow.com/rust-to-wgsl/

===

### ChatGPT 5 Thinking

Love it — this is exactly the kind of pragmatic “small, strict subset” approach that can make Rust→WGSL workable without dragging in a full compiler.

Here’s what stands out (and what I’d tighten next):

#### What’s already strong

* **Clear scope & honesty about gaps.** The README and playground focus on tiny, verifiable steps (comments, `let`→`var`, explicit call-outs that chars/strings have no WGSL equivalent). That’s the right starting discipline. ([GitHub][1])
* **Simple tooling & quick feedback.** A tiny JS/TS transpiler with runnable examples and a live playground makes iteration fast. MIT license is a plus. ([GitHub][1])

#### Biggest wins to tackle next

1. **Formalize the “allowed Rust” subset.**
   Publish a table: *Rust syntax/semantics → WGSL equivalent / not supported*. Start with:

   * Scalars, `vecN<f32>`, `matN<M>f`, arrays with fixed length
   * `fn` (no generics/traits), `const`, `let` (no refs/borrows), `if/else`, `for`/`while`, `return`
   * Arithmetic/bit ops, casts (`as`), indexing, swizzles
   * What’s explicitly **disallowed** (strings, chars, heap, traits, generics, references, recursion, pattern matching beyond simple destructures, 64-bit types, etc.)
     This doc becomes your north star and makes PRs reviewable.

2. **Switch from ad-hoc parsing to a real parser.**
   Hand-rolled token juggling will break as you add constructs. Two practical options while staying in Node:

   * **tree-sitter-rust** for a robust AST you can consume in TS.
   * Or keep the transpiler in TS but call a tiny Rust helper (using **syn**/**rustc_ast** to JSON AST) and emit WGSL from TS.
     Either way, move to **AST → WGSL emitter** with precise error messages.

3. **Golden tests + differential validation.**

   * Keep your current unit tests, then add **golden output** tests (expected WGSL snapshots).
   * Pipe emitted WGSL through **Tint or Naga** in CI to guarantee it validates (WGSL-in → WGSL-out). The README already points to Shader Playground; automating that check locally/CI is the next step. ([GitHub][1])

4. **CPU↔GPU conformance harness.**
   Your selling point is “same logic on CPU (Rust/WASM) and GPU (WGSL)”. Ship an `examples/` pair where:

   * A Rust WASM test runner executes the Rust functions on arrays of test vectors.
   * A WebGPU compute shader runs the emitted WGSL on the same vectors.
   * The harness compares buffers and prints diffs (and measures GPU time via timestamp queries).

5. **Module assembly & hygiene.**
   You mention assembling via `mod` and stripping boilerplate — great. Add:

   * A tiny **module resolver** (search paths, ignore list for boilerplate) with deterministic order.
   * A “single-file output” option (today’s default) plus an optional **multi-file WGSL** output with import comments to aid debugging.

6. **Type mapping & literals pass.**
   Nail down conversions that commonly bite:

   * Numeric literals (`1` vs `1.0`, suffix handling)
   * Constructor syntax (`vec3(…)`) versus Rust struct-ish forms
   * Array sizes as compile-time constants
   * Casting rules (`as f32`), and ban implicit narrowing

7. **Roadmap (make it explicit in the README).**
   Short phases, each shippable:

   * P0: pure math functions (no storage), `vecN`, control flow ✔︎
   * P1: structs, arrays, user types (no pointers), const exprs
   * P2: storage/binding models for compute (uniforms/storage), entry-point scaffolding (optional)
   * P3: limited generics via monomorphization (maybe), or explicitly “no generics”

#### Comparators & differentiation (why this is useful)

* Unlike rust-gpu or CubeCL, this keeps the **output as WGSL source** (perfect for browsers) and embraces a **very strict Rust subset**, which makes unit-testing and code review much simpler. Your “throw on disallowed features” stance matches what succeeds in similar projects — just document the subset and enforce it with the parser. (Context only; your repo focuses on direct Rust→WGSL.) ([GitHub][1])

#### Small, concrete repo tweaks

* Add a **`SUBSET.md`** and **`ROADMAP.md`**.
* Add **`/scripts/validate-wgsl`** that runs Tint/Naga locally and in CI on every example/output.
* Expand **`examples/`** with: arithmetic ops, casts, arrays, structs, functions calling functions, simple loop, early return, swizzles. The playground already lists the first four demos — keep growing that set and mirror them in tests. ([richplastow.com][2])
* Print **source locations** in errors (line/column) to make adoption pleasant.

Overall: promising foundation, good taste in constraints, and the path to something immediately useful is clear. If you want, I can sketch the tree-sitter pipeline and a minimal AST→WGSL emitter structure next (nodes, visitors, and a tiny type checker).

[1]: https://github.com/richplastow/rust-to-wgsl "GitHub - richplastow/rust-to-wgsl: Transforms Rust source code to WebGPU Shading Language (WGSL) source code"
[2]: https://richplastow.com/rust-to-wgsl/ "Rust to WGSL Playground"

===

I am the author of rust-to-wgsl, and I am returning to it after nearly a year, so I don’t remember clearly how far it has progressed, or what the next steps are.

Please analyse the repo, and tell me about:
1. Any bugs or problems you find
2. What seems to be the most recently completed parts
3. What you think a logical, prioritised roadmap would be

===

### ChatGPT 5 Deep Research (granted access to the repo)

Thanks for clarifying! To give you the most accurate and helpful analysis of your rust-to-wgsl repo, could you please confirm a few things:

Should I prioritize only the code under src/ and the playground, or also review tests, CI setup, and documentation?

Do you want feedback on parser/transpiler correctness only, or also on project structure and usability (e.g. CLI interface, dev experience)?

Are there any recent commits or branches you've worked on locally that aren't pushed to GitHub yet?

Once I know this, I’ll dive into the current repo state and get you a detailed summary of what’s done, what’s broken, and what makes sense to do next.

=== 

1. Review everything please, given what we talked about above (the wider use-case, the new game engine for web browsers)
2. Everything you mention, please
3. No

===

Great — I’ll do a full review of the richplastow/rust-to-wgsl repository in light of your new game engine architecture. I’ll check for bugs, incomplete features, and recent progress, and I’ll recommend a logical, prioritized roadmap aligned with your goals: modular shader design, shared CPU/GPU logic, and WGSL compatibility.

I’ll get back to you shortly with a comprehensive analysis and roadmap plan.

Research completed in 14m • 25 sources • 8 searches

---

#### Rust-to-WGSL Repository Analysis and Roadmap

##### Current Bugs and Limitations

* **Unsupported Rust features (Strings/Chars):** The converter does not support Rust string literals or char literals – it preserves them verbatim in output and flags errors. For example, the README explicitly notes “Rust chars have no WGSL equivalent” and “Rust strings have no WGSL equivalent”. In the code, encountering a `'` or `"` triggers an error message (`"Contains a char at pos X"` or `"Contains a string at pos X"`) and the literal is passed through to the WGSL output unchanged. As a result, any Rust code containing string/char literals will produce WGSL output that is invalid (WGSL has no string/char type) along with error messages indicating the unsupported literals.

* **Rust-specific keywords in output:** Certain Rust keywords or syntax that have no meaning in WGSL are not yet handled. For instance, the Rust keyword `let` is correctly translated to WGSL `var`, but other keywords like `mut` are simply preserved. Since WGSL doesn’t use `mut` for variable declarations, a Rust snippet like `let mut x = 5;` would yield `var mut x = 5;` in WGSL, which is invalid. Similarly, other Rust-only keywords (`pub`, `crate`, `ref`, etc.) or syntax (`&` references, lifetime annotations) would be carried into the output unchanged, likely causing WGSL compile errors. These cases are not yet flagged as errors or removed – they are simply not specifically handled in the transformation logic.

* **Type mismatches and numeric literal suffixes:** The tool does not fully account for differences in Rust vs WGSL types. It will copy Rust types and numeric suffixes into the output even if WGSL doesn’t support them. For example, Rust integral types like `i8`, `u16`, or `usize` are classified as Rust-only types in the lexer but the transformer does not error or convert them. A Rust variable of type `i8` would appear as `i8` in WGSL output – however, WGSL only supports 32-bit ints (`i32/u32`). Similarly, numeric literals with Rust suffixes (e.g. `100u16`, `1.5f64`) are output exactly as written. The lexing phase does parse such literals (including binary/hex with suffixes) correctly, but the transform phase hasn’t implemented any conversion or error for them. This means the WGSL result might contain literals like `0xFFu8` or `1.0f64` which WGSL’s parser would not accept. In short, any Rust-only numeric types or suffixes are a **known limitation** – they currently pass through and would need to be addressed in future updates.

* **Incomplete punctuation handling:** The rough parser currently tokenizes only a few delimiters (it special-cases `{` and `;` as separate tokens) but many punctuation symbols are not handled explicitly. For instance, an opening curly brace `{` is recognized and output as its own token, but a closing brace `}` is not explicitly handled. In practice, a `}` ends up lumped into a whitespace token by default logic (since there's no case for it in the switch). This is a bug in classification – closing braces (and likely other symbols like `(`, `)`, `,`, `=`) are treated as generic characters and get merged into neighboring whitespace or identifier tokens rather than being isolated. This could lead to subtly malformed output or at least incorrectly classified tokens (e.g. a `+` or `)` might be inside a `WHITESPACE` token). The current output text is usually correct (punctuation is preserved in the right places), but from a parsing/highlighting perspective it’s fragile. The absence of handling for `}` (and others) should be fixed to properly separate punctuation tokens.

* **Unfinished whitespace and escape handling:** The code distinguishes common whitespace vs “rare” Unicode whitespace, but the implementation is incomplete. In the `roughlyParseRust` state machine, when it enters the `WHITESPACE_RARE` state, the logic is left as a TODO and the case falls through without a proper exit condition. This is clearly a bug – if any rare whitespace characters (e.g. vertical tabs, form feeds) appear, the parser will not handle the transition correctly. (In fact, a unit test for rare whitespace is present but commented out, indicating this feature was started and not finished.) Similarly, certain escape sequences are handled in string literals (like `\"` or `\\` inside strings), but other aspects (like Unicode escapes `\u{…}` in char/string literals or byte string prefixes `b"` in Rust) are not addressed. Byte literals (e.g. `b'A'`) are another edge case – the older tokenizer logic could identify `LITERAL_BYTE` tokens, but the current parser does not explicitly handle the `b'...'` prefix, meaning such literals likely produce a spurious “Contains a char” error or get mis-tokenized. These unimplemented pieces are minor on their own, but collectively they point to areas that need completion to robustly handle all Rust lexical forms.

* **Lack of deeper syntax understanding:** Currently, the transformation operates mostly at a lexical level – it splits the input into tokens and then, aside from a special case for `let`, it outputs the tokens essentially unchanged. This means there is no true parsing of Rust syntax or AST generation. As a result, more complex Rust constructs (function definitions, control flow, structs, etc.) aren’t translated beyond a superficial text substitution. For example, an entire `fn` function definition in Rust would mostly copy over to WGSL, even though WGSL’s function syntax is similar, there could be differences (attribute annotations for entry points, no concept of `pub`, etc.) which aren’t accounted for yet. There’s also no validation that, say, a `for` loop or iterators (which Rust has but WGSL does not in the same form) are disallowed – they would just be output and likely cause WGSL compilation errors. In essence, anything beyond the simplest expression or variable declaration may not be handled correctly at this stage. The project will need a more semantic approach as it evolves (or at least a richer rule-based transformation) to truly map Rust logic into valid WGSL code.

##### Recent Progress and Completed Features

Despite the above limitations, the project has made solid progress in certain areas, especially in the past updates (version 0.0.2 as of Oct 2025). Notable recent accomplishments include:

* **Robust Lexical Analysis for Numerics:** The most substantial recent work appears to be on lexing numeric literals. The parser can now recognize Rust numeric literals in decimal, hex (`0x`), binary (`0b`), and octal (`0o`) forms, including ones with underscores and type suffixes. Unit tests cover a wide range of cases – from simple numbers like `0` or `9` to complex forms like `0x___00_0` or `123__45_.___678_90f64` – verifying they are tokenized into the correct `NUM_*` categories. Even edge cases such as incomplete literals (`0x` with no digits, or invalid digits in a given base like `0o8`) are handled by splitting them into an initial valid token and an `UNIDENTIFIED` remainder. This comprehensive number handling was likely one of the latest major milestones, as it significantly improves the fidelity of Rust-to-WGSL conversion for numeric constants.

* **Basic Keyword and Type Differentiation:** The lexer now differentiates Rust keywords and type names, tagging them so they can be highlighted or transformed appropriately. For example, after reading an identifier, it checks against a set of Rust keywords (`if`, `else`, `fn`, `loop`, etc.) and built-in type names. It categorizes identifiers as `KEYWORD`, `TYPE_BOTH`, `TYPE_RUST`, or `TYPE_WGSL` depending on whether they are known in Rust, WGSL, both, or neither. This feature was completed recently, as evidenced by the presence of those classification sets in the code and tests expecting certain tokens to be identified correctly. While the transformation step doesn’t yet leverage this fully (besides the `let` keyword), it’s an important foundation. It means the tool is aware, for instance, that `vec4<f32>` is a WGSL type or that `String` is a Rust-only type, which is useful for producing warnings or future conversions.

* **Preservation of Comments and Formatting:** One part of the tool that is already working well is the handling of comments and basic formatting. Inline `//` comments and block `/* ... */` comments are preserved exactly from Rust source to WGSL output. The lexer treats them as distinct tokens (`INLINE_COMMENT`, `BLOCK_COMMENT`) and they are carried through without modification, ensuring the intent and annotations in original code remain intact in the output. The examples highlight this: example 1 and 2 show that both inline and nested block comments come out unaltered in the WGSL result, which is valuable for a transpiler (it keeps your shader code commented as in the source). Whitespace is also largely preserved. This indicates that the parsing logic is careful to not disturb code layout, an important detail for readability. This part of the implementation (comment/whitespace tokenization) was likely completed earlier on, but it has been maintained and extended (e.g. support for nested block comments with correct depth tracking was added) up through the latest version.

* **HTML Highlighting in the Playground:** Another recently completed aspect is the **Playground** web interface and syntax highlighter. The project provides an interactive web page (hosted at the author’s site) where you can type Rust code and see highlighted WGSL output live. The underlying library supports an option to output highlighted HTML, wrapping tokens in `<span>` tags with CSS classes for keywords, numbers, comments, etc.. This is implemented in `highlightWGSL()` which assigns classes like `"keyword"`, `"number"`, `"comment"`, etc., to different token kinds. Tests confirm that highlighting works (for example, a test converting a sample code to HTML-highlighted WGSL shows the `<span class="...">` wrappers applied correctly). The existence of the `docs/` folder with a rollup build script and a versioned playground suggests that the author recently got the web demo fully working. In short, the tooling around the core conversion (the test suite, the playground, and the highlighter) is operational. These completed parts provide a good base to build upon.

* **Basic Transformation Rule (let→var):** While most Rust tokens currently output “as is,” one concrete transformation rule has been implemented and tested: converting Rust’s `let` to WGSL’s `var`. This reflects the semantic difference that Rust’s `let` declares a mutable variable by default (which corresponds to `var` in WGSL, since WGSL’s `let` would mean an immutable constant). The code explicitly substitutes `wgsl: 'var'` when it encounters a `KEYWORD` token that is `"let"`. Example 2 confirms this behaviour: the Rust code `let a: u32 = 1; ... let c = a + b;` results in WGSL `var a: u32 = 1; ... var c = a + b;`. This rule was likely one of the first transformation features added, but it’s noteworthy as *complete* – it was revisited and verified with tests and examples, so it works reliably now. It sets a pattern for how other rules (for other keywords or constructs) can be added going forward.

Overall, the repository’s recent activity shows it has a solid foundation: the lexical analysis is quite thorough (especially for numbers and identifiers), the comment preservation and highlighting are in place, and a pipeline (with tests and a live playground) is operational. These completed parts provide a good base to build upon.

##### Recommended Roadmap and Priorities

Given the wider goal – integrating this tool into a new web-based game engine (likely to automate shader generation for WebGPU) – the next steps should focus on expanding Rust-to-WGSL compatibility in a pragmatic, prioritized way. Below is a logical, prioritized roadmap:

1. **Address Known Bugs and Gaps First:** Start by fixing the obvious issues in the current implementation:

   * Implement proper handling for the closing brace `}` and other punctuation. Ensuring every opened `{`/`(` is tokenized with a matching `}`/`)` token (and similarly for commas, etc.) will prevent malformed outputs. This is a relatively small fix in the lexer that will improve reliability.
   * Complete the `WHITESPACE_RARE` handling and related TODOs. Finalize the logic to tokenize rare whitespace (or decide to normalize/ignore them) so that code with form-feed or vertical tabs doesn’t break the parser. Remove or implement the other small TODOs (like using full Unicode identifier sets) to make the lexer fully robust.
   * Filter out or flag unsupported Rust keywords. In the transform phase, add cases to drop keywords like `mut`, `ref`, `crate`, etc., or at least produce a clear error if they appear. For example, the transformer could simply omit `mut` in the output (since WGSL variables are implicitly mutable) – this is straightforward string handling once those tokens are identified.
   * Add an explicit error for unsupported Rust types (or auto-convert where possible). Right now types like `i64` or `f64` silently pass through; it would be better to catch these. For instance, if the input contains a variable of type `f64`, the converter should push an error like “`f64` not supported, use `f32`” and perhaps default the output to `f32`. Similarly, smaller ints (`i16`, `i8`, etc.) could default to `i32` or error out. Handling these cases early will prevent the game engine from ingesting invalid WGSL.
   * Improve error messaging for literals. The current messages (“Contains a string at pos X”) are technically correct but not very user-friendly. Consider rephrasing errors to be more descriptive (e.g. “Rust string literal is not supported in WGSL”) and possibly include the literal itself. Since the playground is live, clearer messages will help developers quickly identify and fix issues in their shader code.

2. **Expand the Supported Rust Subset for Shaders:** Once the current parser is bug-free for what it does handle, extend it to cover more of the Rust language that is relevant to WGSL shaders:

   * **Functions and scopes:** Implement parsing of function definitions (`fn`) and their bodies. WGSL’s function syntax is similar to Rust’s, so much can carry over, but you’ll need to handle the removal of Rust-specific items (no `pub` or lifetime annotations in WGSL, and function parameters in WGSL need explicit types and possibly address spaces for pointers). Initially, you could support free-standing functions as WGSL entry points or helpers. This requires recognizing a `fn name(...){...}` structure and ensuring the braces are balanced (the lexing groundwork is there, but you might implement a simple recursive descent or stack to group tokens into a function block). Once functions are parsed, you can transform their signature: for example, omit any visibility modifiers, ensure return types use only WGSL types, etc.

   * **Control flow statements:** Add support for translating Rust control flow that has a direct WGSL equivalent. WGSL supports `if`/`else`, `switch` (similar to `match` in limited form), loops, and continuing, but does **not** support iterators or Rust’s `for x in range` sugar. Likely priorities:

     * *If/Else:* These can largely be copied as-is (Rust `if/else` maps to WGSL `if/else`). Just verify that block braces are handled and that any `else if` chains remain intact. This should be straightforward given that `if`, `else` are already recognized as keywords.
     * *Loops:* WGSL has a `loop {}` construct (and you break out with `break` or continue with `continuing` block) and a C-style `for` loop was introduced in recent WGSL spec versions. Rust’s `loop` can map directly to WGSL `loop`. A Rust `while` can map to a WGSL `loop` with an `if` break, or if WGSL now has `while` (it might not), but you can convert it easily. The biggest gap is Rust’s `for x in 0..N`: since WGSL doesn’t have iterators, you might either prohibit that or transform it into an indexed loop manually (unrolling or using a `for` with index if WGSL supports classic for). Initially, it’s fine to disallow Rust’s `for` and throw an error indicating it’s not supported – engine developers can use `loop`/`while` constructs instead.
     * *`return` statements:* WGSL and Rust both use `return`, but ensure that in WGSL, returning from a function is only allowed in function (not from inside a pipeline stage entry without returning to an output struct – though that’s a detail outside the transpiler’s scope for now). The translator can mostly leave `return` in place. Just be cautious if Rust uses the implicit last-expression return – WGSL requires an explicit `return` for non-void functions. It might be necessary to detect if a Rust function’s last statement is an expression and insert a `return` keyword in WGSL output. This is an advanced detail; initially you might enforce that users write `return` explicitly for clarity.

   * **Structs and user-defined types:** In a game engine context, shaders often use struct types (for uniform buffers, input/output, etc.). Supporting `struct` definitions in Rust code and translating them to WGSL `struct` is highly valuable. Fortunately, Rust’s struct syntax is very similar to WGSL’s. You should be able to parse `struct Name { ... }` and output it unchanged (aside from translating field types). Many Rust field types (e.g. `f32`, `u32`, vectors) will have direct WGSL counterparts (the lexer’s `TYPE_BOTH` and `TYPE_WGSL` setscan guide you here). For any field with an unsupported type, error out or substitute. One thing to strip is Rust’s field visibility (e.g. `pub x: f32` – WGSL struct fields have no `pub` keyword). This again ties into filtering out `pub` in the tokenizer or transform. Implementing struct support will allow passing complex data to shaders (like uniform block structs), a key feature for a game engine.

   * **Mapping Rust types to WGSL types:** Beyond basic numeric scalars, expand support to vector and matrix types, which are common in shaders. WGSL uses types like `vec3<f32>` whereas Rust might represent these as a `Vec3` type or simply use a library type (which the transpiler might not handle). A straightforward approach is to at least handle WGSL vector/matrix keywords if they appear in the Rust code (for example, if the user writes `vec3<f32>` in their Rust shader module, classify that as `TYPE_WGSL` and let it pass). In the future, you might allow aliases: e.g., if the engine’s Rust code uses a type `Vec3` (perhaps a struct or alias), the transpiler could map it to `vec3<f32>` in WGSL. That’s more complex (requires knowing that `Vec3` means a WGSL float3), so it could be deferred. Initially ensure that at least literal WGSL types in angle-bracket form are recognized and preserved.

   * **Entry-point specifics:** Eventually, to fully integrate with WebGPU, shaders need entry point annotations (for vertex/fragment/compute). WGSL uses `@stage(vertex)` and so on, plus binding layout attributes (`@group(0) @binding(0)` etc. on resource declarations). There is no Rust equivalent for these in regular code, but since you’re writing the shaders in Rust, you might invent an attribute syntax (like using Rust attributes `#[vertex]` or comments that the tool can pick up). Designing this is a larger task, but as a roadmap item, it’s worth considering. For now, you might simply allow a user to include WGSL attributes in raw form in their Rust code (the WGSL `@...` syntax) and have the converter pass them through. They’d be seen as identifiers starting with `@`, which the current lexer might not handle cleanly (it doesn’t expect `@` as part of an identifier). So an intermediate step: update the lexer to recognize `@` as a valid token start for WGSL attributes (perhaps tokenize them as a special kind). Then, the output WGSL can include these lines unchanged. This will let advanced users mark entry points and resource bindings in their Rust source that survive the translation. It’s a lower priority than basic syntax support, but important for real-world use in an engine.

3. **Integration and Testing in the Engine Context:** As the feature set grows, plan for how `rust-to-wgsl` will be used within the game engine’s toolchain:

   * **Command-line or Library usage:** Determine if this transpiler will be a build-time tool (e.g., a script that converts Rust shader modules into WGSL files before compiling the game) or a runtime component (less likely, but possibly converting on the fly in the browser). If it’s build-time, you might want to reimplement it in Rust for easier integration with cargo or build scripts. However, reimplementing might be costly – an alternative is to compile the current project (written in JS) to a single JS file (already done via Rollup) and run it under Deno or Node as part of a build. In any case, having a CLI interface to feed in a `.rs` (or snippet) and get WGSL out would be useful. This could be a simple next step once the core translation is reliable.
   * **Automated Testing with Realistic Shaders:** Start writing a few sample shader codes (in the restricted Rust subset) that the engine would use – e.g., a simple vertex shader and fragment shader in Rust – and use `rust-to-wgsl` to generate WGSL. Then actually run these WGSL shaders in a WebGPU environment (perhaps via the [`shader-playground.timjones.io`](https://shader-playground.timjones.io/) or integration tests in the engine) to ensure they compile and work. This will quickly reveal any missing features or incorrect translations in a real scenario. It’s essentially an end-to-end test: from Rust source to WGSL to GPU execution. Given that the README already references such resources, doing this will validate the approach. Fix any issues discovered (for example, you might find that a certain needed feature like array types or constant definitions are missing and need to be added to the transpiler).
   * **Documentation and Developer Guidance:** As the tool stabilizes, document the supported Rust subset and any coding conventions for writing Rust that will successfully transpile to WGSL. Since this is for your game engine, this documentation will guide engine developers (or your future self) on how to write shader code in Rust. It should list things like “no heap allocations, no dynamic dispatch, no std lib – only core math operations, control flow, and structures are supported” and so on. Clarify how to denote entry points and bindings (the solution from the previous point). Essentially, treat this like a mini-language spec (Rust for WGSL) and update the README or wiki accordingly.
   * **Performance considerations:** Once functionality is in place, consider the performance of the transpiler for larger inputs. The current approach is string-based and probably fine for shader-sized code (which is typically not huge). But if needed, optimizations like using a single pass or improving tokenization speed (perhaps using Regex for some lexing) could be looked at. The code already mentions using a cache for lexing as a TODO. This isn’t urgent unless you plan on transpiling many shaders per frame (unlikely). However, if the tool will run in a browser (e.g., as part of a live reload workflow), efficiency could matter. Keep this in mind for later – first priority is correctness and coverage.

4. **Long-Term Enhancements:** Looking further ahead, once the core Rust-to-WGSL translation is reliable for essentially all WGSL features, you could explore advanced enhancements:

   * **Macro or attribute support for shader specifics:** Perhaps allow certain Rust procedural macros or attributes to denote shader layout (for example, a macro to declare a uniform buffer struct might automatically add WGSL group/binding attributes). This would integrate nicely with the Rust ecosystem, but it’s a complex task requiring either a Rust-side macro (outside the JS transpiler) or a more sophisticated parser in the transpiler to understand and inject WGSL attributes.
   * **Tooling around the transpiler:** Provide ways to verify and format the output WGSL. Maybe integrate a WGSL validator (like running Tint or naga in the background if available) to catch errors right after generation. This could be part of a test suite or an optional step in the playground that shows WGSL compiler errors.
   * **Port to Rust:** If the game engine is Rust-based, eventually porting this transpiler to Rust could be beneficial (so it can run as part of the engine or build process natively, without Node). The logic can be informed by the current JS implementation and tests. There is also the possibility of leveraging existing Rust parser libraries (e.g., using `syn` to parse Rust and then output WGSL) for a more robust solution. That said, this is a significant project on its own – the JS version is a working prototype, and it may suffice as a dev tool. Porting can be weighed against simply using Rust GPU libraries (like Embark’s rust-gpu that compiles to SPIR-V) and then converting SPIR-V to WGSL – but your tool has the advantage of producing human-readable WGSL directly.

By following this roadmap – **fixing bugs**, **extending support to necessary language features**, and **integrating with the engine’s workflow** – the `rust-to-wgsl` project can evolve from its current proof-of-concept state into a practical tool for the new game engine. Each step above builds on the last: first solidify what’s there, then gradually take on more Rust constructs that map to WGSL, and ensure the output works in real GPU scenarios. This phased approach will help prioritize development effort on features that unblock the engine’s needs (for example, struct and function support likely come before, say, macro attributes).

Given the progress so far and these next steps, an approximate plan could be:

* **Short term (weeks):** bug fixes and small improvements (item 1), plus basic support for dropping unsupported syntax.
* **Mid term (1-2 months):** implement functions, control flow, and structs (item 2), with iterative testing on actual shaders.
* **Longer term:** engine integration, polish, and potentially porting or advanced features (items 3 and 4).

Each implemented feature should be accompanied by new unit tests and example updates (just as you have done with the numeric literal tests and example cases). This will ensure regressions are caught and the tool remains reliable as it grows. With this roadmap, `rust-to-wgsl` can steadily move toward the ultimate goal: letting you write shader code in a Rust subset and seamlessly run it as WGSL in the browser – a powerful capability for your WebGPU-based game engine.

===

