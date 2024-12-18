import { strictEqual as eq } from 'assert';
import { highlightWGSL as fn } from './highlight-wgsl.mjs';

const plainOptions = { classPrefix: '', highlight: 'PLAIN' };
const htmlOptions = { classPrefix: 'pre-', highlight: 'HTML' };

export const testHighlightWGSL = () => {

    eq(
        fn('', plainOptions, 'WS'),
        '',
        'Empty WGSL, PLAIN'
    );

    eq(
        fn('', htmlOptions, 'WS'),
        '<span class="pre-whitespace"></span>',
        'Empty WGSL, HTML'
    );

    eq(
        fn('/* ok */', plainOptions, 'BLOCK_COMMENT'),
        '/* ok */',
        'Block comment, PLAIN'
    );

    eq(
        fn('/* ok */', htmlOptions, 'BLOCK_COMMENT'),
        '<span class="pre-comment">/* ok */</span>',
        'Block comment, HTML'
    );

    eq(
        fn('// ok\n\n', htmlOptions, 'INLINE_COMMENT'),
        '<span class="pre-comment">// ok</span><br /><br />',
        'Inline comment and two newlines, HTML'
    );

    eq(
        fn("'\\u{c9}'", htmlOptions, 'CHAR_LITERAL'),
        `<span class="pre-char-or-string">'\\u{c9}'</span>`,
        'Char literal, HTML'
    );

    eq(
        fn('"<b>\n\n</b>"', htmlOptions, 'STRING_LITERAL'),
        '<span class="pre-char-or-string">"&lt;b><br /><br />&lt;/b>"</span>',
        'String literal containing 2 newlines and 2 less-than signs, HTML'
    );

    console.log('OK: All highlightWGSL() tests passed!');
}
