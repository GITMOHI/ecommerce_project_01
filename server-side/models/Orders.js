const { Schema } = require("mongoose");
const mongoose = require("mongoose");

const orderSchema = new Schema({
  items: {
    type: [Schema.Types.Mixed],
    required: true
  },
  totalAmount: {
    type: Number
  },
  totalItem: {
    type: Number
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    default: 'pending'
  },
  selectedAddress: {
    type: Schema.Types.Mixed,
    required: true
  },
  paidStatus: {
    type: Boolean,
    required: true,
    default: false
  },
  tranjectionId: {
    type: String,
    required: true,
    default: ''
  }
}, { timestamps: true });

// Virtual for 'id'
const virtual = orderSchema.virtual('id');
virtual.get(function() {
  return this._id;
});

orderSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function(doc, ret) {
    delete ret._id;
  }
});

const Orders = mongoose.model("Orders", orderSchema);

module.exports = Orders;
