import without from 'lodash/without';
import EventEmitter from 'events';

export const puts = Symbol('puts');
export const tasks = Symbol('tasks');
export const takes = Symbol('takes');

export default class SgEmitter extends EventEmitter {
    constructor(mainId) {
        super();
        this[puts] = {};
        this[tasks] = [mainId];
        this[takes] = [];
        this.on('fork', ({ promise }) => this[tasks].push(promise.id));
        this.on('cancel', ({ id }) => {
            this[tasks] = without(this[tasks], id);
        });
    }

    take(id, type) {
        return new Promise((resolve, reject) => {
            try {
                const key = `${type}_${id}`;
                const event = this[puts][key];
                if (event) {
                    delete this[puts][key];
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
            this[puts][key] = payload;
        });
        this.emit(type, payload);
    }
}
