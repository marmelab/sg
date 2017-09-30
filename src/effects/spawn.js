import executeSaga from '../utils/executeSaga';
import createEffect from './createEffect';

export const handleSpawnEffectFactory = executeSagaImpl => ([callable, ...args]) =>
    new Promise((resolve, reject) => {
        try {
            const task = executeSagaImpl(callable)(...args);
            resolve(task);
        } catch (error) {
            reject(error);
        }
    });

export const handleSpawnEffect = handleSpawnEffectFactory(executeSaga);

export default createEffect('fork', handleSpawnEffect);
