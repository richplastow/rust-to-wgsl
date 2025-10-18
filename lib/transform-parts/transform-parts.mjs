import { isWhitespaceMost, isWhitespaceRare } from '../rough-lexers/is-whitespace.mjs';

const toString = (value) => {
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) return value.join('');
    return '';
};

const transformCode = (segment) => segment.replace(/\blet\b/g, 'var');

const pushPart = (parts, kind, wgsl) => {
    if (!wgsl.length) return;
    parts.push({ kind, wgsl });
};

const segmentTbd = (text, parts) => {
    let currentKind = null;
    let buffer = '';

    const flush = () => {
        if (!buffer) return;
        if (currentKind === 'CODE') {
            pushPart(parts, 'UNIDENTIFIED', transformCode(buffer));
        } else {
            pushPart(parts, currentKind, buffer);
        }
        buffer = '';
    };

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        let kind;
        if (isWhitespaceMost(char)) {
            kind = 'WHITESPACE_MOST';
        } else if (isWhitespaceRare(char)) {
            kind = 'WHITESPACE_RARE';
        } else {
            kind = 'CODE';
        }

        if (kind !== currentKind) {
            flush();
            currentKind = kind;
        }

        buffer += char;
    }

    flush();
};

export const transformParts = (tokens, options = {}) => {
    const errors = [];
    const parts = [];

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (!token) continue;

        const raw = toString(token.chars);
        const { kind, start = 0 } = token;

        switch (kind) {
            case 'COMMENT_BLOCK':
                pushPart(parts, 'BLOCK_COMMENT', raw);
                break;
            case 'COMMENT_LINE':
                pushPart(parts, 'INLINE_COMMENT', raw);
                break;
            case 'LITERAL_STRING':
                errors.push(`Contains a string at pos ${start}`);
                pushPart(parts, 'STRING_LITERAL', raw);
                break;
            case 'LITERAL_CHAR':
                errors.push(`Contains a char at pos ${start}`);
                pushPart(parts, 'CHAR_LITERAL', raw);
                break;
            case 'LITERAL_BYTE':
                errors.push(`Contains a char at pos ${start}`);
                pushPart(parts, 'CHAR_LITERAL', raw);
                break;
            case 'LIFETIME_MARKER': {
                if (raw === "'") {
                    const next = tokens[i + 1];
                    const isLifetime =
                        next && next.start === start + raw.length && next.kind === 'IDENTIFIER';
                    if (isLifetime) {
                        pushPart(parts, 'UNIDENTIFIED', transformCode(raw));
                    } else {
                        errors.push(`Contains a char at pos ${start}`);
                        errors.push('Unterminated char literal');
                        pushPart(parts, 'CHAR_LITERAL', raw);
                    }
                } else {
                    pushPart(parts, 'UNIDENTIFIED', transformCode(raw));
                }
                break;
            }
            case 'PUNCTUATION':
                if (raw === '"') {
                    const prev = tokens[i - 1];
                    const prevRaw = toString(prev?.chars);
                    const escaped = prevRaw.endsWith('\\');
                    if (!escaped) {
                        errors.push(`Contains a string at pos ${start}`);
                        errors.push('Unterminated string literal');
                    }
                    pushPart(parts, 'STRING_LITERAL', raw);
                } else {
                    pushPart(parts, 'UNIDENTIFIED', transformCode(raw));
                }
                break;
            case 'TBD':
                segmentTbd(raw, parts);
                break;
            default:
                pushPart(parts, 'UNIDENTIFIED', transformCode(raw));
                break;
        }
    }

    return { errors, parts };
};
