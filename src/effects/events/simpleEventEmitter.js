import set from 'lodash.set';
import get from 'lodash.get';

export default (ctx = {}) => ({
    once(type, listener) {
        set(ctx, [type], [
            ...get(ctx, [type], []),
            listener,
        ]);
    },
    emit(type, payload) {
        const events = get(ctx, [type], []);
        if (events) {
            events.map(fn => fn(payload));
            set(ctx, [type], []);
        }
    },
});
