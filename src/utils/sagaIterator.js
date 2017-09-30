import handleEffect from './handleEffect';

/*
 * sagaIteratorFactory: Take a function and then an iterator and a task
 * And map the function on the iterator yielded value
 *
 * sagaIterator: iterate over an iterator updating the task object accordingly
 *      iterator: the iterator object
 *      task: the task
 *  return iterateSaga
 *
 * iterateSaga:
 *      Execute the iterator recursively
 */
export const sagaIteratorFactory = handleEffectImpl => (iterator, task) =>
    async function iterateSaga(data, isError) {
        try {
            if (task.cancelled()) {
                return null;
            }
            const { done, value } = isError ? iterator.throw(data) : iterator.next(data);
            if (done) {
                task.resolve(value);
                return null;
            }
            try {
                const result = await handleEffectImpl(value, task);
                return iterateSaga(result);
            } catch (error) {
                return iterateSaga(error, true);
            }
        } catch (error) {
            task.reject(error);
            return null;
        }
    };

export default sagaIteratorFactory(handleEffect);
