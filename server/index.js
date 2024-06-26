const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./User'); // Adjust the path as per your file structure

const app = express();
const port = 5000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/fileuploads', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fileType = file.mimetype.split('/')[0];
    const uploadPath = path.join(__dirname, 'uploads', fileType);

    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });
// Route for file upload
app.post('/upload', upload.single('file'), async (req, res) => {
  const fileUrl = `http://localhost:${port}/uploads/${req.file.mimetype.split('/')[0]}/${req.file.filename}`;
  
  // Add uploaded file to user's uploadedFiles array
  try {
    const user = await User.findOne({ username: req.body.username }); // Assuming username is sent in the request body
    if (user) {
      user.uploadedFiles.push(req.file.filename);
      await user.save();
      res.json({ fileUrl });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error in uploading file:', error);
    res.status(500).json({ message: 'File upload failed' });
  }
});

// Route to fetch user's uploaded files
app.get('/user/files', async (req, res) => {
  const { username } = req.query;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Log the user object to console for debugging
    console.log('User:', user);

    // Ensure uploadedFiles array is populated
    console.log('Uploaded Files:', user.uploadedFiles);

    // Return uploadedFiles array
    res.json({ uploadedFiles: user.uploadedFiles });
  } catch (error) {
    console.error('Error in fetching files:', error);
    res.status(500).json({ message: 'Failed to fetch files' });
  }
});

// Route for user signup
// Route for user signup
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if username already exists
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).json({ message: 'Signup failed' });
  }
});




/// Route for user login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare passwords using bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Login successful
    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
