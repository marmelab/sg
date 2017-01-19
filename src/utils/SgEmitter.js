import without from 'lodash/without';
import EventEmitter from 'events';

export default class SgEmitter extends EventEmitter {
    constructor() {
        super();
        this.events = {};
        this.tasks = [];
        this.takes = [];
        this.on('fork', ({ id }) => this.tasks.push(id));
        this.on('cancel', ({ id }) => {
            this.tasks = without(this.tasks, id);
        });
    }
    take(id, type) {
        const key = `${type}_${id}`;
        const event = this.events[key];
        if (event) {
            delete this.events[key];
            return Promise.resolve(event);
        }
        this.takes.push(id);


        return new Promise((resolve) => {
            this.once(type, (payload) => {
                this.takes = without(this.takes, id);
                resolve(payload);
            });
        });
    }

    put(id, type, payload) {
        this.tasks
        .filter(taskId => taskId !== id && this.takes.indexOf(id) === -1)
        .map(taskId => `${type}_${taskId}`)
        .forEach((key) => {
            this.events[key] = payload;
        });
        this.emit(type, payload);
    }
}
