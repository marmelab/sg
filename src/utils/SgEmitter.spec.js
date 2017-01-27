import expect from 'expect';
import SgEmitter, { takes, puts, tasks } from './SgEmitter';

describe('SgEmitter', () => {
    let sgEmitter;
    beforeEach(() => {
        sgEmitter = new SgEmitter('mainId');
    });

    it('should be initialized with tasks containing mainId', () => {
        expect(sgEmitter[tasks]).toEqual(['mainId']);
        expect(sgEmitter[puts]).toEqual({});
        expect(sgEmitter[takes]).toEqual([]);
    });

    describe('on fork/cancel', () => {
        it('should add forked task id to sgEmitter[tasks] and remove canceled task id', () => {
            sgEmitter.emit('fork', { id: 'id1' });
            sgEmitter.emit('fork', { id: 'id2' });
            expect(sgEmitter[tasks]).toEqual(['mainId', 'id1', 'id2']);
            sgEmitter.emit('cancel', { id: 'id2' });
            expect(sgEmitter[tasks]).toEqual(['mainId', 'id1']);
        });
    });

    describe('take', () => {
        it('should resolve to sgEmitter[puts][type_id] if it exists and delete it', (done) => {
            sgEmitter[puts].type_id = 'event value';
            const takePromise = sgEmitter.take('id', 'type');
            expect(sgEmitter.listeners('event').length).toBe(0);
            expect(sgEmitter[takes]).toEqual([]);

            takePromise.then((result) => {
                expect(result).toBe('event value');
                expect(sgEmitter[puts].type_id).toBe(undefined);
                done();
            })
            .catch(done);
        });

        it('should reject if sgEmitter[takes] is not an array', (done) => {
            sgEmitter[takes] = undefined;

            sgEmitter.take('id', 'type')
            .then(() => {
                throw new Error('take promise should have been rejected');
            })
            .catch((error) => {
                expect(error.message).toBe('Cannot read property \'push\' of undefined');
                done();
            })
            .catch(done);
        });

        it('should add listener to type and add ids in sgEmitter[takes] if no matching value in puts', (done) => {
            const takePromise = sgEmitter.take('id', 'event');
            expect(sgEmitter.listeners('event').length).toBe(1);
            expect(sgEmitter[takes]).toEqual(['id']);

            sgEmitter.emit('event', 'event value');
            takePromise.then((result) => {
                expect(result).toBe('event value');
                done();
            })
            .catch(done);
        });
    });

    describe('put', () => {
        it('should emit event with given payload', (done) => {
            sgEmitter.on('event', (payload) => {
                try {
                    expect(payload).toBe(payload);
                    expect(sgEmitter[puts]).toEqual({ event_mainId: 'payload' });
                    done();
                } catch (error) {
                    done(error);
                }
            });
            sgEmitter.put('id', 'event', 'payload');
        });

        it('should add type_taskId in puts for each id in tasks', () => {
            sgEmitter[tasks] = ['task_id1', 'task_id2'];
            sgEmitter.put('id', 'event', 'payload');
            expect(sgEmitter[puts]).toEqual({
                event_task_id1: 'payload',
                event_task_id2: 'payload',
            });
        });

        it('should ignore task id if it is the same as put current id', () => {
            sgEmitter[tasks] = ['current_task_id', 'other_task_id'];
            sgEmitter.put('current_task_id', 'event', 'payload');
            expect(sgEmitter[puts]).toEqual({
                event_other_task_id: 'payload',
            });
        });

        it('should ignore task id that are presents in takes', () => {
            sgEmitter[tasks] = ['taken_task_id', 'other_task_id'];
            sgEmitter[takes] = ['taken_task_id'];
            sgEmitter.put('current_task_id', 'event', 'payload');
            expect(sgEmitter[puts]).toEqual({
                event_other_task_id: 'payload',
            });
        });
    });
});
