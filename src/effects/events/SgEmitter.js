import without from 'lodash.without';
import EventEmitter from 'events';

export const puts = Symbol('puts');
export const tasks = Symbol('tasks');
export const takes = Symbol('takes');

export default class SgEmitter {
    constructor(mainId, eventEmitter = new EventEmitter()) {
        if (eventEmitter instanceof SgEmitter) {
            return eventEmitter;
        }
        this[puts] = {};
        this[tasks] = [mainId];
        this[takes] = [];
        this.on = eventEmitter.on.bind(eventEmitter);
        this.once = eventEmitter.once.bind(eventEmitter);
        this.emit = eventEmitter.emit.bind(eventEmitter);
        this.listeners = eventEmitter.listeners.bind(eventEmitter);
        this.on('newTask', ({ id }) => this[tasks].push(id));
        this.on('cancel', ({ target }) => {
            this[tasks] = without(this[tasks], target);
        });

        return this;
    }

    take(id, type) {
        return new Promise((resolve, reject) => {
            try {
                const key = `${type}_${id}`;
                const event = this[puts][key] && this[puts][key].shift();
                if (event) {
                    resolve(event);
                    return;
                }
                this[takes].push(id);

                this.once(type, (payload) => {
                    this[takes] = without(this[takes], id);
                    resolve(payload);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    put(id, type, payload) {
        this[tasks]
        .filter(taskId => taskId !== id && this[takes].indexOf(taskId) === -1)
        .map(taskId => `${type}_${taskId}`)
        .forEach((key) => {
            this[puts][key] = this[puts][key] || [];
            this[puts][key].push(payload);
        });
        this.emit(type, payload);
    }
}
