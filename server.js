const express = require('express');
const isAdmin = require('./middlewares/isLoggedIn');
const mainErrorHandler = require('./middlewares/mainErrorHandler');
const categoryRouter = require('./routes/categories/categoryRoutes');
const commentRouter = require('./routes/comments/commentRoutes');
const postRouter = require('./routes/posts/postRoutes');
const userRouter = require('./routes/users/userRoutes');
const dotenv = require('dotenv').config();
require("./config/dbConnect");


const app = express();
app.use(express.json());
// Routes
// 1. User Routes
app.use('/api/v1/users/', userRouter);

// 2. Post Routes
app.use('/api/v1/posts', postRouter);

// 3. Comment Route
app.use('/api/v1/comments', commentRouter);

// 4. Category Route
app.use('/api/v1/categories', categoryRouter);

// Error handling middleWares
app.use(mainErrorHandler);

app.use('*', (req, res) => {
    res.status(404).json({
        message: `${req.originalUrl} Route not found!`
    });
});


const PORT = process.env.PORT || 7000;

app.listen(PORT, console.log(`Server is up and running on ${PORT}`));