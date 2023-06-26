const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
mongoose.set('strictQuery', true);
mongoose.connect(`mongodb+srv://${process.env.EMAIL}:${process.env.PASS}@cluster0.yfz8i.mongodb.net/CrackExam`);
//

// const productRouter = require('./api/routes/product');
// const orderRouter = require('./api/routes/orders');
const userRouter = require('./api/routes/user');
const instituteRouter = require('./api/routes/institue');
const examRouter = require('./api/routes/exam');
const questionRouter = require('./api/routes/question');

app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization');
//     if (req.method === 'OPTIONS') {
//         res.header('Access-Control-Allow-Methods', 'PUT,POST,PATCH,DELETE,GET');
//         return res.status(200).json({});
//     }
// });

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

// app.use(
//     cors({
//         origin: 'http://localhost:2000',
//     })
// );

// app.use('/products', productRouter);
// app.use('/orders', orderRouter);
app.use('/users', userRouter);
app.use('/institutes', instituteRouter);
app.use('/exams', examRouter);
app.use('/questions', questionRouter);

app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message,
        },
    });
});
module.exports = app;
