const { Schema } = require("mongoose");
const mongoose = require("mongoose");


const cartSchema = new Schema({
    quantity:{
        type:Number,
        required:true
    },
    product:{
        type:Schema.Types.ObjectId,
        ref:'Products',
        required:true
    },
    user:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    }

})

//_id->id..
const virtual = cartSchema.virtual('id');
virtual.get(function(){
    return this._id;
})
cartSchema.set('toJSON',{
    virtuals:true,
    versionKey: false,
    transform:function(doc,ret){delete ret._id}
})

const  Carts = mongoose.model("Carts", cartSchema);

module.exports = Carts;
