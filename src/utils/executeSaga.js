import handleEffect from './handleEffect';
import createTask from './createTask';
import sagaIterator from './sagaIterator';

/*
 * sagaIteratorFactory: Take the handleEffect function and return a saga iterator
 *
 * sagaIterator: iterate over an iterator updating the task object accordingly
 *      iterator: the iterator object
 *      task: the task
 *  return iterateSaga
 *
 * iterateSaga:
 *      Execute the iterator recursively
 */
export const executeSagaFactory = (handleEffectImpl, createTaskImpl, sagaIteratorImpl) => generator => (...args) => {
    const task = createTaskImpl();
    const iterator = generator(...args);

    sagaIteratorImpl(iterator, task)();

    return task;
};

export default executeSagaFactory(handleEffect, createTask, sagaIterator);
