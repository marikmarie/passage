"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConnection = exports.pool = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const env_1 = require("./env");
// Create a connection pool to MySQL
exports.pool = promise_1.default.createPool({
    host: env_1.env.DB_HOST,
    user: env_1.env.DB_USER,
    password: env_1.env.DB_PASSWORD,
    database: env_1.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
const testConnection = async () => {
    try {
        const connection = await exports.pool.getConnection();
        console.log('✅ Successfully connected to MySQL Database');
        connection.release();
    }
    catch (error) {
        console.error('❌ Failed to connect to MySQL Database:', error);
        process.exit(1);
    }
};
exports.testConnection = testConnection;
//# sourceMappingURL=database.js.map