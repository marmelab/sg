#SG
Utility to handle side effects with generators. Inspired by [redux-saga](https://github.com/yelouafi/redux-saga) and [co](https://github.com/tj/co).

##install
`npm install`

##Introduction
The sg function takes a generator yielding effect and returns a function which return a promise.
```js
import sg from 'sg';
function* gen(name) {
    //...
    yield sg.call(console.log, `hello ${name}`);

    return 'done';
}

const func = sg(gen);

func('world')
.then((result) => {
    console.log(result); // done
});
```

##effects
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

###call
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
    const c = yield sg.call(add, a, b);
    const d = yield sg.call(addPromise, a, c);
    return yield sg.call(addAsync, b, d);
}
```

###thunk
Calls a thunk function and either returns the value or throws an error.
A thunk function is a function that returns an asynchronous function taking a callback.
```js
const add = (a, b) => cb => cb(null, a + b);
```

###co
Calls a co style generator (yielding promise or thunk, not effect).
```js
function* add(a, b) {
    return yield Promise.resolve(a + b);
}
```

###cps
Calls a continuation passing style function.
```js
const add = (a, b, cb) => cb(null, a + b);
```

### coming soon
 - fork (same as call but will not wait for the result returning the promise instead)
 - put (emit an event)
 - take (wait for an event)
 - takeEvery (execute given generator for each matching event)

###Adding your own custom effects with createEffect
You can create your own effect with createEffect.
It takes a type, an handler and an optional context.
Type: string with the effect name
Handler: a function that will be called with the effect parameter and must returns a promise or be async.
Context: the context(this value) with which the handler will be called. (context will have no effect with arrow function)
Example of custom effect:
```js
import { createEffect } from 'sg.js';
const sqlEffect = createEffect('sql', function (sql, parameter) {
    return executeQueryAndReturnAPromise(sql, parameter);
});

ds(function* (userData) {
    yield sqlEffect('INSERT ... INTO user', userData);
})({ name: 'john' });
```
