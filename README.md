# 🏋️‍♂️Personal Trainer Website & Fitness Tracker

## 💻 About The Project 

This project consists of a professional personal trainer website with an integrated fitness tracking system. The website serves as a platform for trainers to showcase their services and for clients to track their fitness progress.

Live demo: [www.yagutkinfitness.ee]

Test account for fitness tracker:
- Email: test@test.ee
- Password: Parool1

## 🏆Features

- 📱 Responsive design for all devices
- 🌐 Multilingual support (Estonian and Russian)
- 📊 Comprehensive fitness tracking system
- 📅 Integration with Google Calendar for booking
- 💪 Progress monitoring and analytics
- 🔒 Secure authentication system
- 📈 Body measurements and strength tracking
- 🍎 Calorie intake monitoring

## 🔌Built With 

- 📌 Node.js
- 📌 Express.js
- 📌 PostgreSQL
- 📌 EJS
- 📌 Bootstrap
- 📌 Chart.js
- 📌 Google Calendar API

## 💣Prerequisites 

🔩 Before you begin, ensure you have installed:
- 📌 Node.js (v14 or higher)
- 📌 npm (comes with Node.js)
- 📌 PostgreSQL (v13 or higher)

## ⚙️Installation

1. Clone the repository
   `git clone https://github.com/Artjomeller/Personaalnetreener.git`

2. Navigate to the project directory
   `cd Personaalnetreener`

3. Install NPM packages
   `npm install`

4. Create a .env file in the root directory and add the following variables:
- `DB_HOST=your_database_host`
- `DB_USER=your_database_user`
- `DB_PASSWORD=your_database_password`
- `DB_DATABASE=your_database_name`
- `SECRET_KEY=your_jwt_secret_key`
- `GOOGLE_API_KEY=your_google_api_key`

5. Set up the PostgreSQL database:
- Create a new database
- Import the schema from database/schema.sql
- Run migrations if any: `npm run migrate`


6. Start the development server
   `npm start`

The application should now be running on http://localhost:3000

## 💾Database Setup
- Create a new PostgreSQL database
- Run the following commands in PostgreSQL:
  `CREATE DATABASE personaalnetreener;`
  `\c personaalnetreener`

- Import the database schema:
  `psql -U your_username -d personaalnetreener -f database/schema.sql`


### 🙋‍♂️Contributing

- Fork the Project
- Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
- Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
- Push to the Branch (`git push origin feature/AmazingFeature`)
- Open a Pull Request

### 🙋‍♂️Issues and Bug Reports
If you find any bugs or have feature suggestions, please create an issue in the GitHub repository.

### 🙋‍♂️License
Distributed under the MIT License. See **LICENSE** for more information.

### 🙋‍♂️Contact
- [www.linkedin.com/in/artjom-eller]