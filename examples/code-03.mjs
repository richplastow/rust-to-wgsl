export const rust03 =
`let a = 'A';
// let b = 'B'; commented-out with a line comment
/* let c = 'C'; commented-out with a block comment */
let eAcute = '\\u{c9}';
`;

export const expectedWGSL03 =
`var a = 'A';
// let b = 'B'; commented-out with a line comment
/* let c = 'C'; commented-out with a block comment */
var eAcute = '\\u{c9}';
`;
