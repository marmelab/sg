const assert = require('chai').assert;
const sg = require('../sg');

describe('sg', function () {
    it('should execute generator', function () {
        const add = (a, b) => { return a + b; };
        const multiply = (a, b) => { return a * b; };
        const boom = () => {throw new Error('boom');}

        assert.equal(sg(function* (a, b) {
            const c = yield [add, a, b];
            try {
                yield [boom];
            } catch (error) {
                console.log(error);
            }

            return yield [multiply, c, a];
        }, 2, 3), 10);
    });
});
