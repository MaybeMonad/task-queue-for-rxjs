# Task Queue for RxJS

```ts
const ob$ = new Subject()

ob$.subscribe(x => {
  
})

const taskQueue = new TaskQueue(ob$, 1)
taskQueue.subscribe()
```
