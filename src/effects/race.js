import createEffect from './createEffect';
import executeSaga from '../utils/executeSaga';

export const getEffectArray = (effects) => {
    if (Array.isArray(effects)) {
        throw new Error('race take a literal received an array');
    }

    const keys = Object.keys(effects);
    if (effects.handle || keys.length === 1) {
        throw new Error('Cannot race a single effect');
    }

    return {
        keys,
        effectArray: keys.map(key => effects[key]),
    };
};

export const cancelTasks = (tasks, except) =>
    tasks
        .filter((_, i) => i !== except)
        .forEach(task => task.cancel());

export const wrapInGenerator = effect =>
    function* () { return yield effect; };

export const createTasksFromEffects = (executeSagaImpl, wrapInGeneratorImpl) => effects =>
    effects
    .map(wrapInGeneratorImpl)
    .map(gen => executeSagaImpl(gen))
    .map(task => task());

export const executeOneTask = (task, index) => task.promise.then(
    result => ({ result, index }),
    error => ({ error, index }),
);

export const executeTasks = executeTasksImpl => tasks =>
    Promise.race(tasks.map(executeTasksImpl));

export const handleRaceEffect = (
    getEffectArrayImpl,
    createTasksFromEffectsImpl,
    executeTasksImpl,
    cancelTasksImpl
) => async ([effects]) => {
    const { effectArray, keys } = getEffectArrayImpl(effects);
    const tasks = createTasksFromEffectsImpl(effectArray);

    const { result, error, index } = await executeTasksImpl(tasks);
    cancelTasksImpl(tasks, index);
    if (error) {
        throw error;
    }

    return { [keys[index]]: result };
};

export default createEffect('put', handleRaceEffect(
    getEffectArray,
    createTasksFromEffects(executeSaga, wrapInGenerator),
    executeTasks(executeOneTask),
    cancelTasks
));
