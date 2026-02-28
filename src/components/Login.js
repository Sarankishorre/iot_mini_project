import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [signupData, setSignupData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  // Initialize database
  const initDatabase = () => {
    if (!localStorage.getItem('parkingUsers')) {
      localStorage.setItem('parkingUsers', JSON.stringify({}));
    }
  };

  const getUsersFromDB = () => {
    return JSON.parse(localStorage.getItem('parkingUsers') || '{}');
  };

  const saveUserToDB = (username, userData) => {
    const users = getUsersFromDB();
    users[username] = userData;
    localStorage.setItem('parkingUsers', JSON.stringify(users));
  };

  initDatabase();

  const flipToSignUp = () => setIsFlipped(true);
  const flipToLogin = () => setIsFlipped(false);

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const users = getUsersFromDB();
    if (users[loginData.username] && users[loginData.username].password === loginData.password) {
      const sessionData = {
        username: loginData.username,
        email: users[loginData.username].email,
        loginTime: new Date().toISOString()
      };
      onLogin(sessionData);
    } else {
      showMessage('Invalid username or password', 'error');
    }
    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      showMessage('Passwords do not match', 'error');
      return;
    }
    
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const users = getUsersFromDB();
    if (users[signupData.username]) {
      showMessage('Username already exists', 'error');
    } else {
      saveUserToDB(signupData.username, {
        username: signupData.username,
        email: signupData.email,
        password: signupData.password,
        createdAt: new Date().toISOString()
      });
      showMessage('Account created successfully!', 'success');
      setTimeout(() => flipToLogin(), 1000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 p-4 relative overflow-hidden">
      <div className="w-full max-w-md">
        <div className={`relative transition-transform duration-700 transform ${isFlipped ? 'rotate-y-180' : ''}`} style={{ perspective: '1500px' }}>
          
          {/* Login Form */}
          {!isFlipped && (
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border-2 border-yellow-300/30">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mb-4">
                  <i className="fas fa-parking text-white text-3xl"></i>
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
                <p className="text-gray-600">Sign in to your smart parking account</p>
              </div>

              {message.text && (
                <div className={`mb-4 p-3 rounded-xl ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  <i className={`fas ${message.type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'} mr-2`}></i>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="relative">
                  <input
                    type="text"
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white/80 border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Username or Email"
                  />
                  <i className="fas fa-user absolute right-4 top-4 text-gray-500"></i>
                </div>

                <div className="relative">
                  <input
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white/80 border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Password"
                  />
                  <i className="fas fa-lock absolute right-4 top-4 text-gray-500"></i>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition duration-200 transform hover:scale-[1.02] flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <button onClick={flipToSignUp} className="text-blue-500 font-semibold hover:text-blue-600 transition">
                    Sign Up
                  </button>
                </p>
              </div>

              <div className="mt-6 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                <p className="text-xs text-gray-600 text-center">
                  <i className="fas fa-info-circle mr-1 text-yellow-600"></i>
                  Demo: Use any username with password "admin123"
                </p>
              </div>
            </div>
          )}

          {/* Signup Form */}
          {isFlipped && (
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border-2 border-yellow-300/30">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full mb-4">
                  <i className="fas fa-user-plus text-white text-3xl"></i>
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
                <p className="text-gray-600">Join our smart parking system</p>
              </div>

              {message.text && (
                <div className={`mb-4 p-3 rounded-xl ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  <i className={`fas ${message.type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'} mr-2`}></i>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={signupData.username}
                    onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white/80 border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    placeholder="Username"
                  />
                  <i className="fas fa-user absolute right-4 top-4 text-gray-500"></i>
                </div>

                <div className="relative">
                  <input
                    type="email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white/80 border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    placeholder="Email"
                  />
                  <i className="fas fa-envelope absolute right-4 top-4 text-gray-500"></i>
                </div>

                <div className="relative">
                  <input
                    type="password"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white/80 border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    placeholder="Password"
                  />
                  <i className="fas fa-lock absolute right-4 top-4 text-gray-500"></i>
                </div>

                <div className="relative">
                  <input
                    type="password"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white/80 border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    placeholder="Confirm Password"
                  />
                  <i className="fas fa-lock absolute right-4 top-4 text-gray-500"></i>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition duration-200 transform hover:scale-[1.02] flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <button onClick={flipToLogin} className="text-green-500 font-semibold hover:text-green-600 transition">
                    Sign In
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
