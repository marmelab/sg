export default (iterator, resolveSaga, abortSaga, handleEffect) => function iterateSaga(data, isError) {
    try {
        const { done, value } = isError ? iterator.throw(data) : iterator.next(data);
        if (iterator.cancelled) {
            return;
        }
        if (done) {
            resolveSaga(value);
            return;
        }

        handleEffect(value)
        .then(result => iterateSaga(result))
        .catch(error => iterateSaga(error, true))
        .catch(abortSaga);
    } catch (error) {
        abortSaga(error);
    }
};
