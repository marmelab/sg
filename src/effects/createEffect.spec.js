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
        expect(effectDescriptor.args).toEqual([callable, 'arg1', 'arg2']);
        effectDescriptor.handle('something else');
        expect(effectDescriptor.handle).toEqual(handle);
    });
});
