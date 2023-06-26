const mongoose = require('mongoose');

const parentSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    first_name: { type: String, require: true },
    last_name: { type: String, require: true },
    phone: { type: String, require: true },
    relation: {
        type: String,
        require: true,
        enum: ['mother', 'father', 'other'],
    },
    address: { type: String, require: true },
});

const userSchema = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        studentId: {
            type: String,
            require: true,
        },
        password: {
            type: String,
            require: true,
        },
        class: {
            type: String,
            require: true,
        },
        instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', require: true },
        first_name: { type: String, require: true },
        last_name: { type: String, require: true },
        dob: {
            type: Date,
            require: true,
        },
        phone: { type: String, require: true },
        gender: { type: String, require: true, enum: ['m', 'f', 'o'] },
        address: { type: String, require: true },
        p_address: { type: String, require: true },
        p_first_name: { type: String, require: true },
        p_last_name: { type: String, require: true },
        p_phone: { type: String, require: true },
        p_relation: {
            type: String,
            require: true,
            enum: ['mother', 'father', 'other'],
        },
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    }
);

module.exports = mongoose.model('User', userSchema);
