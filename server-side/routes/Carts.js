const express = require('express');
const { addToCart, fetchCartByUser, deleteCartItem, updateCartItem } = require('../controllers/Carts');
const router = express.Router();

router.post('/',addToCart)
      .get('/:id',fetchCartByUser)
      .delete('/:id',deleteCartItem)
      .patch('/:id',updateCartItem);

exports.router = router;