import newTask from '../../utils/newTask';
import createEffect from '../createEffect';

export const handleSpawnEffect = newTaskImpl => ([callable, ...args], emitter) =>
    new Promise((resolve, reject) => {
        try {
            const task = newTaskImpl(callable, emitter)(...args);

            resolve(task);
        } catch (error) {
            reject(error);
        }
    });

export default createEffect('spawn', handleSpawnEffect(newTask));
