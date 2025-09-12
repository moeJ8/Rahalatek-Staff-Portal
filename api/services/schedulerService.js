const cron = require('node-cron');
const NotificationService = require('./notificationService');
const ScheduleConfig = require('../models/ScheduleConfig');
const SystemConfig = require('../models/SystemConfig');

class SchedulerService {
    constructor() {
        this.jobs = new Map();
        this.timezone = 'UTC'; // Default fallback - will be overridden by database value
        this.isInitialized = false;
    }

    /**
     * Initialize all scheduled jobs with database configurations
     */
    async initializeSchedules() {
        try {
            // Initialize default configurations if not exists
            await ScheduleConfig.initializeDefaults();
            await SystemConfig.initializeDefaults();

            // Get current timezone from database
            this.timezone = await SystemConfig.getValue('SYSTEM_TIMEZONE', this.timezone);
            
            console.log(`🕐 Initializing schedules with timezone: ${this.timezone}`);
            
            // Fix any existing schedule records that have wrong timezone
            await this.migrateScheduleTimezones();
            
            // Stop any existing jobs first
            this.stopAllJobs();

            // Get all schedule configurations from database
            const scheduleConfigs = await ScheduleConfig.find({ enabled: true });
            
            for (const config of scheduleConfigs) {
                await this.createJob(config);
            }

            this.isInitialized = true;
            console.log(`✅ Initialized ${scheduleConfigs.length} scheduled jobs with timezone: ${this.timezone}`);
            
        } catch (error) {
            console.error('❌ Error initializing schedules:', error);
            throw error;
        }
    }

    /**
     * Create a single scheduled job from configuration
     */
    async createJob(config) {
        try {
            const jobFunction = this.getJobFunction(config.jobName);
            
            // Determine timezone: use config timezone, fallback to system timezone
            const jobTimezone = config.timezone || this.timezone;
            
            const job = cron.schedule(config.cronExpression, async () => {
                try {
                    await jobFunction();
                } catch (error) {
                    console.error(`❌ Error in ${config.jobName}:`, error);
                }
            }, {
                timezone: jobTimezone,
                scheduled: false
            });

            this.jobs.set(config.jobName, {
                job,
                config,
                created: new Date(),
                timezone: jobTimezone // Store for debugging
            });

            // console.log(`✅ Created job: ${config.jobName} - ${config.displaySchedule} (timezone: ${jobTimezone})`);
            
        } catch (error) {
            console.error(`❌ Error creating job ${config.jobName}:`, error);
            throw error;
        }
    }

    /**
     * Migrate existing schedule records to use the current system timezone
     */
    async migrateScheduleTimezones() {
        try {
            // Find schedules that don't match the current system timezone
            const outdatedSchedules = await ScheduleConfig.find({
                timezone: { $ne: this.timezone }
            });

            if (outdatedSchedules.length > 0) {
                // Update all schedules to use the current system timezone
                await ScheduleConfig.updateMany(
                    { timezone: { $ne: this.timezone } },
                    { 
                        timezone: this.timezone,
                        lastModified: new Date()
                    }
                );
                
                console.log(`✅ Updated ${outdatedSchedules.length} schedule(s) to timezone: ${this.timezone}`);
            }
        } catch (error) {
            console.error('❌ Error migrating schedule timezones:', error);
            // Don't throw - this is not critical for startup
        }
    }

    /**
     * Get the appropriate function for each job type
     */
    getJobFunction(jobName) {
        const jobFunctions = {
            'checkin-reminder': () => NotificationService.generateDailyCheckinReminder(),
            'checkout-reminder': () => NotificationService.generateDailyCheckoutReminder(),
            'auto-checkout': () => NotificationService.autoCheckoutForgottenEmployees(),
            'daily-summary': async () => {
                await NotificationService.generateArrivalReminders();
                await NotificationService.generateDepartureReminders();
                await NotificationService.generateDailyArrivalsSummary();
                await NotificationService.generateDailyDeparturesSummary();
            },
            'upcoming-events': () => NotificationService.generateUpcomingEventsEmails(),
            'monthly-financial': () => NotificationService.generateMonthlyFinancialSummaryEmails(),
            'custom-reminders': () => NotificationService.processScheduledReminders(),
            'cleanup': () => NotificationService.cleanupExpiredNotifications()
        };

        const jobFunction = jobFunctions[jobName];
        if (!jobFunction) {
            throw new Error(`Unknown job name: ${jobName}`);
        }
        
        return jobFunction;
    }

    /**
     * Start all scheduled jobs
     */
    startAllJobs() {
        let startedCount = 0;
        
        for (const [name, jobData] of this.jobs) {
            try {
                jobData.job.start();
                startedCount++;
            } catch (error) {
                console.error(`❌ Failed to start job ${name}:`, error);
            }
        }
        
        console.log(`🎯 Started ${startedCount}/${this.jobs.size} scheduled jobs`);
    }

    /**
     * Stop all scheduled jobs
     */
    stopAllJobs() {
        for (const [name, jobData] of this.jobs) {
            try {
                jobData.job.stop();
            } catch (error) {
                console.error(`❌ Error stopping job ${name}:`, error);
            }
        }
        this.jobs.clear();
    }

    /**
     * Get detailed status of all jobs
     */
    async getJobStatus() {
        const status = {};
        const scheduleConfigs = await ScheduleConfig.find();
        
        for (const [name, jobData] of this.jobs) {
            const config = scheduleConfigs.find(c => c.jobName === name);
            status[name] = {
                running: jobData.job.running || false,
                scheduled: jobData.job.scheduled || false,
                cronExpression: config?.cronExpression,
                displaySchedule: config?.displaySchedule,
                description: config?.description,
                enabled: config?.enabled,
                timezone: config?.timezone || this.timezone,
                lastModified: config?.lastModified,
                created: jobData.created
            };
        }
        
        return {
            jobs: status,
            timezone: this.timezone,
            totalJobs: this.jobs.size,
            initialized: this.isInitialized
        };
    }

    /**
     * Log the current schedule status for debugging
     */
    async logScheduleStatus() {
        try {
            const status = await this.getJobStatus();
            console.log('\n📋 Current Schedule Status:');
            console.log('====================');
            
            for (const [name, jobStatus] of Object.entries(status.jobs)) {
                const icon = this.getJobIcon(name);
                const statusIcon = jobStatus.running ? '✅' : '⏸️';
                console.log(`${icon} ${statusIcon} ${name}: ${jobStatus.displaySchedule}`);
            }
            
            console.log(`🌍 Timezone: ${status.timezone}`);
            console.log(`📊 Total Jobs: ${status.totalJobs}`);
            console.log('====================\n');
        } catch (error) {
            console.error('❌ Error logging schedule status:', error);
        }
    }

    /**
     * Get appropriate icon for job type
     */
    getJobIcon(jobName) {
        const icons = {
            'checkin-reminder': '🔔',
            'checkout-reminder': '🏃',
            'auto-checkout': '💤',
            'daily-summary': '📋',
            'upcoming-events': '📅',
            'monthly-financial': '💰',
            'custom-reminders': '⚡',
            'cleanup': '🧹'
        };
        return icons[jobName] || '⚙️';
    }

    /**
     * Manually trigger a specific job (for testing)
     */
    async triggerJob(jobName) {
        const jobFunction = this.getJobFunction(jobName);
        return await jobFunction();
    }

    /**
     * Update a schedule configuration and restart the job
     */
    async updateSchedule(jobName, scheduleData, modifiedBy = null) {
        try {
            // Validate cron expression
            if (!cron.validate(scheduleData.cronExpression)) {
                throw new Error('Invalid cron expression');
            }

            // Update the database configuration
            const updatedConfig = await ScheduleConfig.findOneAndUpdate(
                { jobName },
                {
                    ...scheduleData,
                    lastModified: new Date(),
                    modifiedBy
                },
                { new: true }
            );

            if (!updatedConfig) {
                throw new Error(`Schedule configuration for '${jobName}' not found`);
            }

            // Stop and recreate the job with new configuration
            if (this.jobs.has(jobName)) {
                this.jobs.get(jobName).job.stop();
                this.jobs.delete(jobName);
            }

            if (updatedConfig.enabled) {
                await this.createJob(updatedConfig);
                this.jobs.get(jobName).job.start();
            }

            console.log(`✅ Updated schedule for ${jobName}: ${updatedConfig.displaySchedule}`);
            return updatedConfig;

        } catch (error) {
            console.error(`❌ Error updating schedule for ${jobName}:`, error);
            throw error;
        }
    }

    /**
     * Update system timezone and restart all jobs
     */
    async updateTimezone(newTimezone, modifiedBy = null) {
        try {
            // Validate timezone (basic validation)
            if (!newTimezone || typeof newTimezone !== 'string') {
                throw new Error('Invalid timezone');
            }

            // Update system configuration
            await SystemConfig.setValue('SYSTEM_TIMEZONE', newTimezone, modifiedBy);
            
            // Update internal timezone
            this.timezone = newTimezone;

            // IMPORTANT: Update all existing schedule records to use the new timezone
            await ScheduleConfig.updateMany(
                {}, // Update all records
                { 
                    timezone: newTimezone,
                    lastModified: new Date(),
                    ...(modifiedBy && { modifiedBy })
                }
            );

            // Stop all current jobs
            this.stopAllJobs();

            // Get existing schedule configurations (without reinitializing defaults)
            const scheduleConfigs = await ScheduleConfig.find({ enabled: true });
            
            // Recreate jobs with new timezone
            for (const config of scheduleConfigs) {
                await this.createJob(config);
            }

            // Start all jobs
            this.startAllJobs();

            console.log(`✅ Updated timezone to ${newTimezone} and restarted ${scheduleConfigs.length} jobs`);
            return { timezone: newTimezone, restarted: true };

        } catch (error) {
            console.error(`❌ Error updating timezone:`, error);
            throw error;
        }
    }

    /**
     * Enable or disable a specific job
     */
    async toggleJob(jobName, enabled, modifiedBy = null) {
        try {
            const config = await ScheduleConfig.findOneAndUpdate(
                { jobName },
                { 
                    enabled, 
                    lastModified: new Date(),
                    modifiedBy 
                },
                { new: true }
            );

            if (!config) {
                throw new Error(`Schedule configuration for '${jobName}' not found`);
            }

            if (enabled) {
                // Start the job if it doesn't exist
                if (!this.jobs.has(jobName)) {
                    await this.createJob(config);
                }
                this.jobs.get(jobName).job.start();
                console.log(`✅ Enabled job: ${jobName}`);
            } else {
                // Stop and remove the job
                if (this.jobs.has(jobName)) {
                    this.jobs.get(jobName).job.stop();
                    this.jobs.delete(jobName);
                }
                console.log(`⏸️ Disabled job: ${jobName}`);
            }

            return config;

        } catch (error) {
            console.error(`❌ Error toggling job ${jobName}:`, error);
            throw error;
        }
    }

    /**
     * Get all schedule configurations
     */
    async getAllSchedules() {
        try {
            const configs = await ScheduleConfig.find().sort({ jobName: 1 });
            const timezone = await SystemConfig.getValue('SYSTEM_TIMEZONE', this.timezone);
            
            return {
                schedules: configs,
                timezone,
                totalSchedules: configs.length
            };
        } catch (error) {
            console.error('❌ Error getting all schedules:', error);
            throw error;
        }
    }
}

module.exports = new SchedulerService();
