const assert = require('chai').assert;
const sg = require('../sg');

describe('sg', function () {
    it('should execute generator', function (done) {
        const add = (a, b) => { return a + b; };
        const multiply = (a, b) => { return Promise.resolve(a * b); };
        const boom = () => {throw new Error('boom');}
        function* compute(a, b) {
            const c = yield [add, a, b];
            try {
                yield [boom];
            } catch (error) {
                console.log(error);
            }

            return yield [multiply, c, a];
        }

        sg(compute(2, 3))
        .then(result => {
            assert.equal(result, 10);
            done();
        }).catch(error => {
            console.log(error.stack);
            done(error);
        });

    });
});
