const pool = require('../config/db');

const customerController = {
  getAll: async (req, res) => {
    try {
      const { q } = req.query;
      let sql = `
        SELECT 
          c.*,
          COUNT(DISTINCT v.id) as total_vehicles_purchased,
          COUNT(DISTINCT s.id) as total_services
        FROM customers c
        LEFT JOIN vehicles v ON v.customer_id = c.id AND v.status = 'SOLD'
        LEFT JOIN services s ON s.customer_id = c.id
        WHERE 1=1
      `;
      const params = [];

      if (q && q.trim()) {
        const term = `%${q.trim()}%`;
        sql += ' AND (c.name LIKE ? OR c.phone LIKE ? OR c.email LIKE ? OR c.address LIKE ?)';
        params.push(term, term, term, term);
      }

      sql += ' GROUP BY c.id ORDER BY c.name ASC';

      const [rows] = await pool.query(sql, params);
      return res.json({ success: true, customers: rows });
    } catch (err) {
      console.error('Fetch customers error:', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve customers.' });
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const [customers] = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);
      if (customers.length === 0) {
        return res.status(404).json({ success: false, message: 'Customer not found.' });
      }

      const customer = customers[0];

      const [vehicles] = await pool.query(`
        SELECT id, vehicle_name, brand, registration_number, vehicle_type, selling_price, date_sold, status 
        FROM vehicles 
        WHERE customer_id = ?
        ORDER BY date_sold DESC
      `, [id]);

      const [services] = await pool.query(`
        SELECT s.*, v.vehicle_name, v.registration_number 
        FROM services s
        LEFT JOIN vehicles v ON s.vehicle_id = v.id
        WHERE s.customer_id = ?
        ORDER BY s.service_date DESC
      `, [id]);

      customer.vehicles = vehicles;
      customer.services = services;

      return res.json({ success: true, customer });
    } catch (err) {
      console.error('Fetch customer detail error:', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve customer details.' });
    }
  },

  create: async (req, res) => {
    try {
      const { name, phone, email, address } = req.body;
      if (!name || !phone) {
        return res.status(400).json({ success: false, message: 'Customer name and phone number are required.' });
      }

      const [result] = await pool.query(
        'INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)',
        [name.trim(), phone.trim(), email ? email.trim() : null, address ? address.trim() : null]
      );

      const [newRow] = await pool.query('SELECT * FROM customers WHERE id = ?', [result.insertId]);

      return res.status(201).json({
        success: true,
        message: 'Customer added successfully.',
        customer: newRow[0]
      });
    } catch (err) {
      console.error('Create customer error:', err);
      return res.status(500).json({ success: false, message: 'Failed to create customer.' });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, phone, email, address } = req.body;

      const [existing] = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ success: false, message: 'Customer not found.' });
      }

      await pool.query(
        'UPDATE customers SET name = ?, phone = ?, email = ?, address = ? WHERE id = ?',
        [
          name !== undefined ? name.trim() : existing[0].name,
          phone !== undefined ? phone.trim() : existing[0].phone,
          email !== undefined ? email.trim() : existing[0].email,
          address !== undefined ? address.trim() : existing[0].address,
          id
        ]
      );

      const [updated] = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);

      return res.json({
        success: true,
        message: 'Customer updated successfully.',
        customer: updated[0]
      });
    } catch (err) {
      console.error('Update customer error:', err);
      return res.status(500).json({ success: false, message: 'Failed to update customer.' });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM customers WHERE id = ?', [id]);
      return res.json({ success: true, message: 'Customer deleted successfully.' });
    } catch (err) {
      console.error('Delete customer error:', err);
      return res.status(500).json({ success: false, message: 'Failed to delete customer.' });
    }
  }
};

module.exports = customerController;
