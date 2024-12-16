const Brand = require("../models/Brands");

exports.fetchBrands = async(req,res)=>{
    try{
        console.log("Fetching");
        const brands = await Brand.find({}).exec();
        res.status(200).json(brands);

    }catch(e){
        res.status(400).json(e);
    }
}

exports.createBrand = async(req,res)=>{
    
    try{
        const brand = new Brand(req.body);
        console.log(brand);
        const doc = await brand.save();

        res.status(200).json(doc);

    }catch(e){
        res.status(400).json(e);
    }
}