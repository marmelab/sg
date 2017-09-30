import executeSaga from '../utils/executeSaga';
import createEffect from './createEffect';

export const handleForkEffectFactory = executeSagaImpl => ([callable, ...args], currentTask) =>
    new Promise((resolve, reject) => {
        try {
            const forkedTask = executeSagaImpl(callable)(...args);
            currentTask.waitFor(forkedTask.promise);
            forkedTask.onError(currentTask.reject);
            currentTask.onCancel(forkedTask.cancel);
            currentTask.onError(forkedTask.cancel);
            resolve(forkedTask);
        } catch (error) {
            reject(error);
        }
    });

export const handleForkEffect = handleForkEffectFactory(executeSaga);

export default createEffect('fork', handleForkEffect);
