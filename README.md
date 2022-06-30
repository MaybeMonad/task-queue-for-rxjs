# Async Task Queue for RxJS

Checkout: [Code Sandbox Example](https://codesandbox.io/s/task-queue-for-rxjs-g1prs6?file=/src/App.js)

![Preview](https://github.com/captain-martin/task-queue-for-rxjs/blob/master/preview.png)

You can simply create an instance to get a new `Subject` with queued execution by applying `new TaskQueue()`, as well as wrap your exist `Subject`s with `TaskQueue` like `new TaskQueue(ob$)`.

```ts
const ob$ = new Subject()
const subOb$ = new Subject()

async function asyncFunc() {
  await new Promise((resolve) => setTimeout(resolve, Math.random(1) * 1000))
}

// Without [TaskQueue]
ob$.subscribe(x => {
  subOb$.next(x)
})
subOb$.current.pipe(switchMap(asyncFunc)).subscribe()  // <- My main goal is to make sure the [asyncFunc] is executed asyncronously.

// With [TaskQueue]
const taskQueue = new TaskQueue(subOb$)
ob$.subscribe(x => {
  taskQueue.next(x)
  // or
  taskQueue.nextAsync(x)
})
taskQueue.subscribe(asyncFunc)
```

## `TaskQueue`

```ts
interface Option {
  taskPacakgeSize?: number; // Maximum tasks in an execution, default is 1
  tickTime?: number; // Debounce Time(ms), default is 0
}
```

## `Reconciler`

Reconciler is a tool to schedule the executions between different Observables.

```ts
const ob1$ = new TaskQueue()
const ob2$ = new TaskQueue()
const ob3$ = new TaskQueue()

const asyncFunc = async (x) => {
  await new Promise(resolve => setTimeout(resolve, Math.random(1) * 1000))
  console.log(x)
}

// Without Reconciler
ob1$.next(1)
ob2$.next(2)
ob3$.next(3)

ob1$.subscribe(console.log)
ob2$.subscribe(console.log)
ob3$.subscribe(console.log)


// With Reconciler
const executor = new Reconciler(ob1$, ob2$, ob3$)

executor.next(1, ob$1)
executor.next(2, ob$2)
executor.next(3, ob$3)

ob1$.subscribe(console.log)
ob2$.subscribe(console.log)
ob3$.subscribe(console.log)
```
