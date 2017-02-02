export default (emitter, id) => (effect, iterateSaga) => {
    let promise;
    if (Array.isArray(effect)) {
        promise = Promise.all(effect.map(e => e.handle(e.args, emitter, id)));
    } else {
        promise = effect.handle(effect.args, emitter, id);
    }

    return promise
    .then(iterateSaga)
    .catch(error => iterateSaga(error, true));
};
