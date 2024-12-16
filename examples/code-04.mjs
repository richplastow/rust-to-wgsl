export const rust04 =
`let a = "Can \\\\ contain \\" backslashes";
// let b = "Commented-out with an inline comment";
/* let c = "Commented-out with a block comment"; */
let d = "Not an // inline comment";
let e = "Not a /* block */ comment";
`;

export const expectedWGSL04 =
`var a = "Can \\\\ contain \\" backslashes";
// let b = "Commented-out with an inline comment";
/* let c = "Commented-out with a block comment"; */
var d = "Not an // inline comment";
var e = "Not a /* block */ comment";
`;
