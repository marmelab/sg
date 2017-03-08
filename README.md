# SG

Utility to handle side effects with generators. Inspired by [redux-saga](https://github.com/yelouafi/redux-saga) and [co](https://github.com/tj/co).

An effect is an object that describe a task, but do not execute it.
This allows to separate the tasks scheduling from the tasks themself.

## install

`npm install`

## Introduction

The sg function takes a generator yielding effect and returns a function which return a promise.

```js
import { call } from 'sg/effects';
function* gen(name) {
    //...
    yield call(console.log, `hello ${name}`);

    return 'done';
}

const func = sg(gen);

func('world')
.then((result) => {
    console.log(result); // done
});
```

## effects

The effects are helper functions which return an object describing what to do.

```js
const effect = call(console.log, 'hello world');
// effect:
{
    type: 'call',
    handler: // function that will execute the effect: called with arg, and returning a promise
    args: [console.log, 'hello world'], // args passed to the effect function
}
```

### call

Calls a function (normal, async or returning a promise) or a generator yielding effect and either returns the value or throws an error.

```js
const add = (a, b) => a + b;
const addPromise = (a, b) => new Promise((resolve, reject) => {
    try {
        resolve(a + b);
    } catch (error) {
        reject(error);
    }
})
const addAsync = async (a, b) => await Promise.resolve(a + b);
function* addGenerator(a, b) {
    const c = yield call(add, a, b);
    const d = yield call(addPromise, a, c);
    return yield call(addAsync, b, d);
}
```

### thunk

Calls a thunk function and either returns the value or throws an error.
A thunk function is a function that returns an asynchronous function taking a callback.

```js
const add = (a, b) => cb => cb(null, a + b);
```

### co

Calls a co style generator (yielding promise or thunk, not effect).

```js
function* add(a, b) {
    return yield Promise.resolve(a + b);
}
```

### cps

Calls a continuation passing style function.

```js
const add = (a, b, cb) => cb(null, a + b);
```

### put

emit an event

```js
yield put('my event', { payload: data });
```

### take

Waits for event sent by put and return its payload

```js
const payload = yield take('my event'); // { payload: data }
```

### spawn

Launches another sg generator, but do not wait for it to end, returning a [task](#task) object.

```js
const task = yield spawn(sgGenerator);
yield task.done(); //resolve when spawned task resolve
```

### fork

Same as spawn, but errors from the forked generator will bubble up to the parent generator making it fail. Also the parent generator will wait for the forked generator to end before resolving.

```js
const task = yield fork(sgGenerator);
yield task.done(); // resolve when spawned task resolve
```

### cancel

takes a task returned by fork or spawn, and cancels it, ending it and its children.

### race

yields several effect simultaneously in a literal and returns only the result of the first completed effect, or its error if it failed.

```js
const { user, cancel } = yield race({
    user: yield call(fetchUser),
    cancel: yield take('CANCEL'),
});
```

### takeEvery

forks given generator each time given event is triggered.
It is the same as forking the following generator:

```js
function* takeEverySaga(type, gen, ...args) {
    while (true) {
        const action = yield take(type);
        yield fork(gen, ...args.concat(action));
    }
}
```

### task

Object returned by fork and spawn. It has a done and cancel method.

- done: returns a promise, which resolves with task result or rejects with task error.
- cancel: Cancels the task if it is still running. This in turn will also cancel all children of this task.

### Adding your own custom effects with createEffect

You can create your own effect with createEffect.
It takes a type, and an handler.

- Type:
    A string with the effect name
- Handler:
    a function returning a promise and that receives three arguments:
    - effect parameters:
        an array with the list of argument passed to the effect function
    - emitter
        An event emitter used internally for the take and put effects.
    - id
        The internal id of the current saga. You will probably never need this.

Example of custom effect:

```js
import sg, { createEffect } from 'sg.js';
import { createEffect } from 'sg.js/effects';

function handleSql([sql, parameter]) {
    return executeQueryAndReturnAPromise(sql, parameter);
}

const sqlEffect = createEffect('sql', handleSql);
```

`sqlEffect('query', 'parameter');`
give

```js
{
    type: 'sql',
    handle: handleSql,
    args: ['query', 'parameter'],
}
```

Our sqlEffect can be used in a generator like this.

```js
sg(function* (userData) {
    yield sqlEffect('INSERT ... INTO user', userData);
})({ name: 'john' });
```

During execution handleSql will get called like so

```js
handleSql(['INSERT ... INTO user', userData]);
```

## injecting custom eventEmitter

Sg use an eventEmitter internally to handle take and put effect.
It is possible to pass your own eventEmitter to sg. This allow to take event from this event emitter.
Your event emitter must extends node event emitter.
