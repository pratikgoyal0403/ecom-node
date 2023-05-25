const mongoose = require('mongoose');



const ProductSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    imageUrl: [{
        type: String,
        required: true
    }],
    quantity: {
        type: Number,
        required: true
    },
    rating: {
        type: String
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    review: [
        {
            username: {type: String},
            comment: {type: String},
            rating: {type: Number},
            userId: {type: mongoose.Schema.Types.ObjectId, ref: "user"},
            date: {type: Date}
        }
    ]

})

const ProductModel = mongoose.model('product', ProductSchema);

module.exports = ProductModel;