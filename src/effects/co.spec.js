import expect from 'expect';
import { handleCoEffect } from './co';

describe('handleCoEffect', () => {
    it('should call callable with args', () => {
        let callableCall;
        const callable = function* (...args) {
            callableCall = args;
            return yield Promise.resolve();
        };
        const args = [1, 2, 3];
        handleCoEffect(callable, ...args);

        expect(callableCall).toEqual(args);
    });

    it('should return a promise resolving with callable() result', (done) => {
        const callable = function* () {
            return yield Promise.resolve('callable result');
        };
        const promise = handleCoEffect(callable);

        expect(promise).toBeA(Promise);
        promise.then((result) => {
            expect(result).toBe('callable result');
            done();
        })
        .catch(done);
    });

    it('should return a promise rejecting with error throw by callable() if any', (done) => {
        const callable = function* () {
            yield Promise.reject(new Error('callable error'));
        };
        const promise = handleCoEffect(callable);

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

    it('should throw an error if receiving a callable that is not a generator', () => {
        expect(() => handleCoEffect(() => {}))
        .toThrow('coEfffect need a generator got function');
    });
});
