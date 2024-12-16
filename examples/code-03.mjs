export const rust03 =
`let a = "Apple";
// let b = "Banana";
/* let c = "Cherry"; */
let d = "Not an // inline comment";
let e = "Not a /* block */ comment";
`;

export const expectedWGSL03 =
`var a = "Apple";
// let b = "Banana";
/* let c = "Cherry"; */
var d = "Not an // inline comment";
var e = "Not a /* block */ comment";
`;
