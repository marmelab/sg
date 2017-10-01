import createEffect from '../createEffect';
import fork, { handleForkEffect } from '../fork';

export const takeEverySaga = take => function* (type, gen, ...args) {
    while (true) {
        const action = yield take(type);
        yield fork(gen, ...args.concat(action));
    }
};

export const handleTakeEveryEffect = take => ([type, gen, ...args], task) =>
    handleForkEffect([takeEverySaga(take), type, gen, ...args], task);

export default take => createEffect('takeEvery', handleTakeEveryEffect(take));
