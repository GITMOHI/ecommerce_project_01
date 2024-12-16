const { Schema } = require("mongoose");
const mongoose = require("mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    default: "user",
  },
  addresses: [
    {
      type: Schema.Types.ObjectId,
      ref: "Address", // Reference to the Address model
    },
  ],
  name: {
    type: String,
  },
  orders: {
    type: [Schema.Types.Mixed],
  },
  image: {
    type: String,
  },
  lastActive: { type: Date, default: Date.now }, 

});

//_id->id..
const virtual = userSchema.virtual("id");
virtual.get(function () {
  return this._id;
});
userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
