const dotenv = require('dotenv');
const express = require('express');
const app = express();
dotenv.config();
const userModel = require('./models/users.model');
const quizModel = require('./models/createQuiz.model');
const sectionModel = require('./models/sections.model');
const instructorModel = require('./models/instructers.model');

const connectDB = require('./config/db.config');
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Hello World');
});

// Combined registration endpoint
app.post('/register', async (req, res) => {
    const { userId, role, instructorId } = req.body;

    if (role === 'student') {
        const user = await userModel.findOne({ userId });
        if (!user) {
            const newUser = await userModel.create({ userId });
            return res.status(201).json(newUser);
        }
        return res.status(200).json(user);
    } else if (role === 'instructor') {
        const instructor = await instructorModel.findOne({ instructorId });
        if (!instructor) {
            const newInstructor = await instructorModel.create({ instructorId });
            return res.status(201).json(newInstructor);
        }
        return res.status(200).json(instructor);
    } else {
        return res.status(400).json({ message: 'Invalid role' });
    }
});

// Show all instructors
app.get("/instructors", async (req, res) => {
    const instructors = await instructorModel.find().populate("sections");
    res.status(200).json(instructors);
});

// Create sections for instructors
app.post('/createSection/:instructorId', async (req, res) => {
    const { sect } = req.body;
    const instructor = await instructorModel.findOne({ instructorId: req.params.instructorId });
    if (!instructor) {
        return res.status(404).json({ message: 'Instructor not found' });
    }
    const section = await sectionModel.create({ sect, instructor: instructor._id });
    instructor.sections.push(section._id);
    await instructor.save();
    res.status(201).json(section);
});

// Show all sections for instructors
app.get('/getSections/:instructorId', async (req, res) => {
    const instructor = await instructorModel.findOne({ instructorId: req.params.instructorId });
    if (!instructor) {
        return res.status(404).json({ message: 'Instructor not found' });
    }
    const sections = await sectionModel.find({ instructor: instructor._id });
    res.status(200).json(sections);
});

// Create quizzes for sections
app.post('/createQuiz/:sectionId', async (req, res) => {
    const section = await sectionModel.findById(req.params.sectionId);
    if (!section) {
        return res.status(404).json({ message: 'Section not found' });
    }
    const { question, options, answer } = req.body;
    const quiz = await quizModel.create({ question, options, answer, section: section._id });
    section.quizzes.push(quiz._id);
    await section.save();
    res.status(201).json(quiz);
});

// Show all quizzes for sections
app.get('/getQuizzes/:sectionId', async (req, res) => {
    const section = await sectionModel.findById(req.params.sectionId);
    if (!section) {
        return res.status(404).json({ message: 'Section not found' });
    }
    const quizzes = await quizModel.find({ section: section._id });
    res.status(200).json(quizzes);
});

// Submit quizzes for users
app.post('/submitQuiz/:userId/:sectionId/:quizId', async (req, res) => {
    const quiz = await quizModel.findById(req.params.quizId);
    if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
    }
    const { answer } = req.body;
    const user = await userModel.findOne({ userId: req.params.userId });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    user.attemptedQuizzes += 1;

    if (answer === quiz.answer) {
        user.score += 1;

        const sectionScoreEntry = user.sectionScore.find(entry => entry.section.toString() === req.params.sectionId);
        if (sectionScoreEntry) {
            sectionScoreEntry.score += 1;
        } else {
            user.sectionScore.push({ section: req.params.sectionId, score: 1 });
        }
    }

    await user.save();
    res.status(200).json({ message: 'Quiz submitted successfully' });
});

// Show section score for users
app.get("/show-section-score/:userId/:sectionId", async (req, res) => {
    const user = await userModel.findOne({ userId: req.params.userId });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    const section = await sectionModel.findById(req.params.sectionId);
    if (!section) {
        return res.status(404).json({ message: 'Section not found' });
    }
    const sectionScore = user.sectionScore.find(entry => entry.section.toString() === section._id.toString());
    res.status(200).json(sectionScore);
});

// Show instructor score for users
app.get("/show-instructor-score/:instructorId", async (req, res) => {
    const instructor = await instructorModel.findOne({ instructorId: req.params.instructorId }).populate("users");
    if (!instructor) {
        return res.status(404).json({ message: 'Instructor not found' });
    }
    const users = instructor.users;
    const sortedUsers = users.sort((a, b) => b.score - a.score);
    res.status(200).json(sortedUsers);
});

// Show score board for all users
app.get('/show-score-board', async (req, res) => {
    const users = await userModel.find();
    const sortedUsers = users.sort((a, b) => b.score - a.score);
    res.status(200).json(sortedUsers);
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});