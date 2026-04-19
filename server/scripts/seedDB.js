const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Headquarters = require('../models/Headquarters');
const Hospital = require('../models/Hospital');
const Vendor = require('../models/Vendor');
const StockItem = require('../models/StockItem');
const SupplyOrder = require('../models/SupplyOrder');

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      Headquarters.deleteMany(),
      Hospital.deleteMany(),
      Vendor.deleteMany(),
      StockItem.deleteMany(),
      SupplyOrder.deleteMany()
    ]);
    console.log('Cleared existing data');

    // Create HQ Admin
    const hq = await Headquarters.create({
      name: 'Central Headquarters',
      email: 'admin@hq.com',
      passwordHash: 'admin123'
    });
    console.log('✓ HQ Admin created');

    // Create Hospitals - use .create() to trigger pre-save hooks
    const hospitals = await Promise.all([
      Hospital.create({
        hospitalName: 'City Hospital',
        location: 'Downtown',
        email: 'city@hospital.com',
        passwordHash: 'hospital123'
      }),
      Hospital.create({
        hospitalName: 'Rural Medical Center',
        location: 'Village',
        email: 'rural@hospital.com',
        passwordHash: 'hospital123'
      }),
      Hospital.create({
        hospitalName: 'Urgent Care Clinic',
        location: 'Suburb',
        email: 'urgentcare@hospital.com',
        passwordHash: 'hospital123'
      })
    ]);
    console.log(`✓ ${hospitals.length} Hospitals created`);

    // Create Vendors - use .create() to trigger pre-save hooks
    const vendors = await Promise.all([
      Vendor.create({
        companyName: 'PharmaCorp Supplies',
        contactNumber: '+1-800-PHARMA1',
        email: 'supply1@pharma.com',
        passwordHash: 'vendor123'
      }),
      Vendor.create({
        companyName: 'Global Drug Distributors',
        contactNumber: '+1-800-GLOBAL2',
        email: 'supply2@global.com',
        passwordHash: 'vendor123'
      }),
      Vendor.create({
        companyName: 'MediCare Logistics',
        contactNumber: '+1-800-MEDI3',
        email: 'supply3@medicarelogistics.com',
        passwordHash: 'vendor123'
      })
    ]);
    console.log(`✓ ${vendors.length} Vendors created`);

    // Create Stock Items
    const drugs = [
      { name: 'Paracetamol', category: 'Pain Relief', level: 5000, critical: 500 },
      { name: 'Aspirin', category: 'Pain Relief', level: 3000, critical: 300 },
      { name: 'Ibuprofen', category: 'Pain Relief', level: 2500, critical: 250 },
      { name: 'Amoxicillin', category: 'Antibiotics', level: 1500, critical: 300 },
      { name: 'Penicillin', category: 'Antibiotics', level: 800, critical: 200 },
      { name: 'Vitamin C', category: 'Supplements', level: 10000, critical: 1000 },
      { name: 'Insulin', category: 'Diabetes', level: 500, critical: 100 },
      { name: 'Metformin', category: 'Diabetes', level: 3000, critical: 500 },
      { name: 'Atorvastatin', category: 'Cardiovascular', level: 2000, critical: 400 },
      { name: 'Lisinopril', category: 'Cardiovascular', level: 1800, critical: 300 }
    ];

    const stocks = await StockItem.insertMany(
      drugs.map(drug => ({
        drugName: drug.name,
        category: drug.category,
        currentLevel: drug.level,
        criticalLimit: drug.critical,
        unit: 'tablets',
        managedBy: hq._id
      }))
    );
    console.log(`✓ ${stocks.length} Drugs created in inventory`);

    // Create some Supply Orders
    const orders = await SupplyOrder.insertMany([
      {
        drugId: stocks[0]._id,
        quantity: 2000,
        status: 'Pending',
        generatedBy: hq._id,
        fulfilledBy: null
      },
      {
        drugId: stocks[3]._id,
        quantity: 500,
        status: 'Confirmed',
        generatedBy: hq._id,
        fulfilledBy: vendors[0]._id
      },
      {
        drugId: stocks[5]._id,
        quantity: 5000,
        status: 'In-Transit',
        generatedBy: hq._id,
        fulfilledBy: vendors[1]._id
      }
    ]);
    console.log(`✓ ${orders.length} Supply Orders created`);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('HQ Admin: admin@hq.com / admin123');
    console.log('Hospital: city@hospital.com / hospital123');
    console.log('Vendor: supply1@pharma.com / vendor123');

    return true;
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    return false;
  } finally {
    await mongoose.disconnect();
  }
};

// Run seeder
seedDB().then(success => {
  process.exit(success ? 0 : 1);
});
