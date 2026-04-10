# QuickChat

A full-stack real-time messaging platform built with the MERN stack, WebSockets, and WebRTC. Supports live chat, voice calls, video calls, and online presence — designed with horizontal scalability in mind using Redis Pub/Sub.

🔴 **[Live Demo](https://quick-chat-eight-eta.vercel.app)** &nbsp;|&nbsp; ⌥ **[GitHub](https://github.com/enayat-enoo/Quickchat)**

---

![QuickChat Screenshot](https://quick-chat-eight-eta.vercel.app/preview.png)

---

## What it does

- **Real-time messaging** — messages delivered instantly via Socket.IO with optimistic UI so the sender never waits
- **Voice & video calls** — peer-to-peer calls using WebRTC with full ICE/STUN negotiation, screen sharing, and mid-call audio/video toggle
- **Online presence** — live online/offline status with last-seen timestamps, updated in real time across all connected clients
- **Unread badge tracking** — per-user unread message counts stored at the chat level, not just the message level
- **Avatar upload** — profile pictures stored on Cloudinary with server-side file type and size validation
- **JWT authentication** — stateless auth via httpOnly cookies (not localStorage), extended to the WebSocket handshake so socket connections are also authenticated

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Redux Toolkit, Tailwind CSS, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Real-time | Socket.IO |
| Peer-to-peer | WebRTC (native browser API) |
| Media storage | Cloudinary |
| Auth | JWT, httpOnly cookies |
| Scalability layer | Redis Pub/Sub (Socket.IO Redis adapter) |

---

## Architecture

The core architecture decision in this project was designing the messaging layer to support horizontal scaling from day one — meaning the app can run across multiple Node.js processes without messages getting lost.

### The problem with a single-node Socket.IO server

In a standard Socket.IO setup, each server instance keeps its own in-memory map of connected socket IDs. If you scale to two server instances behind a load balancer, a message sent through Instance A has no way to reach a user connected to Instance B — they live in completely separate memory spaces.

### How Redis Pub/Sub solves it

```
Client A (Instance 1)          Client B (Instance 2)
       │                               │
       ▼                               ▼
  [Node.js #1] ──── publish ────▶ [Redis] ──── subscribe ────▶ [Node.js #2]
       │                                                              │
  socket.emit()                                               socket.emit()
```

When a message arrives at Instance 1, instead of broadcasting directly to in-memory sockets, it publishes to a Redis channel. Every other Node.js instance is subscribed to that channel and forwards the message to its own connected clients. The sender's instance doesn't need to know which server the receiver is on.

This is implemented using `@socket.io/redis-adapter`. The research behind this — benchmarking Redis Pub/Sub against direct WebSocket broadcasting across 3-node clusters — formed the core of my M.Tech thesis at RGPV University, where I measured approximately 40% latency reduction and tested up to 10,000 concurrent connections.

---

## Running locally

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Redis (local or a free Redis Cloud instance)
- A Cloudinary account (free tier is fine)

### 1. Clone the repo

```bash
git clone https://github.com/enayat-enoo/Quickchat.git
cd Quickchat
```

### 2. Set up the server

```bash
cd server
npm install
```

Create a `.env` file in the `server/` folder:

```env
PORT=8000
DB_URL=mongodb://localhost:27017/quickchat
SECRET_KEY=your_minimum_32_char_random_string_here
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
REDIS_URL=redis://localhost:6379
SALT_ROUNDS=10
```

Generate a secure `SECRET_KEY`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Start the server:
```bash
npm run dev
```

### 3. Set up the client

```bash
cd ../client
npm install
```

Create a `.env` file in the `client/` folder:

```env
VITE_API_URL=http://localhost:8000
```

Start the client:
```bash
npm run dev
```

The app will be running at `http://localhost:5173`.

---

## Project structure

```
QuickChat/
├── client/                   # React frontend
│   └── src/
│       ├── components/       # Reusable UI components
│       ├── context/          # Auth, Socket, Call contexts
│       ├── hooks/            # Custom hooks (useWebRTC, useCallListeners)
│       ├── pages/            # ChatPage, HomePage, Login, Register
│       └── store/            # Redux slices (chat, message, user)
│
└── server/                   # Express backend
    └── src/
        ├── config/           # DB, Cloudinary, Multer setup
        ├── controllers/      # Auth, message, user controllers
        ├── middleware/        # Auth, socket auth, validation
        ├── models/           # User, Message, Chat schemas
        ├── routes/           # API route definitions
        ├── sockets/          # Chat and call socket handlers
        └── utils/            # Token generation, password hashing
```

---

## Key technical decisions

**Why httpOnly cookies instead of localStorage for auth?**
Tokens stored in localStorage are accessible to any JavaScript running on the page — meaning an XSS attack can steal them silently. httpOnly cookies are completely inaccessible to JavaScript and can only be sent by the browser itself. The same token is passed to the Socket.IO handshake via the cookie header, so WebSocket connections are authenticated the same way as HTTP requests.

**Why WebRTC for calls instead of a media server?**
A media server (like Mediasoup or Janus) routes all media through a central server, which adds latency and infrastructure cost. WebRTC is peer-to-peer — once the connection is established via the signalling server, media travels directly between the two browsers. For a one-to-one call this is always the better choice. The tradeoff is that it requires ICE/STUN/TURN negotiation, which is what `callSocket.js` handles.

**Why Redux Toolkit instead of just Context?**
The chat list, active chat, and online status need to be read and updated from multiple unrelated components simultaneously — the sidebar, the chat header, and the socket event handlers. Context re-renders the entire subtree on every update. Redux gives fine-grained selector subscriptions so only the components that actually use a specific piece of state re-render.

---

## What I'd add with more time

- Message pagination (cursor-based, load older messages on scroll-up)
- Read receipts with double-tick indicator
- Push notifications for messages received while the tab is in the background
- Group chats
- Message reactions

---

## Author

**Md Enayat Ansari** — M.Tech Computer Science, RGPV University

[GitHub](https://github.com/enayat-enoo) · [LinkedIn](https://www.linkedin.com/in/md-enayat-ansari-856667228) · [enayatansari33@gmail.com](mailto:enayatansari33@gmail.com)