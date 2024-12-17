import { strictEqual as eq } from 'assert';
import { topToWGSL as fn } from './top-to-wgsl.mjs';

const plainOptions = { classPrefix: '', highlight: 'PLAIN' };
const htmlOptions = { classPrefix: 'pre-', highlight: 'HTML' };

export const testTopToWGSL = () => {

    eq(
        fn([], plainOptions),
        '',
        'Empty WGSL, PLAIN'
    );

    eq(
        fn([], htmlOptions),
        '<span class="pre-top"></span>',
        'Empty WGSL, HTML'
    );

    eq(
        fn('let a = 1;'.split(''), plainOptions),
        'var a = 1;',
        'Typical variable assignment, PLAIN'
    );

    eq(
        fn('let a = 1;'.split(''), htmlOptions),
        '<span class="pre-top">var a = 1;</span>',
        'Typical variable assignment, HTML'
    );

    console.log('OK: All topToWGSL() tests passed!');
}
