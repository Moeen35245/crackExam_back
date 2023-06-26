const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
const sendMail = require('../helper/sendmail');
const checkAuth = require('../middleware/checkAuth');
const checkUserAuth = require('../middleware/checkUserAuth');

const multer = require('multer');
const csv = require('csvtojson');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        // Change the filename to use the original filename with a timestamp
        cb(null, new Date().toISOString() + file.originalname);
    },
});

const fileFilter = (req, file, cb) => {
    // Check if the file is a CSV file
    if (file.mimetype === 'text/csv') {
        cb(null, true);
    } else {
        // Reject the file if it is not a CSV file
        cb(null, false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 0.5, // Limit the file size to 500KB (adjust as needed)
    },
    fileFilter: fileFilter,
});

router.post('/add_user', checkAuth, (req, res, next) => {
    if (
        !req.body.studentId ||
        !req.body.password ||
        !req.body.instituteId ||
        !req.body.first_name ||
        !req.body.last_name ||
        !req.body.dob ||
        !req.body.phone ||
        !req.body.gender ||
        !req.body.address ||
        !req.body.class ||
        !req.body.p_first_name ||
        !req.body.p_last_name ||
        !req.body.p_relation ||
        !req.body.p_phone ||
        !req.body.p_address
    ) {
        return res.status(404).json({ message: 'All fields are required' });
    }

    User.find({ studentId: req.body.studentId })
        .exec()
        .then((user) => {
            if (user.length >= 1) {
                return res.status(404).json({ message: 'Student Already Exist' });
            } else {
                const newUser = new User({
                    _id: new mongoose.Types.ObjectId(),
                    studentId: req.body.studentId,
                    password: req.body.password,
                    instituteId: req.body.instituteId,
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    dob: new Date(req.body.dob),
                    phone: req.body.phone,
                    gender: req.body.gender,
                    address: req.body.address,
                    class: req.body.class,
                    parent: {
                        first_name: req.body.p_first_name,
                        last_name: req.body.p_last_name,
                        phone: req.body.p_phone,
                        relation: req.body.p_relation,
                        address: req.body.p_address,
                    },
                });
                newUser
                    .save()
                    .then((result) => {
                        return res.status(201).json({
                            _id: result._id,
                            message: 'Student Created',
                        });
                    })
                    .catch((err) => {
                        return res.status(500).json({
                            message: 'Something Went Wrong',
                            error: err,
                        });
                    });
            }
        })
        .catch((err) => {
            return res.status(500).json({ message: 'Something went wrong', error: err });
        });
});

router.patch('/update_user', checkAuth, (req, res, next) => {
    // if (
    //     !req.body.studentId ||
    //     !req.body.password ||
    //     !req.body.instituteId ||
    //     !req.body.first_name ||
    //     !req.body.last_name ||
    //     !req.body.dob ||
    //     !req.body.phone ||
    //     !req.body.gender ||
    //     !req.body.address ||
    //     !req.body.class ||
    //     !req.body.p_first_name ||
    //     !req.body.p_last_name ||
    //     !req.body.p_relation ||
    //     !req.body.p_phone ||
    //     !req.body.p_address
    // ) {
    //     return res.status(404).json({ message: 'All fields are required' });
    // }

    User.updateOne({ studentId: req.body.studentId })
        .exec()
        .then((user) => {
            User(
                { studentId: req.body.studentId },
                {
                    $set: {
                        password: req.body.password,
                        first_name: req.body.first_name,
                        last_name: req.body.last_name,
                        dob: new Date(req.body.dob),
                        phone: req.body.phone,
                        gender: req.body.gender,
                        address: req.body.address,
                        class: req.body.class,
                        parent: {
                            first_name: req.body.p_first_name,
                            last_name: req.body.p_last_name,
                            phone: req.body.p_phone,
                            relation: req.body.p_relation,
                            address: req.body.p_address,
                        },
                    },
                }
            )
                .then((result) => {
                    return res.status(201).json({
                        _id: result._id,
                        message: 'Student Updated',
                    });
                })
                .catch((err) => {
                    return res.status(500).json({
                        message: 'Something Went Wrong',
                        error: err,
                    });
                });
        })
        .catch((err) => {
            return res.status(500).json({ message: 'Something went wrong', error: err });
        });
});

router.post('/login', (req, res, next) => {
    User.find({ studentId: req.body.studentId })
        .exec()
        .then((user) => {
            if (user.length < 1) {
                return res.status(401).json({ message: 'Please confirm id and password from your institute' });
            }
            if (user[0].studentId === req.body.studentId && user[0].password === req.body.password) {
                const token = jwt.sign(
                    {
                        studentId: user[0].studentId,
                        userId: user[0]._id,
                    },
                    process.env.JWT_SECRET_USER,
                    {
                        expiresIn: '1h',
                    }
                );

                return res.status(200).json({ message: 'Auth successful', token: token });
            }
            res.status(401).json({ message: 'Auth failed' });
        })
        .catch((err) => {
            res.status(500).json({ error: err });
        });
});

router.post('/add_bulk', checkAuth, upload.single('userCollection'), (req, res, next) => {
    csv()
        .fromFile(req.file.path)
        .then((data) => {
            const users = [];

            data.forEach((item, i) => {
                users.push({
                    ...item,
                    instituteId: req.body.instituteId,
                });
            });

            console.log(users);
            User.insertMany(users)
                .then((result) => {
                    return res.status(201).json({ message: 'Bulk Students uploaded' });
                })
                .catch((err) => {
                    return res.status(500).json({ message: 'Something went wrong' });
                });
        })
        .catch((err) => console.log('Something went wrong'));
});

router.delete('/:id', checkAuth, (req, res, next) => {
    const id = req.params.userId;

    User.deleteOne({ _id: id })
        .exec()
        .then((user) => {
            res.status(200).json({ user: user, message: 'user deleted' });
        })
        .catch((err) => {
            res.status(500).json({ error: err });
        });
});

module.exports = router;
