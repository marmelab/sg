import putFactory from './put';
import takeFactory from './take';
import takeEveryFactory from './takeEvery';
import takeLatestFactory from './takeLatest';
import simpleEventEmitter from './simpleEventEmitter';

export default (eventEmitter = simpleEventEmitter()) => {
    const put = putFactory(eventEmitter);
    const take = takeFactory(eventEmitter);
    const takeEvery = takeEveryFactory(take);
    const takeLatest = takeLatestFactory(take);

    return {
        put,
        take,
        takeEvery,
        takeLatest,
    };
};
