import createEffect from '../createEffect';
import cancel from '../cancel';
import fork, { handleForkEffect } from '../fork';

export const takeLatestSaga = take => function* (type, gen, ...args) {
    let task;
    while (true) {
        const action = yield take(type);
        if (task) {
            yield cancel(task);
        }
        task = yield fork(gen, ...args.concat(action));
    }
};

export const handleTakeLatestEffect = take => ([type, gen, ...args], emitter, id) =>
    handleForkEffect([takeLatestSaga(take), type, gen, ...args], emitter, id);

export default take => createEffect('takeEvery', handleTakeLatestEffect(take));
