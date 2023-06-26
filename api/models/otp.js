const mongoose = require('mongoose');

const otpSchema = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        email: {
            type: String,
            require: true,
            unique: true,
        },
        otp: {
            type: String,
            require: true,
        },
        type: {
            type: String,
            require: true,
            enum: ['S', 'I'],
        },
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    }
);

module.exports = mongoose.model('Otp', otpSchema);
