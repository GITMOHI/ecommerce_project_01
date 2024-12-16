const Products = require("../models/Products");
const cloudinary = require("../utils/cloudinary");
const Brand = require("../models/Brands"); // Assuming you have a Brand model
const Category = require("../models/Categories"); // Assuming you have a Category model

exports.createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      discountPercentage,
      stockQuantity,
      brand: brandId,
      category: categoryId,
    } = req.body;

    console.log(req.body);

    // Fetch brand label using the brandId
    const bran = await Brand.findById(brandId).select("label");

    // Fetch category label using the categoryId
    const cat = await Category.findById(categoryId).select("label");
   

    // Upload thumbnail to Cloudinary
    const thumbnailResult = await cloudinary.uploader.upload(req.files.thumbnail[0].path);

    // Upload additional images to Cloudinary
    const imageUploadPromises = req.files.images.map((file) =>
      cloudinary.uploader.upload(file.path)
    );
    const imageResults = await Promise.all(imageUploadPromises);

    // Extract secure URLs for all images
    const additionalImages = imageResults.map((result) => result.secure_url);

    // Create product document
    const product = new Products({
      title,
      description,
      price,
      discountPercentage,
      stockQuantity,
      brand:  bran.label,
      category:  cat.label,
      thumbnail: thumbnailResult.secure_url,
      images: additionalImages,
    });
    console.log(product);
    const savedProduct = await product.save();

    res.status(201).json(savedProduct);
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(400).json({ error: "Failed to create product.", details: err });
  }
};


exports.insertAll = async (req, res) => {
  const products = req.body;
  try {
    const docs = await Products.insertMany(products);
    console.log("Products inserted:", docs);
    res.status(201).json(docs); // Respond with the inserted documents
  } catch (err) {
    console.error("Error inserting products:", err);
    res.status(500).send("Error inserting products"); // Send an error response
  }
};

exports.fetchAllProducts = async (req, res) => {
  try {
    console.log(req.query);
    let query = Products.find({});
    let totalDocsQuery = Products.find({});

    // Filtering
    if (req.query.category) {
      console.log(req.query.category);

      query = query.where("category").equals(req.query.category);
      totalDocsQuery = totalDocsQuery
        .where("category")
        .equals(req.query.category);
    }
    if (req.query.brand) {
      query = query.where("brand").equals(req.query.brand);
      totalDocsQuery = totalDocsQuery.where("brand").equals(req.query.brand);
    }

    // Sorting
    if (req.query._sort && req.query._order) {
      if (req.query._sort === "BestSeller") {
        query = query.where("bestSeller").equals(true);
      } else {
        const sortOrder = req.query._order === "desc" ? -1 : 1;
        query = query.sort({ [req.query._sort]: sortOrder });

        totalDocsQuery = totalDocsQuery.sort({ [req.query._sort]: sortOrder });
      }
    }

    // Pagination
    if (req.query._page && req.query._per_page) {
      const pageSize = parseInt(req.query._per_page, 10);
      const page = parseInt(req.query._page, 10);
      query = query.skip(pageSize * (page - 1)).limit(pageSize);
      totalDocsQuery = totalDocsQuery
        .skip(pageSize * (page - 1))
        .limit(pageSize);
    }

    const totalDocs = await totalDocsQuery.count().exec();
    res.set("X-Total-Count", totalDocs);
    // console.log(res['X-Total-Count'])

    // Execute the query
    const docs = await query.exec();
    res.status(200).send(docs);
  } catch (e) {
    res.status(400).send({ message: e.message });
  }
};

exports.fetchBestSellers = async (req, res) => {
  try {
    const bestSellingProducts = await Products.find({ bestSeller: true });
    res.status(200).json(bestSellingProducts);
  } catch (err) {
    res.status(404).send({ message: err.message });
  }
};

exports.fetchProductById = async (req, res) => {
  try {
    const product = await Products.findById(req.params.id);
    res.status(200).json(product);
  } catch (err) {
    res.status(404).send({ message: err.message });
  }
};

exports.fetchNewArrivals = async (req, res) => {
  try {
    const daysAgo = 15;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

    const newArrivals = await Products.find({
      createdAt: { $gte: cutoffDate },
    });

    res.status(200).json(newArrivals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error, please try again later." });
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Products.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).json(product);
  } catch (err) {
    res.status(404).send({ message: err.message });
  }
};
