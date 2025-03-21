# Construction Scheduler

A web application for managing construction projects, work assignments, and scheduling.

## Project Overview

The Construction Scheduler application helps construction managers and workers coordinate their projects and tasks efficiently. The system includes user management with different roles and permissions.

## Features

- User authentication and authorization
- Role-based access control (Admin, Manager, User)
- User profile management
- Dashboard for task overview
- (Future) Task management and assignment
- (Future) Project scheduling and tracking

## Tech Stack

- **Frontend**: React
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **ORM**: Sequelize

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- npm or yarn
- PostgreSQL database

### Database Setup

1. Create a PostgreSQL database named `construction_scheduler`
2. Update the database credentials in `/server/.env` if needed

### Installation

1. Clone the repository
2. Install server dependencies:
   ```
   cd server
   npm install
   ```
3. Install client dependencies:
   ```
   cd ../client
   npm install
   ```

### Running the Application

1. Start the server:
   ```
   cd server
   npm run dev
   ```
2. Start the client:
   ```
   cd client
   npm start
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `/client` - React frontend application
- `/server` - Node.js backend API
- `/docs` - Project documentation

## License

[MIT License](LICENSE)