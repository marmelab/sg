import without from 'lodash/without';
import EventEmitter from 'events';

export const puts = Symbol('puts');
export const tasks = Symbol('tasks');
export const takes = Symbol('takes');

export default class SgEmitter extends EventEmitter {
    constructor() {
        super();
        this[puts] = {};
        this[tasks] = [];
        this[takes] = [];
        this.on('fork', ({ id }) => this[tasks].push(id));
        this.on('cancel', ({ id }) => {
            this[tasks] = without(this[tasks], id);
        });
    }

    take(id, type) {
        const key = `${type}_${id}`;
        const event = this[puts][key];
        if (event) {
            delete this[puts][key];
            return Promise.resolve(event);
        }
        this[takes].push(id);

        return new Promise((resolve) => {
            this.once(type, (payload) => {
                this[takes] = without(this[takes], id);
                resolve(payload);
            });
        });
    }

    put(id, type, payload) {
        this[tasks]
        .filter(taskId => taskId !== id && this[takes].indexOf(taskId) === -1)
        .map(taskId => `${type}_${taskId}`)
        .forEach((key) => {
            this[puts][key] = payload;
        });
        this.emit(type, payload);
    }
}
