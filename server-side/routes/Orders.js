const express = require('express');
const { createOrder, fetchOrderByUser, finalizeOrder, handleFailure } = require('../controllers/Orders');
const router = express.Router();

router.post('/',createOrder)
      .get('/:id',fetchOrderByUser)
      .post('/payment/success/:tranId',finalizeOrder)
      .post('/payment/failed/:tranId',handleFailure)

exports.router = router;