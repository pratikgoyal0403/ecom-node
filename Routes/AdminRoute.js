const router = require('express').Router();

const adminController = require('../controller/AdminController');
const isAuth = require('../middleware/is-auth');

router.get('/admin/product/:adminId', adminController.getAdminProducts);
router.post('/admin/addProduct', isAuth, adminController.addProduct);
router.put('/admin/editProduct/:productId', adminController.editProduct);
router.delete('/admin/product/:productId', adminController.deleteProduct);
router.get('/admin/orders', adminController.getAdminOrders);
router.put('/admin/orderstatus/:orderId', adminController.updateOrderStatus)
module.exports = router;