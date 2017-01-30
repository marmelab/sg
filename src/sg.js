import newTask from './utils/newTask';

function sg(generator, emitter, parentId = null) {
    const task = newTask(generator, emitter, parentId);
    return (...args) => task(...args).done();
}

export default sg;
