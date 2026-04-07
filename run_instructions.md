# How to Run and Test Locally

Follow these sequential steps to test the Intern Desk full-stack application on your local machine.

## 1. Start the Backend Server (Database is Automatic!)
You no longer need to worry about starting a separate database! The backend will automatically create a local `database.sqlite` file and run `schema.sql` on its very first start.

1. Open a command prompt or terminal.
2. Navigate into the `server` directory:
   ```bash
   cd server
   ```
3. Install the dependencies (if you haven't already):
   ```bash
   npm install
   ```
4. Start the Node.js server:
   ```bash
   npm run dev
   ```
   *The console should print "Database initialized successfully" and "Server running on port 5000". Leave this terminal open.*

## 2. Start the Frontend Client
1. Open a **new** separate command prompt or terminal.
2. Navigate into the `client` directory:
   ```bash
   cd client
   ```
3. Install the frontend dependencies:
   ```bash
   npm install
   ```
4. Start the Vite React app:
   ```bash
   npm run dev
   ```
   *The console will provide a local URL, typically `http://localhost:5173`. Leave this terminal open.*

## 3. Test the Full-Stack Integration
1. Open your browser and go to the frontend URL (`http://localhost:5173`).
2. Click **Sign in** and test the login with the automatically injected demo credentials:
   - Intern: `intern@demo.com`
   - Mentor: `mentor@demo.com`
   - Manager: `manager@demo.com`
   - Password for all: `demo123`
3. Click **Sign up** to create a brand new account and select a role (Mentor/Intern/Manager). Once registered, verify the new user was added to your local `.sqlite` database using your VS Code SQLite Viewer!
