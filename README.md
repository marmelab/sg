# SG

Utility to handle side effects with generators. Inspired by [redux-saga](https://github.com/yelouafi/redux-saga) and [co](https://github.com/tj/co).

An effect is an object that describe an operation, but do not execute it.
This allows to separate the operation scheduling from the operations themself.

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
    handler: // function that will execute the effect: called with args, and a task object representing the state of the saga. Return a promise
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

### spawn

Launches another sg generator, but do not wait for it to end, returning a [task](#task) object.

### fork

Same as spawn, but errors from the forked generator will bubble up to the parent generator making it fail. Also the parent generator will wait for the forked generator to end before resolving.

```js
const task = yield fork(sgGenerator);
```

### cancel

takes a task returned by fork or spawn, and cancels it, ending it and its children.

```js
yield cancel(task);
```

### join

takes a task returned by fork or spawn, and joins it, waiting for the task to end or throw an error to resume the generator.

```js
const result = yield join(task);
```

### race

yields several effect simultaneously in a literal and returns only the result of the first completed effect, or its error if it failed.

```js
const { user, cancel } = yield race({
    user: yield call(fetchUser),
    cancel: yield take('CANCEL'),
});
```

### events

A function initializing a group of effect to handle event.
It take an optional eventEmitter. The eventEmitter must implement an emit and an once method.
It returns the following effects :

#### put

emit an event

```js
yield put('my event', { payload: data });
```

#### take

Waits for event sent by put and return its payload

```js
const payload = yield take('my event'); // { payload: data }
```

```js
const task = yield spawn(sgGenerator);
```

#### takeEvery

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

The task object, it get passed to the effects handler allowing them to reject, cancel, and add listener on the task event. It is also returned by fork and spawn. It has the following methods :

- promise: the task promise, which resolves with task result or rejects with task error.
- cancel: Cancels the task if it is still running. This in turn will also cancel all children of this task.
- waitFor: add a promise for the task to `waitFor` before resolving. Used by the forkEffect to tell its parent task to wait for the new forked task to end
- reject: reject the task promise with the given error, used internally to abort the task when the generator threw an error. Note that it will also cancel any forked task and bubble up, to the parent task if the current task was forked.
- resolve: resolve the task promise with the given result, used internally in sagaIterator to end the task once the generator has finished its execution. Note that the promise will still wait for any forked task or promise passed to the `waitFor` method. You should never have to call this yourself.
- onError: add error listener to be called when the task intenal promise is rejected.
- onCancel: add cancel listener to be called when the task get cancelled.
- cancelled: return true if the task has been cancelled false otherwise

### Adding your own custom effects with createEffect

You can create your own effect with createEffect.
It takes a type, and an handler.

- Type:
    A string with the effect name
- Handler:
    a function returning a promise and that receives two arguments:

    - effect parameters:
        an array with the list of argument passed to the effect function
    - task
        the task that triggered the effect

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
