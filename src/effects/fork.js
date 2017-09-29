import newTask from '../utils/newTask';
import createEffect from './createEffect';

export const handleForkEffectFactory = newTaskImpl => ([callable, ...args], currentTask) =>
    new Promise((resolve, reject) => {
        try {
            const forkedTask = newTaskImpl(callable)(...args);
            currentTask.waitFor(forkedTask.promise);
            forkedTask.onError(currentTask.reject);
            currentTask.onCancel(forkedTask.cancel);
            currentTask.onError(forkedTask.cancel);
            resolve(forkedTask);
        } catch (error) {
            reject(error);
        }
    });

export const handleForkEffect = handleForkEffectFactory(newTask);

export default createEffect('fork', handleForkEffect);
