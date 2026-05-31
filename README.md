# 🏭 Industrial Maintenance Management System

> **End-of-Studies Project (PFE)** - Full-stack web application for industrial maintenance tracking and KPI analysis using DMAIC methodology

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://maintenance-elmazraa.netlify.app)
[![Backend](https://img.shields.io/badge/backend-render-blue)](https://maintenance-dashboard-oqea.onrender.com)
[![License](https://img.shields.io/badge/license-MIT-green)]()

---

## 📋 Project Overview

A comprehensive **industrial maintenance dashboard** designed for **El Mazraa** to monitor equipment performance, track breakdowns, and optimize maintenance operations through data-driven insights. Built with modern web technologies and deployed on cloud platforms.

### 🎯 Key Objectives
- **Real-time KPI monitoring** (MTTR, MTBF, TRS)
- **Predictive maintenance** through trend analysis
- **Automated reporting** (PDF/Excel exports)
- **Role-based access control** for team collaboration
- **Data-driven decision making** using DMAIC methodology

---

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication with secure password hashing (Bcrypt)
- Role-based access control (Admin, Supervisor, Technician)
- Protected routes and API endpoints

### 📊 Dashboard & Analytics
- **Interactive KPI cards** with real-time calculations
- **Dynamic charts** (Chart.js) for visual insights
- **Trend analysis** comparing performance across time periods
- **Color-coded alerts** (green/orange/red) based on target thresholds

### 🔧 Maintenance Management
- **Machine inventory** with detailed specifications
- **Breakdown tracking** with duration and cost analysis
- **Corrective actions** workflow (planned → in progress → completed)
- **Excel import/export** for bulk data operations

### 📈 KPI Tracking
- **MTTR** (Mean Time To Repair) - Average repair duration
- **MTBF** (Mean Time Between Failures) - Equipment reliability
- **TRS** (Overall Equipment Effectiveness) - Production efficiency
- **Breakdown rate** - Frequency analysis
- **Target vs. Actual** comparison with deviation percentages

### 👥 User Management
- Multi-user support with role assignment
- User activity tracking
- Profile management

### 📄 Reporting
- **PDF reports** with professional formatting and logo
- **Excel exports** with multiple sheets (KPI, machines, breakdowns)
- **Automated recommendations** based on performance data

---

## 🛠️ Tech Stack

### Frontend
- **React.js 18** - Modern UI library
- **CoreUI** - Professional admin template
- **Chart.js** - Interactive data visualization
- **Axios** - HTTP client
- **React Router** - Client-side routing
- **Vite** - Fast build tool

### Backend
- **Python 3.11** - Core language
- **Flask** - Lightweight web framework
- **SQLAlchemy** - ORM for database operations
- **Flask-JWT-Extended** - JWT authentication
- **Flask-Bcrypt** - Password hashing
- **Pandas** - Data processing for Excel imports
- **ReportLab** - PDF generation

### Database
- **PostgreSQL** (Production - Render)
- **MySQL** (Development - XAMPP)

### Deployment
- **Frontend**: Netlify (CDN + automatic deployments)
- **Backend**: Render (free tier with auto-scaling)
- **Version Control**: GitHub

---

## 🚀 Live Demo

- **Frontend**: [https://maintenance-elmazraa.netlify.app](https://maintenance-elmazraa.netlify.app)
- **Backend API**: [https://maintenance-dashboard-oqea.onrender.com](https://maintenance-dashboard-oqea.onrender.com)

### Test Credentials
```
Email: admin@elmazraa.com
Password: admin123
Role: Administrator
```

---

## 📸 Screenshots

### Dashboard
![Dashboard](https://via.placeholder.com/800x400?text=Dashboard+Screenshot)

### KPI Evolution
![KPI Evolution](https://via.placeholder.com/800x400?text=KPI+Evolution+Screenshot)

### Machine Management
![Machines](https://via.placeholder.com/800x400?text=Machine+Management+Screenshot)

---

## 🏗️ Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  React Frontend │◄───────►│  Flask Backend  │◄───────►│   PostgreSQL    │
│   (Netlify)     │  REST   │    (Render)     │   ORM   │   (Render)      │
│                 │   API   │                 │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

### API Endpoints
```
Authentication:
POST   /api/auth/register      - User registration
POST   /api/auth/login         - User login
GET    /api/auth/me            - Get current user

Machines:
GET    /api/machines           - List all machines
GET    /api/machines/:id       - Get machine details

Breakdowns:
GET    /api/pannes             - List all breakdowns
POST   /api/upload             - Import Excel data

KPIs:
GET    /api/kpi                - Get current KPIs
GET    /api/stats/evolution-kpi - Get KPI trends

Actions:
GET    /api/actions-correctives - List corrective actions
POST   /api/actions-correctives - Create new action
PUT    /api/actions-correctives/:id - Update action

Reports:
GET    /api/reports/pdf        - Generate PDF report
GET    /api/reports/excel      - Generate Excel report
```

---

## 💻 Local Development

### Prerequisites
- Node.js 20+
- Python 3.11+
- MySQL (XAMPP) or PostgreSQL

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python init_db.py
python app.py
```
Backend runs on `http://localhost:5000`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:3000`

---

## 🌐 Deployment Guide

### Backend (Render)
1. Create PostgreSQL database on Render
2. Create Web Service from GitHub repository
3. Configure environment variables:
   ```
   DATABASE_URL=<postgres-connection-string>
   SECRET_KEY=<random-secret-key>
   ```
4. Deploy with:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app`

### Frontend (Netlify)
1. Connect GitHub repository
2. Configure build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
3. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```

---

## 📊 Project Metrics

- **15+ React components** with reusable architecture
- **20+ API endpoints** with full CRUD operations
- **5 database tables** with relational integrity
- **3 user roles** with granular permissions
- **100% responsive design** (mobile, tablet, desktop)
- **Zero-downtime deployment** with automatic CI/CD

---

## 🎓 Learning Outcomes

### Technical Skills
- Full-stack development (React + Flask)
- RESTful API design and implementation
- Database modeling and optimization
- Authentication and authorization (JWT)
- Cloud deployment (Netlify, Render)
- Version control with Git/GitHub

### Soft Skills
- Project planning and time management
- Problem-solving and debugging
- Technical documentation
- Agile methodology (DMAIC)

---

## 🔮 Future Enhancements

- [ ] Real-time notifications (WebSocket)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics (ML predictions)
- [ ] Multi-language support (i18n)
- [ ] Dark mode theme
- [ ] Email notifications for critical alerts
- [ ] Integration with IoT sensors

---

## 👨‍💻 Author

**Mohamed Amine Ayari**
- GitHub: [@hamayari](https://github.com/hamayari)

---

## 📄 License

This project is part of an End-of-Studies Project (PFE) for **El Mazraa**.

---

## 🙏 Acknowledgments

- **El Mazraa** for the project opportunity
- **CoreUI** for the admin template
- **Chart.js** for visualization library
- **Render & Netlify** for free hosting

---

<div align="center">

**⭐ Star this repo if you find it useful!**

Made with ❤️ for industrial maintenance optimization

</div>
