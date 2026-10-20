import { Worker } from 'node:worker_threads';
import EventEmitter from 'node:events';

export interface PoolTask {
  taskData: any;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}

export class WorkerPool extends EventEmitter {
  private workerFilePath: string;
  private numberOfThreads: number;
  private workers: Worker[] = [];
  private freeWorkers: Worker[] = [];
  private taskQueue: PoolTask[] = [];
  private isDestroyed: boolean = false;

  constructor(workerFilePath: string, numberOfThreads: number) {
    super();
    this.workerFilePath = workerFilePath;
    this.numberOfThreads = numberOfThreads;

    for (let i = 0; i < numberOfThreads; i++) {
      this.addWorker();
    }
  }

  private addWorker(): void {
    if (this.isDestroyed) return;

    const isTs = this.workerFilePath.endsWith('.ts');
    const worker = new Worker(this.workerFilePath, {
      execArgv: isTs ? ['-r', 'ts-node/register'] : []
    });

    worker.on('message', (result) => {
      const task = (worker as any).currentTask as PoolTask;
      if (task) {
        task.resolve(result);
        (worker as any).currentTask = null;
      }
      this.freeWorkers.push(worker);
      this.processNextTask();
    });

    worker.on('error', (err) => {
      const task = (worker as any).currentTask as PoolTask;
      if (task) {
        task.reject(err);
        (worker as any).currentTask = null;
      }
      this.workers = this.workers.filter((w) => w !== worker);
      this.addWorker();
    });

    this.workers.push(worker);
    this.freeWorkers.push(worker);
  }

  public runTask(taskData: any): Promise<any> {
    if (this.isDestroyed) {
      return Promise.reject(new Error('WorkerPool ha sido destruido'));
    }
    return new Promise((resolve, reject) => {
      this.taskQueue.push({ taskData, resolve, reject });
      this.processNextTask();
    });
  }

  private processNextTask(): void {
    if (this.freeWorkers.length > 0 && this.taskQueue.length > 0) {
      const worker = this.freeWorkers.pop()!;
      const task = this.taskQueue.shift()!;
      (worker as any).currentTask = task;
      worker.postMessage(task.taskData);
    }
  }

  public getActiveWorkersCount(): number {
    return this.workers.length - this.freeWorkers.length;
  }

  public getFreeWorkersCount(): number {
    return this.freeWorkers.length;
  }

  public getQueueLength(): number {
    return this.taskQueue.length;
  }

  public async destroy(): Promise<void> {
    this.isDestroyed = true;
    for (const task of this.taskQueue) {
      task.reject(new Error('WorkerPool destruido antes de procesar la tarea'));
    }
    this.taskQueue = [];
    await Promise.all(this.workers.map((w) => w.terminate()));
    this.workers = [];
    this.freeWorkers = [];
  }
}
