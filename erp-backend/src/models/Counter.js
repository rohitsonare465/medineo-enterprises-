const mongoose = require('mongoose');

// Counter Schema for auto-incrementing invoice numbers
const counterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  prefix: {
    type: String,
    required: true
  },
  financialYear: {
    type: String,
    required: true
  },
  sequence: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Static method to get next sequence number
counterSchema.statics.getNextSequence = async function(name, prefix) {
  const currentDate = new Date();
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const financialYear = month >= 3 
    ? `${year}-${(year + 1).toString().slice(-2)}`
    : `${year - 1}-${year.toString().slice(-2)}`;
  
  const counter = await this.findOneAndUpdate(
    { name, financialYear },
    { 
      $inc: { sequence: 1 },
      $setOnInsert: { prefix, financialYear }
    },
    { 
      new: true, 
      upsert: true 
    }
  );
  
  return {
    sequence: counter.sequence,
    financialYear,
    formatted: `${prefix}/${financialYear}/${String(counter.sequence).padStart(5, '0')}`
  };
};

module.exports = mongoose.model('Counter', counterSchema);
