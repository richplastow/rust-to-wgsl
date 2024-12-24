/** #### Detects a pair of characters which begin a block comment
 * 
 * @param {string} char0  The first character - must be the '/' in '/*'
 * @param {string} char1  The second character - must be the '*' in '/*'
 * @returns {boolean}  `true` if the pair of characters begins a block comment
 */
export const isCommentBlockBegin = (char0, char1) =>
    char0 === '/' && char1 === '*';

/** #### Detects a pair of characters which end a block comment
 * 
 * @param {string} char0  The first character - must be '*'
 * @param {string} char1  The second character - must be '/'
 * @returns {boolean}  `true` if the pair of characters begins a block comment
 */
export const isCommentBlockEnd = (char0, char1) =>
    char0 === '*' && char1 === '/';

/** #### Detects a pair of characters which begin a line comment
 * 
 * @param {string} char0  The first character - must be the first '/' in '//'
 * @param {string} char1  The second character - must be the second '/' in '//'
 * @returns {boolean}  `true` if the pair of characters begins a line comment
 */
export const isCommentLineBegin = (char0, char1) =>
    char0 === '/' && char1 === '/';

/** #### Detects a character which ends a line comment
 * 
 * In Rust, only a newline character or the end of the file ends a line comment.
 * 
 * @param {string} char0  The character - must be a newline
 * @returns {boolean}  `true` if the character ends a line comment
 */
export const isCommentLineEnd = (char0) =>
    char0 === '\n';

/** #### Detects a pair of characters which begin a comment
 * 
 * @param {string} char0  The first character - must be '/' in '/*' or '//'
 * @param {string} char1  The second character - must be '*' in '/*' or '/' in '//'
 * @returns {boolean}  `true` if the pair of characters begins a comment
 */
export const isCommentAnyBegin = (char0, char1) =>
    (char0 === '/' && char1 === '*') || (char0 === '/' && char1 === '/');
