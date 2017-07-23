import newTask from '../utils/newTask';
import createEffect from './createEffect';

export const handleForkEffectFactory = newTaskImpl => ([callable, ...args], ctx, currentTask) =>
    new Promise((resolve, reject) => {
        try {
            const forkedTask = newTaskImpl(callable, ctx)(...args);
            currentTask.waitFor(forkedTask.done());
            forkedTask.onError(currentTask.abort);
            currentTask.onCancel(forkedTask.cancel);
            currentTask.onError(forkedTask.abort);
            resolve(forkedTask);
        } catch (error) {
            reject(error);
        }
    });

export const handleForkEffect = handleForkEffectFactory(newTask);

export default createEffect('fork', handleForkEffect);
