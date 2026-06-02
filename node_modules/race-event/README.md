# race-event

[![codecov](https://img.shields.io/codecov/c/github/achingbrain/race-event.svg?style=flat-square)](https://codecov.io/gh/achingbrain/race-event)
[![CI](https://img.shields.io/github/actions/workflow/status/achingbrain/race-event/js-test-and-release.yml?branch=main\&style=flat-square)](https://github.com/achingbrain/race-event/actions/workflows/js-test-and-release.yml?query=branch%3Amain)

> Race an event against an AbortSignal

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

Race an event against an AbortSignal, taking care to remove any event
listeners that were added.

## Example - Getting started

```TypeScript
import { raceEvent } from 'race-event'

const controller = new AbortController()
const emitter = new EventTarget()

setTimeout(() => {
  controller.abort()
}, 500)

setTimeout(() => {
  // too late
  emitter.dispatchEvent(new CustomEvent('event'))
}, 1000)

// throws an AbortError
const resolve = await raceEvent(emitter, 'event', controller.signal)
```

## Example - Aborting the promise with an error event

```TypeScript
import { raceEvent } from 'race-event'

const emitter = new EventTarget()

setTimeout(() => {
  emitter.dispatchEvent(new CustomEvent('failure', {
    detail: new Error('Oh no!')
  }))
}, 1000)

// throws 'Oh no!' error
const resolve = await raceEvent(emitter, 'success', AbortSignal.timeout(5000), {
  errorEvent: 'failure'
})
```

## Example - Customising the thrown AbortError

The error message and `.code` property of the thrown `AbortError` can be
specified by passing options:

```TypeScript
import { raceEvent } from 'race-event'

const controller = new AbortController()
const emitter = new EventTarget()

setTimeout(() => {
  controller.abort()
}, 500)

// throws a Error: Oh no!
const resolve = await raceEvent(emitter, 'event', controller.signal, {
  errorMessage: 'Oh no!',
  errorCode: 'ERR_OH_NO'
})
```

## Example - Only resolving on specific events

Where multiple events with the same type are emitted, a `filter` function can
be passed to only resolve on one of them:

```TypeScript
import { raceEvent } from 'race-event'

const controller = new AbortController()
const emitter = new EventTarget()

// throws a Error: Oh no!
const resolve = await raceEvent(emitter, 'event', controller.signal, {
  filter: (evt: Event) => {
    return evt.detail.foo === 'bar'
  }
})
```

## Example - Terminating early by throwing from the filter

You can cause listening for the event to cease and all event listeners to be
removed by throwing from the filter:

```TypeScript
import { raceEvent } from 'race-event'

const controller = new AbortController()
const emitter = new EventTarget()

// throws Error: Cannot continue
const resolve = await raceEvent(emitter, 'event', controller.signal, {
  filter: (evt) => {
    if (...reasons) {
      throw new Error('Cannot continue')
    }

    return true
  }
})
```

# Install

```console
$ npm i race-event
```

## Browser `<script>` tag

Loading this module through a script tag will make its exports available as `RaceEvent` in the global namespace.

```html
<script src="https://unpkg.com/race-event/dist/index.min.js"></script>
```

# API Docs

- <https://achingbrain.github.io/race-event>

# License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](https://github.com/achingbrain/race-event/LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](https://github.com/achingbrain/race-event/LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

# Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.
