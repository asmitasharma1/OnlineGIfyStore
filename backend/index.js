const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const { request } = require("http");

const stripe = require("stripe")("sk_test_51P4diFBkFF9T1sc9hCAtp9JEMvnmxrxbnQew9Sd82Y7BC1nec5FRwCCRTJvrERGBfIwk0OvsStxHxqdvfBDn4nJW00M7vPYDMA");
// require("dotenv").config()

app.use(express.json());
app.use(cors({ origin: "*" }));


// Define the MongoDB connection string (replace 'your_connection_string' with your actual connection string)
const uri = 'mongodb+srv://asmitaasharmaaa:Igloo143$%40@cluster0.sdg2p1y.mongodb.net/giftshop';

// Connect to MongoDB
mongoose.connect(uri, {
    bufferCommands: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('Connected to MongoDB');
        // Start your application logic here
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });

//Database Connection with MongoDB
mongoose.connect("mongodb+srv://@cluster0.sdg2p1y.mongodb.net/giftshop")

//API creation

app.get("/", (req, res) => {
    res.send("Express App is running")

})

//Image Storage engine
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})
const upload = multer({ storage: storage })

//upload endpoint for images
app.use('/images', express.static('upload/images'))

app.post("/upload", upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    })

})

//Schema for creating products

const Product = mongoose.model("Product", {
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    new_price: {
        type: Number,
        required: true,
    },
    old_price: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    available: {
        type: Boolean,
        default: true,
    }
})

app.post('/addproduct', async (req, res) => {
    let products = await Product.find({});
    let id;
    if (products.length > 0) {
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id + 1;
    }
    else {
        id = 1;
    }
    const product = new Product({
        id: id,
        name: req.body.name,
        image: req.body.image,
        category: req.body.category,
        new_price: req.body.new_price,
        old_price: req.body.old_price,
    });
    console.log(product);
    await product.save();
    console.log("Saved");
    res.json({
        success: true,
        name: req.body.name,
    })
})

//API for deleting products
app.post('/removeproduct', async (req, res) => {
    await Product.findOneAndDelete({ id: req.body.id });
    console.log("Removed");
    res.json({
        succes: true,
        name: req.body.name
    })
})

//API for getting all products
app.get('/allproducts', async (req, res) => {
    try {
        let products = await Product.find({});
        console.log("All Products Fetched");
        res.send(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//Schema for user model
const Users = mongoose.model('Users', {
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    cartData: {
        type: Object,
    },
    date: {
        type: Date,
        default: Date.now,
    }
})

//Endpoint for User Registration
app.post('/signup', async (req, res) => {
    let check = await Users.findOne({ email: req.body.email });
    if (check) {
        return res.status(400).json({ success: false, errors: "existing user found with same email address" })
    }
    let cart = {};
    for (let i = 0; i < 300; i++) {
        cart[i] = 0;
    }
    const user = new Users({
        name: req.body.username,
        email: req.body.email,
        password: req.body.password,
        cartData: cart,
    })

    await user.save();

    const data = {
        user: {
            id: user.id
        }
    }

    const token = jwt.sign(data, 'secret_egift');
    res.json({ success: true, token })
})

//Endpoint for User Login
const { LocalStorage } = require('node-localstorage');
const localStorage = new LocalStorage('./scratch');

app.post('/login', async (req, res) => {
    let user = await Users.findOne({ email: req.body.email });
    if (user) {
        const passCompare = req.body.password === user.password;
        if (passCompare) {
            const data = {
                user: {
                    id: user.id
                }
            }
            const token = jwt.sign(data, 'secret_egift');

            localStorage.setItem('userId', user.id);

            res.json({ success: true, token });
        }
        else {
            res.json({ success: false, errors: "Wrong Password" });
        }
    }
    else {
        res.json({ success: false, errors: "Wrong Email Id" });
    }
})

//Endpoint for new collection data
app.get('/newcollections', async (req, res) => {
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    console.log("New Collection Fetched");
    res.send(newcollection);
})

//Popular section
app.get('/popular', async (req, res) => {
    let products = await Product.find({ category: "birthday" });
    let popular = products.slice(0, 4);
    console.log("Popular Gifts for birthday");
    res.send(popular);
})

// API for getting related products
app.get('/relatedproducts', async (req, res) => {
    const { category } = req.query;
    try {
        let products = await Product.find({ category });
        console.log(`Related Products for category ${category} fetched`);
        res.send(products);
    } catch (error) {
        console.error("Error fetching related products:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//Middleware to fetch user
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    // localStorage.setItem('userId', user.id);

    if (!token) {
        res.status(401).send({ errors: "Please authenticate using valid token" })
    }
    else {
        try {
            const data = jwt.verify(token, 'secret_egift');
            req.user = data.user;
            next();
        } catch (error) {
            res.status(401).send({ errors: "please authenticate using a valid token" })
        }
    }
}

//Adding products in cart data
// app.post('/addtocart', fetchUser, async (req, res) => {
//     // console.log(req.body,req.user);
//     console.log("added",req.body.itemId);
//     let userData = await Users.findOne({ _id: req.user.id });
//     userData.cartData[req.body.itemId] += 1;
//     await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
//     res.send("Added")
// })

// //Remove product from cartData
// app.post('/removefromcart', fetchUser, async (req, res) => {
//     console.log("removed",req.body.itemId);
//     let userData = await Users.findOne({ _id: req.user.id });
//     userData.cartData[req.body.itemId] -= 1;
//     if (userData.cartData[req.body.itemId] > 0)
//         await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
//     res.send("Removed")
// })

app.post('/addtocart', fetchUser, async (req, res) => {
    try {
        let userData = await Users.findOneAndUpdate(
            { _id: req.user.id },
            { $inc: { [`cartData.${req.body.itemId}`]: 1 } },
            { new: true }
        );
        res.json({
            message: "Item added to cart",
            cartData: userData.cartData
        });
    } catch (error) {
        console.error("Error adding item to cart:", error);
        res.status(500).send("Error adding item to cart");
    }
});

app.post('/removefromcart', fetchUser, async (req, res) => {
    try {
        let userData = await Users.findOneAndUpdate(
            { _id: req.user.id, [`cartData.${req.body.itemId}`]: { $gt: 0 } },
            { $inc: { [`cartData.${req.body.itemId}`]: -1 } },
            { new: true }
        );
        res.json(userData.cartData);
    } catch (error) {
        console.error("Error removing item from cart:", error);
        res.status(500).send("Error removing item from cart");
    }
});

//Get CartData
app.post('/getcart', fetchUser, async (req, res) => {
    console.log("GetCart");
    let userData = await Users.findOne({ _id: req.user.id });
    res.json(userData.cartData);
})

app.listen(port, (error) => {
    if (!error) {
        console.log("Server running in port " + port)
    }
    else {
        console.log("Error: " + error)
    }

})

const CustomerOrder = mongoose.model("CustomerOrder", {
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            productName: {
                type: String,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            }
        }
    ],
    totalAmount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered'],
        default: 'Pending',
    },
    date: {
        type: Date,
        default: Date.now,
    }
});

// API for placing an order
app.post('/placeorder', fetchUser, async (req, res) => {
    try {
        const { userId, cartItems } = req.body;
        const user = await Users.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const products = [];
        let totalAmount = 0;
        for (const itemId in cartItems) {
            if (cartItems[itemId] > 0) {
                const product = await Product.findById(itemId);
                if (product) {
                    products.push({
                        productId: product._id,
                        quantity: cartItems[itemId],
                    });
                    totalAmount += product.new_price * cartItems[itemId];
                }
            }
        }

        const order = new CustomerOrder({
            userId: user._id,
            products,
            totalAmount,
        });

        await order.save();

        // Clear the cart after placing the order
        user.cartData = getDefaultCart();
        await user.save();

        res.json({ success: true, message: 'Order placed successfully' });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

const bodyParser = require('body-parser');

const emailSchema = new mongoose.Schema({
    email: String,
});

// Create a model for the email
const Email = mongoose.model('Email', emailSchema);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/subscribe', async (req, res) => {
    const { email } = req.body;

    try {
        // Save the email to the database
        const newEmail = new Email({ email });
        await newEmail.save();
        console.log(`Subscribed email: ${email}`);
        res.json({ message: 'Subscribed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to subscribe' });
    }
});

app.post("/checkout/:userId", async (req, res) => {
    try {
      // const { userId: loggedInUserId } = req.body;
      const { userId } = req.params;
  
      const { items, totalAmount } = req.body;
  
      // Retrieve cart items from the request body
      const cartItems = req.body.items;
  
      // Create an order object with user ID, book IDs, and cart items
      const order = new Order({
        user: userId,
        gifts: items.map((item) => item.id), // Use the correct property name
        cartItems: items,
        totalAmount: totalAmount,
      });
  
      // Save the order to the database
      await order.save();
      

// //Checkout
// app.post("/checkout", async (req, res) => {
//     try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: CartItems.map(item => {
                return {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: item.name
                        },
                        unit_amount: item.price * 100,
                    },
                    quantity: item.quantity
                }
            }),
            success_url: "http://localhost:3000/success",
            cancel_url: "http://localhost:3000/cancel"
        })
        res.json({ url: session.url })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
});







