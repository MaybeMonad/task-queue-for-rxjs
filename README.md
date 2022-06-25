# Task Queue for RxJS

```ts
const ob$ = new Subject()

ob$.subscribe(async x => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  console.log(x)
})

const taskQueue = new TaskQueue(ob$)
taskQueue.subscribe(async x => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  console.log(x)
})

ob$.next()
```
