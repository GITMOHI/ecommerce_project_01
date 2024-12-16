///admin................

const User = require("../../models/Users");
const bcrypt = require('bcryptjs');


//login admin

exports.loginAdmin = async (req, res) => {
  try {
    console.log(req.body);
    const { email, password } = req.body;
    const user = await User.findOne({ email: email }).exec();
    console.log(user);

    if (!user) {
      return res.status(404).send({ message: "No user found" });
    }

    if (bcrypt.compareSync(password, user.password) && user.role === "admin") {
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ error: "Internal server error: " + err });
        }
        const { _id, password, ...userWithoutPassword } = user.toObject();
        userWithoutPassword.id = _id;
        return res.json(userWithoutPassword);
      });
    } else {
      return res.status(401).send({ message: "Invalid credentials or not an admin" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error: " + error });
  }
};
  
exports.isAdmin = (req, res, next) => {
  // Check if the user is authenticated
  console.log("admin = ",req.user);
  if (req.isAuthenticated()) {
    const user = req.user;

    // Check if the user's role is admin
    if (user.role === "admin") {
      return next(); // User is admin, proceed to the next middleware or route
    } else {
      return res.status(403).json({ message: "Forbidden: User is not an admin" });
    }
  } else {
    return res.status(401).json({ message: "Unauthorized: User is not authenticated" });
  }
};
  
  // Route to check session
  exports.checkAdminSession = async (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user;
      const { password, ...userWithoutPassword } = user.toObject();
      return res.json(userWithoutPassword);
    } else {
      res.status(401).send({ message: "Not authenticated" });
    }
  };
  exports.checkAdminSession = async (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user;
      const { password, ...userWithoutPassword } = user.toObject();
      return res.json(userWithoutPassword);
    } else {
      res.status(401).send({ message: "Not authenticated" });
    }
  };
  
  //fetch logged Admin..
  exports.loggedAdmin = async (req, res) => {
    console.log("req.user:-", req.user);
    if (!req.user) {
      return res.status(404).json({ error: "Admin not found" });
    }
    const id = req.user.id;
    const user = await User.findById(id, "name email id addresses image")
      .populate("addresses")
      .exec();
    res.json(user);
  };
  
  
  // logout
  exports.logoutAdmin = (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
  
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ error: 'Session destruction failed' });
            }
            res.clearCookie('connect.sid', { path: '/' });
            res.json("Logged out");
        });
    });
  };
  
  