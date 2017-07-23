import createEffect from '../createEffect';

export const handlePutEffect = ([type, payload], ctx) =>
    new Promise((resolve, reject) => {
        try {
            if (ctx.event && ctx.event[type]) {
                ctx.event[type].map(fn => fn(payload));
                delete ctx.event[type];
            }
            resolve();
        } catch (error) {
            reject(error);
        }
    });

export default createEffect('put', handlePutEffect);
