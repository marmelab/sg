import createEffect from '../createEffect';

export const handlePutEffect = emitter => ([type, payload]) =>
    new Promise((resolve, reject) => {
        try {
            emitter.emit(type, payload);
            setTimeout(resolve, 0);
        } catch (error) {
            reject(error);
        }
    });

export default emitter => createEffect('put', handlePutEffect(emitter));
