// FileUpload.jsx (client-side)

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    if (token) {
      fetchUploadedFiles();
    }
  }, [token]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadMessage('No file selected');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('username', username); // Send username along with the file

    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      setFileUrl(response.data.fileUrl);
      setUploadMessage('File uploaded successfully');
    } catch (err) {
      console.error(err);
      setUploadMessage('File upload failed');
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/login', { username, password });
      console.log(response.data); // Log response for debugging
      setToken(response.data.token); // If using tokens, set the token in state/context
      setIsLoggedIn(true); // Set login state to true
      setUploadMessage('Login successful'); // Set success message or clear any previous error message
    } catch (err) {
      console.error('Login error:', err);
      setUploadMessage('Login failed'); // Set error message in state
    }
  };

  const handleSignup = async () => {
    try {
      const response = await axios.post('http://localhost:5000/signup', {
        username: username,
        password: password,
      });
      console.log(response.data); // Log the response for debugging
      setUploadMessage('Successfully signed up. Now login to continue.'); // Display appropriate error message
      // Handle success message or redirect if needed
    } catch (error) {
      if (error.response.status === 400) {
        setUploadMessage('Username already exists'); // Display appropriate error message
      } else {
        console.error('Signup error:', error);
        setUploadMessage('Signup failed'); // Display generic signup failure message
      }
    }
  };
  const fetchUploadedFiles = async () => {
    try {
      const response = await axios.get('http://localhost:5000/user/files', {
        params: { username },
        headers: { Authorization: `Bearer ${token}` },
      });
      setUploadedFiles(response.data.uploadedFiles);
    } catch (error) {
      console.error('Error fetching uploaded files:', error);
    }
  };

  const handleViewFiles = () => {
    // Logic to display uploadedFiles in a popup or modal
    console.log('Uploaded Files:', uploadedFiles);
    // Implement popup/modal display logic here
    alert(`Uploaded Files: ${uploadedFiles.join(', ')}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400  to-blue-500">
      {!isLoggedIn ? (
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Login or Signup</h2>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Username"
              className="block w-full py-2 px-4 mb-2 rounded-full border-2 border-gray-300 focus:outline-none focus:border-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="block w-full py-2 px-4 mb-4 rounded-full border-2 border-gray-300 focus:outline-none focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex justify-between mb-6">
            <button
              onClick={handleLogin}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg focus:outline-none w-1/2"
            >
              Login
            </button>
            <button
              onClick={handleSignup}
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg focus:outline-none w-1/2"
            >
              Signup
            </button>
          </div>
          {uploadMessage && <p className="mt-4 text-sm text-gray-700">{uploadMessage}</p>}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">File Upload</h2>
          <input
            type="file"
            onChange={handleFileChange}
            className="block w-full py-2 px-4 mb-4 rounded-full border-2 border-gray-300 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleUpload}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg focus:outline-none w-full"
          >
            Upload
          </button>
          <button
            onClick={handleViewFiles} // Handle click on View Files button
            className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg focus:outline-none w-full mt-4"
          >
            View Files
          </button>
          {uploadMessage && <p className="mt-4 text-sm text-gray-700">{uploadMessage}</p>}
          {fileUrl && (
            <div className="mt-4">
              <p className="text-center font-semibold text-gray-800">Uploaded File:</p>
              {file.type.startsWith('image/') ? (
                <img
                  src={fileUrl}
                  alt="Uploaded file"
                  className="mt-2 mx-auto rounded-lg shadow-lg"
                  style={{ maxWidth: '300px' }}
                />
              ) : (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-center"
                >
                  View File
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;