# main-event

[![codecov](https://img.shields.io/codecov/c/github/achingbrain/main-event.svg?style=flat-square)](https://codecov.io/gh/achingbrain/main-event)
[![CI](https://img.shields.io/github/actions/workflow/status/achingbrain/main-event/js-test-and-release.yml?branch=main\&style=flat-square)](https://github.com/achingbrain/main-event/actions/workflows/js-test-and-release.yml?query=branch%3Amain)

> Typed event emitters

# About

<!--

!IMPORTANT!

Everything in this README between "# About" and "# Install" is automatically
generated and will be overwritten the next time the doc generator is run.

To make changes to this section, please update the @packageDocumentation section
of src/index.js or src/index.ts

To experiment with formatting, please run "npm run docs" from the root of this
repo and examine the changes made.

-->

Adds types to the EventTarget class.

Hopefully this won't be necessary
forever:

- <https://github.com/microsoft/TypeScript/issues/28357>
- <https://github.com/microsoft/TypeScript/issues/43477>
- <https://github.com/microsoft/TypeScript/issues/299>
- <https://www.npmjs.com/package/typed-events>
- <https://www.npmjs.com/package/typed-event-emitter>
- <https://www.npmjs.com/package/typed-event-target>
- etc

In addition to types, a `safeDispatchEvent` method is available which
prevents dispatching events that aren't in the event map, and a
`listenerCount` method which reports the number of listeners that are
currently registered for a given event.

## Example

```ts
import { TypedEventEmitter } from 'main-event'
import type { TypedEventTarget } from 'main-event'

interface EventTypes {
  'test': CustomEvent<string>
}

const target = new TypedEventEmitter<EventTypes>()

// it's a regular EventTarget
console.info(target instanceof EventTarget) // true

// register listeners normally
target.addEventListener('test', (evt) => {
  // evt is CustomEvent<string>
})

// @ts-expect-error 'derp' is not in the event map
target.addEventListener('derp', () => {})

// use normal dispatchEvent method
target.dispatchEvent(new CustomEvent('test', {
  detail: 'hello'
}))

// use type safe dispatch method
target.safeDispatchEvent('test', {
  detail: 'world'
})

// report listener count
console.info(target.listenerCount('test')) // 0

// event emitters can be used purely as interfaces too
function acceptTarget (target: TypedEventTarget<EventTypes>) {
  // ...
}
```

# Install

```console
$ npm i main-event
```

## Browser `<script>` tag

Loading this module through a script tag will make its exports available as `MainEvent` in the global namespace.

```html
<script src="https://unpkg.com/main-event/dist/index.min.js"></script>
```

# API Docs

- <https://achingbrain.github.io/main-event>

# License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](https://github.com/achingbrain/main-event/LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](https://github.com/achingbrain/main-event/LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

# Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.
