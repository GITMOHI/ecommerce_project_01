const express = require('express');
const { fetchBrands, createBrand } = require('../controllers/Brands');
const { isAdmin } = require('../controllers/Admin/Auth');
const router = express.Router();

router.get('/',fetchBrands)
      .post('/',isAdmin,createBrand);

exports.router = router;