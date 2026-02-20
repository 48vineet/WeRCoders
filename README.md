# WeRCoders

A real-time collaborative coding platform where developers can solve programming problems together with integrated video calls, live code execution, and chat functionality.

## 🚀 Features

- **Real-time Collaboration**: Multiple users can code together in the same session
- **1v1 Battle Mode**: Competitive coding challenges with countdown, timer, and instant winner determination
- **Video & Audio Calls**: Built-in video conferencing for pair programming and battles
- **Live Code Execution**: Run and test code directly in the browser using Piston API
- **Monaco Editor**: Professional code editor with syntax highlighting and IntelliSense
- **Chat Integration**: In-session messaging powered by Stream Chat
- **Problem Library**: Collection of coding problems with difficulty levels
- **Session Management**: Create, join, and manage collaborative coding sessions
- **Password-Protected Rooms**: Lock battle rooms with optional passwords for private matches
- **Countdown & Timer**: Battle countdown (3-2-1-Go) and elapsed time tracking
- **Authentication**: Secure user authentication with Clerk
- **Responsive UI**: Modern interface built with React and TailwindCSS

## 🛠️ Tech Stack

### Frontend

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **TailwindCSS + DaisyUI** - Styling
- **Monaco Editor** - Code editor
- **Stream Video SDK** - Video calling
- **Stream Chat** - Real-time messaging
- **Clerk** - Authentication
- **TanStack Query** - Data fetching and caching
- **React Router** - Navigation

### Backend

- **Node.js + Express** - Server framework
- **MongoDB + Mongoose** - Database
- **Clerk Express** - Authentication middleware
- **Stream SDK** - Video and chat server
- **Inngest** - Background job processing
- **CORS** - Cross-origin resource sharing

## 📋 Prerequisites

- Node.js 18.x or later
- MongoDB database
- Clerk account for authentication
- Stream account for video/chat functionality
- Inngest account for background jobs

## ⚙️ Installation

1. **Clone the repository**

```bash
git clone https://github.com/48vineet/MiniLeetCode.git
cd WeCode
```

2. **Install dependencies**

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. **Configure environment variables**

Create `.env` file in the `backend` folder:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# Database
MONGO_URI=your_mongodb_connection_string

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Stream (Video & Chat)
STREAM_API_KEY=your_stream_api_key
STREAM_SECRET_KEY=your_stream_secret_key

# Inngest
INNGEST_SIGNING_KEY=your_inngest_signing_key
```

Create `.env` file in the `frontend` folder:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_STREAM_API_KEY=your_stream_api_key
```

## 🚀 Running the Application

### Development Mode

**Backend:**

```bash
cd backend
npm run dev
```

Server runs on `http://localhost:5000`

**Frontend:**

```bash
cd frontend
npm run dev
```

Client runs on `http://localhost:5173`

### Production Mode

**Build and start:**

```bash
# Build both frontend and backend
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
WeCode/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── models/           # MongoDB schemas
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Custom middleware
│   │   ├── lib/              # Utilities (DB, Stream, Inngest)
│   │   └── server.js         # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── api/              # API client functions
│   │   ├── lib/              # Utilities
│   │   ├── data/             # Static data (problems)
│   │   └── App.jsx           # Root component
│   └── package.json
└── package.json              # Root package file
```

### Battle Winner Determination

- **Correct Submission**: First user to submit a solution that passes all test cases wins
- **Wrong Submission**: User who submits incorrect code loses immediately; opponent wins
- **Simultaneous Wrong**: If both submit incorrect solutions within 2 seconds, it's a draw
- **Disconnect**: User who disconnects forfeits; opponent wins

## 🎯 Key Features Explained

### Session Flow

1. User creates a new coding session selecting a problem
2. Host receives a shareable session link
3. Participants join via the link
4. All users see synchronized code editor
5. Video call and chat are active throughout
6. Code can be executed and results shared in real-time
7. Session ends when host terminates it

### Battle Mode Flow

1. User creates a 1v1 battle by selecting a problem (optionally password-protected)
2. Creator receives a shareable battle link
3. Opponent joins via link (enters password if locked)
4. Both users see the problem, code editor, video call, and chat
5. Users click "Ready" when prepared
6. When both are ready, a 3-2-1-Go countdown begins
7. Timer starts; users can "Run" code (sample tests) or "Submit" (full tests)
8. First correct submission wins; incorrect submission loses immediately
9. Both users see win/loss popup and can return to lobby

### Code Execution

- Powered by Piston API for running code in multiple languages
- Supports real-time output display
- Error handling and execution feedback

### Video Calling

- Stream Video SDK integration
- Screen sharing capabilities
- Audio/video controls
- Participant management

## 🔑 API Endpoints

### Session Routes

- `POST /api/session/create` - Create new session
- `POST /api/session/:id/join` - Join existing session
- `POST /api/session/:id/end` - End session
- `GET /api/session/:id` - Get session details
- `GET /api/session/active` - Get active sessions
- `GET /api/session/recent` - Get recent sessions

### Battle Routes

- `POST /api/battle/create` - Create new battle
- `GET /api/battle/active` - Get active battles
- `GET /api/battle/:roomId` - Get battle details
- `POST /api/battle/join/:roomId` - Join battle (with optional password)
- `POST /api/battle/:roomId/ready` - Set ready status
- `POST /api/battle/:roomId/run` - Run code against sample tests
- `POST /api/battle/:roomId/submit` - Submit final solution
- `POST /api/battle/:roomId/leave` - Leave/forfeit battle

### Chat Routes

- `POST /api/chat/token` - Generate Stream chat token
- `GET /api/chat/channel/:sessionId` - Get channel info

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👤 Author

**48vineet**

- GitHub: [@48vineet](https://github.com/48vineet)
- Repository: [WeRCoders](https://github.com/48vineet/WeRCoders)

## 🙏 Acknowledgements

- [Stream](https://getstream.io/) for video and chat infrastructure
- [Clerk](https://clerk.com/) for authentication
- [Piston](https://github.com/engineer-man/piston) for code execution
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the code editor
