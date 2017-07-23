import createEffect from '../createEffect';

export const handleTakeEffect = ([type], ctx) =>
    new Promise((resolve, reject) => {
        try {
            ctx.event = ctx.event || {};
            ctx.event[type] = [
                ...ctx.event[type] || [],
                payload => resolve(payload),
            ];
        } catch (error) {
            reject(error);
        }
    });

export default createEffect('take', handleTakeEffect);
