import handleEffect from './handleEffect';
import newTask from './newTask';
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
export const executeSagaFactory = (handleEffectImpl, newTaskImpl, sagaIteratorImpl) => generator => (...args) => {
    const task = newTaskImpl();
    const iterator = generator(...args);

    sagaIteratorImpl(iterator, task)();

    return task;
};

export default executeSagaFactory(handleEffect, newTask, sagaIterator);
