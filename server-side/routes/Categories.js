const express = require('express');
const { fetchCategories, createCategory } = require('../controllers/Categories');
const router = express.Router();
const multer = require('../middlewares/multer.js');
const { isAdmin } = require('../controllers/Admin/Auth.js');


router.get('/',fetchCategories)
      .post('/',isAdmin,multer.single('image'),createCategory);

exports.router = router;