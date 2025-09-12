const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const SchedulerService = require('../services/schedulerService');
const ScheduleConfig = require('../models/ScheduleConfig');
const SystemConfig = require('../models/SystemConfig');

// Get scheduler status (Admin only)
router.get('/status', verifyToken, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const status = await SchedulerService.getJobStatus();
        res.json({
            ...status,
            message: 'Scheduler status retrieved successfully'
        });
    } catch (error) {
        console.error('Error getting scheduler status:', error);
        res.status(500).json({ message: 'Failed to get scheduler status' });
    }
});

// Manually trigger a job (Admin only, for testing)
router.post('/trigger/:jobName', verifyToken, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const { jobName } = req.params;
        const validJobs = [
            'checkin-reminder',
            'checkout-reminder', 
            'auto-checkout',
            'daily-summary',
            'upcoming-events',
            'monthly-financial'
        ];

        if (!validJobs.includes(jobName)) {
            return res.status(400).json({ 
                message: 'Invalid job name',
                validJobs 
            });
        }

        const result = await SchedulerService.triggerJob(jobName);

        res.json({
            message: `Job '${jobName}' triggered successfully`,
            result,
            triggeredBy: req.user.userId,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(`Error triggering job ${req.params.jobName}:`, error);
        res.status(500).json({ 
            message: `Failed to trigger job '${req.params.jobName}'`,
            error: error.message 
        });
    }
});

// Restart scheduler (Admin only)
router.post('/restart', verifyToken, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Admin access required' });
        }

        console.log(`🔄 Restarting scheduler by admin ${req.user.userId}`);
        
        SchedulerService.stopAllJobs();
        await SchedulerService.initializeSchedules();
        SchedulerService.startAllJobs();

        res.json({
            message: 'Scheduler restarted successfully',
            restartedBy: req.user.userId,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error restarting scheduler:', error);
        res.status(500).json({ 
            message: 'Failed to restart scheduler',
            error: error.message 
        });
    }
});

// Get all schedule configurations (Admin only)
router.get('/schedules', verifyToken, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const result = await SchedulerService.getAllSchedules();
        res.json({
            ...result,
            message: 'Schedule configurations retrieved successfully'
        });
    } catch (error) {
        console.error('Error getting schedules:', error);
        res.status(500).json({ 
            message: 'Failed to get schedule configurations',
            error: error.message 
        });
    }
});

// Update a specific schedule (Admin only)
router.put('/schedules/:jobName', verifyToken, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const { jobName } = req.params;
        const scheduleData = req.body;

        // Validate required fields
        if (!scheduleData.cronExpression && !scheduleData.metadata) {
            return res.status(400).json({ 
                message: 'Either cronExpression or metadata is required' 
            });
        }

        // If metadata is provided, generate cron expression
        if (scheduleData.metadata && !scheduleData.cronExpression) {
            const tempConfig = new ScheduleConfig({ 
                jobName: 'temp', 
                metadata: scheduleData.metadata 
            });
            scheduleData.cronExpression = tempConfig.generateCronFromMetadata();
            scheduleData.displaySchedule = tempConfig.generateDisplayFromMetadata();
        }

        const updatedConfig = await SchedulerService.updateSchedule(
            jobName, 
            scheduleData, 
            req.user.userId
        );

        res.json({
            schedule: updatedConfig,
            message: `Schedule for '${jobName}' updated successfully`,
            updatedBy: req.user.userId,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(`Error updating schedule ${req.params.jobName}:`, error);
        res.status(500).json({ 
            message: `Failed to update schedule '${req.params.jobName}'`,
            error: error.message 
        });
    }
});

// Enable/disable a specific job (Admin only)
router.patch('/schedules/:jobName/toggle', verifyToken, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const { jobName } = req.params;
        const { enabled } = req.body;

        if (typeof enabled !== 'boolean') {
            return res.status(400).json({ 
                message: 'enabled field must be a boolean' 
            });
        }

        const updatedConfig = await SchedulerService.toggleJob(
            jobName, 
            enabled, 
            req.user.userId
        );

        res.json({
            schedule: updatedConfig,
            message: `Job '${jobName}' ${enabled ? 'enabled' : 'disabled'} successfully`,
            updatedBy: req.user.userId,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(`Error toggling job ${req.params.jobName}:`, error);
        res.status(500).json({ 
            message: `Failed to toggle job '${req.params.jobName}'`,
            error: error.message 
        });
    }
});

// Update system timezone (Admin only)
router.put('/timezone', verifyToken, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const { timezone } = req.body;

        if (!timezone) {
            return res.status(400).json({ 
                message: 'timezone field is required' 
            });
        }

        const result = await SchedulerService.updateTimezone(timezone, req.user.userId);

        res.json({
            ...result,
            message: `System timezone updated to '${timezone}' successfully`,
            updatedBy: req.user.userId,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error updating timezone:', error);
        res.status(500).json({ 
            message: 'Failed to update system timezone',
            error: error.message 
        });
    }
});

// Get available timezones (Admin only)
router.get('/timezones', verifyToken, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const timezones = [
            { value: 'UTC', label: 'UTC (Coordinated Universal Time)', offset: '+00:00' },
            { value: 'Europe/Istanbul', label: 'Turkey (Istanbul)', offset: '+03:00' },
            { value: 'Asia/Damascus', label: 'Syria (Damascus)', offset: '+03:00' },
            { value: 'Europe/London', label: 'United Kingdom (London)', offset: '+00:00/+01:00' },
            { value: 'Europe/Paris', label: 'France (Paris)', offset: '+01:00/+02:00' },
            { value: 'Europe/Berlin', label: 'Germany (Berlin)', offset: '+01:00/+02:00' },
            { value: 'America/New_York', label: 'USA East Coast (New York)', offset: '-05:00/-04:00' },
            { value: 'America/Los_Angeles', label: 'USA West Coast (Los Angeles)', offset: '-08:00/-07:00' },
            { value: 'Asia/Tokyo', label: 'Japan (Tokyo)', offset: '+09:00' },
            { value: 'Australia/Sydney', label: 'Australia (Sydney)', offset: '+10:00/+11:00' }
        ];

        const currentTimezone = await SystemConfig.getValue('SYSTEM_TIMEZONE', 'UTC');

        res.json({
            timezones,
            currentTimezone,
            message: 'Available timezones retrieved successfully'
        });
    } catch (error) {
        console.error('Error getting timezones:', error);
        res.status(500).json({ 
            message: 'Failed to get available timezones',
            error: error.message 
        });
    }
});

module.exports = router;
