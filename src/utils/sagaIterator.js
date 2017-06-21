export default (iterator, resolveSaga, abortSaga, handleEffect) => async function iterateSaga(data, isError) {
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
            const result = await handleEffect(value);
            return iterateSaga(result);
        } catch (error) {
            return iterateSaga(error, true);
        }
    } catch (error) {
        abortSaga(error);
        return null;
    }
};
