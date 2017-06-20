import expect, { createSpy } from 'expect';

import {
    handleRaceEffect as handleRaceEffectFactory,
    getEffectArray,
    cancelTasks,
    createTasksFromEffects as createTasksFromEffectsFactory,
} from './race';


describe('Effects: race', () => {
    describe('handleRaceEffect', () => {
        const getEffectArrayImpl = createSpy().andReturn({ keys: ['key1', 'key2', 'key3'], effectArray: 'effectArray' });
        const createTasksFromEffectsImpl = createSpy().andReturn('tasks');
        const executeTasksImpl = createSpy();
        const cancelTasksImpl = createSpy();
        const handleRaceEffect = handleRaceEffectFactory(
            getEffectArrayImpl,
            createTasksFromEffectsImpl,
            executeTasksImpl,
            cancelTasksImpl,
        );

        it('should be resolved with { key3: "success" } when executeTasksImpl return a result of success', async () => {
            executeTasksImpl.andReturn({ result: 'success', index: 2 });
            const result = await handleRaceEffect(['effects'], 'emitter', 'id');
            expect(result).toEqual({ key3: 'success' });
            expect(getEffectArrayImpl).toHaveBeenCalledWith('effects');
            expect(createTasksFromEffectsImpl).toHaveBeenCalledWith('effectArray', 'emitter', 'id');
            expect(executeTasksImpl).toHaveBeenCalledWith('tasks');
            expect(cancelTasksImpl).toHaveBeenCalledWith('tasks', 2);
        });

        it('should be rejected when executeTasksImpl return an error', async () => {
            executeTasksImpl.andReturn({ error: new Error('boom'), index: 2 });
            let error;
            try {
                await handleRaceEffect(['effects'], 'emitter', 'id');
            } catch (e) {
                error = e;
            }
            expect(error.message).toBe('boom');

            expect(getEffectArrayImpl).toHaveBeenCalledWith('effects');
            expect(createTasksFromEffectsImpl).toHaveBeenCalledWith('effectArray', 'emitter', 'id');
            expect(executeTasksImpl).toHaveBeenCalledWith('tasks');
            expect(cancelTasksImpl).toHaveBeenCalledWith('tasks', 2);
        });
    });

    describe('canceltasks', () => {
        it('should call cancel method of every tasks except the one which index equal except', () => {
            const tasks = [
                { cancel: createSpy() },
                { cancel: createSpy() },
                { cancel: createSpy() },
            ];

            cancelTasks(tasks, 1);

            expect(tasks[0].cancel).toHaveBeenCalled();
            expect(tasks[1].cancel).toNotHaveBeenCalled();
            expect(tasks[2].cancel).toHaveBeenCalled();
        });
    });

    describe('createTasksFromEffects', () => {
        const effects = ['effect1', 'effect2'];
        const task = createSpy().andReturn('taskObject');
        const newTask = createSpy().andReturn(task);
        const wrapInGeneratorImpl = createSpy().andReturn('effect in generator');
        const createTasksFromEffects = createTasksFromEffectsFactory(newTask, wrapInGeneratorImpl);

        it('should call newTaskImpl with each effects wrapped in gen and execute them', () => {
            const result = createTasksFromEffects(effects, 'emitter', 'id');
            expect(result).toEqual(['taskObject', 'taskObject']);
            expect(wrapInGeneratorImpl).toHaveBeenCalledWith('effect1', 0, effects);
            expect(wrapInGeneratorImpl).toHaveBeenCalledWith('effect2', 1, effects);
            expect(newTask).toHaveBeenCalledWith('effect in generator', 'emitter', 'id');
            expect(task).toHaveBeenCalled();
        });
    });

    describe('getEffectArray', () => {
        it('should throw `Cannot race a single effect` when receiving an effect', () => {
            const effect = {
                handle: () => {},
            };
            expect(() => getEffectArray(effect))
                .toThrow('Cannot race a single effect');
        });

        it('should throw `Cannot race a single effect` when receiving a literal with one effect', () => {
            const effects = {
                effect: 'effect',
            };
            expect(() => getEffectArray(effects))
                .toThrow('Cannot race a single effect');
        });

        it('should throw `race take a literal received an array` when receiving a literal with one effect', () => {
            const effects = ['effect'];
            expect(() => getEffectArray(effects))
                .toThrow('race take a literal received an array');
        });

        it('should return array of effect along with array of keys', () => {
            const effects = {
                effect1: 'effect1 object',
                effect2: 'effect2 object',
            };
            expect(getEffectArray(effects)).toEqual({
                keys: ['effect1', 'effect2'],
                effectArray: ['effect1 object', 'effect2 object'],
            });
        });
    });
});
