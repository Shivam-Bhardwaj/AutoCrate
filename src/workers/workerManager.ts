/**
 * Worker Manager for handling Web Workers efficiently
 * Manages worker lifecycle, message passing, and result caching
 */

import { CrateConfiguration } from '@/types/crate';

export interface WorkerTask {
  id: string;
  type: 'calculate';
  configuration: CrateConfiguration;
  timestamp: number;
}

export interface WorkerResult {
  id: string;
  data: any;
  timestamp: number;
}

export class WorkerManager {
  private static instance: WorkerManager;
  private workers: Map<string, Worker> = new Map();
  private pendingTasks: Map<string, WorkerTask> = new Map();
  private callbacks: Map<string, {
    resolve: (value: any) => void;
    reject: (error: any) => void;
    progress?: (progress: number, message?: string) => void;
  }> = new Map();
  private maxWorkers = navigator.hardwareConcurrency || 4;
  private workerPool: Worker[] = [];
  private availableWorkers: Worker[] = [];

  private constructor() {
    this.initializeWorkerPool();
  }

  public static getInstance(): WorkerManager {
    if (!WorkerManager.instance) {
      WorkerManager.instance = new WorkerManager();
    }
    return WorkerManager.instance;
  }

  private initializeWorkerPool() {
    // Create a pool of workers based on available CPU cores
    for (let i = 0; i < Math.min(this.maxWorkers, 4); i++) {
      const worker = new Worker(
        new URL('./calculations.worker.ts', import.meta.url),
        { type: 'module' }
      );
      
      worker.addEventListener('message', this.handleWorkerMessage.bind(this));
      worker.addEventListener('error', this.handleWorkerError.bind(this));
      
      this.workerPool.push(worker);
      this.availableWorkers.push(worker);
    }
  }

  private handleWorkerMessage(event: MessageEvent) {
    const { type, id, data, error, progress } = event.data;
    const callback = this.callbacks.get(id);

    if (!callback) return;

    switch (type) {
      case 'result':
        callback.resolve(data);
        this.cleanupTask(id);
        break;

      case 'error':
        callback.reject(new Error(error));
        this.cleanupTask(id);
        break;

      case 'progress':
        if (callback.progress) {
          callback.progress(progress, data?.message);
        }
        break;
    }
  }

  private handleWorkerError(error: ErrorEvent) {
    console.error('Worker error:', error);
    // Attempt to recover by recreating the worker
    this.recoverWorker(error.target as Worker);
  }

  private recoverWorker(failedWorker: Worker) {
    const index = this.workerPool.indexOf(failedWorker);
    if (index !== -1) {
      failedWorker.terminate();
      
      const newWorker = new Worker(
        new URL('./calculations.worker.ts', import.meta.url),
        { type: 'module' }
      );
      
      newWorker.addEventListener('message', this.handleWorkerMessage.bind(this));
      newWorker.addEventListener('error', this.handleWorkerError.bind(this));
      
      this.workerPool[index] = newWorker;
      
      // If the failed worker was available, make the new one available
      const availableIndex = this.availableWorkers.indexOf(failedWorker);
      if (availableIndex !== -1) {
        this.availableWorkers[availableIndex] = newWorker;
      }
    }
  }

  private getAvailableWorker(): Worker | null {
    return this.availableWorkers.shift() || null;
  }

  private releaseWorker(worker: Worker) {
    if (!this.availableWorkers.includes(worker)) {
      this.availableWorkers.push(worker);
    }
    this.processNextTask();
  }

  private processNextTask() {
    if (this.pendingTasks.size === 0) return;
    
    const worker = this.getAvailableWorker();
    if (!worker) return;

    const [taskId, task] = this.pendingTasks.entries().next().value;
    this.pendingTasks.delete(taskId);
    
    this.workers.set(taskId, worker);
    worker.postMessage({
      type: 'calculate',
      id: taskId,
      payload: {
        configuration: task.configuration
      }
    });
  }

  private cleanupTask(id: string) {
    const worker = this.workers.get(id);
    if (worker) {
      this.workers.delete(id);
      this.releaseWorker(worker);
    }
    this.callbacks.delete(id);
    this.pendingTasks.delete(id);
  }

  public async calculate(
    configuration: CrateConfiguration,
    onProgress?: (progress: number, message?: string) => void
  ): Promise<any> {
    const id = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject, progress: onProgress });
      
      const task: WorkerTask = {
        id,
        type: 'calculate',
        configuration,
        timestamp: Date.now()
      };

      const worker = this.getAvailableWorker();
      if (worker) {
        this.workers.set(id, worker);
        worker.postMessage({
          type: 'calculate',
          id,
          payload: {
            configuration: task.configuration
          }
        });
      } else {
        // Queue the task if no workers are available
        this.pendingTasks.set(id, task);
      }
    });
  }

  public cancelTask(id: string) {
    const worker = this.workers.get(id);
    if (worker) {
      worker.postMessage({ type: 'cancel', id });
      this.cleanupTask(id);
    } else {
      this.pendingTasks.delete(id);
      const callback = this.callbacks.get(id);
      if (callback) {
        callback.reject(new Error('Task cancelled'));
        this.callbacks.delete(id);
      }
    }
  }

  public cancelAllTasks() {
    // Cancel pending tasks
    for (const [id, callback] of this.callbacks.entries()) {
      callback.reject(new Error('All tasks cancelled'));
    }
    
    // Clear all maps
    this.workers.clear();
    this.pendingTasks.clear();
    this.callbacks.clear();
    
    // Return all workers to available pool
    this.availableWorkers = [...this.workerPool];
  }

  public getStatus() {
    return {
      totalWorkers: this.workerPool.length,
      availableWorkers: this.availableWorkers.length,
      busyWorkers: this.workers.size,
      pendingTasks: this.pendingTasks.size
    };
  }

  public terminate() {
    this.cancelAllTasks();
    for (const worker of this.workerPool) {
      worker.terminate();
    }
    this.workerPool = [];
    this.availableWorkers = [];
  }
}