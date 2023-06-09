const Users = require("../model/user");
const Product = require("../model/Product");
const Orders = require("../model/order");
const fs = require("fs");
const formidable = require("formidable");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dviel1ssr",
  api_key: "456421157484577",
  api_secret: "o_21SmyIKn7pZS8FZuQwW-k515I",
});

exports.getAdminProducts = async (req, res, next) => {
  const { adminId } = req.params;
  try {
    const products = await Product.find({ ownerId: adminId });
    res
      .status(200)
      .json({ message: "fetched products successfully", products });
  } catch (err) {
    console.log(err);
  }
};

exports.addProduct = (req, res, next) => {
  console.log(req.userInfo);
  const form = formidable({ multiples: true });
  form.parse(req, (err, fields, files) => {
    if (err) {
      console.log(err);
    }

    cloudinary.uploader
      .upload(files.images.filepath, {
        public_id: "proshop",
      })
      .then((result) => {
        const product = new Product({
          title: fields.title,
          description: fields.description,
          price: +fields.price,
          imageUrl: result.secure_url,
          quantity: +fields.quantity,
          ownerId: req.userInfo.userId,
        });
        return product.save();
      })
      .then((result) =>
        res.status(200).json({ message: "done", response: result })
      )
      .catch((err) => {
        console.log(err);
        res.status(404).json({ message: "Something went wrong", error: err });
      });
  });
};
exports.editProduct = async (req, res, next) => {
  const { title, price, description, quantity, userId, prevImages } = req.body;
  const { productId } = req.params;
  const files = req.files;
  const newUrls = files.map((file) => file.path);
  try {
    const product = await Product.findById(productId);
    product.imageUrl.map((url, index) => {
      console.log(url, index);
      if (!(url === prevImages[index])) {
        console.log("inside if");
        fs.unlink(url, (err) => {
          console.log(err);
        });
      }
    });
    product.imageUrl = [...prevImages, ...newUrls];
    product.title = title;
    product.price = +price;
    product.description = description;
    product.quantity = +quantity;
    const updatedProduct = await product.save();
    res.status(200).json({ message: "done", product: updatedProduct });
  } catch (err) {
    console.log(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  const { productId } = req.params;
  try {
    const deleted = await Product.findByIdAndRemove(productId);
    if (deleted) {
      res.status(200).json({ message: "product deleted" });
    }
    res.status(404).json({ message: "Something went wrong" });
  } catch (err) {
    console.log(err);
  }
};

exports.getAdminOrders = async (req, res) => {
  try {
    const orders = await Orders.find();
    if (orders)
      return res
        .status(200)
        .json({ message: "Order fetched successfull", orders });
  } catch (err) {
    console.log(err);
  }
};
exports.updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { orderStatus } = req.body;
  try {
    const order = await Orders.findById(orderId);
    if (!order) res.status(404).json({ message: "order not found" });
    order.orderStatus = orderStatus;
    const updatedOrder = await order.save();
    const eventEmitter = req.app.get("eventEmitter");
    eventEmitter.emit("statusChanged", { orderId, orderStatus });
    res
      .status(200)
      .json({ message: "order status updated", order: updatedOrder });
  } catch (err) {
    console.log(err);
  }
};
