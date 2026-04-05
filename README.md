# 🚗 IoT Smart Parking System

A full-stack, end-to-end smart parking solution that combines IoT sensor hardware, 
mobile-based computer vision, a live web dashboard, and automated payment collection 
— built for real-world scalability and modular deployment.

---

## 📌 Overview

Traditional parking systems are manual, inefficient, and prone to congestion. This 
project addresses that by automating slot detection, vehicle identification, booking 
management, and fee collection — all in real time.

The system uses **ESP32 microcontrollers** paired with **ultrasonic/IR sensors** to 
detect slot occupancy, a **mobile phone IP camera + built-in ML model** for number 
plate recognition, a **live web dashboard** for monitoring and booking, and 
**Razorpay** for seamless payment processing.

---

## ✨ Features

- 🔍 **Real-time slot detection** via ultrasonic/IR sensors on ESP32
- 📱 **Mobile IP camera stream** for live vehicle feed at entry/exit
- 🤖 **Automatic Number Plate Recognition (ANPR)** using a built-in ML model
- 🖥️ **Live web dashboard** with slot availability, booking status & analytics
- 💳 **Automated fee collection** via Razorpay payment gateway
- 📡 **Wireless data transmission** from ESP32 to backend over Wi-Fi
- 📊 **Analytics panel** for occupancy trends and revenue tracking
- 🧩 **Modular architecture** — each component is independently deployable

---

## 🏗️ System Architecture
[ IR Sensors ]
|
[ ESP32 MCU ]  ──── Wi-Fi ────►  [ Backend Server ]
|
[ Mobile Phone (IP Webcam) ] ──────► [ ANPR ML Pipeline ]
|                                   |
IP Stream URL                     [ Web Dashboard ]
|
[ Booking & Payment ]
|
[ Razorpay Gateway ]
### Component Breakdown

| Layer | Technology |
|---|---|
| Sensor Firmware | ESP32, Ultrasonic / IR Sensors, Arduino C++ |
| Camera Input | Mobile Phone via IP Webcam App |
| Number Plate Recognition | Python, OpenCV, Built-in ML Model |
| Backend | Python (Flask / FastAPI) or Node.js |
| Frontend Dashboard | HTML / CSS / JS (or React) |
| Payment | Razorpay Payment Gateway API |
| Communication | HTTP / WebSocket over Wi-Fi |

---

## 🔧 Hardware Requirements

| Component | Purpose |
|---|---|
| ESP32 Microcontroller | Central MCU for sensor interfacing & Wi-Fi |
| Ultrasonic Sensor (HC-SR04) / IR Sensor | Slot occupancy detection per parking slot |
| Mobile Phone | Live vehicle feed via IP Webcam app |
| Power Supply (5V / 3.3V) | Powering ESP32 and sensors |
| Jumper Wires & Breadboard | Circuit prototyping |
| Local Wi-Fi Network | Communication between all components |

### Circuit Overview
- Each parking slot has one ultrasonic/IR sensor connected to a GPIO pin on the ESP32.
- Sensor readings are polled at regular intervals and transmitted to the backend via Wi-Fi.
- The mobile phone is mounted at the entry/exit point and streams video over the local network.

---

## 📱 Mobile Camera Setup (IP Webcam)

1. Install the **IP Webcam** app on your Android phone (available on Play Store).
2. Open the app and tap **"Start Server"**.
3. Note the IP address displayed on screen (e.g., `http://192.168.1.5:8080`).
4. Use the stream URL in the backend:
```python
# Stream URL format
stream_url = "http://<phone-ip>:8080/video"

import cv2
cap = cv2.VideoCapture(stream_url)
```

5. Ensure the phone and the backend machine are on the **same Wi-Fi network**.
6. Mount the phone at the **entry/exit point** with a clear view of number plates.

---

## 🤖 Number Plate Recognition (ANPR)

- Live frames are captured from the mobile IP stream using **OpenCV**.
- Each frame is passed through a **built-in ML model** that handles:
  - Vehicle and number plate **detection** (locating the plate region)
  - **Character recognition** (reading alphanumeric plate text)
- The recognized plate number is:
  - Logged with a timestamp in the database
  - Matched against active bookings
  - Used to trigger the payment flow on vehicle exit
```python
# Example ANPR pipeline (simplified)
import cv2

cap = cv2.VideoCapture("http://<phone-ip>:8080/video")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    plate_text = ml_model.predict(frame)   # Built-in ML model inference
    if plate_text:
        print(f"Detected Plate: {plate_text}")
        # Match with booking DB and trigger payment
```

---

## 💻 Software Requirements

- Python 3.8+
- OpenCV (`cv2`)
- ESP32 Arduino Core (via Arduino IDE)
- Backend framework — Flask / FastAPI / Node.js
- Razorpay Python/Node SDK
- IP Webcam App (Android)
- A modern browser for the dashboard

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/smart-parking-iot.git
cd smart-parking-iot
```

### 2. Flash the ESP32 Firmware

- Open `firmware/smart_parking.ino` in **Arduino IDE**
- Install the **ESP32 board package** and required libraries:
  - `WiFi.h`, `HTTPClient.h`
- Update credentials in `config.h`:
```cpp
#define WIFI_SSID      "your_wifi_ssid"
#define WIFI_PASSWORD  "your_wifi_password"
#define SERVER_URL     "http://your-server-ip:5000"
```

- Flash to the ESP32

### 3. Set Up the ANPR Pipeline
```bash
cd cv_pipeline
pip install -r requirements.txt
# Update the IP stream URL in config
python anpr.py
```

### 4. Set Up the Backend
```bash
cd backend
pip install -r requirements.txt   # or: npm install
cp .env.example .env
# Fill in your Razorpay Key ID, Secret, and DB config in .env
python app.py   # or: node server.js
```

### 5. Launch the Dashboard

Open `dashboard/index.html` directly in a browser, or if using a dev server:
```bash
cd dashboard
npm install && npm start
```

---

## 🌐 Dashboard Features

- **Live slot grid** — color-coded availability (🟢 free / 🔴 occupied)
- **Booking panel** — reserve a slot with entry/exit time
- **ANPR log** — verified number plates with timestamps
- **Analytics** — occupancy rate, peak hours, revenue charts
- **Payment status** — real-time Razorpay transaction tracking

---

## 💳 Payment Flow
Vehicle arrives
│
▼
Mobile camera captures number plate
│
▼
ML model reads plate → matched to booking
│
▼
Vehicle parks → ESP32 marks slot as occupied
│
▼
Vehicle exits → duration calculated → fee computed
│
▼
Razorpay payment link / QR generated
│
▼
Payment confirmed → slot freed → exit logged
---

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend/` directory:
```env
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
MOBILE_STREAM_URL=http://192.168.1.5:8080/video
DATABASE_URL=sqlite:///parking.db
SERVER_PORT=5000
```

---

## 📈 Future Improvements

- [ ] Mobile app (Android/iOS) for remote slot booking
- [ ] Replace IP Webcam with a dedicated ESP32-CAM module
- [ ] ML-based occupancy prediction for peak hours
- [ ] Multi-floor / multi-zone parking support
- [ ] Google Maps integration for navigation to free slots
- [ ] SMS / email notifications on booking confirmation
- [ ] EV charging slot management

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss 
what you'd like to change.

