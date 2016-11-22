import { assert } from 'chai';
import sg from '../src/sg';

describe('sg', () => {
    it('should execute generator', (done) => {
        const add = (a, b) => a + b;
        const multiply = (a, b) => Promise.resolve(a * b);
        const substract = (a, b, cb) => cb(null, a - b);
        const boom = () => {
            throw new Error('boom');
        };
        function* compute(a, b) {
            const c = yield sg.call(add, a, b);
            try {
                yield sg.call(boom);
            } catch (error) {
                console.log(error);
            }

            const d = yield sg.call(multiply, c, a);

            return yield sg.cps(substract, d, b);
        }

        sg(compute)(2, 3)
        .then((result) => {
            assert.equal(result, 7);
            done();
        }).catch((error) => {
            done(error);
        });
    });

    it('should reject with error unhandled by generator', (done) => {
        function boom() {
            throw new Error('Boom');
        }
        function* bomb() {
            yield sg.call(boom);
        }

        sg(bomb)()
        .then(() => {
            done(new Error('it should have thrown an error'));
        })
        .catch((error) => {
            assert.equal(error.message, 'Boom');
            done();
        })
        .catch(done);
    });

    it('should reject with error throw diractly by generator', (done) => {
        function* bomb() {
            throw new Error('Boom');
        }

        sg(bomb)()
        .then(() => {
            done(new Error('it should have thrown an error'));
        })
        .catch((error) => {
            assert.equal(error.message, 'Boom');
            done();
        })
        .catch(done);
    });
});
