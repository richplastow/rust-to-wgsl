/** #### 
 * 
 * @param {*} parsedParts  
 * @param {*} options 
 * @returns 
 */
export const transformParts = (parsedParts, options) => {
    const errors = [];
    const parts = [];

    for (let i=0; i<parsedParts.length; i++) {
        const { kind, rust } = parsedParts[i];

        switch (kind) {
            case 'KEYWORD':
                if (rust.join('') === 'let') {
                    parts.push({
                        kind,
                        wgsl: 'var',
                    });
                } else {
                    parts.push({
                        kind,
                        wgsl: rust.join(''),
                    });    
                }
                break;
            default:
                parts.push({
                    kind,
                    wgsl: rust.join(''),
                });
                break;
        }
    }

    // 
    return { errors, parts };
}
