const Category = require("../models/Categories");
const cloudinary = require("../utils/cloudinary");

exports.fetchCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).exec();
    res.status(200).json(categories);
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { label } = req.body;

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);
    console.log(result);
    console.log(result.secure_url);

    const category = await new Category({ label, image: result.secure_url});
    console.log(category);
    const doc = await category.save();
    console.log(doc);
    console.log('Success...');
    res.status(200).json(doc);
  } catch (err) {
    res.status(400).json(err);
  }
};
