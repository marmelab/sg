import executeSaga from './utils/executeSaga';

function sg(generator) {
    const execute = executeSaga(generator);

    return (...args) => {
        const task = execute(...args);

        return task.promise;
    };
}

export default sg;
