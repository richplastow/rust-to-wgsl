export const rust04 =
`let a = "Can \\\\ contain \\" backslashes";
// let b = "Commented-out with a line comment";
/* let c = "Commented-out with a block comment"; */
let d = "Not a // line comment";
let e = "Not a /* block */ comment";
`;

export const expectedWGSL04 =
`var a = "Can \\\\ contain \\" backslashes";
// let b = "Commented-out with a line comment";
/* let c = "Commented-out with a block comment"; */
var d = "Not a // line comment";
var e = "Not a /* block */ comment";
`;
