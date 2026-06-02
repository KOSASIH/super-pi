import { base58btc } from 'multiformats/bases/base58'
import { base64url } from 'multiformats/bases/base64'
import type { Matcher, MultiaddrMatcher } from './index.js'
import type { Multiaddr } from '@multiformats/multiaddr'

/**
 * Split a multiaddr into path components
 */
const toParts = (ma: Multiaddr): string[] => {
  return ma.toString().split('/').slice(1)
}

export const func = (fn: (val: string) => boolean): Matcher => {
  return {
    match: (vals) => {
      if (vals.length < 1) {
        return false
      }

      if (fn(vals[0])) {
        return vals.slice(1)
      }

      return false
    },
    pattern: 'fn'
  }
}

export const literal = (str: string): Matcher => {
  return {
    match: (vals) => func((val) => val === str).match(vals),
    pattern: str
  }
}

export const string = (): Matcher => {
  return {
    match: (vals) => func((val) => typeof val === 'string').match(vals),
    pattern: '{string}'
  }
}

export const number = (): Matcher => {
  return {
    match: (vals) => func((val) => !isNaN(parseInt(val))).match(vals),
    pattern: '{number}'
  }
}

export const peerId = (): Matcher => {
  return {
    match: (vals) => {
      if (vals.length < 2) {
        return false
      }

      if (vals[0] !== 'p2p' && vals[0] !== 'ipfs') {
        return false
      }

      // Q is RSA, 1 is Ed25519 or Secp256k1
      if (vals[1].startsWith('Q') || vals[1].startsWith('1')) {
        try {
          base58btc.decode(`z${vals[1]}`)
        } catch (err) {
          return false
        }
      } else {
        return false
      }

      return vals.slice(2)
    },
    pattern: '/p2p/{peerid}'
  }
}

export const certhash = (): Matcher => {
  return {
    match: (vals) => {
      if (vals.length < 2) {
        return false
      }

      if (vals[0] !== 'certhash') {
        return false
      }

      try {
        base64url.decode(vals[1])
      } catch {
        return false
      }

      return vals.slice(2)
    },
    pattern: '/certhash/{certhash}'
  }
}

export const optional = (matcher: Matcher): Matcher => {
  return {
    match: (vals) => {
      const result = matcher.match(vals)

      if (result === false) {
        return vals
      }

      return result
    },
    pattern: `optional(${matcher.pattern})`
  }
}

export const or = (...matchers: Matcher[]): Matcher => {
  return {
    match: (vals) => {
      let matches: string[] | undefined

      for (const matcher of matchers) {
        const result = matcher.match(vals)

        // no match
        if (result === false) {
          continue
        }

        // choose greediest matcher
        if (matches == null || result.length < matches.length) {
          matches = result
        }
      }

      if (matches == null) {
        return false
      }

      return matches
    },
    pattern: `or(${matchers.map(m => m.pattern).join(', ')})`
  }
}

export const and = (...matchers: Matcher[]): Matcher => {
  return {
    match: (vals) => {
      for (const matcher of matchers) {
        // pass what's left of the array
        const result = matcher.match(vals)

        // no match
        if (result === false) {
          return false
        }

        vals = result
      }

      return vals
    },
    pattern: `and(${matchers.map(m => m.pattern).join(', ')})`
  }
}

export function fmt (...matchers: Matcher[]): MultiaddrMatcher {
  function match (ma: Multiaddr): string[] | false {
    let parts = toParts(ma)

    for (const matcher of matchers) {
      const result = matcher.match(parts)

      if (result === false) {
        return false
      }

      parts = result
    }

    return parts
  }

  function matches (ma: Multiaddr): boolean {
    const result = match(ma)

    return result !== false
  }

  function exactMatch (ma: Multiaddr): boolean {
    const result = match(ma)

    if (result === false) {
      return false
    }

    return result.length === 0
  }

  return {
    matchers,
    matches,
    exactMatch
  }
}
