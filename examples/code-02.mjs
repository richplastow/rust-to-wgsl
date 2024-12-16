export const rust02 =
`let a: u32 = 1;
let b: u32 = 2;
let c = a + b;
// let d: u32 = 4;
/** /*/* let e: u32 = 5; */*/ let f: u32 = 5; */
`;

export const expectedWGSL02 =
`var a: u32 = 1;
var b: u32 = 2;
var c = a + b;
// let d: u32 = 4;
/** /*/* let e: u32 = 5; */*/ let f: u32 = 5; */
`;
