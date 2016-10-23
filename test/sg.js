const assert = require('chai').assert;
const sg = require('../sg');

describe('sg', function () {
    it('should execute generator', function (done) {
        const add = (a, b) => a + b;
        const multiply = (a, b) => Promise.resolve(a * b);
        const substract = (a, b, cb) => cb(null, a - b);
        const boom = () => {throw new Error('boom');}
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

        sg(compute(2, 3))
        .then(result => {
            assert.equal(result, 7);
            done();
        }).catch(error => {
            done(error);
        });

    });
});
