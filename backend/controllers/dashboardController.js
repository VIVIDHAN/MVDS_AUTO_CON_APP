const pool = require('../config/db');

const dashboardController = {
  getStats: async (req, res) => {
    try {
      // 1. Vehicle counts by status
      const [vehicleCounts] = await pool.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'AVAILABLE' THEN 1 ELSE 0 END) as available,
          SUM(CASE WHEN status = 'SOLD' THEN 1 ELSE 0 END) as sold,
          SUM(CASE WHEN status = 'IN_SERVICE' THEN 1 ELSE 0 END) as in_service,
          SUM(CASE WHEN status = 'BOOKED' THEN 1 ELSE 0 END) as booked
        FROM vehicles
      `);

      // 2. Financial Metrics
      const [financials] = await pool.query(`
        SELECT 
          COALESCE(SUM(CASE WHEN status = 'AVAILABLE' THEN bought_price ELSE 0 END), 0) as current_investment,
          COALESCE(SUM(CASE WHEN status = 'AVAILABLE' THEN selling_price ELSE 0 END), 0) as expected_inventory_value,
          COALESCE(SUM(CASE WHEN status = 'SOLD' THEN selling_price ELSE 0 END), 0) as total_sales_revenue,
          COALESCE(SUM(CASE WHEN status = 'SOLD' THEN (selling_price - bought_price) ELSE 0 END), 0) as total_profit_realized
        FROM vehicles
      `);

      // 3. Service jobs summary
      const [serviceCounts] = await pool.query(`
        SELECT 
          COUNT(*) as total_services,
          SUM(CASE WHEN status IN ('PENDING', 'IN_PROGRESS') THEN 1 ELSE 0 END) as active_services,
          COALESCE(SUM(cost), 0) as total_service_revenue
        FROM services
      `);

      // 4. Customer count
      const [customerCounts] = await pool.query('SELECT COUNT(*) as total_customers FROM customers');

      // 5. Recent 5 vehicles with preview
      const [recentVehicles] = await pool.query(`
        SELECT 
          id, vehicle_name, brand, registration_number, vehicle_type,
          bought_price, price_code, selling_price, date_bought, status,
          image_base64
        FROM vehicles
        ORDER BY date_bought DESC
        LIMIT 5
      `);

      return res.json({
        success: true,
        stats: {
          vehicles: vehicleCounts[0],
          financials: financials[0],
          services: serviceCounts[0],
          customers: customerCounts[0]
        },
        recentVehicles
      });
    } catch (err) {
      console.error('Fetch dashboard stats error:', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve dashboard statistics.' });
    }
  }
};

module.exports = dashboardController;
