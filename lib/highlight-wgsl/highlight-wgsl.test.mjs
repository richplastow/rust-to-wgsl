import { strictEqual as eq } from 'assert';
import { highlightWGSL as fn } from './highlight-wgsl.mjs';

const plainOptions = { classPrefix: '', highlight: 'PLAIN' };
const htmlOptions = { classPrefix: 'pre-', highlight: 'HTML' };

export const testHighlightWGSL = () => {

    eq(
        fn('', 'WHITESPACE_MOST', plainOptions),
        '',
        'Empty WGSL, PLAIN'
    );

    eq(
        fn('', 'WHITESPACE_MOST', htmlOptions),
        '<span class="pre-whitespace-most"></span>',
        'Empty WGSL, HTML'
    );

    eq(
        fn('/* ok */', 'BLOCK_COMMENT', plainOptions),
        '/* ok */',
        'Block comment, PLAIN'
    );

    eq(
        fn('/* ok */', 'BLOCK_COMMENT', htmlOptions),
        '<span class="pre-comment">/* ok */</span>',
        'Block comment, HTML'
    );

    eq(
        fn('// ok\n\n', 'INLINE_COMMENT', htmlOptions),
        '<span class="pre-comment">// ok</span><br /><br />',
        'Inline comment and two newlines, HTML'
    );

    eq(
        fn("'\\u{c9}'", 'CHAR_LITERAL', htmlOptions),
        `<span class="pre-char-or-string">'\\u{c9}'</span>`,
        'Char literal, HTML'
    );

    eq(
        fn('"<b>\n\n</b>"', 'STRING_LITERAL', htmlOptions),
        '<span class="pre-char-or-string">"&lt;b><br /><br />&lt;/b>"</span>',
        'String literal containing 2 newlines and 2 less-than signs, HTML'
    );

    console.log('OK: All highlightWGSL() tests passed!');
}
