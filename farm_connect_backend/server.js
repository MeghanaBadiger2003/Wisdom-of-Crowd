const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');
const bcrypt = require('bcrypt'); // For password hashing

const app = express();
const PORT = 3000;

// Middleware to parse request bodies and serve static files from the public directory
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the 'public' folder

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Replace with your MySQL username
    password: 'root', // Replace with your MySQL password
    database: 'farm_connect' // Ensure the database exists
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database!');
});

// Serve Signup Page
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Serve Login Page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve index2 Page
app.get('/index2', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index2.html'));
});

// Signup Route
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).send('All fields are required!');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(query, [username, email, hashedPassword], (err, results) => {
        if (err) {
            return res.status(500).send('Error inserting data: ' + err.message);
        }
        // Redirect to the login page after successful signup
        res.redirect('/login');
    });
});

// Login Route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if the user exists with either username or email
        const query = 'SELECT * FROM users WHERE username = ? OR email = ?';
        db.query(query, [username, username], async (err, results) => {
            if (err) {
                return res.status(500).send('Database error: ' + err.message);
            }

            if (results.length === 0) {
                return res.status(401).send('Invalid username or email.');
            }

            const user = results[0];

            // Check if the password is correct
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).send('Invalid password.');
            }

            // Login successful
            res.redirect('/index2'); // You may want to redirect to a different page instead
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error.');
    }
});

// Logout Route
app.post('/logout', (req, res) => {
    // Logic to clear user session or token (if you're using sessions or JWT)
    // For now, we will simply redirect to the index page
    res.redirect('/index'); // Redirect to the homepage
});

// Serve Homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
