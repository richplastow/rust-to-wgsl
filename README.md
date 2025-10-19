# Rust to WGSL

> Transforms Rust source code to WebGPU Shading Language (WGSL) source code

- Version: 0.0.2
- Created: 2024-12-15 by Rich Plastow
- Updated: 2025-10-18 by Rich Plastow
- License: MIT
- Repo: <https://github.com/richplastow/rust-to-wgsl>
- Playground: <https://richplastow.com/rust-to-wgsl/>

## Examples

1. `node examples/run-01.mjs` Inline and block comments are preserved
2. `node examples/run-02.mjs` Rust’s `let` is equivalent to WGSL’s `var`
3. `node examples/run-03.mjs` Rust chars have no WGSL equivalent
4. `node examples/run-04.mjs` Rust strings have no WGSL equivalent

## Unit tests

`npm test`

## Resources

- <https://play.rust-lang.org/>
- <https://shader-playground.timjones.io/> with Input format ‘WGSL’, Compiler #1
  ‘Tint’ ‘trunk’, Shader stage ‘\<all>’ and Output format ‘WGSL’

## Install and build

```zsh
npm install --global rollup
# added 4 packages, and audited 5 packages in 1s
# found 0 vulnerabilities
rollup --version
# rollup v4.52.5
npm install
# (only installs the "@types/node" dev-dependency, ~3 MB for ~150 items)
npm run build
# rust-to-wgsl.mjs → docs/rust-to-wgsl.js...
# created docs/rust-to-wgsl.js in 32ms
```

## Check types

```zsh
npm install --global typescript
# added 1 package in 709ms
tsc --version
# Version 5.9.3
tsc --noEmit && echo "no type-errors found"
# no type-errors found
```
