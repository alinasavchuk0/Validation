const express = require('express');
const mongoose = require('mongoose');
const Joi = require('joi');

const app = express();
app.use(express.json()); // Дозволяє приймати JSON у запитах

// --- 1. ПІДКЛЮЧЕННЯ ДО БД (Хмарна база для тестів) ---
const dbURI = 'mongodb://testUser:testPass123@ac-sh6vz7u-shard-00-00.mongodb.net:27017,ac-sh6vz7u-shard-00-01.mongodb.net:27017,ac-sh6vz7u-shard-00-02.mongodb.net:27017/testdb?ssl=true&replicaSet=atlas-13p5of-shard-0&authSource=admin&retryWrites=true&w=majority';

mongoose.connect(dbURI)
    .then(() => console.log('✅ Connected to MongoDB Atlas (Cloud)'))
    .catch(err => console.error('❌ Database connection error:', err));

// --- 2. МОДЕЛЬ ДАНИХ (Mongoose) ---
const User = mongoose.model('User', new mongoose.Schema({
    name: String,
    email: String,
    age: Number
}));

// --- 3. ФУНКЦІЯ ВАЛІДАЦІЇ (Joi) ---
function validateUser(user) {
    const schema = Joi.object({
        name: Joi.string().min(3).required().messages({
            'string.min': "Ім'я має бути мінімум 3 символи",
            'any.required': "Ім'я обов'язкове"
        }),
        email: Joi.string().email().required().messages({
            'string.email': "Некоректний формат email"
        }),
        age: Joi.number().min(18).required().messages({
            'number.min': "Тільки для дорослих (18+)"
        })
    });
    return schema.validate(user);
}

// --- 4. МАРШРУТ (Route) ---
app.post('/api/users', async (req, res) => {
    // А. Валідація вхідних даних
    const { error } = validateUser(req.body);
    if (error) {
        return res.status(400).send({ error: error.details[0].message });
    }

    try {
        // Б. Збереження в базу даних
        let user = new User({
            name: req.body.name,
            email: req.body.email,
            age: req.body.age
        });
        user = await user.save();
        
        res.status(201).send({
            status: "success",
            message: "Користувача збережено!",
            data: user
        });
    } catch (ex) {
        res.status(500).send("Помилка на сервері при збереженні.");
    }
});

// --- 5. ЗАПУСК СЕРВЕРА ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server started on http://localhost:${PORT}`);
    console.log(`💡 Send POST request to http://localhost:3000/api/users`);
});