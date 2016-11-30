import assertIsFunction from '../utils/assertIsFunction';
import createEffect from './createEffect';

export const handleThunkEffect = ([callable, ...args]) => {
    assertIsFunction(callable);

    return new Promise((resolve, reject) => {
        try {
            return callable(...args)((error, result) => {
                if (error) {
                    return reject(error);
                }

                return resolve(result);
            });
        } catch (error) {
            return reject(error);
        }
    });
};
export default createEffect('thunk', handleThunkEffect);
