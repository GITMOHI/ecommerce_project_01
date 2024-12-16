const User = require("../../models/Users");
const Order = require("../../models/Orders");
const Category = require("../../models/Categories");

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Fetch monthly active users from current month to the last 12 months
  exports.getLast12MonthsActiveUsers = async (req, res) => {
    try {
      const currentDate = new Date();
      const monthsData = [];
  
      // Loop through the last 12 months
      for (let i = 0; i < 12; i++) {
        // Calculate the start and end date for each month
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0); // Last day of the month
  
        // Count active users for the current month
        const activeUsersCount = await User.countDocuments({
          lastActive: {
            $gte: startDate,
            $lte: endDate
          },
          role: { $ne: 'admin' } 
        });
  
        // Push the data to the result array
        monthsData.push({
        //   year: startDate.getFullYear(),
        //   month: monthNames[startDate.getMonth()], // Convert month number to name
          period: `${monthNames[startDate.getMonth()]} ${startDate.getFullYear()}`, // Combine month and year
          activeUsers: activeUsersCount
        });
      }
  
      // Reverse the array to have the oldest month first
      monthsData.reverse();
  
      // Return the data
      res.status(200).json(monthsData);
    } catch (error) {
      console.error("Error fetching last 12 months active users:", error);
      res.status(500).json({ error: "Server error" });
    }
  };

  exports.getLast12MonthsRevenue = async (req, res) => {
    try {
      const currentDate = new Date();
      const monthsData = [];
  
      // Loop through the last 12 months
      for (let i = 0; i < 12; i++) {
        // Calculate the start and end date for each month
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0); // Last day of the month
  
        // Fetch orders for the current month
        const orders = await Order.find({
          createdAt: {
            $gte: startDate,
            $lte: endDate
          }
        });
  
        // Sum the totalAmount for the current month
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  
        // Push the data to the result array
        monthsData.push({
          period: `${monthNames[startDate.getMonth()]} ${startDate.getFullYear()}`, // Combine month and year
          totalRevenue: totalRevenue
        });
      }
  
      // Reverse the array to have the oldest month first
      monthsData.reverse();
  
      // Return the data
      res.status(200).json(monthsData);
    } catch (error) {
      console.error("Error fetching last 12 months revenue:", error);
      res.status(500).json({ error: "Server error" });
    }
  };


  // // Fetch number of orders by category
  // exports.getOrdersCountByCategory = async (req, res) => {
  //   try {

  //     const categories = await Category.find({}, 'label'); 
  //     const orders = await Order.find({});

  //     const ordersCountByCategory = [];


  //     // Initialize a count
  //     let count = 0;
  
  //     // Iterate through each order and its items
  //     orders.forEach(order => {
  //       order.items.forEach(item => {
        
  //       });
  //     });
  
  //     for (const category of categories) {
  //       const count = await Order.countDocuments({ 'items.category': category });
  //       ordersCountByCategory.push({
  //         category: category.label,
  //         count: count
  //       });
  //     }
  
  //     // Return the data
  //     res.status(200).json(ordersCountByCategory);
  //   } catch (error) {
  //     console.error("Error fetching orders count by category:", error);
  //     res.status(500).json({ error: "Server error" });
  //   }
  // };
  

  

// Fetch number of orders by category
exports.getOrdersCountByCategory = async (req, res) => {
  try {
    const categories = await Category.find({}, 'label'); 

    const ordersCountByCategory = [];

    for (const category of categories) {
      const count = await Order.countDocuments({
        'items.product.category': category.label  
      });

      ordersCountByCategory.push({
        category: category.label,
        count: count
      });
    }

    res.status(200).json(ordersCountByCategory);
  } catch (error) {
    console.error("Error fetching orders count by category:", error);
    res.status(500).json({ error: "Server error" });
  }
};
