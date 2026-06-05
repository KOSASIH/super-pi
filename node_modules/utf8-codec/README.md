# utf8-codec

A javascript-only (esm/cjs) utf8 codec that is [abstract-encoding][] compatible,
well-tested and pretty efficient. Bonus: It doesn't use Nodejs' Buffer object
and comes with typescript types.

[abstract-encoding]: https://github.com/mafintosh/abstract-encoding

## Usage

```js
import { encode, encodingLength, decode } from 'utf8-codec' // require works too!

const str = 'Hello World / こんにちは世界'
const bytes = encode(
  str,
  new Uint8Array(endcodingLength(str)), // own buffer supplied, optional
  0 // offset, at which to write the str, optional
)
str === decode(bytes, 0, bytes.length)
```

## Why?

The [TextEncoder][] and [TextDecoder][] classes _exist_ to encode utf8 strings but
they are not optimized for bigger byte processing and don't offer APIs to figure
out how preemptively how many bytes are supposed to be written/read. Surprisingly
this algorithm is even faster.

The other implementations found at the time do either not implement the edge cases
properly and/or both directions of the codec.

[TextEncoder]: https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder
[TextDecoder]: https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder

## License

[MIT](./LICENSE)
