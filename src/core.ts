/**
 * TaskQueue for RxJS Subjects
 *
 * 基于 RxJS Subjects 的任务队列，支持异步执行，执行中继等。
 *
 * [#tasksConsumer$] -> [#tasks] -> [#status$::idle] -> [#queue$::throttleTime(500)] -> [Async Execution]
 * [#tasksConsumer$] -> [#tasks] -> [#status$::running] -> [#taskPackages]
 * [#status$::idle] -> [#taskPackages] -> [#queue$::throttleTime(500)] -> [Async Execution]
 */

 import { BehaviorSubject, concatMap, debounceTime, mergeMap, Observable, of, Subject, Subscription, zip } from 'rxjs'

 interface Option {
  taskPacakgeSize?: number
  tickTime?: number
 }

 export class TaskQueue<T> {
   #tasksConsumer$: Subject<T> = new Subject()
   #queue$: Subject<T[]> = new Subject()
   /**
    * Store the tasks in the latest queue.
    */
   #tasks: (T | null)[] = []
   #status$: BehaviorSubject<'idle' | 'running' | 'paused'> = new BehaviorSubject<'idle' | 'running' | 'paused'>('idle')
   #taskPackages: Observable<T>[] = []
   #taskSourceSubscription: Subscription | null = null
   #statusSubscription: Subscription | null = null
   #queueSubscription: Subscription | null = null
   #taskPacakgeSize = 1
   #tickTime = 100
 
   constructor(subject: Subject<T>, opt?: Option) {
     this.#tasksConsumer$ = subject
     this.#taskPacakgeSize = opt?.taskPacakgeSize ?? this.#taskPacakgeSize
     this.#tickTime = opt?.tickTime ?? this.#tickTime
   }
 
   unsubscribe() {
     this.#taskSourceSubscription?.unsubscribe()
     this.#statusSubscription?.unsubscribe()
     this.#queueSubscription?.unsubscribe()
   }
 
   pause() {
     this.#status$.next('paused')
   }
 
   static async *asyncLoopGenerator<T>(x: T[], exec: (x: T) => Promise<T>) {
     let i = 0
 
     while (i < x.length) {
       console.warn(`[Task Queue]: AsyncLoop::[running]::${(x[i] as any)?.action}`)
       await exec(x[i])
       yield i++
     }
   }
 
   subscribe(execution: (x: T) => Promise<T>) {
     this.#queueSubscription = this.#queue$.pipe(debounceTime(this.#tickTime)).subscribe(async x => {
       console.groupCollapsed(
         `[Custom Events]: %c TaskQueue::taskPacakgeSize(${this.#taskPacakgeSize}) `,
         `background: #1BA353; color: white; border-radius: 2px;`
       )
 
       if (this.#status$.value === 'paused') return
 
       if (x instanceof Array) {
         this.#status$.next('running')
         for await (const result of TaskQueue.asyncLoopGenerator(x, execution)) {
           this.#tasks[result] = null
 
           // eslint-disable-next-line @typescript-eslint/ban-ts-comment
           // @ts-ignore
           if (this.#status$.value === 'pause') break
         }
 
         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
         // @ts-ignore
         if (this.#status$.value === 'pause') return
 
         this.#tasks = []
         this.#status$.next('idle')
       }
 
       console.groupEnd()
     })
 
     this.#taskSourceSubscription = this.#tasksConsumer$?.subscribe(action => {
       switch (this.#status$.value) {
         case 'idle':
           if (this.#tasks.length < this.#taskPacakgeSize + 1) {
             this.#tasks.push(action)
             this.#queue$.next(this.#tasks as T[])
           } else {
             this.#status$.next('running')
             this.#taskPackages.push(of(action))
           }
 
           break
 
         case 'paused':
         case 'running':
         default:
           this.#taskPackages.push(of(action))
           break
       }
     })
 
     this.#statusSubscription = this.#status$.subscribe(status => {
       console.warn(`[Custom Events]: TaskQueue::${status}`)
       if (status === 'idle' && this.#taskPackages.length > 0) {
         zip(this.#taskPackages.splice(0, this.#taskPacakgeSize))
           .pipe(
             mergeMap(i => {
               // Manipulate the tasks in TasksPackageQueue before sending them to the queue
               // Example:
               // 1. If the tasks have [priority] property, sort them by priority
               // 2. If the tasks have [delay] property, delay them by delay
               // 3. If the tasks have [interval] property, delay them by interval
               // 4. If the tasks have [sequence] property, delay them by sequence
               // 5. If the tasks have [parallel] property, delay them by parallel
               return of(i)
             }),
             concatMap(x => {
               this.#queue$.next(x)
               return x
             })
           )
           .subscribe()
       }
     })
 
     return this
   }
 }
 