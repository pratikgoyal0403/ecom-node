
const express = require("express");

const router = express.Router();

const AppController = require("../Controller/AppController");
const isAuth = require("../middleware/is-auth");

router.get("/products", AppController.getProducts);
router.post("/cart/:productId", AppController.saveCart);
router.get("/cart/:userId", AppController.getCart);
router.put("/cart/:cartId", AppController.alterQuantity);
router.get("/product/:id", AppController.getProductDetails);
router.delete("/cart/:cartId", AppController.deleteCartItem);
router.post("/product/review/:id", AppController.postProductReview);
router.post("/neworder", AppController.postNewOrder);
router.get("/orders/:userId", AppController.getUserOrders);
router.get('/order/:orderId', AppController.getOrderDetail)
/**
 PAYMENT ROUTES
 */

 router.post('/create-checkout-session', AppController.processPayment);

module.exports = router;



