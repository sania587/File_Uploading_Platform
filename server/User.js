// ./models/User.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  uploadedFiles: [{ type: String }], // Array to store uploaded file names or metadata
});

module.exports = mongoose.model('User', userSchema);

