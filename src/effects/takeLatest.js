import createEffect from './createEffect';
import take from './take';
import cancel from './cancel';
import fork, { handleForkEffect } from './fork';

export function* takeLatest(type, gen, ...args) {
    let task;
    while (true) {
        const action = yield take(type);
        if (task) {
            yield cancel(task);
        }
        task = yield fork(gen, ...args.concat(action));
    }
}

export const handleTakeLatestEffect = ([type, gen, ...args], emitter, id) =>
    handleForkEffect([takeLatest, type, gen, ...args], emitter, id);

export default createEffect('takeEvery', handleTakeLatestEffect);
