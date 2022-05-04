const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const addressSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  phoneNo: {
    type: Number,
    required: true
  },
  pincode: {
    type: Number,
    required: true
  },
  add: {
    type: String,
    required: true
  },
  locality: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Address', addressSchema);
