import expect from 'expect';
import { handleCpsEffect } from './cps';

describe('handleCpsEffect', () => {
    it('should call callable with args', () => {
        let callableCall;
        const callable = (...args) => {
            callableCall = args.slice(0, -1);
        };
        const args = [1, 2, 3];
        handleCpsEffect([callable, ...args]);

        expect(callableCall).toEqual(args);
    });

    it('should return a promise resolving with callable(...args, `cb`) second argument', (done) => {
        const callable = (...args) => args.slice(-1)[0](null, 'callable result');
        const promise = handleCpsEffect([callable]);

        expect(promise).toBeA(Promise);
        promise.then((result) => {
            expect(result).toBe('callable result');
            done();
        })
        .catch(done);
    });

    it('should return a promise rejecting with callable(...args, `cb`) first argument if any', (done) => {
        const callable = (...args) => args.slice(-1)[0](new Error('callable error'));
        const promise = handleCpsEffect([callable]);

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
        expect(() => handleCpsEffect(['callable']))
        .toThrow('Expected string to be a function');
    });

    it('should throw an error if receiving a callable that is a generator function', () => {
        expect(() => handleCpsEffect([function* callable() { return yield Promise.resolve(); }]))
        .toThrow('Expected generator function to be a function');
    });
});
