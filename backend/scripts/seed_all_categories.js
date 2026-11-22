const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

const imgDir = path.join(__dirname, '../assets/category_images');

const toBase64 = (fileName) => {
  const p = path.join(imgDir, fileName);
  if (fs.existsSync(p)) {
    const data = fs.readFileSync(p);
    return `data:image/jpeg;base64,${data.toString('base64')}`;
  }
  return null;
};

const vehiclesToSeed = [
  {
    name: 'Toyota Corolla Altis 1.8G Sedan',
    brand: 'Toyota',
    year: 2021,
    reg: 'TN 29 AZ 4410',
    type: 'Cars',
    bought: 850000,
    selling: 1020000,
    code: 'MV-10.2L',
    status: 'AVAILABLE',
    img: 'cars.jpg',
    notes: 'Single owner, pristine pearl white metallic, complete service history, 38,000 km'
  },
  {
    name: 'Honda Hornet 2.0 Street Sports Bike',
    brand: 'Honda',
    year: 2023,
    reg: 'TN 24 R 7721',
    type: 'Two Wheelers',
    bought: 115000,
    selling: 142000,
    code: 'MV-1.42L',
    status: 'AVAILABLE',
    img: 'two_wheelers.jpg',
    notes: 'Repsol racing red & black, zero accidental history, showroom maintained, 8,200 km'
  },
  {
    name: 'JCB 3CX EcoXcellence Backhoe Loader',
    brand: 'JCB',
    year: 2020,
    reg: 'TN 24 AB 9901',
    type: 'JCB / Earth Movers',
    bought: 1850000,
    selling: 2240000,
    code: 'MV-22.4L',
    status: 'AVAILABLE',
    img: 'jcb_earth_movers.jpg',
    notes: 'Heavy duty front loader bucket, live link telematics, fully certified hydraulics'
  },
  {
    name: 'Massey Ferguson 290 Heavy Farm Tractor',
    brand: 'Massey Ferguson',
    year: 2022,
    reg: 'TN 24 Q 3381',
    type: 'Tractors',
    bought: 360000,
    selling: 440000,
    code: 'MV-4.40L',
    status: 'AVAILABLE',
    img: 'tractors.jpg',
    notes: 'Robust Simpson engine, high torque PTO, canopy roof, pristine agricultural tractor'
  },
  {
    name: 'Mahindra Bolero Camper 4x4 Pik-Up',
    brand: 'Mahindra',
    year: 2022,
    reg: 'TN 24 K 6614',
    type: 'Pickup',
    bought: 490000,
    selling: 580000,
    code: 'MV-5.80L',
    status: 'AVAILABLE',
    img: 'pickup.jpg',
    notes: 'Power steering, factory payload cargo bed, m2DiCR engine, Krishnagiri registered'
  },
  {
    name: 'Tata Daewoo Novus 25.5T Heavy Quarry Tipper',
    brand: 'Tata',
    year: 2019,
    reg: 'TN 29 M 5520',
    type: 'Tippers',
    bought: 2150000,
    selling: 2600000,
    code: 'MV-26.0L',
    status: 'AVAILABLE',
    img: 'tippers.jpg',
    notes: 'Cummins 415PS heavy engine, 8x4 multi-axle, hardox high tensile steel body'
  },
  {
    name: 'Eicher Pro 6055 Commercial Freight Truck',
    brand: 'Eicher',
    year: 2022,
    reg: 'TN 24 B 8890',
    type: 'Trucks',
    bought: 1720000,
    selling: 2080000,
    code: 'MV-20.8L',
    status: 'AVAILABLE',
    img: 'trucks.jpg',
    notes: 'VXD6 high fuel-efficiency engine, factory sleeper cabin, national permit valid'
  },
  {
    name: 'Volvo 9400 B11R Luxury Multi-Axle Coach Bus',
    brand: 'Volvo',
    year: 2021,
    reg: 'KA 57 F 2853',
    type: 'Buses',
    bought: 4200000,
    selling: 4900000,
    code: 'MV-49.0L',
    status: 'AVAILABLE',
    img: 'buses.jpg',
    notes: 'Airavat luxury club class, air suspension, rear engine D11C, LCD entertainment'
  },
  {
    name: 'Force Traveller 3350 Luxury Passenger Van',
    brand: 'Force Motors',
    year: 2020,
    reg: 'KA 02 AA 6002',
    type: 'Vans',
    bought: 620000,
    selling: 750000,
    code: 'MV-7.50L',
    status: 'AVAILABLE',
    img: 'vans.jpg',
    notes: 'Mercedes FM2.6 CR ED engine, pushback recliner seats, AC dual-blower, single owner'
  },
  {
    name: 'Liebherr 5-Axle Heavy Mobile Hydraulic Crane',
    brand: 'Liebherr',
    year: 2019,
    reg: 'TN 24 J 9204',
    type: 'Special Vehicles',
    bought: 12800000,
    selling: 15600000,
    code: 'MV-1.56Cr',
    status: 'AVAILABLE',
    img: 'special_vehicles.jpg',
    notes: '50m telescopic boom, LICCON computer system, certified safety inspection valid'
  }
];

async function seed() {
  console.log('Seeding 10 authentic visiting card vehicles...');
  for (const v of vehiclesToSeed) {
    const base64Img = toBase64(v.img);
    await pool.query(
      `INSERT INTO vehicles 
        (vehicle_name, brand, model_year, registration_number, vehicle_type, bought_price, selling_price, price_code, status, image_base64, notes, date_bought)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE 
        vehicle_name = VALUES(vehicle_name),
        brand = VALUES(brand),
        model_year = VALUES(model_year),
        bought_price = VALUES(bought_price),
        selling_price = VALUES(selling_price),
        price_code = VALUES(price_code),
        image_base64 = VALUES(image_base64),
        notes = VALUES(notes)`,
      [v.name, v.brand, v.year, v.reg, v.type, v.bought, v.selling, v.code, v.status, base64Img, v.notes]
    );
    console.log(`Seeded: ${v.type} - ${v.name}`);
  }
  console.log('Finished seeding all 10 visiting card categories!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
