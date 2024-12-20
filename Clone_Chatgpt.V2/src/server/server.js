import express from 'express';
import mysql from 'mysql';
import bodyParser from 'body-parser';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken'; 
import cors from 'cors';
import dotenv from 'dotenv';
import process from 'process';
import https from 'https';


dotenv.config();

const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_DATABASE', 'SECRET_KEY'];
requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE, SECRET_KEY } = process.env;


const app = express();


// Middleware
app.use(cors(
  { origin: "http://localhost:5173",
   credentials: true,
  }));



app.use(bodyParser.json());


app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173"); 
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE"); 
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization"); 
  res.header("Access-Control-Allow-Credentials", "true"); 
  if (req.method === "OPTIONS") {
    return res.sendStatus(200); 
  }
  next();
})



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

  // Utility function to validate password
  const validatePassword = (password) => {
    if (password.length < 8) return 'Password must be at least 8 characters long';
    if (!/[A-Z]/.test(password)) return 'Password must include at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must include at least one lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must include at least one number';
    return null;
  };



// REGISTER ROUTE
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required' });
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return res.status(400).json({ message: passwordError });
  }
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

      const updateQuery = 'UPDATE users SET token = ? WHERE id = ?';
      db.query(updateQuery, [token, user.id], (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error storing token in the database' });
        }
      });


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
  if (!id) {
    return res.status(400).json({ message: 'User ID is required' });
  }
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

// Middleware to verify JWT token from the database
const verifyTokenFromDB = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ message: "No token provided" });

  // Extract the token from "Bearer <token>"
  const tokenWithoutBearer = token.split(" ")[1];

  // Check if the token exists in the database
  const query = 'SELECT * FROM users WHERE token = ?';
  db.query(query, [tokenWithoutBearer], (err, result) => {
    if (err || result.length === 0) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    // Token is valid, proceed to the next middleware
    req.userId = result[0].id;
    next();
  });
};

// ROOT ROUTE
app.get('/user', verifyTokenFromDB, (req, res) => {
  const query = 'SELECT username, userIcon FROM users WHERE id = ?';
  db.query(query, [req.userId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error fetching user data' });
    if (result.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(result[0]);
  });
});

// SERVER LISTEN
https.createServer(app).listen(5000, () => {
  console.log(`Server is running on port 5000`);
});
