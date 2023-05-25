const mongoose = require("mongoose");

const OrderSchema = mongoose.Schema(
  {
      address: {
        type: String,
        required: true
      },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
        },
        quantity: {
          type: Number,
        },
      },
    ],
    userInfo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "PREPAID"],
      default: "COD",
    },
    paid: {
      type: Boolean,
      required: true,
    },
    orderStatus: {
      type: String,
      enum: ['Placed', 'Confirmed', 'Shipped', 'Out For Delivery', 'Completed'],
      default: 'Placed'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('order', OrderSchema);