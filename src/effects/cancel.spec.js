import expect from 'expect';
import { handleCancelEffect } from './cancel';


describe('handleCancelEffect', () => {
    it('should resolve and call task and emit the result as cancel', async () => {
        const task = {
            id: 'id',
            cancel: expect.createSpy(),
        };
        await handleCancelEffect([task], 'ctx');

        expect(task.cancel).toHaveBeenCalled();
    });

    it('should reject if task thrown an error', (done) => {
        const task = {
            cancel: () => {
                throw new Error('Boom');
            },
        };
        const emitter = {
            emit: () => {},
        };
        handleCancelEffect([task], emitter)
        .then(() => {
            throw new Error('handleCancelEffect should have thrown an error');
        })
        .catch((error) => {
            expect(error.message).toBe('Boom');
            done();
        })
        .catch(done);
    });
});
