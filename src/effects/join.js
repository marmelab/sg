import createEffect from './createEffect';

export const handleJoinEffect = ([task]) => task.done();

export default createEffect('join', handleJoinEffect);
