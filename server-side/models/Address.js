const { Schema } = require("mongoose");
const mongoose = require("mongoose");

const addressSchema = new Schema({
  street: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  postalCode: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    default: 'Bangladesh',
  },
  phone:{
    type: String,
    required: true,
  }
});

// _id -> id virtual property
const virtual = addressSchema.virtual("id");
virtual.get(function () {
  return this._id;
});
addressSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const Address = mongoose.model("Address", addressSchema);

module.exports = Address;
