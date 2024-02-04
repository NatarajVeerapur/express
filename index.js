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
    data: Buffer,
    contentType: String,
  },
});

const storage = multer.memoryStorage();
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

// Handle POST request for updating a product with image
app.post("/updateProduct", upload.single("newImage"), (req, res) => {
  const { productId, newName, newPrice } = req.body;
  const image = req.file
    ? { data: req.file.buffer, contentType: req.file.mimetype }
    : null;

  ProductModel.findByIdAndUpdate(
    productId,
    { name: newName, price: newPrice, image: image },
    { new: true }
  )
    .then((updatedProduct) => {
      console.log(`Product updated: ${updatedProduct}`);
      res.redirect("/viewProducts");
    })
    .catch((error) => {
      console.error(`Error updating product: ${error}`);
      res.status(500).send("Internal Server Error");
    });
});

// Handle POST request for deleting a product and associated image
app.post("/deleteProduct", (req, res) => {
  const { productId } = req.body;

  ProductModel.findByIdAndRemove(productId)
    .then((deletedProduct) => {
      // Delete the associated image if it exists
      if (deletedProduct.image && deletedProduct.image.data) {
        const fs = require("fs");
        const imagePath = path.join(
          __dirname,
          "uploads",
          "product_image_" + deletedProduct._id
        );
        fs.unlinkSync(imagePath);
      }

      console.log(`Product deleted: ${deletedProduct}`);
      res.redirect("/viewProducts");
    })
    .catch((error) => {
      console.error(`Error deleting product: ${error}`);
      res.status(500).send("Internal Server Error");
    });
});

// ... (unchanged code)

app.listen(3001, () => {
  console.log("Listening to the port 3001");
});
