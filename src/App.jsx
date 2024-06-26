import React from 'react';
import FileUpload from './components/FileUpload';


const App = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
      <FileUpload />
    </div>
  );
};

export default App;