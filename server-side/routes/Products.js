const express = require('express');
const { createProduct, insertAll, fetchAllProducts, fetchProductById, fetchBestSellers, fetchNewArrivals } = require('../controllers/Products');
const { isAdmin } = require('../controllers/Admin/Auth');
const multer = require('../middlewares/multer.js');

const router = express.Router();

router.post('/',isAdmin,multer.fields([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'images', maxCount: 10 },
      ]),
      createProduct)
      .get('/',fetchAllProducts)
      .get('/new_arrivals',fetchNewArrivals)
      .get('/bestSellers',fetchBestSellers)
      .get('/:id',fetchProductById)
      .post('/bulk', insertAll);

exports.router = router;