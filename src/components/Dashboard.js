import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// ── Flask server address ──────────────────────────────────────
// Must match SERVER_IP:SERVER_PORT in smart_parking_integrated.py
const API = process.env.REACT_APP_API_URL || 'http://10.56.217.148:5000';

const Dashboard = ({ user, onLogout }) => {

  // ── State ────────────────────────────────────────────────────
  const [slots, setSlots]           = useState({ occupied: [], available: [1,2,3,4] });
  const [stats, setStats]           = useState({
    total_slots: 4, occupied_count: 0, available_count: 4,
    occupancy_pct: 0, total_revenue: 0, today_revenue: 0,
    active_sessions: 0
  });
  const [history, setHistory]       = useState([]);      // from /vehicles
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notification, setNotification] = useState(null);

  // ── Helpers ──────────────────────────────────────────────────
  const showNotif = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const formatTime = (d) => d.toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
  });

  const formatDate = (d) => d.toLocaleDateString('en-IN', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  });

  // ── Live clock ───────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Poll /slot_status every 3 s ──────────────────────────────
  // Real-time slot status from Flask server
  const fetchSlots = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/slot_status`);
      setSlots(data);
      console.log('[SLOTS] Updated:', data);
    } catch (err) {
      console.error('[SLOTS] Error:', err);
    }
  }, []);

  useEffect(() => {
    fetchSlots();
    const interval = setInterval(fetchSlots, 3000);
    return () => clearInterval(interval);
  }, [fetchSlots]);

  // ── Poll /dashboard_stats every 5 s ─────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/dashboard_stats`);
      setStats(data);
    } catch (e) {
      console.warn('[stats poll]', e.message);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const t = setInterval(fetchStats, 5000);
    return () => clearInterval(t);
  }, [fetchStats]);

  // ── Poll /vehicles every 5 s ─────────────────────────────────
  const fetchHistory = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/vehicles`);
      setHistory(data);
    } catch (e) {
      console.warn('[history poll]', e.message);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
    const t = setInterval(fetchHistory, 5000);
    return () => clearInterval(t);
  }, [fetchHistory]);

  // ── Derived: active / recent bookings ────────────────────────
  const activeBookings = history.filter(
    v => v.payment_status === 'pending' && !v.exit_time
  );
  const recentBookings = history
    .filter(v => v.payment_status === 'paid' || v.exit_time)
    .slice(0, 5);

  // ── Time tracking for occupied slots ────────────────────────
  const getSlotTime = (slotNum) => {
    const vehicle = history.find(v => v.slot_number === slotNum && v.payment_status === 'pending' && !v.exit_time);
    if (!vehicle || !vehicle.entry_time) return null;
    
    const entryTime = new Date(vehicle.entry_time);
    const now = new Date();
    const diffMs = now - entryTime;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds, vehicle };
  };

  // ── Slot display helpers ─────────────────────────────────────
  const slotStatus = (n) => slots.occupied.includes(n) ? 'occupied' : 'available';

  const slotColor = (n) => {
    const s = slotStatus(n);
    if (s === 'occupied') return 'bg-red-100 border-red-400 text-red-700 cursor-not-allowed';
    return 'bg-green-100 border-green-400 text-green-700 cursor-pointer hover:bg-green-200 transition';
  };

  // ── Open Flask payment page for vehicle ───────────────────────
  const openPaymentPage = (vehicleId) => {
    const paymentUrl = `${API}/pay?vehicle_id=${vehicleId}`;
    window.open(paymentUrl, '_blank');
  };

  // ─────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen overflow-y-auto"
      style={{
        background: "linear-gradient(rgba(0,0,0,0.3),rgba(0,0,0,0.4)), url('/car-park-with-cars-background_1047188-62547.avif'), linear-gradient(135deg,#667eea 0%,#764ba2 100%)",
        backgroundSize: 'cover,cover,cover',
        backgroundPosition: 'center,center,center',
        backgroundRepeat: 'no-repeat,no-repeat,no-repeat',
        backgroundAttachment: 'fixed,fixed,fixed'
      }}
    >
      <div className="p-4 md:p-6 min-h-screen pb-20">

        {/* ── Notification toast ── */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl text-white font-semibold shadow-lg transition
            ${notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
            {notification.message}
          </div>
        )}

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-8 gap-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg text-center md:text-left">
            Smart Parking Dashboard
          </h1>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="glass-card px-4 md:px-6 py-2 md:py-3 rounded-xl text-gray-800 font-semibold text-sm md:text-base">
              {user.username}
            </div>
            <button
              onClick={onLogout}
              className="bg-red-500/80 hover:bg-red-600/80 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl transition font-semibold text-sm md:text-base"
            >
              Logout
            </button>
          </div>
        </div>

        {/* ── Top stat cards — live from /dashboard_stats ── */}
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
                <p className="font-semibold text-sm md:text-lg">₹{stats.total_revenue}</p>
                <p className="text-xs opacity-60">Today ₹{stats.today_revenue}</p>
              </div>
            </div>
          </div>
          <div className="feature-card text-white">
            <div className="flex items-center gap-2 md:gap-3">
              <i className="fas fa-chart-line text-xl md:text-2xl text-purple-300"></i>
              <div>
                <p className="text-xs md:text-sm opacity-80">Occupancy</p>
                <p className="font-semibold text-sm md:text-lg">
                  {stats.occupied_count}/{stats.total_slots}
                </p>
                <p className="text-xs opacity-60">{stats.occupancy_pct}% full</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main content grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">

          {/* ── Left: Parking slots — live from /slot_status ── */}
          <div className="lg:col-span-8">
            <div className="glass-card rounded-2xl md:rounded-3xl p-4 md:p-6">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Parking Slots</h2>
                <span className="text-xs text-gray-400">Live · updates every 3 s</span>
              </div>

              {/* 4 slots (1–4) from IoT system with real-time status */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
                {[1, 2, 3, 4].map((n) => {
                  const slotTime = getSlotTime(n);
                  const isOccupied = slotStatus(n) === 'occupied';
                  return (
                    <div
                      key={n}
                      className={`slot-card border-2 rounded-xl p-4 text-center select-none ${slotColor(n)}`}
                    >
                      <i className={`fas fa-car text-2xl md:text-3xl mb-1 md:mb-2 ${
                        isOccupied ? 'text-red-500' : 'text-green-500'
                      }`}></i>
                      <p className="font-semibold text-sm md:text-base">Slot {n}</p>
                      <p className="text-xs md:text-sm opacity-80">
                        {isOccupied ? 'Occupied' : 'Available'}
                      </p>
                      
                      {/* Show time and vehicle info for occupied slots */}
                      {isOccupied && slotTime && (
                        <div className="mt-2 text-xs">
                          <p className="font-mono text-red-600">
                            {String(slotTime.hours).padStart(2, '0')}:{String(slotTime.minutes).padStart(2, '0')}:{String(slotTime.seconds).padStart(2, '0')}
                          </p>
                          <p className="text-gray-600 truncate">
                            {slotTime.vehicle.vehicle_id}
                          </p>
                        </div>
                      )}
                      
                      {/* Payment button for occupied slots */}
                      {isOccupied && slotTime && slotTime.vehicle.fare_amount && (
                        <button
                          onClick={() => openPaymentPage(slotTime.vehicle.vehicle_id)}
                          className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs transition"
                        >
                          Pay ₹{parseFloat(slotTime.vehicle.fare_amount).toFixed(0)}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Quick stats bar — FIX #7: active_sessions now always defined from stats */}
              <div className="grid grid-cols-3 gap-2 md:gap-4">
                <div className="bg-green-100 p-3 md:p-6 rounded-xl text-center">
                  <p className="stats-number text-green-700 text-xl md:text-4xl">
                    {stats.available_count ?? slots.available.length}
                  </p>
                  <p className="stats-label text-green-600 text-xs md:text-sm">Available</p>
                </div>
                <div className="bg-red-100 p-3 md:p-6 rounded-xl text-center">
                  <p className="stats-number text-red-700 text-xl md:text-4xl">
                    {stats.occupied_count ?? slots.occupied.length}
                  </p>
                  <p className="stats-label text-red-600 text-xs md:text-sm">Occupied</p>
                </div>
                <div className="bg-blue-100 p-3 md:p-6 rounded-xl text-center">
                  {/* FIX #7: active_sessions is now always present in stats initial state */}
                  <p className="stats-number text-blue-700 text-xl md:text-4xl">
                    {stats.active_sessions}
                  </p>
                  <p className="stats-label text-blue-600 text-xs md:text-sm">Active sessions</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Active + Recent ── */}
          <div className="lg:col-span-4">

            {/* Active bookings (vehicles currently inside, payment pending) */}
            <div className="glass-card rounded-2xl md:rounded-3xl p-4 md:p-6 mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">
                Active Sessions
              </h2>
              {activeBookings.length === 0 ? (
                <div className="text-center text-gray-500 py-6 md:py-8">
                  <i className="fas fa-parking text-3xl md:text-4xl mb-2"></i>
                  <p className="text-sm md:text-base">No active sessions</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {activeBookings.map((v) => (
                    // FIX #2: use v.id (unique DB row id) as key instead of vehicle_id+created_at
                    // which can collide for repeat visitors with the same plate
                    <div key={v.id} className="bg-green-50 border border-green-200 p-3 rounded-xl">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-green-700 text-sm tracking-widest">
                          {v.vehicle_id}
                        </span>
                        <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">
                          Slot {v.slot_number}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Entry: {v.entry_time ? new Date(v.entry_time).toLocaleTimeString('en-IN') : '—'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Duration: {v.entry_time ? (() => {
                          const now = new Date();
                          const entry = new Date(v.entry_time);
                          const diff = Math.floor((now - entry) / 60000);
                          return `${diff} min`;
                        })() : '—'}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-orange-600 font-medium">
                          {v.fare_amount ? `Fare: ₹${parseFloat(v.fare_amount).toFixed(0)}` : 'Calculating...'}
                        </p>
                        {v.fare_amount && (
                          <button
                            onClick={() => openPaymentPage(v.vehicle_id)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs transition"
                          >
                            Pay Now
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent paid/completed sessions from /vehicles */}
            <div className="glass-card rounded-2xl md:rounded-3xl p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">
                Recent Bookings
              </h2>
              {recentBookings.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No completed sessions yet</p>
              ) : (
                <div className="space-y-2 md:space-y-3">
                  {recentBookings.map((v) => (
                    // FIX #2: use v.id as the unique key — v.id comes from the
                    // SELECT id field added to /vehicles in the Flask fix
                    <div key={v.id} className="bg-gray-100 p-2 md:p-3 rounded-xl">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-sm md:text-base tracking-widest">
                            {v.vehicle_id}
                          </p>
                          <p className="text-xs md:text-sm text-gray-500">
                            Slot {v.slot_number}
                            {v.duration_mins
                              ? ` · ${Math.round(v.duration_mins)} min`
                              : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600 text-sm md:text-base">
                            {v.fare_amount ? `₹${parseFloat(v.fare_amount).toFixed(0)}` : '—'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {v.payment_status === 'paid' ? '✅ paid' : '⏳ pending'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;