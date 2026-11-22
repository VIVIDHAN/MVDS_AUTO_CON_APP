const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {
  login: async (req, res) => {
    try {
      const { phone, password } = req.body;
      if (!phone || !password) {
        return res.status(400).json({ success: false, message: 'Please provide phone number and password.' });
      }

      const cleanPhone = phone.trim();
      const [rows] = await pool.query('SELECT * FROM users WHERE phone = ?', [cleanPhone]);

      if (rows.length === 0) {
        return res.status(401).json({ success: false, message: 'User not found with this phone number.' });
      }

      const user = rows[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Incorrect password.' });
      }

      const token = jwt.sign(
        { id: user.id, name: user.name, phone: user.phone, role: user.role },
        process.env.JWT_SECRET || 'mvds_super_secret_jwt_key_2026_mani_vehicles',
        { expiresIn: '30d' }
      );

      return res.json({
        success: true,
        message: 'Login successful.',
        token,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role
        }
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  getProfile: async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT id, name, phone, role, created_at FROM users WHERE id = ?', [req.user.id]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
      return res.json({ success: true, user: rows[0] });
    } catch (err) {
      console.error('Profile fetch error:', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
    }
  }
};

module.exports = authController;
