import newTask from './utils/newTask';

function sg(generator) {
    const task = newTask(generator);

    return (...args) => task(...args).done();
}

export default sg;
