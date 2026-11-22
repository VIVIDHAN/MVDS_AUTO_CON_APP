const pool = require('../config/db');

const serviceController = {
  getAll: async (req, res) => {
    try {
      const { status, vehicle_id } = req.query;
      let sql = `
        SELECT 
          s.*,
          v.vehicle_name, v.registration_number, v.brand,
          c.name as customer_name, c.phone as customer_phone
        FROM services s
        JOIN vehicles v ON s.vehicle_id = v.id
        LEFT JOIN customers c ON s.customer_id = c.id
        WHERE 1=1
      `;
      const params = [];

      if (status && status !== 'ALL') {
        sql += ' AND s.status = ?';
        params.push(status);
      }

      if (vehicle_id) {
        sql += ' AND s.vehicle_id = ?';
        params.push(vehicle_id);
      }

      sql += ' ORDER BY s.service_date DESC';

      const [rows] = await pool.query(sql, params);
      return res.json({ success: true, count: rows.length, services: rows });
    } catch (err) {
      console.error('Fetch services error:', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve services.' });
    }
  },

  create: async (req, res) => {
    try {
      const {
        vehicle_id,
        customer_id,
        service_type,
        cost = 0,
        service_date,
        delivery_date,
        status = 'PENDING',
        notes
      } = req.body;

      if (!vehicle_id || !service_type) {
        return res.status(400).json({ success: false, message: 'Vehicle ID and Service Type are required.' });
      }

      const sDate = service_date ? new Date(service_date) : new Date();
      const dDate = delivery_date ? new Date(delivery_date) : null;

      const [result] = await pool.query(`
        INSERT INTO services 
        (vehicle_id, customer_id, service_type, cost, service_date, delivery_date, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        vehicle_id,
        customer_id || null,
        service_type.trim(),
        parseFloat(cost) || 0.00,
        sDate,
        dDate,
        status,
        notes || null
      ]);

      const [newRow] = await pool.query(`
        SELECT s.*, v.vehicle_name, v.registration_number, c.name as customer_name 
        FROM services s
        JOIN vehicles v ON s.vehicle_id = v.id
        LEFT JOIN customers c ON s.customer_id = c.id
        WHERE s.id = ?
      `, [result.insertId]);

      return res.status(201).json({
        success: true,
        message: 'Service record added successfully.',
        service: newRow[0]
      });
    } catch (err) {
      console.error('Create service error:', err);
      return res.status(500).json({ success: false, message: 'Failed to create service record.' });
    }
  },

  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, delivery_date, cost, notes } = req.body;

      const [existing] = await pool.query('SELECT * FROM services WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ success: false, message: 'Service record not found.' });
      }

      const current = existing[0];
      const dDate = delivery_date !== undefined 
        ? (delivery_date ? new Date(delivery_date) : null) 
        : (status === 'DELIVERED' && !current.delivery_date ? new Date() : current.delivery_date);

      await pool.query(`
        UPDATE services SET
          status = COALESCE(?, status),
          delivery_date = ?,
          cost = COALESCE(?, cost),
          notes = COALESCE(?, notes)
        WHERE id = ?
      `, [
        status,
        dDate,
        cost !== undefined ? parseFloat(cost) : current.cost,
        notes,
        id
      ]);

      const [updated] = await pool.query(`
        SELECT s.*, v.vehicle_name, v.registration_number, c.name as customer_name 
        FROM services s
        JOIN vehicles v ON s.vehicle_id = v.id
        LEFT JOIN customers c ON s.customer_id = c.id
        WHERE s.id = ?
      `, [id]);

      return res.json({
        success: true,
        message: 'Service status updated.',
        service: updated[0]
      });
    } catch (err) {
      console.error('Update service error:', err);
      return res.status(500).json({ success: false, message: 'Failed to update service.' });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM services WHERE id = ?', [id]);
      return res.json({ success: true, message: 'Service record deleted.' });
    } catch (err) {
      console.error('Delete service error:', err);
      return res.status(500).json({ success: false, message: 'Failed to delete service.' });
    }
  }
};

module.exports = serviceController;
