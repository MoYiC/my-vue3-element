const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: '600',
});

app.get('/api/cards', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [results] = await connection.query('SELECT * FROM cards');
        connection.release();
        res.json(results);
    } catch (error) {
        console.error('Error fetching cards:', error);
        res.status(500).send('Error fetching cards');
    }
});

app.get('/api/cards/:id', async (req, res) => {
    const cardId = req.params.id;
    try {
        const connection = await pool.getConnection();
        const [results] = await connection.query('SELECT * FROM cards WHERE id = ?', [cardId]);
        connection.release();
        res.json(results[0]);
    } catch (error) {
        console.error('Error fetching card:', error);
        res.status(500).send('Error fetching card');
    }
});

app.get('/api/password/:id', async (req, res) => {
    const cardId = req.params.id;
    try {
        const connection = await pool.getConnection();
        const [results] = await connection.query('SELECT password FROM cards WHERE id = ?', [cardId]);
        connection.release();
        res.json(results[0].password);
    } catch (error) {
        console.error('Error fetching password:', error);
        res.status(500).send('Error fetching password');
    }
});


app.get('/api/options', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [types] = await connection.query('SELECT DISTINCT type FROM cards');
        const [locations] = await connection.query('SELECT DISTINCT location FROM cards');
        const [times] = await connection.query('SELECT DISTINCT time FROM cards');
        const [recommends] = await connection.query('SELECT DISTINCT recommend FROM cards');
        connection.release();
        res.json({ types, locations, times, recommends });
    } catch (error) {
        console.error('Error fetching options:', error);
        res.status(500).send('Error fetching options');
    }
});



const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
