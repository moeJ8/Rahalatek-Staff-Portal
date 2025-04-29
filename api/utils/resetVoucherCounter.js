/**
 * Utility script to reset the voucher counter sequence
 * Run this with: node api/utils/resetVoucherCounter.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(async () => {
  console.log('MongoDB connected');
  
  try {
    // Import Voucher model directly
    const VoucherModel = require('../models/Voucher');
    
    // Find the highest voucher number
    const lastVoucher = await VoucherModel.findOne().sort({ voucherNumber: -1 });
    console.log('Last voucher:', lastVoucher ? `ID: ${lastVoucher._id}, Number: ${lastVoucher.voucherNumber}` : 'No vouchers found');
    
    // Check for vouchers with null voucherId
    const nullVoucherIds = await VoucherModel.find({ voucherId: null });
    console.log(`Found ${nullVoucherIds.length} vouchers with null voucherId`);
    
    // Fix vouchers with null voucherId
    if (nullVoucherIds.length > 0) {
      for (const voucher of nullVoucherIds) {
        const newNumber = voucher.voucherNumber || 10000 + Math.floor(Math.random() * 90000);
        console.log(`Updating voucher ${voucher._id} to set voucherId = ${newNumber}`);
        
        await VoucherModel.updateOne(
          { _id: voucher._id },
          { $set: { voucherId: newNumber } }
        );
      }
      console.log('Fixed vouchers with null voucherId');
    }
    
    // Check for duplicate voucher numbers
    const voucherNumberCounts = await VoucherModel.aggregate([
      { $group: { _id: "$voucherNumber", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    if (voucherNumberCounts.length > 0) {
      console.log('Found duplicate voucher numbers:', voucherNumberCounts);
      
      // Fix duplicates by updating them to new numbers
      for (const dupEntry of voucherNumberCounts) {
        const duplicates = await VoucherModel.find({ voucherNumber: dupEntry._id });
        console.log(`Found ${duplicates.length} vouchers with number ${dupEntry._id}`);
        
        // Keep the first one, update the rest
        for (let i = 1; i < duplicates.length; i++) {
          const newNumber = 10000 + Math.floor(Math.random() * 90000);
          console.log(`Updating voucher ID ${duplicates[i]._id} from ${duplicates[i].voucherNumber} to ${newNumber}`);
          
          await VoucherModel.updateOne(
            { _id: duplicates[i]._id },
            { $set: { voucherNumber: newNumber, voucherId: newNumber } }
          );
        }
      }
      
      console.log('Duplicate voucher numbers have been fixed.');
    } else {
      console.log('No duplicate voucher numbers found.');
    }
    
    // Check indices
    const indexInfo = await VoucherModel.collection.indexInformation();
    console.log('Current indices for vouchers collection:', indexInfo);
    
    console.log('Voucher counter check completed.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
}); 