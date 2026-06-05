import { from } from './base.js';
const alphabet = Array.from('🚀🪐☄🛰🌌🌑🌒🌓🌔🌕🌖🌗🌘🌍🌏🌎🐉☀💻🖥💾💿😂❤😍🤣😊🙏💕😭😘👍😅👏😁🔥🥰💔💖💙😢🤔😆🙄💪😉☺👌🤗💜😔😎😇🌹🤦🎉💞✌✨🤷😱😌🌸🙌😋💗💚😏💛🙂💓🤩😄😀🖤😃💯🙈👇🎶😒🤭❣😜💋👀😪😑💥🙋😞😩😡🤪👊🥳😥🤤👉💃😳✋😚😝😴🌟😬🙃🍀🌷😻😓⭐✅🥺🌈😈🤘💦✔😣🏃💐☹🎊💘😠☝😕🌺🎂🌻😐🖕💝🙊😹🗣💫💀👑🎵🤞😛🔴😤🌼😫⚽🤙☕🏆🤫👈😮🙆🍻🍃🐶💁😲🌿🧡🎁⚡🌞🎈❌✊👋😰🤨😶🤝🚶💰🍓💢🤟🙁🚨💨🤬✈🎀🍺🤓😙💟🌱😖👶🥴▶➡❓💎💸⬇😨🌚🦋😷🕺⚠🙅😟😵👎🤲🤠🤧📌🔵💅🧐🐾🍒😗🤑🌊🤯🐷☎💧😯💆👆🎤🙇🍑❄🌴💣🐸💌📍🥀🤢👅💡💩👐📸👻🤐🤮🎼🥵🚩🍎🍊👼💍📣🥂');
const alphabetBytesToChars = (alphabet.reduce((p, c, i) => { p[i] = c; return p; }, ([])));
const alphabetCharsToBytes = (alphabet.reduce((p, c, i) => {
    const codePoint = c.codePointAt(0);
    if (codePoint == null) {
        throw new Error(`Invalid character: ${c}`);
    }
    p[codePoint] = i;
    return p;
}, ([])));
function encode(data) {
    return data.reduce((p, c) => {
        p += alphabetBytesToChars[c];
        return p;
    }, '');
}
function decode(str) {
    const byts = [];
    for (const char of str) {
        const codePoint = char.codePointAt(0);
        if (codePoint == null) {
            throw new Error(`Invalid character: ${char}`);
        }
        const byt = alphabetCharsToBytes[codePoint];
        if (byt == null) {
            throw new Error(`Non-base256emoji character: ${char}`);
        }
        byts.push(byt);
    }
    return new Uint8Array(byts);
}
export const base256emoji = from({
    prefix: '🚀',
    name: 'base256emoji',
    encode,
    decode
});
//# sourceMappingURL=base256emoji.js.map