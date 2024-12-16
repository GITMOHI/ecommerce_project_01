const { Schema } = require("mongoose");
const mongoose = require("mongoose");

const categorySchema = new Schema({
    label: {
        type: String,
        required: true,
        unique: true,
    },
    value: {
        type: String,
        required: true,
        default:"category",
    },
    checked: {
        type: Boolean,
        default: false,
    },
    image: {
        type: String,
        required: true,
    },
});

// Middleware to synchronize `label` and `value` before saving
categorySchema.pre('save', function (next) {
    // Ensure `value` is the same as `label`
    this.value = this.label;
    next();
});

// Virtual field for id
const virtual = categorySchema.virtual('id');
virtual.get(function () {
    return this._id;
});

categorySchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    },
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
