const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// PostgreSQL connection
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'ticket_booking',
    password: '1234', // Replace with your PostgreSQL password
    port: 5432,
});

// Routes

// Get all seats
app.get('/seats', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM seats ORDER BY seat_number');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving seats');
    }
});

// Book seats
app.post('/book', async (req, res) => {
    const { seatNumbers } = req.body; // Array of seat numbers to book
    try {
        await pool.query('BEGIN');
        for (const seatNumber of seatNumbers) {
            await pool.query(
                'UPDATE seats SET status = $1 WHERE seat_number = $2 AND status = $3',
                ['booked', seatNumber, 'available']
            );
        }
        await pool.query('COMMIT');
        res.send('Seats booked successfully');
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error(error);
        res.status(500).send('Error booking seats');
    }
});

// Reset seats
app.post('/reset', async (req, res) => {
    try {
        await pool.query('UPDATE seats SET status = $1', ['available']);
        res.send('Seats reset successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error resetting seats');
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
