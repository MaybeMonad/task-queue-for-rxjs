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
