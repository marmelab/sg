import createEffect from './createEffect';
import newTask from '../utils/newTask';

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

export const createTasksFromEffects = (newTaskImpl, wrapInGeneratorImpl) => (effects, ctx) =>
    effects
    .map(wrapInGeneratorImpl)
    .map(gen => newTaskImpl(
        gen,
        ctx
    ))
    .map(task => task());

export const executeOneTask = (task, index) => task.done().then(
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
) => async ([effects], ctx) => {
    const { effectArray, keys } = getEffectArrayImpl(effects);
    const tasks = createTasksFromEffectsImpl(effectArray, ctx);

    const { result, error, index } = await executeTasksImpl(tasks);
    cancelTasksImpl(tasks, index);
    if (error) {
        throw error;
    }

    return { [keys[index]]: result };
};

export default createEffect('put', handleRaceEffect(
    getEffectArray,
    createTasksFromEffects(newTask, wrapInGenerator),
    executeTasks(executeOneTask),
    cancelTasks
));
