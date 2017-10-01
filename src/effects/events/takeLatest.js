import createEffect from '../createEffect';
import cancel from '../cancel';
import fork, { handleForkEffect } from '../fork';

export const takeLatestSaga = take => function* (type, gen, ...args) {
    let forkedTask;
    while (true) {
        const action = yield take(type);
        if (forkedTask) {
            yield cancel(forkedTask);
        }
        forkedTask = yield fork(gen, ...args.concat(action));
    }
};

export const handleTakeLatestEffect = take => ([type, gen, ...args], task) =>
    handleForkEffect([takeLatestSaga(take), type, gen, ...args], task);

export default take => createEffect('takeEvery', handleTakeLatestEffect(take));
