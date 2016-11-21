import expect from 'expect';
import { handleThunkEffect } from './thunk';

describe('handleThunkEffect', () => {
    it('should call callable with args', () => {
        let callableCall;
        const callable = (...args) => () => {
            callableCall = args;
        };
        const args = [1, 2, 3];
        handleThunkEffect({ callable, args });

        expect(callableCall).toEqual(args);
    });

    it('should return a promise resolving with callable()(`cb`) second argument', (done) => {
        const callable = () => cb => cb(null, 'callable result');
        const promise = handleThunkEffect({ callable });

        expect(promise).toBeA(Promise);
        promise.then((result) => {
            expect(result).toBe('callable result');
            done();
        })
        .catch(done);
    });

    it('should return a promise rejecting with callable()(`cb`) first argument if any', (done) => {
        const callable = () => cb => cb(new Error('callable error'));
        const promise = handleThunkEffect({ callable });

        expect(promise).toBeA(Promise);
        promise.then(() => {
            done(new Error('promise should have been rejected'));
        })
        .catch((error) => {
            expect(error.message).toBe('callable error');
            done();
        })
        .catch(done);
    });

    it('should throw an error if receiving a callable that is not a function', () => {
        expect(() => handleThunkEffect({ callable: 'callable' }))
        .toThrow('Expected string to be a function');
    });

    it('should throw an error if receiving a callable that is a generator function', () => {
        expect(() => handleThunkEffect({ * callable() { return yield Promise.resolve(); } }))
        .toThrow('Expected generator function to be a function');
    });
});
