const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
    },
    cart: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "product"
            },
            quantity: {
                type: Number
            }
        }
    ],
    passwordResetToken: {
        type: String
    },
    tokenExpiry: {
        type: Number
    }
})


const userModel = mongoose.model('user', userSchema);

module.exports = userModel;