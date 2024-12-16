const passport = require("passport");
const User = require("../models/Users");
const Address = require("../models/Address"); // Import Address model
const bcrypt = require('bcryptjs');

const { genSaltSync, hashSync,compareSync } = require("bcryptjs");
const cloudinary = require("../utils/cloudinary");
const Orders = require("../models/Orders");

//signup.
exports.createUser = async (req, res) => {
  const salt = genSaltSync(10);
  const email = req.body.email;

  try {
    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const data = {
      name: req.body.name,
      email,
      role: req.body.role,
      password: hashSync(req.body.password, salt),
    };

    const user = new User(data);
    const doc = await user.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.fetchUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(
      id,
      "name email id addresses image"
    ).exec();
    res.status(201).send(user);
  } catch (err) {
    res.status(400).send(err);
  }
};

exports.updateUser = async (req, res) => {
  console.log("hitted.......", req.body);
  const { id } = req.params;

  try {
    const { name, image, addresses, email, role } = req.body;
    console.log(req.body);

    const userData = {
      name,
      role: role ? role : "user",
    };

    if (addresses) {
      console.log("here");
      // Create an array to hold the new Address document IDs
      const addressIds = [];

      // Check if addresses is an array or a single object
      if (Array.isArray(addresses)) {
        for (let addressData of addresses) {
          // Create a new Address document and save it
          const newAddress = new Address(addressData);
          await newAddress.save();

          // Add the address ObjectId to the addressIds array
          addressIds.push(newAddress.id);
          console.log(newAddress);
        }
      } else {
        // If addresses is a single object, handle it directly
        const newAddress = new Address(addresses);
        await newAddress.save();
        addressIds.push(newAddress.id);
        console.log(newAddress);
      }

      // Add the array of address ObjectIds to the userData
      userData.addresses = addressIds;
    }

    console.log(userData);

    // Update the user document
    const updatedUser = await User.findByIdAndUpdate(id, userData, {
      new: true,
    }).exec();

    // Populate the addresses field
    const populatedUser = await User.findById(updatedUser.id)
      .populate("addresses")
      .exec();
    console.log("populated = ", populatedUser);
    res.status(201).json(populatedUser);
  } catch (e) {
    res.status(400).json(e);
  }
};

// exports.updateUser = async (req, res) => {
//   console.log('hitted.......',req.body)
//   const { id } = req.params;

//   try {
//     const { name, image, addresses, email } = req.body;
//     console.log(req.body);

//     const userData = {
//       name,
//     };

//     if (addresses) {
//       console.log('here');

//       // Create a new Address document and save it
//       const newAddress = new Address(addresses);
//       await newAddress.save();

//       // Add the address ObjectId to the userData
//       userData.addresses = [newAddress.id];
//       console.log(newAddress);

//     }

//     console.log(userData);

//     // Update the user document
//     const updatedUser = await User.findByIdAndUpdate(id, userData, {
//       new: true,
//     }).exec();

//     // Populate the addresses field
//     const populatedUser = await User.findById(updatedUser.id).populate('addresses').exec();
//     console.log("populated = ",populatedUser)
//     res.status(201).json(populatedUser);
//   } catch (e) {
//     res.status(400).json(e);
//   }
// };

exports.updateUserImage = async (req, res) => {
  const { id } = req.params;

  try {
    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);
    const imageUrl = result.secure_url; // URL of the uploaded image

    console.log(imageUrl);
    // Update user document with new image URL
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { image: imageUrl }, // Set the new image URL in the database
      { new: true } // Return the updated document
    ).exec();

    // Check if user exists
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Send back the updated user object (optional)
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user image:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// add address..
exports.addAddressForUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const addressData = req.body.addresses;
    console.log(addressData);
    // Create a new address
    const address = new Address(addressData);
    await address.save();

    console.log(address);
    // Find user and add the address reference
    const user = await User.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    user.addresses.push(address.id);
    await user.save();
    res.json(address);
  } catch (error) {
    console.error("Error adding address for user:", error);
    throw error;
  }
};

// get users addresses..
exports.getUserAddresses = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).populate("addresses");
    if (!user) {
      throw new Error("User not found");
    }
    res.send(user.addresses);
  } catch (error) {
    res.send(error);
  }
};

// logout
exports.logoutUser = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }

    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Session destruction failed" });
      }
      res.clearCookie("connect.sid", { path: "/" });
      res.json("Logged out");
    });
  });
};

exports.loggedUser = async (req, res) => {
  console.log("req.user:-", req.user);
  if (!req.user) {
    return res.status(404).json({ error: "User not found" });
  }
  const id = req.user.id;
  const user = await User.findById(id, "name email id addresses image")
    .populate("addresses")
    .exec();
  res.json(user);
};


// // Update user activity
// exports.updateUserActivity = async (req, res) => {
//   const { id } = req.params;
//   console.log("Updating user activity for ID:", id);

//   try {
//     // Update the lastActive field to the current date and time
//     await User.findByIdAndUpdate(
//       id,
//       { lastActive: new Date() },
//       { new: true }
//     );

//     // Fetch the updated user without the password field
//     const updatedUser = await User.findById(id).select('-password').populate('addresses').populate('orders').exec();;

//     if (!updatedUser) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     res.status(200).json(updatedUser);
//   } catch (error) {
//     console.error("Error updating user activity:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// };









// Fetch all users 
exports.fetchAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }, "name email id addresses image role").exec();
    res.status(200).send(users); 
  } catch (err) {
    console.error("Error fetching users:", err); 
    res.status(500).send({ error: "Internal Server Error" }); 
  }
};


exports.fetchAllOrders= async (req, res) => {
  console.log("hit");
  try {
      const orders = await Orders.find({});
      res.status(201).json(orders);
  } catch (err) {
      res.status(500).json(err);
  }
};
