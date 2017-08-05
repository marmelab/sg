import set from 'lodash.set';
import get from 'lodash.get';

export default () => {
    const ctx = {};

    return {
        once(type, listener) {
            set(ctx, [type], [
                ...get(ctx, [type], []),
                payload => listener(payload),
            ]);
        },
        emit(type, payload) {
            const events = get(ctx, [type], []);
            if (events) {
                events.map(fn => fn(payload));
                set(ctx, [type], []);
            }
        },
    };
};
