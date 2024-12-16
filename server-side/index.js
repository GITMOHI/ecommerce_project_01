const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/Users");
const bcrypt = require('bcryptjs');
const MongoStore = require('connect-mongo');
require('dotenv').config();



const app = express();
const PORT = 4040;


app.use(cors({
  origin: 'http://localhost:3000', // Update with your client app's URL
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));



app.use(express.json());
app.use(bodyParser.json());


app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: 'mongodb+srv://mohi:mohi1234@cluster0.becc4nn.mongodb.net/shopZen',
      ttl: 2 * 60 * 60
    }),
    cookie: {
      maxAge: 2 * 60 * 60 * 1000 + 4 * 60 * 1000
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, async function (username, password, done) {
    try {
      const user = await User.findOne({ email: username });
      if (!user) {
        return done(null, false, { message: 'Incorrect Email.' });
      }
      
      if (!bcrypt.compareSync(password, user.password)) {
        return done(null, false, { message: 'Invalid Password' });
      }
      
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

const FRONTEND_URL = process.env.FRONTEND_URL || 3000;
console.log(`FRONTEND_URL: ${FRONTEND_URL}`);

// app.get('/some-endpoint', (req, res) => {
//     res.json({ message: 'API key loaded from environment variables', FRONTEND_URL });
//   });

const ProductsRouter = require("./routes/Products");
const BrandsRouter = require("./routes/Brands");
const CategoriesRouter = require("./routes/Categories");
const UsersRouter = require("./routes/Users");
const AuthRouter = require("./routes/Auth");
const cartsRouter = require("./routes/Carts");
const ordersRouter = require("./routes/Orders");

const AdminRouter = require("./routes/admin-routes/Admin");

// admin..
app.use('/admin', AdminRouter.router);

//client..
app.use("/products", ProductsRouter.router);
app.use("/brands", BrandsRouter.router);
app.use("/categories", CategoriesRouter.router);
app.use("/users", UsersRouter.router);
app.use('/auth', AuthRouter.router);
app.use("/cart", cartsRouter.router);
app.use('/orders',ordersRouter.router);



async function main() {
  try {
    mongoose.connect(
      "mongodb+srv://mohi:mohi1234@cluster0.becc4nn.mongodb.net/shopZen?retryWrites=true&w=majority",
      { useNewUrlParser: true, useUnifiedTopology: true }
    );
    console.log("Database connected");
  } catch (err) {
    console.error("Database connection error:", err);
  }
}

main();

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
