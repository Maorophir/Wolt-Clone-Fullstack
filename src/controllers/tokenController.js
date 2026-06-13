const userModel = require('../models/userModel');
const { createToken } = require('../utils/jwt');

const login = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = userModel.getUserByUsername(username);
    if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Never expose password in responses
    const { password: _, ...publicUser } = user;
    
    const token = createToken({ userId: publicUser.id });

    res.status(200).json({ user: publicUser, token });
};

module.exports = { login };
