import newTask from '../utils/newTask';
import createEffect from './createEffect';

export const handleSpawnEffectFactory = newTaskImpl => ([callable, ...args], ctx) =>
    new Promise((resolve, reject) => {
        try {
            const task = newTaskImpl(callable, ctx)(...args);
            resolve(task);
        } catch (error) {
            reject(error);
        }
    });

export const handleSpawnEffect = handleSpawnEffectFactory(newTask);

export default createEffect('fork', handleSpawnEffect);
