import React, { useState, useEffect } from 'react';

const Dashboard = ({ user, onLogout }) => {
  // Parking slots state
  const [parkingSlots, setParkingSlots] = useState({
    'A1': { status: 'available', bookedBy: null, duration: null, vehicleNumber: null, bookingTime: null, paymentMethod: null, amount: null, endTime: null },
    'A2': { status: 'occupied', bookedBy: 'demo_user', duration: 2, vehicleNumber: 'ABC123', bookingTime: new Date().toISOString(), paymentMethod: 'card', amount: 100, endTime: new Date().getTime() + (2 * 60 * 60 * 1000) },
    'A3': { status: 'available', bookedBy: null, duration: null, vehicleNumber: null, bookingTime: null, paymentMethod: null, amount: null, endTime: null },
    'A4': { status: 'reserved', bookedBy: 'demo_user', duration: 3, vehicleNumber: 'XYZ789', bookingTime: new Date().toISOString(), paymentMethod: 'upi', amount: 150, endTime: new Date().getTime() + (3 * 60 * 60 * 1000) },
    'B1': { status: 'available', bookedBy: null, duration: null, vehicleNumber: null, bookingTime: null, paymentMethod: null, amount: null, endTime: null },
    'B2': { status: 'available', bookedBy: null, duration: null, vehicleNumber: null, bookingTime: null, paymentMethod: null, amount: null, endTime: null },
    'B3': { status: 'occupied', bookedBy: 'demo_user', duration: 1, vehicleNumber: 'DEF456', bookingTime: new Date().toISOString(), paymentMethod: 'wallet', amount: 50, endTime: new Date().getTime() + (1 * 60 * 60 * 1000) },
    'B4': { status: 'available', bookedBy: null, duration: null, vehicleNumber: null, bookingTime: null, paymentMethod: null, amount: null, endTime: null }
  });

  // Modal and booking states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingForm, setBookingForm] = useState({ duration: 1, vehicleNumber: '' });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [notification, setNotification] = useState(null);
  
  // Real-time states
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timers, setTimers] = useState({});

  // Update current time every second
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
      updateTimers();
    }, 1000);

    return () => clearInterval(timeInterval);
  }, [parkingSlots]);

  // Calculate timer display for each occupied slot
  const updateTimers = () => {
    const newTimers = {};
    Object.entries(parkingSlots).forEach(([slotId, slot]) => {
      if (slot.status === 'occupied' && slot.endTime) {
        const now = new Date().getTime();
        const timeLeft = slot.endTime - now;
        
        if (timeLeft <= 0) {
          // Auto-release expired slots
          releaseSlot(slotId);
          return;
        }
        
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        newTimers[slotId] = `${hours}h ${minutes}m ${seconds}s`;
      }
    });
    setTimers(newTimers);
  };

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Open booking modal
  const openBookingModal = (slotId) => {
    const slot = parkingSlots[slotId];
    if (slot.status !== 'available') {
      showNotification('This slot is not available', 'error');
      return;
    }
    setSelectedSlot(slotId);
    setShowBookingModal(true);
  };

  // Close booking modal
  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedSlot(null);
    setBookingForm({ duration: 1, vehicleNumber: '' });
    setSelectedPayment(null);
  };

  // Select payment method
  const selectPayment = (method) => {
    setSelectedPayment(method);
  };

  // Process payment (simulated)
  const processPayment = async (amount, method) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        showNotification(`Payment of ₹${amount} processed via ${method.toUpperCase()}!`, 'success');
        resolve(true);
      }, 1500);
    });
  };

  // Handle booking submission
  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!selectedPayment) {
      showNotification('Please select a payment method', 'error');
      return;
    }

    const amount = bookingForm.duration * 50;
    const paymentSuccess = await processPayment(amount, selectedPayment);

    if (paymentSuccess) {
      const now = new Date();
      const endTime = now.getTime() + (bookingForm.duration * 60 * 60 * 1000);
      
      setParkingSlots(prev => ({
        ...prev,
        [selectedSlot]: {
          status: 'occupied',
          bookedBy: user.username,
          duration: parseInt(bookingForm.duration),
          vehicleNumber: bookingForm.vehicleNumber,
          bookingTime: now.toISOString(),
          paymentMethod: selectedPayment,
          amount: amount,
          endTime: endTime
        }
      }));

      showNotification(`Slot ${selectedSlot} booked successfully! Timer started.`, 'success');
      closeBookingModal();
    }
  };

  // Release slot
  const releaseSlot = (slotId) => {
    setParkingSlots(prev => ({
      ...prev,
      [slotId]: {
        status: 'available',
        bookedBy: null,
        duration: null,
        vehicleNumber: null,
        bookingTime: null,
        paymentMethod: null,
        amount: null,
        endTime: null
      }
    }));
    showNotification(`Slot ${slotId} released successfully!`, 'success');
  };

  // Calculate statistics
  const getStats = () => {
    const slots = Object.values(parkingSlots);
    return {
      available: slots.filter(s => s.status === 'available').length,
      occupied: slots.filter(s => s.status === 'occupied').length,
      reserved: slots.filter(s => s.status === 'reserved').length,
      totalRevenue: slots.reduce((sum, s) => sum + (s.amount || 0), 0),
      occupancyRate: ((slots.filter(s => s.status === 'occupied').length / slots.length) * 100).toFixed(1)
    };
  };

  // Get active booking for current user
  const getActiveBooking = () => {
    return Object.entries(parkingSlots).find(([id, slot]) => 
      slot.bookedBy === user.username && slot.status === 'occupied'
    );
  };

  const stats = getStats();
  const activeBooking = getActiveBooking();

  return (
    <div className="min-h-screen p-6 parking-bg overflow-y-auto">
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-5xl font-bold text-white drop-shadow-lg">Smart Parking Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="glass-card px-6 py-3 rounded-xl text-gray-800 font-semibold">
            <span>{user.username}</span>
          </div>
          <button onClick={onLogout} className="bg-red-500/80 hover:bg-red-600/80 text-white px-6 py-3 rounded-xl transition font-semibold">
            Logout
          </button>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="feature-card text-white">
          <div className="flex items-center gap-3">
            <i className="fas fa-clock text-2xl text-blue-300"></i>
            <div>
              <p className="text-sm opacity-80">Current Time</p>
              <p className="font-semibold text-lg">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
            </div>
          </div>
        </div>
        <div className="feature-card text-white">
          <div className="flex items-center gap-3">
            <i className="fas fa-calendar text-2xl text-green-300"></i>
            <div>
              <p className="text-sm opacity-80">Today</p>
              <p className="font-semibold text-lg">{currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
            </div>
          </div>
        </div>
        <div className="feature-card text-white">
          <div className="flex items-center gap-3">
            <i className="fas fa-coins text-2xl text-yellow-300"></i>
            <div>
              <p className="text-sm opacity-80">Today's Revenue</p>
              <p className="font-semibold text-lg">₹{stats.totalRevenue}</p>
            </div>
          </div>
        </div>
        <div className="feature-card text-white">
          <div className="flex items-center gap-3">
            <i className="fas fa-chart-line text-2xl text-purple-300"></i>
            <div>
              <p className="text-sm opacity-80">Occupancy Rate</p>
              <p className="font-semibold text-lg">{stats.occupancyRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Side - Parking Slots */}
        <div className="col-span-8">
          <div className="glass-card rounded-3xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Parking Slots</h2>
            
            {/* Slot Grid */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {Object.entries(parkingSlots).map(([slotId, slot]) => (
                <div
                  key={slotId}
                  onClick={() => slot.status === 'available' && openBookingModal(slotId)}
                  className={`slot-card slot-${slot.status} ${slot.status === 'available' ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                >
                  <i className="fas fa-car text-3xl mb-2"></i>
                  <p className="font-semibold">{slotId}</p>
                  <p className="text-sm opacity-80">{slot.status.charAt(0).toUpperCase() + slot.status.slice(1)}</p>
                </div>
              ))}
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-100 p-6 rounded-xl text-center">
                <p className="stats-number text-green-700">{stats.available}</p>
                <p className="stats-label text-green-600">Available</p>
              </div>
              <div className="bg-red-100 p-6 rounded-xl text-center">
                <p className="stats-number text-red-700">{stats.occupied}</p>
                <p className="stats-label text-red-600">Occupied</p>
              </div>
              <div className="bg-yellow-100 p-6 rounded-xl text-center">
                <p className="stats-number text-yellow-700">{stats.reserved}</p>
                <p className="stats-label text-yellow-600">Reserved</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side - Booking Info */}
        <div className="col-span-4">
          {/* Active Booking */}
          <div className="glass-card rounded-3xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Active Booking</h2>
            {activeBooking ? (
              <div className="bg-green-100 p-4 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-green-700">Active Booking</span>
                  <span className="text-sm text-green-600">{activeBooking[0]}</span>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  <p>Vehicle: {activeBooking[1].vehicleNumber}</p>
                  <p>Duration: {activeBooking[1].duration} hours</p>
                  <p>Payment: {activeBooking[1].paymentMethod?.toUpperCase()}</p>
                  <p>Amount: ₹{activeBooking[1].amount}</p>
                </div>
                <div className="timer-display mb-3">
                  {timers[activeBooking[0]] || 'Loading...'}
                </div>
                <button onClick={() => releaseSlot(activeBooking[0])} className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 transition">
                  Release Slot
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <i className="fas fa-parking text-4xl mb-2"></i>
                <p>No active booking</p>
              </div>
            )}
          </div>
          
          {/* Recent Bookings */}
          <div className="glass-card rounded-3xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Bookings</h2>
            <div className="space-y-3">
              {Object.entries(parkingSlots)
                .filter(([id, slot]) => slot.status !== 'available')
                .slice(0, 3)
                .map(([id, slot]) => (
                  <div key={id} className="bg-gray-100 p-3 rounded-xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{id}</p>
                        <p className="text-sm text-gray-500">{slot.vehicleNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">₹{slot.amount}</p>
                        <p className="text-xs text-gray-500">{slot.paymentMethod?.toUpperCase()}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="booking-modal active">
          <div className="glass-card rounded-3xl p-8 max-w-lg w-full mx-4">
            <h3 className="text-3xl font-bold text-gray-800 mb-6">Book Parking Slot</h3>
            
            <form onSubmit={handleBooking} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Slot Number</label>
                <input type="text" value={selectedSlot} readOnly className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl font-semibold" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
                <select 
                  value={bookingForm.duration} 
                  onChange={(e) => setBookingForm({ ...bookingForm, duration: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl"
                >
                  <option value={1}>1 hour - ₹50</option>
                  <option value={2}>2 hours - ₹100</option>
                  <option value={3}>3 hours - ₹150</option>
                  <option value={4}>4 hours - ₹200</option>
                  <option value={8}>8 hours - ₹400</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Number</label>
                <input 
                  type="text" 
                  value={bookingForm.vehicleNumber}
                  onChange={(e) => setBookingForm({ ...bookingForm, vehicleNumber: e.target.value })}
                  placeholder="Enter vehicle number" 
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl" 
                  required
                />
              </div>
              
              {/* Payment Gateway Options */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { method: 'card', icon: 'fa-credit-card', color: 'text-blue-500', label: 'Credit Card' },
                    { method: 'upi', icon: 'fa-mobile-alt', color: 'text-green-500', label: 'UPI' },
                    { method: 'wallet', icon: 'fa-wallet', color: 'text-purple-500', label: 'Wallet' },
                    { method: 'cash', icon: 'fa-money-bill', color: 'text-yellow-500', label: 'Cash' }
                  ].map(({ method, icon, color, label }) => (
                    <div 
                      key={method}
                      onClick={() => selectPayment(method)}
                      className={`payment-option bg-white border-2 rounded-xl p-3 ${selectedPayment === method ? 'selected border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                    >
                      <div className="flex items-center gap-2">
                        <i className={`fas ${icon} ${color}`}></i>
                        <span className="font-medium">{label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-4">
                <button type="button" onClick={closeBookingModal} className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-400 transition font-semibold">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 transition font-semibold">
                  Proceed to Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
