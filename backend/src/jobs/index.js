import cron from 'node-cron'
import { config } from '../config/config.js'
import { logger } from '../logging/logger.js'

// Import job definitions
import { cleanupJob } from './definitions/cleanupJob.js'
// import { reportJob } from './definitions/reportJob.js';

/**
 * Initialize all Cron Jobs
 * 
 * Jobs are defined in separate files in the 'definitions' folder.
 * This function registers them with node-cron based on their schedules.
 */
export function initJobs() {
  if (!config.jobs.enabled) {
    logger.info('Cron jobs are disabled in configuration.')
    return
  }

  logger.info('Initializing cron jobs...')

  // Register Cleanup Job
  // Schedule: Every day at midnight (0 0 * * *)
  cron.schedule('0 0 * * *', () => {
    logger.info('Running daily cleanup job...')
    cleanupJob()
  }, {
    timezone: config.jobs.timezone,
  })

  // Register other jobs here...
  // cron.schedule('0 9 * * 1', reportJob, { timezone: config.jobs.timezone });

  logger.info('Cron jobs initialized successfully.')
}
