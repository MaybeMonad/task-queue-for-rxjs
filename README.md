# Task Queue for RxJS

Checkout: [Code Sandbox Example](https://codesandbox.io/s/task-queue-for-rxjs-g1prs6?file=/src/App.js)

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
subOb$.current.pipe(switchMap(asyncFunc)).subscribe()

// With [TaskQueue]
const taskQueue = new TaskQueue(subOb$)
ob$.subscribe(x => {
  taskQueue.next(x)
  // or
  taskQueue.nextAsync(x)
})
taskQueue.subscribe(asyncFunc)
```
