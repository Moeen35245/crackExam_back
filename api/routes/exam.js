const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Exam = require('../models/exam');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
const sendMail = require('../helper/sendmail');
const checkAuth = require('../middleware/checkAuth');
const checkUserAuth = require('../middleware/checkUserAuth');

router.post('/add_exam', checkAuth, (req, res, next) => {
    if (
        !req.body.name ||
        !req.body.date ||
        !req.body.subject ||
        !req.body.className ||
        !req.body.startTime ||
        !req.body.endTime ||
        !req.body.instituteId
    ) {
        return res.status(404).json({ message: 'All fields are required' });
    }

    const newExam = new Exam({
        _id: new mongoose.Types.ObjectId(),
        instituteId: req.body.instituteId,
        name: req.body.name,
        date: new Date(req.body.date),
        subject: req.body.subject,
        className: req.body.className,
        paperCode: req.body.paperCode,
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime),
    });

    newExam
        .save()
        .then((result) => {
            return res.status(201).json({ messase: 'Exam created', id: result._id });
        })
        .catch((err) => res.status(500).json({ message: 'Something went wrong', err: err }));
});

module.exports = router;
