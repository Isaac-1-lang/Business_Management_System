/**
 * Background queues are disabled for now.
 * This module exports no-op functions and placeholders to avoid runtime errors.
 */

export async function setupBullQueue() {
  console.log('[Queues disabled] Skipping queue setup');
}

export async function addEmailJob() {
  return null;
}

export async function addReportJob() {
  return null;
}

export async function addSyncJob() {
  return null;
}

export async function addReminderJob() {
  return null;
}

export async function getQueueStats() {
  return { email: {}, report: {}, sync: {}, reminder: {} };
}

export async function cleanupQueues() {
  return true;
}

export const emailQueue = null;
export const reportQueue = null;
export const syncQueue = null;
export const reminderQueue = null;
