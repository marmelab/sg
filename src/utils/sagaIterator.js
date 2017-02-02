export default (iterator, resolveSaga, abortSaga, handleEffect) => async function iterateSaga(data, isError) {
    try {
        if (iterator.cancelled) {
            return;
        }
        const { done, value } = isError ? iterator.throw(data) : iterator.next(data);
        if (done) {
            resolveSaga(value);
            return;
        }

        await handleEffect(value, iterateSaga);
    } catch (error) {
        abortSaga(error);
    }
};
