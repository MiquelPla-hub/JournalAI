# JournalAI - Mental Health Dashboard

A full-stack application for mental health tracking and analysis, built with React, TypeScript, and Flask.

## Tech Stack

- Frontend: React + TypeScript + Vite
- Backend: Python + Flask
- Database: MySQL
- WebSocket: Socket.IO
- UI Components: Radix UI
- Styling: Tailwind CSS

## Development Setup

### Frontend
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend
```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Start development server
flask run
```

## Deployment Instructions

### Backend Deployment (Python/Flask)

1. **Environment Setup**:
   ```bash
   # Create a new virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r backend/requirements.txt
   ```

2. **Environment Variables**:
   Create a `.env` file in the backend directory with necessary environment variables:
   ```
   FLASK_APP=app.py
   FLASK_ENV=production
   DATABASE_URL=your_database_url
   GROQ_API_KEY=your_groq_api_key
   ```

3. **Database Setup**:
   - Ensure your database is properly configured
   - Run any necessary migrations

4. **Running the Server**:
   ```bash
   # Using Gunicorn (recommended for production)
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"
   ```

### Frontend Deployment (React/Vite)

1. **Build the Application**:
   ```bash
   # Install dependencies
   npm install
   
   # Build the application
   npm run build
   ```

2. **Environment Configuration**:
   Create a `.env.production` file in the root directory:
   ```
   VITE_API_URL=http://your-backend-url:5000
   ```

3. **Serving the Application**:
   You have several options:

   a. **Using a Static File Server**:
   ```bash
   # Install serve
   npm install -g serve
   
   # Serve the built files
   serve -s dist
   ```

   b. **Using Nginx**:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           root /path/to/your/dist;
           try_files $uri $uri/ /index.html;
       }
       
       location /api {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

### Combined Deployment (Recommended)

For a production setup, use Nginx as a reverse proxy to serve both the frontend and backend:

1. **Nginx Configuration**:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       # Frontend
       location / {
           root /path/to/your/dist;
           try_files $uri $uri/ /index.html;
       }
       
       # Backend API
       location /api {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
       
       # WebSocket support
       location /socket.io {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
       }
   }
   ```

2. **Process Management**:
   Use PM2 to manage your Node.js and Python processes:
   ```bash
   # Install PM2
   npm install -g pm2
   
   # Start the backend
   pm2 start "gunicorn -w 4 -b 0.0.0.0:5000 'app:create_app()'" --name "backend"
   
   # Start the frontend server
   pm2 start "serve -s dist" --name "frontend"
   
   # Save the process list
   pm2 save
   
   # Set up PM2 to start on system boot
   pm2 startup
   ```

### Deployment Checklist

1. **Before Deployment**:
   - [ ] Test the application locally
   - [ ] Set up proper environment variables
   - [ ] Configure your database
   - [ ] Set up SSL certificates (if using HTTPS)

2. **During Deployment**:
   - [ ] Build the frontend application
   - [ ] Set up the backend server
   - [ ] Configure Nginx
   - [ ] Set up process management

3. **After Deployment**:
   - [ ] Test all API endpoints
   - [ ] Verify WebSocket connections
   - [ ] Check error logging

## ESLint Configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
