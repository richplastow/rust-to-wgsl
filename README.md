# Rust to WGSL

> Transforms Rust source code to WebGPU Shading Language (WGSL) source code

- Version: 0.0.1
- Created: 2024-12-15 by Rich Plastow
- Last updated: 2024-12-23 by Rich Plastow
- Playground: <https://richplastow.com/rust-to-wgsl/>
- Repo: <https://github.com/richplastow/rust-to-wgsl>

## Examples

1. `node examples/run-01.mjs` Inline and block comments
2. `node examples/run-02.mjs` Rust’s `let` is equivalent to WGSL’s `var`
3. `node examples/run-03.mjs` Rust chars have no WGSL equivalent
4. `node examples/run-04.mjs` Rust strings have no WGSL equivalent

## Unit tests

`node test.mjs`

## Resources

- <https://play.rust-lang.org/>
- <https://shader-playground.timjones.io/> with Input format ‘WGSL’, Compiler #1
  ‘Tint’ ‘trunk’, Shader stage ‘\<all>’ and Output format ‘WGSL’

## Build

```zsh
npm install --global rollup
# added 4 packages, and audited 5 packages in 1s
# found 0 vulnerabilities
rollup --version           
# rollup v4.28.1
rollup -i rust-to-wgsl.mjs -o docs/rust-to-wgsl.js -f iife -n RUST_TO_WGSL
# rust-to-wgsl.mjs → docs/rust-to-wgsl.js...
# created docs/rust-to-wgsl.js in 87ms
```
