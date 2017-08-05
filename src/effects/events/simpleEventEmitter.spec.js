import expect from 'expect';

import simpleEventEmitterFactory from './simpleEventEmitter';

describe('simpleEventListener', () => {
    describe('emit', () => {
        it('should trigger corresponding listener in ctx, and remove them', () => {
            const listener1 = expect.createSpy();
            const listener2 = expect.createSpy();
            const listener3 = expect.createSpy();
            const ctx = {
                eventType: [listener1, listener2],
                otherType: [listener3],
            };
            const simpleEventEmitter = simpleEventEmitterFactory(ctx);
            simpleEventEmitter.emit('eventType', { payload: 'data' });
            expect(listener1).toHaveBeenCalledWith({ payload: 'data' });
            expect(listener2).toHaveBeenCalledWith({ payload: 'data' });
            expect(listener3).toNotHaveBeenCalled();
            expect(ctx.eventType).toEqual([]);
        });
    });

    describe('once', () => {
        it('should add a listener to the context', () => {
            const ctx = {};
            const simpleEventEmitter = simpleEventEmitterFactory(ctx);
            const listener1 = () => 1;
            const listener2 = () => 2;
            const listener3 = () => 3;
            simpleEventEmitter.once('event', listener1);
            simpleEventEmitter.once('event', listener2);
            simpleEventEmitter.once('otherEvent', listener3);
            expect(ctx.event).toBeA('array');
            expect(ctx.event).toEqual([listener1, listener2]);
            expect(ctx.otherEvent).toEqual([listener3]);
        });
    });
});
