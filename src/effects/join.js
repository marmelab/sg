import createEffect from './createEffect';

export const handleCallEffect = ([task]) => task.done();

export default createEffect('join', handleCallEffect);
