export const rustToBasicParts = (...rustLines) => {
    const parts = [{
        kind: 'TOP', // start at the top-level
        rust: [],
    }];
    let partRef = parts[0];

    const rust = rustLines.join('\n');
    for (let pos=0; pos<rust.length; pos++) {
        const c0 = rust[pos];
        const c1 = rust[pos+1]; // possibly undefined

        switch (partRef.kind) {
            case 'TOP':
                if (c0 === '/' && c1 === '*') {
                    pos += 1;
                    partRef = {
                        depth: 1,
                        kind: 'BLOCK_COMMENT',
                        rust: ['/','*'],
                    };
                    parts.push(partRef);
                } else if (c0 === '/' && c1 === '/') {
                    pos += 1;
                    partRef = {
                        kind: 'INLINE_COMMENT',
                        rust: ['/','/'],
                    };
                    parts.push(partRef);
                } else if (c0 === "'") {
                    partRef = {
                        kind: 'CHAR_LITERAL',
                        pos, // used for error message
                        rust: [c0],
                    };
                    parts.push(partRef);
                } else if (c0 === '"') {
                    partRef = {
                        kind: 'STRING_LITERAL',
                        pos, // used for error message
                        rust: [c0],
                    };
                    parts.push(partRef);
                } else {
                    partRef.rust.push(c0);
                }
                break;
            case 'BLOCK_COMMENT':
                if (c0 === '/' && c1 === '*') {
                    pos += 1;
                    partRef.depth += 1;
                    partRef.rust.push('/','*');
                } else if (c0 === '*' && c1 === '/') {
                    pos += 1;
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
                partRef.rust.push(c0);
                if (c0 === '\n') {
                    partRef = {
                        kind: 'TOP',
                        rust: [],
                    };
                    parts.push(partRef);
                }
                break;
            case 'CHAR_LITERAL':
                partRef.rust.push(c0);
                if (c0 === "'") {
                    partRef = {
                        kind: 'TOP',
                        rust: [],
                    };
                    parts.push(partRef);
                }
                break;
            case 'STRING_LITERAL':
                partRef.rust.push(c0);
                if (c0 === '\\' && c1 === '\\') { // escaped backslash
                    pos += 1;
                    partRef.rust.push(c1);
                } else if (c0 === '\\' && c1 === '"') { // escaped double-quote
                    pos += 1;
                    partRef.rust.push(c1);
                } else if (c0 === '"') {
                    partRef = {
                        kind: 'TOP',
                        rust: [],
                    };
                    parts.push(partRef);
                }
                break;
        }
    }

    return parts;
}
