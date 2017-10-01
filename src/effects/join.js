import createEffect from './createEffect';

export const handleJoinEffect = ([task]) => task.promise;

export default createEffect('join', handleJoinEffect);
