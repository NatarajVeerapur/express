const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const mongooseSequence = require("mongoose-sequence")(mongoose);

const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

mongoose.connect("mongodb://localhost:27017/inventory", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define Product Schema and Model with auto-increment
const productSchema = new mongoose.Schema({
  _id: { type: Number },
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  image: { data: Buffer, contentType: String },
});

productSchema.plugin(mongooseSequence, { inc_field: "_id" });

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const ProductModel = mongoose.model("Product", productSchema);

// Handle POST request for adding a new product with image
app.post("/addProduct", upload.single("image"), (req, res) => {
  const { name, price, quantity } = req.body;
  const newProduct = new ProductModel({
    _id: null,
    name,
    price,
    quantity,
    image: {
      data: req.file ? req.file.buffer : null,
      contentType: req.file ? req.file.mimetype : null,
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
app.post("/updateProduct", upload.single("image"), (req, res) => {
  const { _id, newName, newPrice, newQuantity } = req.body;
  const image = req.file
    ? { data: req.file.buffer, contentType: req.file.mimetype }
    : null;

  ProductModel.findByIdAndUpdate(
    _id,
    { name: newName, price: newPrice, quantity: newQuantity, image: image },
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
  const { _id, quantityToRemove } = req.body;

  ProductModel.findById(_id)
    .then((foundProduct) => {
      if (!foundProduct) {
        // Product not found
        console.log(`Product not found for ID: ${productId}`);
        return res.status(404).send("Product not found");
      }

      // Ensure quantityToRemove is a positive integer
      const parsedQuantity = parseInt(quantityToRemove);
      if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
        return res.status(400).send("Invalid quantity to remove");
      }

      // Reduce quantity by the specified amount
      if (foundProduct.quantity > parsedQuantity) {
        foundProduct.quantity -= parsedQuantity;
        return foundProduct.save();
      } else {
        // If quantity is less than or equal to the specified amount, remove the complete product
        return foundProduct.remove();
      }
    })
    .then((deletedProduct) => {
      // Delete the associated image if it exists
      if (deletedProduct.image && deletedProduct.image.data) {
        const fs = require("fs");
        const imagePath = path.join(
          __dirname,
          "uploads",
          "product_image_" + deletedProduct._id
        );

        fs.unlinkSync(imagePath, (err) => {
          if (err) {
            console.error(`Error deleting image: ${err}`);
          }
        });
      }

      console.log(`Product deleted or quantity reduced: ${deletedProduct}`);
      res.redirect("/viewProducts");
    })
    .catch((error) => {
      console.error(`Error deleting product: ${error}`);
      res.status(500).send("Internal Server Error");
    });
});


// ... (unchanged code)

app.get("/", (req, res) => {
  res.render("home", {
    title: "Inventory Management",
  });
});

app.get("/addProduct1", (req, res) => {
  res.render("addProduct1", {
    title: "Inventory Management",
  });
});
app.get("/updateProduct1", (req, res) => {
  res.render("updateProduct1", {
    title: "Inventory Management",
  });
});
app.get("/deleteProduct1", (req, res) => {
  res.render("deleteProduct1", {
    title: "Inventory Management",
  });
});

app.listen(3001, () => {
  console.log("Listening to port 3001");
});
