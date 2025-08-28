/**
 * BULL QUEUE SETUP - Background Job Processing
 * 
 * Handles background job processing for:
 * - Email notifications
 * - Report generation
 * - Data synchronization
 * - Compliance reminders
 */

import Queue from 'bull';
import { RedisService } from '../database/redis.js';

// Queue configurations
const queueConfig = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined
  },
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
};

// Create queues
const emailQueue = new Queue('email-queue', queueConfig);
const reportQueue = new Queue('report-queue', queueConfig);
const syncQueue = new Queue('sync-queue', queueConfig);
const reminderQueue = new Queue('reminder-queue', queueConfig);

/**
 * Setup Bull queue system
 */
export async function setupBullQueue() {
  try {
    console.log('Setting up Bull queues...');
    
    // Email queue processor
    emailQueue.process(async (job) => {
      const { type, data } = job.data;
      console.log(`Processing email job: ${type}`);
      
      // Simulate email processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`Email job completed: ${type}`);
      return { success: true, type, timestamp: new Date().toISOString() };
    });
    
    // Report queue processor
    reportQueue.process(async (job) => {
      const { type, data } = job.data;
      console.log(`Processing report job: ${type}`);
      
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log(`Report job completed: ${type}`);
      return { success: true, type, timestamp: new Date().toISOString() };
    });
    
    // Sync queue processor
    syncQueue.process(async (job) => {
      const { type, data } = job.data;
      console.log(`Processing sync job: ${type}`);
      
      // Simulate data synchronization
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log(`Sync job completed: ${type}`);
      return { success: true, type, timestamp: new Date().toISOString() };
    });
    
    // Reminder queue processor
    reminderQueue.process(async (job) => {
      const { type, data } = job.data;
      console.log(`Processing reminder job: ${type}`);
      
      // Simulate reminder processing
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log(`Reminder job completed: ${type}`);
      return { success: true, type, timestamp: new Date().toISOString() };
    });
    
    // Error handling
    emailQueue.on('error', (error) => {
      console.error('Email queue error:', error);
    });
    
    reportQueue.on('error', (error) => {
      console.error('Report queue error:', error);
    });
    
    syncQueue.on('error', (error) => {
      console.error('Sync queue error:', error);
    });
    
    reminderQueue.on('error', (error) => {
      console.error('Reminder queue error:', error);
    });
    
    // Job completion events
    emailQueue.on('completed', (job, result) => {
      console.log(`Email job ${job.id} completed successfully`);
    });
    
    reportQueue.on('completed', (job, result) => {
      console.log(`Report job ${job.id} completed successfully`);
    });
    
    syncQueue.on('completed', (job, result) => {
      console.log(`Sync job ${job.id} completed successfully`);
    });
    
    reminderQueue.on('completed', (job, result) => {
      console.log(`Reminder job ${job.id} completed successfully`);
    });
    
    console.log('Bull queues setup completed successfully');
    
  } catch (error) {
    console.error('Failed to setup Bull queues:', error);
    throw error;
  }
}

/**
 * Add email job to queue
 */
export async function addEmailJob(type, data, options = {}) {
  try {
    const job = await emailQueue.add(type, data, {
      priority: options.priority || 'normal',
      delay: options.delay || 0,
      ...options
    });
    
    console.log(`Email job added to queue: ${job.id}`);
    return job;
  } catch (error) {
    console.error('Failed to add email job:', error);
    throw error;
  }
}

/**
 * Add report job to queue
 */
export async function addReportJob(type, data, options = {}) {
  try {
    const job = await reportQueue.add(type, data, {
      priority: options.priority || 'normal',
      delay: options.delay || 0,
      ...options
    });
    
    console.log(`Report job added to queue: ${job.id}`);
    return job;
  } catch (error) {
    console.error('Failed to add report job:', error);
    throw error;
  }
}

/**
 * Add sync job to queue
 */
export async function addSyncJob(type, data, options = {}) {
  try {
    const job = await syncQueue.add(type, data, {
      priority: options.priority || 'normal',
      delay: options.delay || 0,
      ...options
    });
    
    console.log(`Sync job added to queue: ${job.id}`);
    return job;
  } catch (error) {
    console.error('Failed to add sync job:', error);
    throw error;
  }
}

/**
 * Add reminder job to queue
 */
export async function addReminderJob(type, data, options = {}) {
  try {
    const job = await reminderQueue.add(type, data, {
      priority: options.priority || 'normal',
      delay: options.delay || 0,
      ...options
    });
    
    console.log(`Reminder job added to queue: ${job.id}`);
    return job;
  } catch (error) {
    console.error('Failed to add reminder job:', error);
    throw error;
  }
}

/**
 * Get queue statistics
 */
export async function getQueueStats() {
  try {
    const stats = {
      email: {
        waiting: await emailQueue.getWaiting(),
        active: await emailQueue.getActive(),
        completed: await emailQueue.getCompleted(),
        failed: await emailQueue.getFailed()
      },
      report: {
        waiting: await reportQueue.getWaiting(),
        active: await reportQueue.getActive(),
        completed: await reportQueue.getCompleted(),
        failed: await reportQueue.getFailed()
      },
      sync: {
        waiting: await syncQueue.getWaiting(),
        active: await syncQueue.getActive(),
        completed: await syncQueue.getCompleted(),
        failed: await syncQueue.getFailed()
      },
      reminder: {
        waiting: await reminderQueue.getWaiting(),
        active: await reminderQueue.getActive(),
        completed: await reminderQueue.getCompleted(),
        failed: await reminderQueue.getFailed()
      }
    };
    
    return stats;
  } catch (error) {
    console.error('Failed to get queue stats:', error);
    throw error;
  }
}

/**
 * Clean up queues
 */
export async function cleanupQueues() {
  try {
    await emailQueue.close();
    await reportQueue.close();
    await syncQueue.close();
    await reminderQueue.close();
    
    console.log('Queues cleaned up successfully');
  } catch (error) {
    console.error('Failed to cleanup queues:', error);
    throw error;
  }
}

export {
  emailQueue,
  reportQueue,
  syncQueue,
  reminderQueue
};
