const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Question = require('../models/question');
const Answer = require('../models/answer');
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

router.post('/add', checkAuth, (req, res, next) => {
    if (!req.body.examId || !req.body.text || !req.body.options) {
        return res.status(404).json({ message: 'all fields are required' });
    }

    const newQuestion = new Question({
        _id: new mongoose.Types.ObjectId(),
        examId: req.body.examId,
        text: req.body.text,
        options: req.body.options,
    });

    console.log(newQuestion);
    newQuestion
        .save()
        .then((result) => {
            return res.status(201).json({
                _id: result._id,
                message: 'Question Created',
            });
        })
        .catch((err) => {
            return res.status(500).json({
                message: 'Something Went Wrong',
                error: err,
            });
        });
});

router.post('/bulk_add', checkAuth, upload.single('questionCollection'), (req, res, next) => {
    csv()
        .fromFile(req.file.path)
        .then((data) => {
            const questions = [];

            data.forEach((item, i) => {
                if (i % 4 === 0)
                    questions.push({ examId: req.body.examId, questionText: item.questionText, options: [] });
            });

            let j = 0;
            data.forEach((item, i) => {
                let len = questions.length;

                if (item.questionText !== questions[j].questionText) {
                    j++;
                }

                questions[j].options.push({
                    optionText: item.optionText,
                    isCorrect: item.isCorrect,
                    type: item.type,
                });
            });

            console.log(questions);

            Question.insertMany(questions)
                .then((result) => {
                    return res.status(201).json({ message: 'Bulk file uploaded' });
                })
                .catch((err) => {
                    return res.status(500).json({ message: 'Something went wrong' });
                });
        })
        .catch((err) => console.log(err));
});

router.post('/save', checkUserAuth, (req, res, next) => {
    const newAnswer = new Answer({
        _id: new mongoose.Types.ObjectId(),
        examId: req.body.examId,
        studentId: req.body.studentId,
        questionId: req.body.questionId,
        optionText: req.body.optionText,
        isCorrect: req.body.isCorrect,
    });

    newAnswer
        .save()
        .then((result) => {
            return res.status(201).json({
                _id: result._id,
                message: 'Answer Created',
            });
        })
        .catch((err) => {
            return res.status(500).json({
                message: 'Something Went Wrong',
                error: err,
            });
        });
});

router.get('/all/:id', checkAuth, (req, res, next) => {
    let newId = new mongoose.mongo.ObjectId(req.params.id);
    Question.find({ examId: newId })
        .exec()
        .then((item) => {
            if (item.length < 1) {
                return res.status(404).json({ message: 'No record found' });
            } else {
                return res.status(200).json({ message: 'All Questions', data: item, len: item.length });
            }
        });
});

module.exports = router;
