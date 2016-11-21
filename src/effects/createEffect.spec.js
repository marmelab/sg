import expect from 'expect';
import createEffect from './createEffect';

describe('createEffect', () => {
    it('should return a function returning an effectDesciptor', () => {
        function handle() {}
        const ctx = {
            key: 'value',
        };
        const effect = createEffect('type', handle, ctx);
        function callable() {}
        const effectDescriptor = effect(callable, 'arg1', 'arg2');
        expect(effectDescriptor.callable).toEqual(callable);
        expect(effectDescriptor.args).toEqual(['arg1', 'arg2']);
        effectDescriptor.handle('something else');
        expect(effectDescriptor.handle).toEqual(handle.bind());
    });

    describe('effectDescriptor.handle', () => {
        it('should be handle function bound as to receive { callable, args} as first argument', () => {
            let handleCall;
            function handle(...args) {
                handleCall = args;
            }
            const effect = createEffect('type', handle);
            function callable() {}
            const effectDescriptor = effect(callable, 'arg1', 'arg2');
            effectDescriptor.handle('something else');
            expect(handleCall).toEqual([{
                callable,
                args: ['arg1', 'arg2'],
            }, 'something else']);
        });

        it('should be handle function bound with given context if any', () => {
            let handleCtx;
            function handle() {
                handleCtx = this;
            }
            const ctx = {
                key: 'value',
            };
            const effect = createEffect('type', handle, ctx);
            function callable() {}
            const effectDescriptor = effect(callable, 'arg1', 'arg2');
            effectDescriptor.handle();

            expect(handleCtx).toEqual(ctx);
        });
    });
});
