const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/../.env' });

// Lightweight, crisp SVG base64 vehicle images for initial seed
function generateVehicleSvgBase64(name, brand, color, iconType) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0F172A"/>
        <stop offset="100%" stop-color="#020617"/>
      </linearGradient>
      <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${color}"/>
        <stop offset="100%" stop-color="#F59E0B"/>
      </linearGradient>
    </defs>
    <rect width="400" height="240" rx="16" fill="url(#bg)"/>
    <rect x="1" y="1" width="398" height="238" rx="15" fill="none" stroke="#334155" stroke-width="1.5"/>
    <circle cx="200" cy="100" r="60" fill="${color}" opacity="0.12"/>
    ${iconType === 'bike' ? `
      <!-- Stylized Motorcycle Silhouette -->
      <path d="M120 150 a25 25 0 1 0 0.1 0" fill="none" stroke="#F8FAFC" stroke-width="6"/>
      <path d="M280 150 a25 25 0 1 0 0.1 0" fill="none" stroke="#F8FAFC" stroke-width="6"/>
      <circle cx="120" cy="150" r="8" fill="#F59E0B"/>
      <circle cx="280" cy="150" r="8" fill="#F59E0B"/>
      <path d="M120 150 L180 110 L230 110 L280 150 M180 110 L210 150 L280 150 M190 90 L215 110 M210 85 L230 85" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <polygon points="175,100 220,100 205,115 165,115" fill="${color}"/>
    ` : iconType === 'scooter' ? `
      <!-- Stylized Scooter Silhouette -->
      <path d="M110 155 a22 22 0 1 0 0.1 0" fill="none" stroke="#F8FAFC" stroke-width="6"/>
      <path d="M290 155 a22 22 0 1 0 0.1 0" fill="none" stroke="#F8FAFC" stroke-width="6"/>
      <path d="M110 155 L160 155 L190 125 L210 125 L230 90 L250 90 M230 90 L275 140 L290 155" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round"/>
      <path d="M150 120 C180 120 200 135 200 155" fill="none" stroke="#F59E0B" stroke-width="4"/>
    ` : `
      <!-- Stylized Car Silhouette -->
      <path d="M110 160 a20 20 0 1 0 0.1 0" fill="none" stroke="#F8FAFC" stroke-width="6"/>
      <path d="M290 160 a20 20 0 1 0 0.1 0" fill="none" stroke="#F8FAFC" stroke-width="6"/>
      <path d="M70 145 L100 145 M130 145 L270 145 M310 145 L330 145 M70 145 C80 130 100 125 130 125 L160 95 L250 95 L290 125 C315 125 325 130 330 145" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round"/>
      <path d="M165 100 L245 100 L280 125 L140 125 Z" fill="${color}" opacity="0.3"/>
    `}
    <text x="200" y="195" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" fill="#F8FAFC" text-anchor="middle">${name}</text>
    <text x="200" y="215" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="500" fill="#94A3B8" text-anchor="middle">${brand} &bull; MVDS Verified</text>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

async function runSetup() {
  console.log('Connecting to MySQL...');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Root@12345'
  });

  try {
    const dbName = process.env.DB_NAME || 'mvds_db';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`Database '${dbName}' ready.`);
    await connection.changeUser({ database: dbName });

    // 1. Users Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('OWNER', 'MANAGER', 'STAFF') DEFAULT 'OWNER',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. Customers Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(100),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. Vehicles Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vehicle_name VARCHAR(150) NOT NULL,
        brand VARCHAR(100),
        model_year INT,
        registration_number VARCHAR(50),
        vehicle_type VARCHAR(50) DEFAULT 'Two Wheeler',
        bought_price DECIMAL(12,2) NOT NULL,
        price_code VARCHAR(50),
        selling_price DECIMAL(12,2),
        date_bought DATETIME NOT NULL,
        date_sold DATETIME NULL,
        status ENUM('AVAILABLE', 'BOOKED', 'SOLD', 'IN_SERVICE') DEFAULT 'AVAILABLE',
        customer_id INT NULL,
        image_base64 LONGTEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Services Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vehicle_id INT NOT NULL,
        customer_id INT NULL,
        service_type VARCHAR(150) NOT NULL,
        cost DECIMAL(10,2) DEFAULT 0.00,
        service_date DATETIME NOT NULL,
        delivery_date DATETIME NULL,
        status ENUM('PENDING', 'IN_PROGRESS', 'READY', 'DELIVERED') DEFAULT 'PENDING',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('Tables initialized successfully.');

    // Seed Test User: phone: 1234567890, password: reset123 (encrypted with bcrypt)
    const testPhone = '1234567890';
    const testPlainPassword = 'reset123';
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(testPlainPassword, salt);

    const [existingUsers] = await connection.query('SELECT * FROM users WHERE phone = ?', [testPhone]);
    if (existingUsers.length === 0) {
      await connection.query(
        'INSERT INTO users (name, phone, password, role) VALUES (?, ?, ?, ?)',
        ['Mani (Shop Owner)', testPhone, hashedPassword, 'OWNER']
      );
      console.log(`Seeded test user: Phone=${testPhone}, Password=${testPlainPassword} (bcrypt encrypted)`);
    } else {
      // Ensure password is updated to encrypted reset123
      await connection.query(
        'UPDATE users SET password = ? WHERE phone = ?',
        [hashedPassword, testPhone]
      );
      console.log(`Updated test user password hash for ${testPhone}.`);
    }

    // Seed Sample Customers
    const [existingCustomers] = await connection.query('SELECT COUNT(*) as count FROM customers');
    if (existingCustomers[0].count === 0) {
      await connection.query(`
        INSERT INTO customers (name, phone, email, address) VALUES
        ('Rajesh Kumar', '9876543210', 'rajesh.kumar@gmail.com', 'No. 14, Cross Cut Road, Gandhipuram, Coimbatore'),
        ('Murugan S', '9443322110', 'murugan.s@yahoo.com', 'Plot 22, Anna Nagar West, Madurai'),
        ('Priya Devi', '9788112233', 'priya.devi@outlook.com', '45B, Mettupalayam Road, RS Puram, Coimbatore'),
        ('Anand Venkatesh', '9944001122', 'anand.v@gmail.com', 'Shop 7, Main Bazaar, Tirupur');
      `);
      console.log('Seeded sample customers.');
    }

    // Seed Sample Vehicles
    const [existingVehicles] = await connection.query('SELECT COUNT(*) as count FROM vehicles');
    if (existingVehicles[0].count === 0) {
      const bikeImage1 = generateVehicleSvgBase64('Yamaha MT-15 V2', 'Yamaha', '#3B82F6', 'bike');
      const bikeImage2 = generateVehicleSvgBase64('Hero Splendor Plus', 'Hero MotoCorp', '#EF4444', 'bike');
      const scooterImage = generateVehicleSvgBase64('Honda Activa 6G', 'Honda', '#10B981', 'scooter');
      const carImage = generateVehicleSvgBase64('Maruti Swift VXi', 'Maruti Suzuki', '#F59E0B', 'car');
      const bikeImage3 = generateVehicleSvgBase64('Bajaj Pulsar NS200', 'Bajaj', '#8B5CF6', 'bike');

      await connection.query(`
        INSERT INTO vehicles 
        (vehicle_name, brand, model_year, registration_number, vehicle_type, bought_price, price_code, selling_price, date_bought, date_sold, status, customer_id, image_base64, notes) 
        VALUES
        ('Yamaha MT-15 V2 (Dark Matte Blue)', 'Yamaha', 2022, 'TN 37 CY 4022', 'Two Wheeler', 115000.00, 'MV-142K', 142000.00, '2026-10-12 11:30:00', NULL, 'AVAILABLE', NULL, ?, 'Single owner, pristine engine condition, dual-channel ABS, fresh Michelin tyres.'),
        ('Hero Splendor Plus XTEC', 'Hero', 2021, 'TN 38 BE 1945', 'Two Wheeler', 38000.00, 'MV-52K', 50000.00, '2026-09-05 09:15:00', '2026-11-15 16:45:00', 'SOLD', 1, ?, 'Sold to Rajesh Kumar. Full service completed before delivery. RC transferred.'),
        ('Honda Activa 6G Deluxe', 'Honda', 2023, 'TN 66 AB 7788', 'Two Wheeler', 56000.00, 'MV-70K', 69000.00, '2026-11-01 14:00:00', NULL, 'AVAILABLE', NULL, ?, 'Showroom condition, 9,200 km genuine reading, insurance valid till 2028.'),
        ('Maruti Suzuki Swift VXi', 'Maruti Suzuki', 2019, 'TN 37 DB 9012', 'Four Wheeler', 410000.00, 'MV-490K', 485000.00, '2026-10-25 17:30:00', NULL, 'AVAILABLE', NULL, ?, 'Petrol manual, chilled AC, comprehensive insurance, zero accidental history.'),
        ('Bajaj Pulsar NS200 ABS', 'Bajaj', 2020, 'TN 43 Z 3311', 'Two Wheeler', 78000.00, 'MV-95K', 92000.00, '2026-11-10 10:00:00', NULL, 'IN_SERVICE', 2, ?, 'Undergoing general maintenance and chain sprocket replacement.');
      `, [bikeImage1, bikeImage2, scooterImage, carImage, bikeImage3]);

      console.log('Seeded sample vehicles with Base64 images.');
    }

    // Seed Sample Services
    const [existingServices] = await connection.query('SELECT COUNT(*) as count FROM services');
    if (existingServices[0].count === 0) {
      await connection.query(`
        INSERT INTO services 
        (vehicle_id, customer_id, service_type, cost, service_date, delivery_date, status, notes)
        VALUES
        (5, 2, 'Full Periodic Maintenance & Chain Sprocket', 2850.00, '2026-11-18 10:30:00', '2026-11-22 18:00:00', 'IN_PROGRESS', 'Motul 7100 fully synthetic oil replaced. Chain tension adjusted.'),
        (2, 1, 'Pre-Delivery General Inspection & Oil Change', 1200.00, '2026-11-14 11:00:00', '2026-11-15 15:00:00', 'DELIVERED', 'Brake shoes cleaned, engine tuning verified.');
      `);
      console.log('Seeded sample services.');
    }

    console.log('Database setup and seeding completed successfully!');
  } catch (error) {
    console.error('Database setup failed:', error);
  } finally {
    await connection.end();
  }
}

runSetup();
