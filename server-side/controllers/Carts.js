const Carts = require("../models/Cart");
const Products = require("../models/Products");
exports.addToCart = async (req, res) => {
  console.log("Add to cart",req.body);
  const cart = new Carts(req.body);

  try {
    const doc = await cart.save();
    console.log("Cart saved",doc);
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.fetchCartByUser = async (req, res) => {
  const { id } = req.params;
  console.log("ID = ", id);

  try {
    const cartItems = await Carts.find({ user: id }).populate("product");
    res.status(201).json(cartItems);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.updateCartItem = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  console.log("Update cart item request received with ID:", id);

  try {
    const updatedCartItem = await Carts.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updatedCartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    // Ensure the correct field names are used
    const populatedCartItem = await Carts.findById(id)
      .populate("product")
      .populate("user")
      .exec();

    res.status(200).json(populatedCartItem);
  } catch (err) {
    console.error("Error updating cart item:", err);
    res.status(500).json({ message: "Internal server error", error: err });
  }
};
exports.deleteCartItem = async (req, res) => {
  const { id } = req.params;
  console.log("hit ", id);

  try {
    // Fetch the cart item to ensure it exists and populate necessary fields
    const cartItem = await Carts.findById(id)
      .populate('product') // Populate the 'product' field
      .populate('user'); // Populate the 'user' field

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    // Delete the cart item
    await Carts.findByIdAndDelete(id); // Use `findByIdAndDelete` for simplicity

    // Return the populated cart item
    res.status(200).json(cartItem);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};