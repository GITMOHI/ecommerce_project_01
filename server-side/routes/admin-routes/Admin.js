const express = require('express');
const { loginAdmin, logoutAdmin, checkAdminSession, loggedAdmin } = require('../../controllers/Admin/Auth');
const { fetchAllUsers, fetchAllOrders } = require('../../controllers/Users');
const { getLast12MonthsActiveUsers, getLast12MonthsRevenue, getOrdersCountByCategory } = require('../../controllers/Admin/Common');
const router = express.Router();



router.post('/admin-login', loginAdmin)
      .post('/admin-logout',logoutAdmin)
      .get('/getMonthlyUsers',getLast12MonthsActiveUsers)
      .get('/getMonthlyRevenue',getLast12MonthsRevenue)
      .get('/getOrdersByCategory',getOrdersCountByCategory)
      .get('/totalUsers', fetchAllUsers)
      .get('/AllOrders',fetchAllOrders)
      .get('/checkAdminSession', checkAdminSession)
      .get('/loggedAdmin', loggedAdmin)
      

exports.router = router;
