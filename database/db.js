const mysql = require('mysql2/promise');
require('dotenv').config();

//Conexão com o banco de dados
const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    database: process.env.DB_NAME || "videostreaming",
    password: process.env.DB_PASSWORD || "admin",
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function testConnection() {
    try {
        // Use getConnection() instead of connect()
        const connection = await pool.getConnection();
        
        // Perform a simple query
        const [rows] = await connection.query('SELECT 1');
        console.log('MySQL database connection successful');
        
        // Always release the connection back to the pool
        connection.release();
    } catch (err) {
        console.error('MySQL connection error:', err);
        console.error('Possible issues:');
        console.error('1. MySQL service is not running');
        console.error('2. Incorrect connection details');
        console.error('3. Database does not exist');
        console.error('4. Firewall blocking connection');
        console.error('5. Incorrect password or user permissions');
    }
}

//Função para migrar o banco de dados
// Migration function
async function migrate() {
    let connection;
    try {
        // Get a connection from the pool
        connection = await pool.getConnection();
        
        // Create videos table if not exists
        await connection.query(`
            CREATE TABLE IF NOT EXISTS videos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                file_path VARCHAR(255) NOT NULL,
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Database migration completed successfully');
    } catch (err) {
        console.error('Database migration failed', err);
    } finally {
        // Always release the connection
        if (connection) connection.release();
    }
}

/**
 * Upload a video to the database.
 * @param {string} title - The title of the video
 * @param {string} description - The description of the video
 * @param {string} filePath - The path to the video file
 * @returns {number} - The ID of the newly inserted video
 * @throws {Error} - If the upload fails
 */
async function uploadVideo(title, description, filePath) {
    let connection;
    try {
        connection = await pool.getConnection();
        const [result] = await connection.query(
            'INSERT INTO videos(title, description, file_path) VALUES(?, ?, ?)',
            [title, description, filePath]
        );
        return result.insertId;
    } catch (error) {
        console.error('Error uploading video:', error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
}

/**
 * Retrieve a list of all uploaded videos from the database.
 * @returns {Promise<[RowDataPacket[]]>} - A promise that resolves to an array of video objects. Each video object contains the properties: id, title, description, filePath and uploadedAt.
 * @throws {Error} - If the query fails.
 */
async function getVideos() {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT id, title, description, file_path, uploaded_at FROM videos ORDER BY uploaded_at DESC');
        return rows;
    } catch (error) {
        console.error('Error getting videos:', error);
        throw error;
    }finally{
        if (connection) connection.release();
    }
}

if (require.main === module) {
    testConnection()
        .then(() => migrate())
        .then(() => pool.end())
        .catch(console.error);
}

module.exports = {
    pool,
    migrate,
    testConnection,
    uploadVideo,
    getVideos
};