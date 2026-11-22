const pool = require('../config/db');

// Helper to auto-format price code if user wants suggestions (e.g. MV-45K or cipher)
function makePriceCode(price) {
  if (!price) return 'MV-0K';
  const val = Number(price);
  if (val >= 100000) {
    const inLakhs = (val / 100000).toFixed(2);
    return `MV-${inLakhs}L`;
  }
  const inK = Math.round(val / 1000);
  return `MV-${inK}K`;
}

const vehicleController = {
  getAll: async (req, res) => {
    try {
      const { status, q, type } = req.query;
      let sql = `
        SELECT 
          v.id, v.vehicle_name, v.brand, v.model_year, v.registration_number, 
          v.vehicle_type, v.bought_price, v.price_code, v.selling_price, 
          v.date_bought, v.date_sold, v.status, v.customer_id, 
          v.notes, v.created_at, v.updated_at,
          LEFT(v.image_base64, 150) as image_preview_meta,
          v.image_base64,
          c.name as customer_name, c.phone as customer_phone
        FROM vehicles v
        LEFT JOIN customers c ON v.customer_id = c.id
        WHERE 1=1
      `;
      const params = [];

      if (status && status !== 'ALL') {
        sql += ' AND v.status = ?';
        params.push(status);
      }

      if (type && type !== 'ALL') {
        sql += ' AND v.vehicle_type = ?';
        params.push(type);
      }

      if (q && q.trim()) {
        const term = `%${q.trim()}%`;
        sql += ' AND (v.vehicle_name LIKE ? OR v.brand LIKE ? OR v.registration_number LIKE ? OR v.price_code LIKE ?)';
        params.push(term, term, term, term);
      }

      sql += ' ORDER BY v.date_bought DESC, v.id DESC';

      const [rows] = await pool.query(sql, params);
      return res.json({ success: true, count: rows.length, vehicles: rows });
    } catch (err) {
      console.error('Fetch vehicles error:', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve vehicles.' });
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const [rows] = await pool.query(`
        SELECT 
          v.*,
          c.name as customer_name, c.phone as customer_phone, c.email as customer_email, c.address as customer_address
        FROM vehicles v
        LEFT JOIN customers c ON v.customer_id = c.id
        WHERE v.id = ?
      `, [id]);

      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Vehicle not found.' });
      }

      const vehicle = rows[0];

      // Also fetch any service records for this vehicle
      const [services] = await pool.query(`
        SELECT s.*, c.name as customer_name 
        FROM services s
        LEFT JOIN customers c ON s.customer_id = c.id
        WHERE s.vehicle_id = ?
        ORDER BY s.service_date DESC
      `, [id]);

      vehicle.services = services;

      return res.json({ success: true, vehicle });
    } catch (err) {
      console.error('Fetch vehicle detail error:', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve vehicle details.' });
    }
  },

  create: async (req, res) => {
    try {
      const {
        brand,
        model_year,
        registration_number,
        vehicle_type = 'Two Wheeler',
        bought_price,
        price_code,
        selling_price,
        date_bought,
        status = 'AVAILABLE',
        customer_id,
        image_base64,
        notes
      } = req.body;

      const vehicle_name = req.body.vehicle_name || req.body.name;

      if (!vehicle_name || bought_price === undefined || bought_price === null) {
        return res.status(400).json({ success: false, message: 'Vehicle name and bought price are required.' });
      }

      const resolvedPriceCode = price_code && price_code.trim() 
        ? price_code.trim() 
        : makePriceCode(selling_price || (Number(bought_price) * 1.25));

      const buyDate = date_bought ? new Date(date_bought) : new Date();

      const [result] = await pool.query(`
        INSERT INTO vehicles 
        (vehicle_name, brand, model_year, registration_number, vehicle_type, bought_price, price_code, selling_price, date_bought, status, customer_id, image_base64, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        vehicle_name.trim(),
        brand ? brand.trim() : null,
        model_year ? parseInt(model_year, 10) : null,
        registration_number ? registration_number.trim().toUpperCase() : null,
        vehicle_type,
        parseFloat(bought_price),
        resolvedPriceCode,
        selling_price ? parseFloat(selling_price) : null,
        buyDate,
        status,
        customer_id || null,
        image_base64 || null,
        notes || null
      ]);

      const [newRow] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [result.insertId]);

      return res.status(201).json({
        success: true,
        message: 'Vehicle added to inventory successfully.',
        vehicle: newRow[0]
      });
    } catch (err) {
      console.error('Create vehicle error:', err);
      return res.status(500).json({ success: false, message: 'Failed to add vehicle.' });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        vehicle_name,
        brand,
        model_year,
        registration_number,
        vehicle_type,
        bought_price,
        price_code,
        selling_price,
        date_bought,
        date_sold,
        status,
        customer_id,
        image_base64,
        notes
      } = req.body;

      const [existing] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ success: false, message: 'Vehicle not found.' });
      }

      const current = existing[0];

      const resolvedVehicleName = req.body.vehicle_name || req.body.name;

      await pool.query(`
        UPDATE vehicles SET
          vehicle_name = ?,
          brand = ?,
          model_year = ?,
          registration_number = ?,
          vehicle_type = ?,
          bought_price = ?,
          price_code = ?,
          selling_price = ?,
          date_bought = ?,
          date_sold = ?,
          status = ?,
          customer_id = ?,
          image_base64 = COALESCE(?, image_base64),
          notes = ?
        WHERE id = ?
      `, [
        resolvedVehicleName !== undefined ? resolvedVehicleName : current.vehicle_name,
        brand !== undefined ? brand : current.brand,
        model_year !== undefined ? model_year : current.model_year,
        registration_number !== undefined ? registration_number : current.registration_number,
        vehicle_type !== undefined ? vehicle_type : current.vehicle_type,
        bought_price !== undefined ? parseFloat(bought_price) : current.bought_price,
        price_code !== undefined ? price_code : current.price_code,
        selling_price !== undefined ? (selling_price ? parseFloat(selling_price) : null) : current.selling_price,
        date_bought !== undefined ? new Date(date_bought) : current.date_bought,
        date_sold !== undefined ? (date_sold ? new Date(date_sold) : null) : current.date_sold,
        status !== undefined ? status : current.status,
        customer_id !== undefined ? (customer_id || null) : current.customer_id,
        image_base64 !== undefined ? image_base64 : current.image_base64,
        notes !== undefined ? notes : current.notes,
        id
      ]);

      const [updated] = await pool.query(`
        SELECT v.*, c.name as customer_name 
        FROM vehicles v 
        LEFT JOIN customers c ON v.customer_id = c.id 
        WHERE v.id = ?
      `, [id]);

      return res.json({
        success: true,
        message: 'Vehicle updated successfully.',
        vehicle: updated[0]
      });
    } catch (err) {
      console.error('Update vehicle error:', err);
      return res.status(500).json({ success: false, message: 'Failed to update vehicle.' });
    }
  },

  markSold: async (req, res) => {
    try {
      const { id } = req.params;
      const { customer_id, selling_price, date_sold, notes } = req.body;

      const [existing] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ success: false, message: 'Vehicle not found.' });
      }

      const soldDate = date_sold ? new Date(date_sold) : new Date();

      await pool.query(`
        UPDATE vehicles SET
          status = 'SOLD',
          customer_id = ?,
          selling_price = ?,
          date_sold = ?,
          notes = COALESCE(?, notes)
        WHERE id = ?
      `, [
        customer_id || null,
        selling_price ? parseFloat(selling_price) : existing[0].selling_price,
        soldDate,
        notes || null,
        id
      ]);

      const [updated] = await pool.query(`
        SELECT v.*, c.name as customer_name, c.phone as customer_phone
        FROM vehicles v 
        LEFT JOIN customers c ON v.customer_id = c.id 
        WHERE v.id = ?
      `, [id]);

      return res.json({
        success: true,
        message: 'Vehicle marked as sold.',
        vehicle: updated[0]
      });
    } catch (err) {
      console.error('Mark sold error:', err);
      return res.status(500).json({ success: false, message: 'Failed to mark vehicle as sold.' });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const [existing] = await pool.query('SELECT id FROM vehicles WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ success: false, message: 'Vehicle not found.' });
      }

      await pool.query('DELETE FROM vehicles WHERE id = ?', [id]);
      return res.json({ success: true, message: 'Vehicle removed from inventory.' });
    } catch (err) {
      console.error('Delete vehicle error:', err);
      return res.status(500).json({ success: false, message: 'Failed to delete vehicle.' });
    }
  }
};

module.exports = vehicleController;
