import React, { useState, useEffect } from 'react';

const Dashboard = ({ user, onLogout }) => {
  // Enhanced pricing structure with hourly rates
  const pricingRates = {
    1: 40,
    2: 75,
    3: 105,
    4: 130,
    5: 155,
    6: 180,
    8: 220,
    12: 300,
    24: 500
  };

  // Calculate cost based on duration
  const calculateCost = (hours) => {
    return pricingRates[hours] || hours * 50;
  };

  // Format time display with seconds
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });
  };

  // Format date display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calculate time elapsed since booking
  const getTimeElapsed = (bookingTime) => {
    const now = new Date();
    const booked = new Date(bookingTime);
    const diff = now - booked;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Parking slots state
  const [parkingSlots, setParkingSlots] = useState({
    'A1': { status: 'available', bookedBy: null, duration: null, vehicleNumber: null, bookingTime: null, paymentMethod: null, amount: null, endTime: null },
    'A2': { status: 'occupied', bookedBy: 'demo_user', duration: 2, vehicleNumber: 'ABC123', bookingTime: new Date().toISOString(), paymentMethod: 'card', amount: 75, endTime: new Date().getTime() + (2 * 60 * 60 * 1000) },
    'A3': { status: 'available', bookedBy: null, duration: null, vehicleNumber: null, bookingTime: null, paymentMethod: null, amount: null, endTime: null },
    'A4': { status: 'reserved', bookedBy: 'demo_user', duration: 3, vehicleNumber: 'XYZ789', bookingTime: new Date().toISOString(), paymentMethod: 'upi', amount: 105, endTime: new Date().getTime() + (3 * 60 * 60 * 1000) },
    'B1': { status: 'available', bookedBy: null, duration: null, vehicleNumber: null, bookingTime: null, paymentMethod: null, amount: null, endTime: null },
    'B2': { status: 'available', bookedBy: null, duration: null, vehicleNumber: null, bookingTime: null, paymentMethod: null, amount: null, endTime: null },
    'B3': { status: 'occupied', bookedBy: 'demo_user', duration: 1, vehicleNumber: 'DEF456', bookingTime: new Date().toISOString(), paymentMethod: 'wallet', amount: 40, endTime: new Date().getTime() + (1 * 60 * 60 * 1000) },
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

  // Calculate timer display with better formatting
  const updateTimers = () => {
    const newTimers = {};
    Object.entries(parkingSlots).forEach(([slotId, slot]) => {
      if (slot.status === 'occupied' && slot.endTime) {
        const now = new Date().getTime();
        const timeLeft = slot.endTime - now;
        
        if (timeLeft <= 0) {
          releaseSlot(slotId);
          return;
        }
        
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        // Color-coded timer based on urgency
        let colorClass = 'text-green-600';
        if (hours === 0 && minutes < 30) colorClass = 'text-red-600';
        else if (hours === 0) colorClass = 'text-yellow-600';
        
        newTimers[slotId] = {
          text: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
          colorClass,
          urgency: hours === 0 && minutes < 30 ? 'critical' : hours === 0 ? 'warning' : 'normal'
        };
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

    const amount = calculateCost(bookingForm.duration);
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

  // Enhanced statistics calculation
  const getStats = () => {
    const slots = Object.values(parkingSlots);
    const occupied = slots.filter(s => s.status === 'occupied');
    const totalRevenue = slots.reduce((sum, s) => sum + (s.amount || 0), 0);
    const activeBookings = occupied.length;
    
    // Calculate estimated hourly earnings
    const hourlyRate = occupied.reduce((sum, s) => sum + (s.amount / (s.duration || 1)), 0);
    
    return {
      available: slots.filter(s => s.status === 'available').length,
      occupied: activeBookings,
      reserved: slots.filter(s => s.status === 'reserved').length,
      totalRevenue,
      occupancyRate: ((activeBookings / slots.length) * 100).toFixed(1),
      hourlyEarnings: hourlyRate.toFixed(0),
      totalSlots: slots.length,
      avgBookingDuration: activeBookings > 0 ? (occupied.reduce((sum, s) => sum + (s.duration || 0), 0) / activeBookings).toFixed(1) : 0
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
    <div className="min-h-screen overflow-y-auto"
         style={{
           background: "linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.4)), url('/car-park-with-cars-background_1047188-62547.avif'), linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
           backgroundSize: 'cover, cover, cover',
           backgroundPosition: 'center, center, center',
           backgroundRepeat: 'no-repeat, no-repeat, no-repeat',
           backgroundAttachment: 'fixed, fixed, fixed'
         }}>
      <div className="p-4 md:p-6 min-h-screen pb-20">
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-8 gap-4">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg text-center md:text-left">Smart Parking Dashboard</h1>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="glass-card px-4 md:px-6 py-2 md:py-3 rounded-xl text-gray-800 font-semibold text-sm md:text-base">
            <span>{user.username}</span>
          </div>
          <button onClick={onLogout} className="bg-red-500/80 hover:bg-red-600/80 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl transition font-semibold text-sm md:text-base">
            Logout
          </button>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="feature-card text-white">
          <div className="flex items-center gap-2 md:gap-3">
            <i className="fas fa-clock text-xl md:text-2xl text-blue-300"></i>
            <div>
              <p className="text-xs md:text-sm opacity-80">Current Time</p>
              <p className="font-semibold text-sm md:text-lg">{formatTime(currentTime)}</p>
            </div>
          </div>
        </div>
        <div className="feature-card text-white">
          <div className="flex items-center gap-2 md:gap-3">
            <i className="fas fa-calendar text-xl md:text-2xl text-green-300"></i>
            <div>
              <p className="text-xs md:text-sm opacity-80">Today</p>
              <p className="font-semibold text-sm md:text-lg">{formatDate(currentTime)}</p>
            </div>
          </div>
        </div>
        <div className="feature-card text-white">
          <div className="flex items-center gap-2 md:gap-3">
            <i className="fas fa-coins text-xl md:text-2xl text-yellow-300"></i>
            <div>
              <p className="text-xs md:text-sm opacity-80">Total Revenue</p>
              <p className="font-semibold text-sm md:text-lg">₹{stats.totalRevenue}</p>
              <p className="text-xs opacity-60">₹{stats.hourlyEarnings}/hr est.</p>
            </div>
          </div>
        </div>
        <div className="feature-card text-white">
          <div className="flex items-center gap-2 md:gap-3">
            <i className="fas fa-chart-line text-xl md:text-2xl text-purple-300"></i>
            <div>
              <p className="text-xs md:text-sm opacity-80">Occupancy</p>
              <p className="font-semibold text-sm md:text-lg">{stats.occupied}/{stats.totalSlots}</p>
              <p className="text-xs opacity-60">{stats.occupancyRate}% full</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* Left Side - Parking Slots */}
        <div className="lg:col-span-8">
          <div className="glass-card rounded-2xl md:rounded-3xl p-4 md:p-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">Parking Slots</h2>
            
            {/* Slot Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
              {Object.entries(parkingSlots).map(([slotId, slot]) => (
                <div
                  key={slotId}
                  onClick={() => slot.status === 'available' && openBookingModal(slotId)}
                  className={`slot-card slot-${slot.status} ${slot.status === 'available' ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                >
                  <i className="fas fa-car text-2xl md:text-3xl mb-1 md:mb-2"></i>
                  <p className="font-semibold text-sm md:text-base">{slotId}</p>
                  <p className="text-xs md:text-sm opacity-80">{slot.status.charAt(0).toUpperCase() + slot.status.slice(1)}</p>
                </div>
              ))}
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              <div className="bg-green-100 p-3 md:p-6 rounded-xl text-center">
                <p className="stats-number text-green-700 text-xl md:text-4xl">{stats.available}</p>
                <p className="stats-label text-green-600 text-xs md:text-sm">Available</p>
              </div>
              <div className="bg-red-100 p-3 md:p-6 rounded-xl text-center">
                <p className="stats-number text-red-700 text-xl md:text-4xl">{stats.occupied}</p>
                <p className="stats-label text-red-600 text-xs md:text-sm">Occupied</p>
              </div>
              <div className="bg-yellow-100 p-3 md:p-6 rounded-xl text-center">
                <p className="stats-number text-yellow-700 text-xl md:text-4xl">{stats.reserved}</p>
                <p className="stats-label text-yellow-600 text-xs md:text-sm">Reserved</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side - Booking Info */}
        <div className="lg:col-span-4">
          {/* Active Booking */}
          <div className="glass-card rounded-2xl md:rounded-3xl p-4 md:p-6 mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">Active Booking</h2>
            {activeBooking ? (
              <div className="bg-green-100 p-3 md:p-4 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-green-700 text-sm md:text-base">Active Booking</span>
                  <span className="text-xs md:text-sm text-green-600">{activeBooking[0]}</span>
                </div>
                <div className="text-xs md:text-sm text-gray-600 mb-3">
                  <p><strong>Vehicle:</strong> {activeBooking[1].vehicleNumber}</p>
                  <p><strong>Duration:</strong> {activeBooking[1].duration} hours</p>
                  <p><strong>Elapsed:</strong> {getTimeElapsed(activeBooking[1].bookingTime)}</p>
                  <p><strong>Payment:</strong> {activeBooking[1].paymentMethod?.toUpperCase()}</p>
                  <p><strong>Amount:</strong> ₹{activeBooking[1].amount}</p>
                  <p><strong>Booked:</strong> {new Date(activeBooking[1].bookingTime).toLocaleTimeString()}</p>
                </div>
                <div className={`timer-display mb-3 text-sm md:text-base font-mono font-bold ${timers[activeBooking[0]]?.colorClass || 'text-gray-700'}`}>
                  ⏱️ {timers[activeBooking[0]]?.text || 'Calculating...'}
                </div>
                <button onClick={() => releaseSlot(activeBooking[0])} className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs md:text-sm hover:bg-red-600 transition">
                  Release Slot
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-6 md:py-8">
                <i className="fas fa-parking text-3xl md:text-4xl mb-2"></i>
                <p className="text-sm md:text-base">No active booking</p>
              </div>
            )}
          </div>
          
          {/* Recent Bookings */}
          <div className="glass-card rounded-2xl md:rounded-3xl p-4 md:p-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">Recent Bookings</h2>
            <div className="space-y-2 md:space-y-3">
              {Object.entries(parkingSlots)
                .filter(([id, slot]) => slot.status !== 'available')
                .slice(0, 3)
                .map(([id, slot]) => (
                  <div key={id} className="bg-gray-100 p-2 md:p-3 rounded-xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-sm md:text-base">{id}</p>
                        <p className="text-xs md:text-sm text-gray-500">{slot.vehicleNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600 text-sm md:text-base">₹{slot.amount}</p>
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
        <div className="booking-modal active p-4">
          <div className="glass-card rounded-2xl md:rounded-3xl p-6 md:p-8 max-w-lg w-full mx-auto max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">Book Parking Slot</h3>
            
            <form onSubmit={handleBooking} className="space-y-4 md:space-y-5">
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
                  <option value={1}>1 hour - ₹40</option>
                  <option value={2}>2 hours - ₹75 (Save ₹5)</option>
                  <option value={3}>3 hours - ₹105 (Save ₹15)</option>
                  <option value={4}>4 hours - ₹130 (Save ₹30)</option>
                  <option value={5}>5 hours - ₹155 (Save ₹45)</option>
                  <option value={6}>6 hours - ₹180 (Save ₹60)</option>
                  <option value={8}>8 hours - ₹220 (Save ₹100)</option>
                  <option value={12}>12 hours - ₹300 (Save ₹180)</option>
                  <option value={24}>24 hours - ₹500 (Save ₹460)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Base rate: ₹50/hr | Discounts applied for longer bookings</p>
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
                        <span className="font-medium text-sm">{label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 md:gap-4">
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
    </div>
  );
};

export default Dashboard;
