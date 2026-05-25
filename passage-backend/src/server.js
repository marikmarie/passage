"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = require("./config/app");
const database_1 = require("./config/database");
const env_1 = require("./config/env");
const socket_io_1 = require("socket.io");
const startServer = async () => {
    // Test Database Connection
    await (0, database_1.testConnection)();
    const app = (0, app_1.createApp)();
    const server = http_1.default.createServer(app);
    // Setup Socket.IO
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });
    io.on('connection', (socket) => {
        console.log(`🔌 New client connected: ${socket.id}`);
        socket.on('disconnect', () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);
        });
    });
    server.listen(env_1.env.PORT, () => {
        console.log(`🚀 Server running on port ${env_1.env.PORT}`);
        console.log(`🌐 Admin Dashboard available at http://localhost:${env_1.env.PORT}/admin`);
    });
};
startServer();
//# sourceMappingURL=server.js.map