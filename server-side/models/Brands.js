const { Schema } = require("mongoose");
const mongoose = require("mongoose");

const brandSchema = new Schema({
    label: {
        type: String,
        required: true,
        unique: true,
    },
    value: {
        type: String,
        required: true,
        default:"label"
    },
    checked: {
        type: Boolean,
        default: false,
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
    },
});

// Pre-save hook to set value equal to label
brandSchema.pre("save", function (next) {
    if (this.isModified("label")) {
        this.value = this.label; // Set value to label
    }
    next();
});

// _id -> id virtual field
const virtual = brandSchema.virtual("id");
virtual.get(function () {
    return this._id;
});

brandSchema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    },
});

const Brand = mongoose.model("Brand", brandSchema);

module.exports = Brand;
