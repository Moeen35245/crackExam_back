const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Institute = require('../models/institute');
const User = require('../models/user');
const Otp = require('../models/otp');
const Exam = require('../models/exam');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
const sendMail = require('../helper/sendmail');
const checkAuth = require('../middleware/checkAuth');

router.post('/send_otp', async (req, res, next) => {
    res.status(201).json({ otp: otp });
});

router.post('/signup', (req, res, next) => {
    const otp = otpGenerator.generate(4, {
        lowerCaseAlphabets: false,
        specialChars: false,
        upperCaseAlphabets: false,
    });

    console.log(req.body.email);

    Institute.find({ email: req.body.email })
        .exec()
        .then((institute) => {
            if (institute.length >= 1) {
                // check if email already exist and its status is active
                if (institute[0].isVerified === true)
                    return res.status(422).json({ message: `Institute already exist` });
                // if email already exist but its status not true
                else if (institute[0].isVerified === false) {
                    bcrypt.hash(req.body.password, 10, async (err, hash) => {
                        if (err) {
                            return res.status(500).json({ error: err, msg: 'bcrypt failed' });
                        } else {
                            const p1 = new Promise((resolve, reject) => {
                                resolve(
                                    Institute.updateOne(
                                        { email: institute[0].email },
                                        {
                                            $set: { password: hash },
                                        }
                                    )
                                );
                                reject(new Error('Something went wrong while updating institue'));
                            });
                            const p2 = new Promise((resolve, reject) => {
                                resolve(
                                    Otp.updateOne(
                                        { email: institute[0].email },
                                        {
                                            $set: { otp: otp },
                                        }
                                    )
                                );
                                reject(new Error('Something went wrong while updating otp'));
                            });
                            // need to create your own email
                            // await sendMail(otp, req.body.email);
                            Promise.all([p1, p2])
                                .then((result) => {
                                    res.status(201).json({
                                        _id: result._id,
                                        email: result.email,
                                        message: 'Institute created with update 1',
                                    });
                                })
                                .catch((err) => {
                                    res.status(500).json({ error: 'error2' });
                                });
                            // res.status(201).json({ message: 'Update Institute' });
                        }
                    });
                }
            } else {
                bcrypt.hash(req.body.password, 10, async (err, hash) => {
                    if (err) {
                        return res.status(500).json({ error: err, msg: 'bcrypt failed' });
                    } else {
                        const institue = new Institute({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash,
                        });
                        const otpSaved = new Otp({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            otp: otp,
                            type: 'I',
                        });
                        const p1 = new Promise((resolve, reject) => {
                            resolve(institue.save());
                            reject(new Error('Something went wrong in saving institue'));
                        });
                        const p2 = new Promise((resolve, reject) => {
                            resolve(otpSaved.save());
                            reject(new Error('Something went wrong in saving otp'));
                        });
                        // need to use gmoeen22 wali email for smtp
                        // await sendMail(otp, req.body.email);
                        Promise.all([p1, p2])
                            .then((result) => {
                                res.status(201).json({
                                    _id: result._id,
                                    email: result.email,
                                    message: 'Institute created',
                                });
                            })
                            .catch((err) => {
                                res.status(500).json({ error: err, message: 'Institute Craetion failed' });
                            });
                    }
                });
            }
        });
});

router.post('/verifyotp', (req, res, next) => {
    Otp.find({ email: req.body.email })
        .exec()
        .then((item) => {
            if (item.length < 1) {
                return res.status(401).json({ message: 'Email not exist' });
            } else if (item[0].otp !== req.body.otp) {
                return res.status(401).json({ message: 'Invalid Otp' });
            } else {
                Institute.updateOne(
                    { email: item[0].email },
                    {
                        $set: { isVerified: true },
                    }
                )
                    .then((result) => {
                        res.status(201).json({
                            _id: result._id,
                            email: result.email,
                            message: 'Otp verified',
                        });
                    })
                    .catch((err) => {
                        res.status(500).json({ error: 'otp verification failed' });
                    });
            }
        });
});

router.post('/login', (req, res, next) => {
    Institute.find({ email: req.body.email })
        .exec()
        .then((item) => {
            if (item.length < 1 || item[0].isVerified === false) {
                return res.status(401).json({ message: 'Auth failed (Need to verify otp)' });
            }
            bcrypt.compare(req.body.password, item[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({ message: 'Auth failed' });
                }
                if (result) {
                    const token = jwt.sign(
                        {
                            email: item[0].email,
                            userId: item[0]._id,
                        },
                        process.env.JWT_SECRET,
                        {
                            expiresIn: '1h',
                        }
                    );

                    return res.status(200).json({ message: 'Auth successful', token: token });
                }
                res.status(401).json({ message: 'Auth failed' });
            });
        })
        .catch((err) => {
            res.status(500).json({ error: err });
        });
});

router.post('/add_institute', checkAuth, (req, res, next) => {
    Institute.find({ email: req.body.email })
        .exec()
        .then((item) => {
            if (item.length < 1 || item[0].isVerified === false) {
                return res.status(404).json({ message: 'Institute not exists' });
            } else if (req.body.name && req.body.phone && req.body.address) {
                Institute.updateOne(
                    { email: item[0].email },
                    {
                        $set: {
                            name: req.body.name,
                            phone: req.body.phone,
                            address: req.body.address,
                            new: false,
                        },
                    }
                )
                    .then((result) => {
                        res.status(201).json({
                            _id: result._id,
                            email: result.email,
                            message: 'Institute added',
                        });
                    })
                    .catch((err) => {
                        res.status(500).json({ error: 'Somthing Went wrong' });
                    });
            } else {
                res.status(404).json({ error: 'All Fields are required' });
            }
        });
});

router.post('/is_new', checkAuth, (req, res, next) => {
    Institute.find({ email: req.body.email })
        .exec()
        .then((item) => {
            if (item.length === 0) return res.status(404).json({ message: 'Institute not exist' });
            if (item[0].new) {
                res.status(200).json({ isNew: true, message: 'Institute is new' });
            } else {
                res.status(200).json({ isNew: false, message: 'Institute details already filled' });
            }
        })
        .catch((err) => res.status(500).json({ err: err, message: 'something went wrong' }));
});

router.get('/all_students/:id', checkAuth, (req, res, next) => {
    let newId = new mongoose.mongo.ObjectId(req.params.id);
    User.find({ instituteId: newId })
        .exec()
        .then((item) => {
            if (item.length < 1) {
                return res.status(404).json({ message: 'No record found' });
            } else {
                return res.status(200).json({ message: 'All students', data: item, len: item.length });
            }
        });
});
router.get('/all_exams/:id', checkAuth, (req, res, next) => {
    let newId = new mongoose.mongo.ObjectId(req.params.id);
    Exam.find({ instituteId: newId })
        .exec()
        .then((item) => {
            if (item.length < 1) {
                return res.status(404).json({ message: 'No record found' });
            } else {
                return res.status(200).json({ message: 'All exams', data: item, len: item.length });
            }
        });
});

router.get('/all_exam/:id', checkAuth, (req, res, next) => {
    let newId = new mongoose.mongo.ObjectId(req.params.id);
    Exam.find({ instituteId: newId })
        .exec()
        .then((item) => {
            if (item.length < 1) {
                return res.status(404).json({ message: 'No record found' });
            } else {
                return res.status(200).json({ message: 'All students', data: item, len: item.length });
            }
        });
});

// router.delete('/:userId', (req, res, next) => {
//     const id = req.params.userId;

//     User.remove({ _id: id })
//         .exec()
//         .then((user) => {
//             res.status(200).json({ user: user, message: 'user deleted' });
//         })
//         .catch((err) => {
//             res.status(500).json({ error: err });
//         });
// });

module.exports = router;
