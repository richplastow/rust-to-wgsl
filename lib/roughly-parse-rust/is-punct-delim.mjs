/** ### PUNCTUATION and DELIMITER tokens
 *
 * Punctuation and delimiter tokens are used to separate other tokens or group
 * them together, to define the structure of the program.
 *
 * #### The 47 Rust PUNCTUATION tokens from https://doc.rust-lang.org/reference/tokens.html#punctuation
 * ```
 * Symbol  Name                Usage
 * _       Underscore          Wildcard patterns, Inferred types, Unnamed items in constants, extern crates, use declarations, and destructuring assignment
 * -       Minus               Subtraction, Negation
 * -=      MinusEq             Subtraction assignment
 * ->      RArrow              Function return type, Closure return type, Function pointer type
 * ,       Comma               Various separators
 * ;       Semi                Terminator for various items and statements, Array types
 * :       Colon               Various separators
 * ::      PathSep             Path separator
 * !       Not                 Bitwise and Logical NOT, Macro Calls, Inner Attributes, Never Type, Negative impls
 * !=      Ne                  Not Equal
 * ?       Question            Question mark operator, Questionably sized, Macro Kleene Matcher
 * .       Dot                 Field access, Tuple index
 * ..      DotDot              Range, Struct expressions, Patterns, Range Patterns
 * ...     DotDotDot           Variadic functions, Range patterns
 * ..=     DotDotEq            Inclusive Range, Range patterns
 * @       At                  Subpattern binding
 * *       Star                Multiplication, Dereference, Raw Pointers, Macro Kleene Matcher, Use wildcards
 * *=      StarEq              Multiplication assignment
 * /       Slash               Division
 * /=      SlashEq             Division assignment
 * &       And                 Bitwise and Logical AND, Borrow, References, Reference patterns
 * &&      AndAnd              Lazy AND, Borrow, References, Reference patterns
 * &=      AndEq               Bitwise And assignment
 * #       Pound               Attributes
 * %       Percent             Remainder
 * %=      PercentEq           Remainder assignment
 * ^       Caret               Bitwise and Logical XOR
 * ^=      CaretEq             Bitwise XOR assignment
 * +       Plus                Addition, Trait Bounds, Macro Kleene Matcher
 * +=      PlusEq              Addition assignment
 * <       Lt                  Less than, Generics, Paths
 * <-      LArrow              The left arrow symbol has been unused since before Rust 1.0, but it is still treated as a single token
 * <<      Shl                 Shift Left, Nested Generics
 * <<=     ShlEq               Shift Left assignment
 * <=      Le                  Less than or equal to
 * =       Eq                  Assignment, Attributes, Various type definitions
 * ==      EqEq                Equal
 * =>      FatArrow            Match arms, Macros
 * >       Gt                  Greater than, Generics, Paths
 * >=      Ge                  Greater than or equal to, Generics
 * >>      Shr                 Shift Right, Nested Generics
 * >>=     ShrEq               Shift Right assignment, Nested Generics
 * |       Or                  Bitwise and Logical OR, Closures, Patterns in match, if let, and while let
 * |=      OrEq                Bitwise Or assignment
 * ||      OrOr                Lazy OR, Closures
 * ~       Tilde               The tilde operator has been unused since before Rust 1.0, but its token may still be used
 * $       Dollar              Macros
 * ```
 *
 * #### PUNCTUATION followed sometimes by another character
 * ```
 * -       Minus, MinusEq, RArrow
 * :       Colon or PathSep
 * !       Not, Ne
 * .       Dot, DotDot, DotDotDot, DotDotEq
 * *       Star, StarEq
 * /       Slash, SlashEq
 * &       And, AndAnd, AndEq
 * %       Percent, PercentEq
 * ^       Caret, CaretEq
 * +       Plus, PlusEq
 * <       Lt, LArrow, Shl, ShlEq, Le
 * =       Eq, EqEq, FatArrow
 * >       Gt, Ge, Shr, ShrEq
 * |       Or, OrEq, OrOr
 * ```
 * 
 * #### ‘Solo’ PUNCTUATION, never followed by another character
 * ```
 * _       Underscore
 * ,       Comma
 * ;       Semi
 * ?       Question
 * @       At
 * #       Pound
 * ~       Tilde
 * $       Dollar
 * ```
 *
 * #### The 6 Rust DELIMITER tokens are also never followed by another character
 * ```
 * (       BracketRoundOpen    Parentheses
 * )       BracketRoundClose   Parentheses
 * [       BracketSquareOpen   Square brackets
 * ]       BracketSquareClose  Square brackets
 * {       BracketCurlyOpen    Curly braces
 * }       BracketCurlyClose   Curly braces
 * ```
 */

// Set of Rust punctuation characters that are sometimes followed by another
// punctuation character to make a longer PUNCTUATION token.
const punctuationFollowedChars = new Set([
    '-',    // U+002D Minus
    ':',    // U+003A Colon
    '!',    // U+0021 Not
    '.',    // U+002E Dot
    '*',    // U+002A Star
    '/',    // U+002F Slash
    '&',    // U+0026 And
    '%',    // U+0025 Percent
    '^',    // U+005E Caret
    '+',    // U+002B Plus
    '<',    // U+003C Lt
    '=',    // U+003D Eq
    '>',    // U+003E Gt
    '|'     // U+007C Or
]);

// Set of Rust punctuation characters that are never followed by another
// character - they immediately become a PUNCTUATION token.
const punctuationSoloChars = new Set([
    '_',    // U+005F Underscore
    ',',    // U+002C Comma
    ';',    // U+003B Semi
    '?',    // U+003F Question
    '@',    // U+0040 At
    '#',    // U+0023 Pound
    '~',    // U+007E Tilde
    '$'     // U+0024 Dollar
]);

// Set of Rust delimiter characters. These are also never followed by another
// character - they immediately become a DELIMITER token.
const delimiterChars = new Set([
    '(',    // U+0028 BracketRoundOpen
    ')',    // U+0029 BracketRoundClose
    '[',    // U+005B BracketSquareOpen
    ']',    // U+005D BracketSquareClose
    '{',    // U+007B BracketCurlyOpen
    '}'     // U+007D BracketCurlyClose
]);

/** #### Detects a punctuation character that’s sometimes followed by another punctuation character
 * 
 * @param {string} char  A single character
 * @returns {boolean}  `true` if a punct char sometimes followed by another punct char
 */
export const isPunctuationFollowed = (char) => punctuationFollowedChars.has(char);

/** #### Detects a punctuation character that’s never followed by another punctuation character
 * 
 * @param {string} char  A single character
 * @returns {boolean}  `true` if a punct char never followed by another punct char
 */
export const isPunctuationSolo = (char) => punctuationSoloChars.has(char);

/** #### Detects a delimiter character
 * 
 * @param {string} char  A single character
 * @returns {boolean}  `true` if a Rust delimiter character
 */
export const isDelimiter = (char) => delimiterChars.has(char);

/** #### Detects any punctuation or delimiter character
 * 
 * @param {string} char  A single character
 * @returns {boolean}  `true` if a punctuation or delimiter character
 */
export const isPunctDelim = (char) =>
    isDelimiter(char) || isPunctuationFollowed(char) || isPunctuationSolo(char);
