/**
 * Returns `true` if the object has type overlap with `Startable`
 */
export function isStartable(obj) {
    return obj != null && typeof obj.start === 'function' && typeof obj.stop === 'function';
}
/**
 * A function that can be used to start and objects passed to it. This checks
 * that an object is startable before invoking its lifecycle methods so it is
 * safe to pass non-`Startable`s in.
 *
 * @example
 *
 * ```TypeScript
 * import { start } from '@libp2p/interface'
 * import type { Startable } from '@libp2p/interface'
 *
 * const startable: Startable = {
 *   start: () => {},
 *   stop: () => {}
 * }
 *
 * const notStartable = 5
 *
 * await start(
 *   startable,
 *   notStartable
 * )
 * ```
 */
export async function start(...objs) {
    const startables = [];
    for (const obj of objs) {
        if (isStartable(obj)) {
            startables.push(obj);
        }
    }
    await Promise.all(startables.map(async (s) => {
        if (s.beforeStart != null) {
            await s.beforeStart();
        }
    }));
    await Promise.all(startables.map(async (s) => {
        await s.start();
    }));
    await Promise.all(startables.map(async (s) => {
        if (s.afterStart != null) {
            await s.afterStart();
        }
    }));
}
/**
 * A function that can be used to stop and objects passed to it. This checks
 * that an object is startable before invoking its lifecycle methods so it is
 * safe to pass non-`Startable`s in.
 *
 * @example
 *
 * ```TypeScript
 * import { stop } from '@libp2p/interface'
 * import type { Startable } from '@libp2p/interface'
 *
 * const startable: Startable = {
 *   start: () => {},
 *   stop: () => {}
 * }
 *
 * const notStartable = 5
 *
 * await stop(
 *   startable,
 *   notStartable
 * )
 * ```
 */
export async function stop(...objs) {
    const startables = [];
    for (const obj of objs) {
        if (isStartable(obj)) {
            startables.push(obj);
        }
    }
    await Promise.all(startables.map(async (s) => {
        if (s.beforeStop != null) {
            await s.beforeStop();
        }
    }));
    await Promise.all(startables.map(async (s) => {
        await s.stop();
    }));
    await Promise.all(startables.map(async (s) => {
        if (s.afterStop != null) {
            await s.afterStop();
        }
    }));
}
//# sourceMappingURL=startable.js.map