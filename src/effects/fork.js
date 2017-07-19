import newTask from '../utils/newTask';
import createEffect from './createEffect';

export const handleForkEffectFactory = newTaskImpl => ([callable, ...args], ctx) =>
    new Promise((resolve, reject) => {
        try {
            const task = newTaskImpl(callable, ctx)(...args);
            ctx.task.waitFor(task.done());
            task.onError(ctx.task.abort);
            ctx.task.onCancel(task.cancel);
            ctx.task.onError(task.abort);
            resolve(task);
        } catch (error) {
            reject(error);
        }
    });

export const handleForkEffect = handleForkEffectFactory(newTask);

export default createEffect('fork', handleForkEffect);
