/**
 * What is reconciler and what for?
 *
 * Since we've encountered the situation as actions will be broadcasted to multiple Observables almost at the same time,
 * we need to find a way to schedule the executions between different Observables.
 *
 * [Actions] -> [ob-1$::action-1], [ob-2$::action-2], [ob-3$::action-3]...-> What if [ob-2$] has to borrow some value from [ob-1$]?
 * [Actions::Reconciler] -> [ob-1$::async::action-1], [ob-2$::action-2], [ob-3$::action-3]...-> Now the [ob-2$] is guaranteed.
 */

 import { TaskQueue } from './queue'

 export class Reconciler<T> {
   #observables = new WeakMap<TaskQueue<T>, TaskQueue<T>>()
   #taskQueue = new TaskQueue<{
     action: T
     executor: TaskQueue<T>
   }>()
 
   constructor(...args: TaskQueue<T>[]) {
     Array.from(args).forEach(tq => {
       if (this.#observables.has(tq)) {
         console.log('Reconciler: already has this queue')
       }
       this.#observables.set(tq, tq)
     })
 
     this.#init()
   }
 
   #init() {
     this.#taskQueue.subscribe(async (x: { action: T; executor: TaskQueue<T> }) => {
       await this.#asyncTaskRunner(x.action, x.executor)
       return x
     })
   }
 
   async #asyncTaskRunner(x: T, executor: TaskQueue<T>) {
     if (!executor) throw new Error('Executor is not set')
     await this.#observables.get(executor).nextAsync(x)
   }
 
   unsubscribe() {
     this.#taskQueue.unsubscribe()
   }
 
   async nextAsync(x: T, tq: TaskQueue<T>) {
     await this.#taskQueue.nextAsync({
       action: x,
       executor: tq
     })
   }
 
   asyncNext(x: T, tq: TaskQueue<T>) {
     this.#taskQueue.nextAsync({
       action: x,
       executor: tq
     })
   }
 
   // parallel() {}
 }
 