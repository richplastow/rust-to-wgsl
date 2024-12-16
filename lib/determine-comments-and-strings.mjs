import { deepStrictEqual as deep } from 'assert';

export const determineCommentsAndStrings = (...rustLines) => {
    const parts = [{
        kind: 'TOP', // start at the top-level
        rust: [],
    }];
    let partRef = parts[0];

    const rust = rustLines.join('\n');
    for (let i=0; i<rust.length; i++) {
        const c0 = rust[i];
        const c1 = rust[i+1]; // possibly undefined

        switch (partRef.kind) {
            case 'TOP':
                if (c0 === '/' && c1 === '*') {
                    i += 1;
                    partRef = {
                        depth: 1,
                        kind: 'BLOCK_COMMENT',
                        rust: ['/','*'],
                    };
                    parts.push(partRef);
                } else if (c0 === '/' && c1 === '/') {
                    i += 1;
                    partRef = {
                        kind: 'INLINE_COMMENT',
                        rust: ['/','/'],
                    };
                    parts.push(partRef);
                } else {
                    partRef.rust.push(c0);
                }
                break;
            case 'BLOCK_COMMENT':
                if (c0 === '/' && c1 === '*') {
                    i += 1;
                    partRef.depth += 1;
                    partRef.rust.push('/','*');
                } else if (c0 === '*' && c1 === '/') {
                    i += 1;
                    partRef.depth -= 1;
                    partRef.rust.push('*','/');
                    if (partRef.depth === 0) {
                        delete partRef.depth;
                        partRef = {
                            kind: 'TOP',
                            rust: [],
                        };
                        parts.push(partRef);
                    }
                } else {
                    partRef.rust.push(c0);
                }
                break;
            case 'INLINE_COMMENT':
                if (c0 === '\n') {
                    partRef.rust.push('\n');
                    partRef = {
                        kind: 'TOP',
                        rust: [],
                    };
                    parts.push(partRef);
                } else {
                    partRef.rust.push(c0);
                }
                break;
        }
    }

    return parts;
}

export const testDetermineCommentsAndStrings = () => {
    const fn = determineCommentsAndStrings;

    deep(
        fn(''),
        [{
            kind: 'TOP',
            rust: [],
        }],
        'Empty string'
    );

    deep(
        fn('  \t\n\t '),
        [{
            kind: 'TOP',
            rust: '  \t\n\t '.split(''),
        }],
        'Just whitespace'
    );

    deep(
        fn('//'),
        [{
            kind: 'TOP',
            rust: [],
        },{
            kind: 'INLINE_COMMENT',
            rust: '//'.split(''),
        }],
        'Minimal inline comment'
    );

    deep(
        fn('abc // "def"',
           'ghi'),
        [{
            kind: 'TOP',
            rust: 'abc '.split(''),
        },{
            kind: 'INLINE_COMMENT',
            rust: '// "def"\n'.split(''),
        },{
            kind: 'TOP',
            rust: 'ghi'.split(''),
        }],
        'Simple inline comment'
    );

    deep(
        fn('/**/'),
        [{
            kind: 'TOP',
            rust: [],
        },{
            kind: 'BLOCK_COMMENT',
            rust: '/**/'.split(''),
        },{
            kind: 'TOP',
            rust: [],
        }],
        'Minimal block comment'
    );

    deep(
        fn('start /* outer /* mid /* inner */\n \t*/*/ end'),
        [{
            kind: 'TOP',
            rust: 'start '.split(''),
        },{
            kind: 'BLOCK_COMMENT',
            rust: '/* outer /* mid /* inner */\n \t*/*/'.split(''),
        },{
            kind: 'TOP',
            rust: ' end'.split(''),
        }],
        'Nested block comment'
    );

    console.log('OK: All determineCommentsAndStrings() tests passed!');
    
}
