import newTask from './utils/newTask';

function sg(generator) {
    const task = newTask(generator);

    return (...args) => task(...args).promise;
}

export default sg;
