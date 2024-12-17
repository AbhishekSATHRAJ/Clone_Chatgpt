import express from 'express';
import mysql from 'mysql';
import bodyParser from 'body-parser';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken'; 
import cors from 'cors';
import dotenv from 'dotenv';
import process from 'process';

dotenv.config();

const result = dotenv.config();
if (result.error) {
  throw result.error;
}
console.log('Environment variables loaded:', process.env);


const app = express();


// Middleware
app.use(cors({
    origin: 'http://localhost:5000',
}));
app.use(bodyParser.json());

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE, SECRET_KEY } = process.env;

// Database connection
const db = mysql.createConnection({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
});

db.connect((err) => {
  if (err) throw err;
  console.log('MySQL Database connected');
});

// REGISTER ROUTE
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcryptjs.hash(password, 10); 
    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(query, [username, email, hashedPassword], (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: 'User registration failed' });
      }
      res.status(201).json({ message: 'User registered successfully' });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// SIGN-IN ROUTE
app.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  if( !email || !password ) {
    return res.status(400).json({ message: 'Email and password are required' });
    }
  try {
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email],async (err, result) => {
      if (err || result.length === 0) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const user = result[0];
      const isValidPassword =await bcryptjs.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid password' });
      }

      const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });

      // Save token to the database
      const saveTokenQuery = 'UPDATE users SET token = ? WHERE id = ?';
      db.query(saveTokenQuery, [token, user.id]);

      res.json({ message: 'User signed in successfully', token, user });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// SIGN-OUT ROUTE
app.post('/signout', async (req, res) => {
  const { id } = req.body;
  try {
    const query = 'UPDATE users SET token = NULL WHERE id = ?';
    db.query(query, [id], (err) => {
      if (err) return res.status(500).json({ message: 'Sign out failed' });
      res.status(200).json({ message: 'Signed out successfully' });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// ROOT ROUTE
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running' });
});

// SERVER LISTEN
app.listen(5000, () => {
  console.log(`Server is running on port 5000`);
});
