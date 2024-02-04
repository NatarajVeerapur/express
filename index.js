// const express = require("express");
// const mongoose = require("mongoose");

// const app = express();

// const bodyParser = require("body-parser");
// app.use(bodyParser.urlencoded({ extended: true }));

// app.set("view engine", "ejs");
// app.set("views", __dirname + "/views");

// mongoose.connect("mongodb://localhost:27017/inventory", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// // Define Product Schema and Model (similar to User in the previous example)

// // Add Product Page
// const productSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   price: {
//     type: Number,
//     required: true,
//     min: 0,
//   },
// });

// const ProductModel = mongoose.model("Product", productSchema);

// // Handle POST request for adding a new product
// app.post("/addProduct", (req, res) => {
//   const { name, price } = req.body;
//   console.log(name, price);

//   const newProduct = new ProductModel({
//     name,
//     price,
//   });

//   newProduct
//     .save()
//     .then((product) => {
//       console.log(`Product saved: ${product}`);
//       res.redirect("/viewProducts"); // Redirect to the viewProducts page after successful addition
//     })
//     .catch((error) => {
//       console.error(`Error saving product: ${error}`);
//       res.status(500).send("Internal Server Error");
//     });
// });

// // View Products Page
// app.get("/viewProducts", (req, res) => {
//   // Fetch products from the database and pass them to the template
//   // Replace 'ProductModel' with the actual name of your product model
//   ProductModel.find({})
//     .then(function (products) {
//       res.render("viewProducts", {
//         title: "View Products",
//         products: products,
//       });
//     })
//     .catch(function (err) {
//       console.log(err);
//       res.status(500).send("Internal Server Error");
//     });
// });

// // Handle POST request for updating a product
// app.post("/updateProduct", (req, res) => {
//   const { productId, newName, newPrice } = req.body;

//   ProductModel.findByIdAndUpdate(
//     productId,
//     { name: newName, price: newPrice },
//     { new: true }
//   )
//     .then((updatedProduct) => {
//       console.log(`Product updated: ${updatedProduct}`);
//       res.redirect("/viewProducts"); // Redirect to the viewProducts page after successful update
//     })
//     .catch((error) => {
//       console.error(`Error updating product: ${error}`);
//       res.status(500).send("Internal Server Error");
//     });
// });

// // Handle POST request for deleting a product
// app.post("/deleteProduct", (req, res) => {
//   const { productId } = req.body;

//   ProductModel.findByIdAndRemove(productId)
//     .then((deletedProduct) => {
//       console.log(`Product deleted: ${deletedProduct}`);
//       res.redirect("/viewProducts"); // Redirect to the viewProducts page after successful deletion
//     })
//     .catch((error) => {
//       console.error(`Error deleting product: ${error}`);
//       res.status(500).send("Internal Server Error");
//     });
// });

// // Home Page
// app.get("/", (req, res) => {
//   res.render("home", {
//     title: "Inventory Management",
//   });
// });

// app.get("/addProduct1", (req, res) => {
//   res.render("addProduct1", {
//     title: "Inventory Management",
//   });
// });
// app.get("/updateProduct1", (req, res) => {
//   res.render("updateProduct1", {
//     title: "Inventory Management",
//   });
// });
// app.get("/deleteProduct1", (req, res) => {
//   res.render("deleteProduct1", {
//     title: "Inventory Management",
//   });
// });

// app.listen(3001, () => {
//   console.log("Listening to the port 3001");
// });



const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");

const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

mongoose.connect("mongodb://localhost:27017/inventory", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define Product Schema and Model
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  image: {
    data: Buffer, // Store binary image data
    contentType: String, // Store content type (e.g., "image/png")
  },
});

const storage = multer.memoryStorage(); // Store image in memory
const upload = multer({ storage: storage });

const ProductModel = mongoose.model("Product", productSchema);

// Handle POST request for adding a new product with image
app.post("/addProduct", upload.single("newImage"), (req, res) => {
  const { name, price } = req.body;
  const newProduct = new ProductModel({
    name,
    price,
    image: {
      data: req.file.buffer,
      contentType: req.file.mimetype,
    },
  });

  newProduct
    .save()
    .then((product) => {
      console.log(`Product saved: ${product}`);
      res.redirect("/viewProducts");
    })
    .catch((error) => {
      console.error(`Error saving product: ${error}`);
      res.status(500).send("Internal Server Error");
    });
});

// View Products Page
app.get("/viewProducts", (req, res) => {
  ProductModel.find({})
    .then(function (products) {
      res.render("viewProducts", {
        title: "View Products",
        products: products,
      });
    })
    .catch(function (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    });
});

// ... (unchanged code)

app.listen(3001, () => {
  console.log("Listening to the port 3001");
});
