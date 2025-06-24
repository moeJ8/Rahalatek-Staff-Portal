const mongoose = require('mongoose');
const Voucher = require('../models/Voucher');

async function migrateVouchers() {
    try {
        console.log('Starting voucher migration...');
        
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/tour-management-system', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('Connected to MongoDB');
        
        // Update all vouchers that don't have the isDeleted field
        const result = await Voucher.updateMany(
            { isDeleted: { $exists: false } },
            { 
                $set: { 
                    isDeleted: false,
                    deletedAt: null,
                    deletedBy: null
                }
            }
        );
        
        console.log(`Migration completed:`);
        console.log(`- Documents matched: ${result.matchedCount}`);
        console.log(`- Documents modified: ${result.modifiedCount}`);
        
        // Verify the migration
        const totalVouchers = await Voucher.countDocuments({});
        const vouchersWithIsDeleted = await Voucher.countDocuments({ isDeleted: { $exists: true } });
        const activeVouchers = await Voucher.countDocuments({ isDeleted: false });
        const deletedVouchers = await Voucher.countDocuments({ isDeleted: true });
        
        console.log('\nPost-migration status:');
        console.log(`- Total vouchers: ${totalVouchers}`);
        console.log(`- Vouchers with isDeleted field: ${vouchersWithIsDeleted}`);
        console.log(`- Active vouchers: ${activeVouchers}`);
        console.log(`- Deleted vouchers: ${deletedVouchers}`);
        
        await mongoose.disconnect();
        console.log('\nMigration completed successfully!');
        
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

// Run the migration if this file is executed directly
if (require.main === module) {
    migrateVouchers();
}

module.exports = migrateVouchers; 