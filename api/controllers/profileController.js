const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Get current user's profile
exports.getCurrentUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password -resetPasswordToken -resetPasswordExpires -securityAnswer');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update current user's profile
exports.updateCurrentUserProfile = async (req, res) => {
    try {
        const { username, currentPassword, newPassword, securityQuestion, securityAnswer } = req.body;
        
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Check if username is being updated and if it's already taken
        if (username && username !== user.username) {
            const existingUser = await User.findOne({ username, _id: { $ne: req.user.userId } });
            if (existingUser) {
                return res.status(400).json({ message: 'Username already exists' });
            }
            user.username = username;
        }
        
        // Handle password change
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: 'Current password is required to change password' });
            }
            
            const isCurrentPasswordValid = await user.comparePassword(currentPassword);
            if (!isCurrentPasswordValid) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }
            
            if (newPassword.length < 6) {
                return res.status(400).json({ message: 'New password must be at least 6 characters long' });
            }
            
            user.password = newPassword;
        }
        
        // Handle security question update
        if (securityQuestion !== undefined) {
            user.securityQuestion = securityQuestion;
        }
        
        if (securityAnswer !== undefined && securityAnswer.trim() !== '') {
            user.securityAnswer = securityAnswer;
        }
        
        await user.save();
        
        // Return user without sensitive data
        const updatedUser = await User.findById(req.user.userId).select('-password -resetPasswordToken -resetPasswordExpires -securityAnswer');
        res.json({ 
            message: 'Profile updated successfully',
            user: updatedUser 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get any user's profile (for admins and accountants)
exports.getUserProfile = async (req, res) => {
    try {
        // Check if user has permission to view other profiles
        if (!req.user.isAdmin && !req.user.isAccountant) {
            return res.status(403).json({ message: 'Access denied. Admin or accountant privileges required.' });
        }
        
        const { userId } = req.params;
        
        const user = await User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires -securityAnswer');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update any user's profile (admin only)
exports.updateUserProfile = async (req, res) => {
    try {
        // Only admins can update other users' profiles
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }
        
        const { userId } = req.params;
        const { username } = req.body;
        
        // Prevent admin from updating their own profile through this endpoint
        if (userId === req.user.userId) {
            return res.status(400).json({ message: 'Use the /me endpoint to update your own profile' });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Check if username is being updated and if it's already taken
        if (username && username !== user.username) {
            const existingUser = await User.findOne({ username, _id: { $ne: userId } });
            if (existingUser) {
                return res.status(400).json({ message: 'Username already exists' });
            }
            user.username = username;
        }
        
        await user.save();
        
        // Return user without sensitive data
        const updatedUser = await User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires -securityAnswer');
        res.json({ 
            message: 'User profile updated successfully',
            user: updatedUser 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get current user's salary (only their own)
exports.getCurrentUserSalary = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('salaryAmount salaryCurrency salaryDayOfMonth salaryNotes');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            salaryAmount: user.salaryAmount,
            salaryCurrency: user.salaryCurrency,
            salaryDayOfMonth: user.salaryDayOfMonth,
            salaryNotes: user.salaryNotes
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get current user's bonuses (only their own)
exports.getCurrentUserBonuses = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('salaryBonuses');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ bonuses: user.salaryBonuses || [] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get any user's salary (admins and accountants only)
exports.getUserSalary = async (req, res) => {
    try {
        if (!req.user.isAdmin && !req.user.isAccountant) {
            return res.status(403).json({ message: 'Access denied. Admin or accountant privileges required.' });
        }
        const { userId } = req.params;
        const user = await User.findById(userId).select('salaryAmount salaryCurrency salaryDayOfMonth salaryNotes');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            salaryAmount: user.salaryAmount,
            salaryCurrency: user.salaryCurrency,
            salaryDayOfMonth: user.salaryDayOfMonth,
            salaryNotes: user.salaryNotes
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update salary for a user (admins and accountants; includes themselves)
exports.updateUserSalary = async (req, res) => {
    try {
        if (!req.user.isAdmin && !req.user.isAccountant) {
            return res.status(403).json({ message: 'Access denied. Admin or accountant privileges required.' });
        }

        const { userId } = req.params;
        const { salaryAmount, salaryCurrency, salaryDayOfMonth, salaryNotes, updateFromNextCycle } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const prevAmount = user.salaryAmount;
        const amountChanged = salaryAmount !== undefined && Number(salaryAmount) !== Number(prevAmount);
        if (salaryAmount !== undefined) user.salaryAmount = salaryAmount;
        if (salaryCurrency !== undefined) user.salaryCurrency = salaryCurrency;
        if (salaryDayOfMonth !== undefined) user.salaryDayOfMonth = salaryDayOfMonth;
        if (salaryNotes !== undefined) user.salaryNotes = salaryNotes;

        // Handle salary changes based on updateFromNextCycle flag
        if (amountChanged) {
            const now = new Date();
            let targetYear = now.getFullYear();
            let targetMonth = now.getMonth();
            
            // If updateFromNextCycle is true, target the next month
            if (updateFromNextCycle) {
                targetMonth++;
                if (targetMonth > 11) {
                    targetMonth = 0;
                    targetYear++;
                }
            }
            
            if (!Array.isArray(user.salaryBaseEntries)) user.salaryBaseEntries = [];
            
            if (!updateFromNextCycle) {
                // Current behavior: preserve historical values and update current month
                // Find the earliest month with salary data (employment start indicator)
                const earliestEntry = user.salaryBaseEntries.reduce((earliest, entry) => {
                    if (!earliest) return entry;
                    const entryDate = new Date(entry.year, entry.month);
                    const earliestDate = new Date(earliest.year, earliest.month);
                    return entryDate < earliestDate ? entry : earliest;
                }, null);
                
                // Only preserve from earliest employment month, not entire year
                const startMonth = earliestEntry && earliestEntry.year === targetYear ? earliestEntry.month : targetMonth;
                
                for (let m = startMonth; m < targetMonth; m++) {
                    const exists = user.salaryBaseEntries.find(e => e.year === targetYear && e.month === m);
                    if (!exists) {
                        user.salaryBaseEntries.push({
                            year: targetYear,
                            month: m,
                            amount: Number(prevAmount) || 0,
                            currency: user.salaryCurrency || 'USD',
                            note: 'Preserved base before change',
                            createdAt: new Date(),
                            updatedAt: new Date()
                        });
                    }
                }
            }
            
            // Create/update entry for the target month
            const idx = user.salaryBaseEntries.findIndex(e => e.year === targetYear && e.month === targetMonth);
            const entry = {
                year: targetYear,
                month: targetMonth,
                amount: Number(salaryAmount) || 0,
                currency: user.salaryCurrency || 'USD',
                note: updateFromNextCycle ? 'Base updated from next cycle' : 'Base updated',
                updatedAt: new Date()
            };
            if (idx >= 0) user.salaryBaseEntries[idx] = { ...user.salaryBaseEntries[idx]._doc, ...entry };
            else user.salaryBaseEntries.push({ ...entry, createdAt: new Date() });
        }

        await user.save();

        const updated = await User.findById(userId).select('username salaryAmount salaryCurrency salaryDayOfMonth salaryNotes salaryBaseEntries');
        res.json({ 
            message: 'Salary updated successfully',
            salary: {
                salaryAmount: updated.salaryAmount,
                salaryCurrency: updated.salaryCurrency,
                salaryDayOfMonth: updated.salaryDayOfMonth,
                salaryNotes: updated.salaryNotes
            },
            user: { id: updated._id, username: updated.username, salaryBaseEntries: updated.salaryBaseEntries }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// Add or update monthly base salary entry
exports.addMonthlyBaseSalary = async (req, res) => {
    try {
        if (!req.user.isAdmin && !req.user.isAccountant) {
            return res.status(403).json({ message: 'Access denied. Admin or accountant privileges required.' });
        }
        const { userId } = req.params;
        const { year, month, amount, note = '' } = req.body;
        if (typeof year !== 'number' || typeof month !== 'number' || month < 0 || month > 11) {
            return res.status(400).json({ message: 'Invalid year or month' });
        }
        if (typeof amount !== 'number' || amount < 0) {
            return res.status(400).json({ message: 'Invalid base amount' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const currency = user.salaryCurrency || 'USD';
        const idx = (user.salaryBaseEntries || []).findIndex(e => e.year === year && e.month === month);
        const entry = { year, month, amount, currency, note, setBy: req.user.userId, updatedAt: new Date() };
        if (idx >= 0) {
            user.salaryBaseEntries[idx] = { ...user.salaryBaseEntries[idx]._doc, ...entry };
        } else {
            user.salaryBaseEntries.push({ ...entry, createdAt: new Date() });
        }
        await user.save();
        res.json({ message: 'Monthly base salary saved', base: entry });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Add or update monthly bonus for a user (admins and accountants only)
exports.addMonthlyBonus = async (req, res) => {
    try {
        if (!req.user.isAdmin && !req.user.isAccountant) {
            return res.status(403).json({ message: 'Access denied. Admin or accountant privileges required.' });
        }

        const { userId } = req.params;
        const { year, month, amount, note = '' } = req.body;

        if (typeof year !== 'number' || typeof month !== 'number' || month < 0 || month > 11) {
            return res.status(400).json({ message: 'Invalid year or month' });
        }
        if (typeof amount !== 'number' || amount < 0) {
            return res.status(400).json({ message: 'Invalid bonus amount' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const currency = user.salaryCurrency || 'USD';

        // Check if bonus for the same (year, month) exists → replace it
        const existingIndex = (user.salaryBonuses || []).findIndex(b => b.year === year && b.month === month);
        const bonusRecord = {
            year,
            month,
            amount,
            currency,
            note,
            awardedBy: req.user.userId,
            updatedAt: new Date()
        };

        if (existingIndex >= 0) {
            user.salaryBonuses[existingIndex] = { ...user.salaryBonuses[existingIndex]._doc, ...bonusRecord };
        } else {
            user.salaryBonuses.push({ ...bonusRecord, createdAt: new Date() });
        }

        await user.save();

        res.json({ message: 'Monthly bonus saved', bonus: bonusRecord });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get bonuses list for a user (admins and accountants only)
exports.getUserBonuses = async (req, res) => {
    try {
        if (!req.user.isAdmin && !req.user.isAccountant) {
            return res.status(403).json({ message: 'Access denied. Admin or accountant privileges required.' });
        }
        const { userId } = req.params;
        const user = await User.findById(userId).select('salaryBonuses username');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ bonuses: user.salaryBonuses || [] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};