import handleEffect from './handleEffect';

export const sagaIteratorFactory = handleEffectImpl => (iterator, resolveSaga, abortSaga, ctx) => async function iterateSaga(data, isError) {
    try {
        if (iterator.cancelled) {
            return null;
        }
        const { done, value } = isError ? iterator.throw(data) : iterator.next(data);
        if (done) {
            resolveSaga(value);
            return null;
        }
        try {
            const result = await handleEffectImpl(value, ctx);
            return iterateSaga(result);
        } catch (error) {
            return iterateSaga(error, true);
        }
    } catch (error) {
        abortSaga(error);
        return null;
    }
};

export default sagaIteratorFactory(handleEffect);
