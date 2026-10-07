import emojiRegex from 'emoji-regex';

export const isEmojiOnlyText = (text: string): boolean => {
    if (!text || text.trim().length === 0) return false;
    const regexFn = typeof emojiRegex === 'function' ? emojiRegex : (emojiRegex as unknown as { default?: () => RegExp })?.default;
    if (!regexFn) return false;
    const regex = regexFn();
    const withoutEmoji = text.replace(regex, '').trim();
    return withoutEmoji.length === 0;
};