/**
 * Job Queue System
 * Manages background processing tasks for AutoCrate
 */

export interface Job {
  id: string;
  type: 'bom-generation' | 'nx-generation' | 'jt-export' | 'drawing-export' | 'validation';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  data: any;
  result?: any;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  metadata?: Record<string, any>;
}

export interface JobQueueOptions {
  maxConcurrent?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

class JobQueueService {
  private jobs: Map<string, Job> = new Map();
  private queue: string[] = [];
  private processing: Set<string> = new Set();
  private maxConcurrent: number = 3;
  private retryAttempts: number = 3;
  private retryDelay: number = 1000;
  private listeners: Map<string, ((job: Job) => void)[]> = new Map();

  constructor(options?: JobQueueOptions) {
    if (options?.maxConcurrent) this.maxConcurrent = options.maxConcurrent;
    if (options?.retryAttempts) this.retryAttempts = options.retryAttempts;
    if (options?.retryDelay) this.retryDelay = options.retryDelay;
  }

  /**
   * Create a new job and add it to the queue
   */
  public createJob(type: Job['type'], data: any, metadata?: Record<string, any>): string {
    const id = this.generateJobId();
    const job: Job = {
      id,
      type,
      status: 'pending',
      progress: 0,
      data,
      createdAt: new Date(),
      metadata
    };

    this.jobs.set(id, job);
    this.queue.push(id);
    this.emitJobUpdate(job);
    
    // Start processing if not at max capacity
    this.processNext();

    return id;
  }

  /**
   * Get job by ID
   */
  public getJob(id: string): Job | null {
    return this.jobs.get(id) || null;
  }

  /**
   * Get all jobs with optional filtering
   */
  public getJobs(filter?: { type?: Job['type']; status?: Job['status'] }): Job[] {
    let jobs = Array.from(this.jobs.values());
    
    if (filter?.type) {
      jobs = jobs.filter(job => job.type === filter.type);
    }
    
    if (filter?.status) {
      jobs = jobs.filter(job => job.status === filter.status);
    }
    
    return jobs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Update job progress
   */
  public updateProgress(id: string, progress: number): void {
    const job = this.jobs.get(id);
    if (!job) return;

    job.progress = Math.min(100, Math.max(0, progress));
    this.emitJobUpdate(job);
  }

  /**
   * Complete a job with result
   */
  public completeJob(id: string, result: any): void {
    const job = this.jobs.get(id);
    if (!job) return;

    job.status = 'completed';
    job.progress = 100;
    job.result = result;
    job.completedAt = new Date();
    
    this.processing.delete(id);
    this.emitJobUpdate(job);
    this.processNext();
  }

  /**
   * Fail a job with error
   */
  public failJob(id: string, error: string): void {
    const job = this.jobs.get(id);
    if (!job) return;

    job.status = 'failed';
    job.error = error;
    job.completedAt = new Date();
    
    this.processing.delete(id);
    this.emitJobUpdate(job);
    this.processNext();
  }

  /**
   * Cancel a pending job
   */
  public cancelJob(id: string): boolean {
    const job = this.jobs.get(id);
    if (!job || job.status !== 'pending') return false;

    const queueIndex = this.queue.indexOf(id);
    if (queueIndex > -1) {
      this.queue.splice(queueIndex, 1);
    }

    job.status = 'failed';
    job.error = 'Job cancelled';
    job.completedAt = new Date();
    
    this.emitJobUpdate(job);
    return true;
  }

  /**
   * Subscribe to job updates
   */
  public subscribe(jobId: string, callback: (job: Job) => void): () => void {
    if (!this.listeners.has(jobId)) {
      this.listeners.set(jobId, []);
    }
    
    this.listeners.get(jobId)!.push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(jobId);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Clear completed jobs older than specified age
   */
  public clearOldJobs(maxAgeMs: number = 3600000): number {
    const now = Date.now();
    let cleared = 0;
    
    for (const [id, job] of this.jobs.entries()) {
      if (job.status === 'completed' || job.status === 'failed') {
        const age = now - job.completedAt!.getTime();
        if (age > maxAgeMs) {
          this.jobs.delete(id);
          this.listeners.delete(id);
          cleared++;
        }
      }
    }
    
    return cleared;
  }

  /**
   * Get queue statistics
   */
  public getStatistics(): {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    queueLength: number;
    avgProcessingTime: number;
  } {
    const jobs = Array.from(this.jobs.values());
    const completed = jobs.filter(j => j.status === 'completed');
    
    const processingTimes = completed
      .filter(j => j.startedAt && j.completedAt)
      .map(j => j.completedAt!.getTime() - j.startedAt!.getTime());
    
    const avgProcessingTime = processingTimes.length > 0 
      ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length 
      : 0;
    
    return {
      total: jobs.length,
      pending: jobs.filter(j => j.status === 'pending').length,
      processing: jobs.filter(j => j.status === 'processing').length,
      completed: completed.length,
      failed: jobs.filter(j => j.status === 'failed').length,
      queueLength: this.queue.length,
      avgProcessingTime
    };
  }

  /**
   * Process next job in queue
   */
  private async processNext(): Promise<void> {
    if (this.processing.size >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const jobId = this.queue.shift();
    if (!jobId) return;

    const job = this.jobs.get(jobId);
    if (!job) return;

    this.processing.add(jobId);
    job.status = 'processing';
    job.startedAt = new Date();
    this.emitJobUpdate(job);

    // Simulate processing based on job type
    // In real implementation, this would call actual processing functions
    try {
      const result = await this.processJob(job);
      this.completeJob(jobId, result);
    } catch (error) {
      this.failJob(jobId, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Process a specific job (simulated)
   */
  private async processJob(job: Job): Promise<any> {
    // Simulate processing with progress updates
    const steps = 10;
    const stepDuration = 200; // ms
    
    for (let i = 1; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, stepDuration));
      this.updateProgress(job.id, (i / steps) * 100);
    }
    
    // Return mock result based on job type
    switch (job.type) {
      case 'bom-generation':
        return {
          items: 12,
          totalCost: 450.00,
          generatedAt: new Date()
        };
      
      case 'nx-generation':
        return {
          expressions: 25,
          features: 8,
          generatedAt: new Date()
        };
      
      case 'jt-export':
        return {
          fileSize: 1024 * 250, // 250KB
          vertices: 5000,
          faces: 2500,
          generatedAt: new Date()
        };
      
      case 'drawing-export':
        return {
          pages: 3,
          format: 'PDF',
          generatedAt: new Date()
        };
      
      case 'validation':
        return {
          passed: true,
          checks: 15,
          warnings: 2,
          generatedAt: new Date()
        };
      
      default:
        return { success: true };
    }
  }

  /**
   * Generate unique job ID
   */
  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Emit job update to listeners
   */
  private emitJobUpdate(job: Job): void {
    const callbacks = this.listeners.get(job.id);
    if (callbacks) {
      callbacks.forEach(callback => callback(job));
    }
  }
}

// Create singleton instance
export const JobQueue = new JobQueueService();

// Export for type usage
export type { JobQueueService };