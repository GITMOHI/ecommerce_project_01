const { Schema } = require("mongoose");
const mongoose = require("mongoose");


const productSchema = new Schema({
    title:{
        type:String,
        required:true,
        unique:true,
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        min:[0,'at least price should be 1'],
        max:[1000000,'at most 100000000']
    },
    discountPercentage:{
        type:Number,
        min:[0,'at least price should be 1'],
        max:[1000000,'at most 100000000']
    },
    rating:{
        type:Number,
        min:[0,'at least price should be 1'],
        max:[3333335,'at most 5'],
        default:0
    },
    stock:{
        type:Number,
        min:[0,'at least  1'],
        max:[2295,'at most 2295'],
        default:0
    },
    brand:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    thumbnail:{
        type:String,
        required:true
    },
    images:{
        type:[String],
        required:true
    },
    deleted:{
        // for admin..
        type:Boolean,
        default:false
    },
    bestSeller:{
        type:Boolean,
        default:false
    }


},{ timestamps: true })

//_id->id..
const virtual = productSchema.virtual('id');
virtual.get(function(){
    return this._id;
})
productSchema.set('toJSON',{
    virtuals:true,
    versionKey: false,
    transform:function(doc,ret){delete ret._id}
})

const  Products = mongoose.model("Products", productSchema);

module.exports = Products;