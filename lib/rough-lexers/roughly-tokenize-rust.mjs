import { tokenizeWhitespaceAny } from "./tokenize-whitespace.mjs";

export const roughlyTokenizeRust = (source) => {
    // // Append `NULL`, which will help avoid some edge cases. The `NULL` will be
    // // removed before roughlyTokenizeRust() `return`s.
    // // TODO convert NL-CR line endings to NL
    // const source = `${rust}\x00`;

    // Create the `lex` object, to store the state of the lexer.
    const lex = {
        currChar: source[0],
        currPos: 0,
        errors: [],
        notices: [],
        source: source,
        tokens: [],
    };

    tokenizeWhitespaceAny(lex);

    // // Remove the trailing `NULL`.
    // const lastToken = lex.tokens.at(-1);
    // lastToken.chars = lastToken.chars.slice(0, -1);

    // Add an error if a block comment, char or string did not end.
    const lastToken = lex.tokens.at(-1) || { kind: '' };
    switch (lastToken.kind) {
        case 'BLOCK_COMMENT':
            errors.push('Unterminated block comment');
            break;
        case 'CHAR_LITERAL':
            errors.push('Unterminated char literal');
            break;
        case 'STRING_LITERAL':
            errors.push('Unterminated string literal');
            break;
    }

    return {
        errors: lex.errors, // errors signify invalid Rust code
        notices: lex.notices, // notices include warnings and other non-fatal information
        tokens: lex.tokens,
    };
}
