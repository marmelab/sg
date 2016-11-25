import expect from 'expect';
import call, { handleCallEffect } from './call';

describe('handleCallEffect', () => {
    it('should call callable with args', () => {
        let callableCall;
        const callable = (...args) => {
            callableCall = args;
        };
        const args = [1, 2, 3];
        handleCallEffect(callable, ...args);

        expect(callableCall).toEqual(args);
    });

    it('should return a promise resolving with callable() result', (done) => {
        const callable = () => 'callable result';
        const promise = handleCallEffect(callable);

        expect(promise).toBeA(Promise);
        promise.then((result) => {
            expect(result).toBe('callable result');
            done();
        })
        .catch(done);
    });

    it('should return a promise rejecting with error throw by callable() if any', (done) => {
        const callable = () => {
            throw new Error('callable error');
        };
        const promise = handleCallEffect(callable);

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

    it('should accept async function', (done) => {
        let callableCall;
        const callable = async (...args) => {
            callableCall = args;
            await Promise.resolve();
            return 'callable result';
        };
        const args = [1, 2, 3];
        const promise = handleCallEffect(callable, ...args);

        expect(callableCall).toEqual(args);

        expect(promise).toBeA(Promise);
        promise.then((result) => {
            expect(result).toBe('callable result');
            done();
        })
        .catch(done);
    });

    it('should throw an error if receiving a callable that is not a function', () => {
        expect(() => handleCallEffect('not a function'))
        .toThrow('Expected string to be callable');
    });

    it('should convert generator callable to promise using sg', (done) => {
        const promise = handleCallEffect(function* callable() {
            return yield call(() => 'callable result');
        });
        expect(promise).toBeA(Promise);
        promise.then((result) => {
            expect(result).toBe('callable result');
            done();
        })
        .catch(done);
    });
});
