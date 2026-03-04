import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PaymentButton from './components/PaymentButton';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/login"
            element={
              currentUser ?
                <Navigate to="/dashboard" replace /> :
                <Login onLogin={handleLogin} />
            }
          />
          <Route
            path="/dashboard"
            element={
              currentUser ?
                <Dashboard
                  user={currentUser}
                  onLogout={handleLogout}
                  // ✅ Payment button passed as prop to Dashboard
                  paymentSection={
                    <PaymentButton
                      deviceId={currentUser?.deviceId || "SENSOR_001"}
                      amount={99}
                      planName="Basic Activation"
                    />
                  }
                /> :
                <Navigate to="/login" replace />
            }
          />
          <Route
            path="/payment"
            element={
              currentUser ?
                <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                  <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                    <h2 className="text-2xl font-bold mb-2">Activate Your Device</h2>
                    <p className="text-gray-500 mb-6">
                      Device ID: <span className="font-mono text-green-600">
                        {currentUser?.deviceId || "SENSOR_001"}
                      </span>
                    </p>
                    <PaymentButton
                      deviceId={currentUser?.deviceId || "SENSOR_001"}
                      amount={99}
                      planName="Basic Activation"
                    />
                  </div>
                </div>
                : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/"
            element={<Navigate to={currentUser ? "/dashboard" : "/login"} replace />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;