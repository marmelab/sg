import newTask from './utils/newTask';

function sg(generator, ctx = {}) {
    const task = newTask(generator, ctx);

    return (...args) => task(...args).done();
}

export default sg;
