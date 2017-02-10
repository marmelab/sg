import createEffect from './createEffect';
import newTask from '../utils/newTask';

const getEffectArray = (effects) => {
    if (Array.isArray(effects)) {
        throw new Error('race take a literal received an array');
    }

    const keys = Object.keys(effects);
    if (effects.handle || keys.length === 1) {
        throw new Error('Trying to race a single effect');
    }

    return {
        keys,
        effectArray: keys.map(key => effects[key]),
    };
};

const cancelTasks = tasks =>
    tasks.forEach(task => task.cancel());

export const handleRaceEffect = ([effects], emitter, id) =>
    new Promise((resolve, reject) => {
        const { effectArray, keys } = getEffectArray(effects);
        const tasks = effectArray.map(effect => newTask(
            function* () { return yield effect; },
            emitter,
            id,
        )());
        const promises = tasks.map((task, index) => task.done().then(
            result => ({ result, index }),
            error => ({ error, index }),
        ));

        Promise.race(promises).then(({ result, error, index }) => {
            if (error) {
                reject(error);
            }
            resolve({ [keys[index]]: result });
            const tasksToCancel = tasks.filter((_, i) => i !== index);
            cancelTasks(tasksToCancel);
        });
    });

export default createEffect('put', handleRaceEffect);
