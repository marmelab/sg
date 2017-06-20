import createEffect from '../createEffect';
import take from './take';
import fork, { handleForkEffect } from './fork';

export function* takeEverySaga(type, gen, ...args) {
    while (true) {
        const action = yield take(type);
        yield fork(gen, ...args.concat(action));
    }
}

export const handleTakeEveryEffect = ([type, gen, ...args], emitter, id) =>
    handleForkEffect([takeEverySaga, type, gen, ...args], emitter, id);

export default createEffect('takeEvery', handleTakeEveryEffect);
