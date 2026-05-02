import React from 'react';
import ReactDOM from 'react-dom/client';
// 1. Yahan BrowserRouter ko HashRouter se replace kiya
import { HashRouter } from 'react-router-dom'; 
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Yahan bhi HashRouter laga diya */}
    <HashRouter>
      <AuthProvider>
        <Toaster position="top-center" /> {/* Notifications ke liye */}
        <App />
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>,
)