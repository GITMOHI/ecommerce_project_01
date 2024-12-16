const express = require("express");
const {
  fetchUserById,
  updateUser,
  createUser,
  updateUserImage,
  addAddressForUser,
  getUserAddresses,
  loginAdmin,
  fetchAllUsers,
  checkSession,
  checkAdminSession,
  Fun,
  logoutAdmin,
  loggedAdmin,
  updateUserActivity,
} = require("../controllers/Users");
const router = express.Router();
const multer = require("../middlewares/multer.js");

router
  .get("/get-address/:id", getUserAddresses)
  // .put('/updateActivity/:id',updateUserActivity)
  .patch("/:id", updateUser)
  .post("/signup", createUser)
  .post("/add-address/:id", addAddressForUser)
  .patch("/upload-image/:id", multer.single("image"), updateUserImage)
  .get("/all-users", fetchAllUsers)
  .get("/:id", fetchUserById);

exports.router = router;
