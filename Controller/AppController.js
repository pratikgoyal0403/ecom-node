const Product = require("../model/Product");
const User = require("../model/user");
const Order = require("../model/order");
const YOUR_DOMAIN = "http://localhost:8000";
const stripe = require("stripe")(
  "sk_test_51IbjOJSIfjc59rBrYPOVkbqhyBpLUvsx5AQSwj6nbGSaDRXPVahCIsllpgRKIo8pKudKzTDZYIm318zXAYhht26h00C7EoKKEw"
);

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((result) => {
      res.json({ products: result, userInfo: req.userInfo });
    })
    .catch((err) => console.log(err));
};
exports.getProductDetails = (req, res, next) => {
  const id = req.params.id;
  Product.findById(id)
    .then((result) => {
      if (!result) {
        res.json({ message: "product not found" });
      }
      res.json({ message: "fetching details sucessful", product: result });
    })
    .catch((err) => console.log(err));
};

exports.postProductReview = (req, res, next) => {
  const id = req.params.id;
  console.log(req.body);
  const data = req.body;
  Product.findById(id)
    .then((product) => {
      if (!product) {
        res.json({ message: "product not found" });
      }
      product.review.push({ ...data, date: Date.now() });
      return product.save();
    })
    .then((result) => res.json({ result }))
    .catch((err) => console.log(err));
};
exports.getCart = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    const result = await user.populate("cart.product").execPopulate();
    res.json({ message: "DONE", cart: result.cart });
  } catch (err) {
    console.log(err);
  }
};

exports.saveCart = async (req, res, next) => {
  const { productId } = req.params;
  const { userId } = req.body;
  const user = await User.findById(userId);
  const index = user.cart.findIndex(
    (product) => product.product.toString() === productId.toString()
  );
  if (index === -1) {
    user.cart.push({ product: productId, quantity: 1 });
  }
  const result = await user.save();
  const populatedCart = await result.populate("cart.product").execPopulate();
  res.status(200).json({ message: "sucess", user: populatedCart });
};
exports.alterQuantity = async (req, res, next) => {
  const { type, userId } = req.body;
  const { cartId } = req.params;
  const user = await User.findById(userId);
  const index = user.cart.findIndex(
    (cartItem) => cartItem._id.toString() === cartId.toString()
  );
  if (type === "INCREASE") {
    user.cart[index].quantity = user.cart[index].quantity + 1;
  } else {
    // user.cart[index].quantity === 1 ? user.cart.splice(index, 1): (user.cart[index].quantity = user.cart[index].quantity - 1);
    user.cart[index].quantity = user.cart[index].quantity - 1;
  }
  const result = await user.save();
  const populatedResult = await result.populate("cart.product").execPopulate();
  res.json({ message: type, user: populatedResult });
};
exports.deleteCartItem = async (req, res, next) => {
  const { userId } = req.body;
  const { cartId } = req.params;
  try {
    const user = await User.findById(userId);
    const updatedCart = user.cart.filter(
      (item) => item._id.toString() !== cartId.toString()
    );
    user.cart = [...updatedCart];
    const updatedUser = await user.save();
    const populatedCart = await user.populate("cart.product").execPopulate();
    res.status(200).json({ message: "Item deleted", cart: updatedUser.cart });
  } catch (err) {
    console.log(err);
  }
};

exports.getUserOrders = async (req, res) => {
  const { userId } = req.params;
  console.log(userId);
  try {
    const orders = await Order.find({ userInfo: userId });
    if (!orders) return res.status(404).json({ message: "no orders found" });
    res.status(200).json({ message: "DONE", orders });
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "something went wrong" });
  }
};
exports.postNewOrder = async (req, res) => {
  const { address, products, userInfo, paymentMethod, paid } = req.body;
  try {
    const newOrder = await Order.create(req.body);
    if (!newOrder)
      return res.status(404).json({ message: "wrong information" });
    console.log(newOrder);
    res.status(200).json({ message: "Order placed" });
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "something went wrong" });
  }
};

exports.getOrderDetail = async (req, res) => {
  //order detail code
  const { orderId } = req.params;
  try {
    const order = await Order.findById(orderId);
    if (!order) res.status(404).json({ message: "something went wrong" });
    res.status(200).json({ message: "success", order });
  } catch (err) {
    console.log(err);
  }
};

exports.processPayment = async (req, res) => {
  const {totalAmount} = req.body
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: "Total Amount to be paid",
            },
            unit_amount: totalAmount * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${YOUR_DOMAIN}/successOrder`,
      cancel_url: `${YOUR_DOMAIN}/cancel`,
    });

    res.json({ id: session.id });
  } catch (err) {
    console.log(err);
  }
};
