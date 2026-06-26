const User = require('../models/userModel');
const { createToken } = require('../utils/jwt');
const bcrypt = require('bcryptjs');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Never expose password in responses
        const userObj = user.toObject();
        const { password: _, ...publicUser } = userObj;
        
        const token = createToken({ userId: publicUser._id });

        res.status(200).json({ user: publicUser, token });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { login };
