import 'dotenv/config';
import { PrismaClient, Role, VehicleType, VehicleStatus, DriverStatus, LicenseCategory, TripStatus, MaintenanceStatus, ExpenseCategory } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // 1. Users
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const fleetManager = await prisma.user.upsert({
    where: { email: 'fleet@transitops.com' },
    update: {},
    create: {
      name: 'Alice Fleet',
      email: 'fleet@transitops.com',
      passwordHash,
      role: Role.FLEET_MANAGER,
    },
  });

  const dispatcher = await prisma.user.upsert({
    where: { email: 'driver@transitops.com' },
    update: {},
    create: {
      name: 'Bob Dispatch',
      email: 'driver@transitops.com',
      passwordHash,
      role: Role.DRIVER,
    },
  });

  const safetyOfficer = await prisma.user.upsert({
    where: { email: 'safety@transitops.com' },
    update: {},
    create: {
      name: 'Carol Safety',
      email: 'safety@transitops.com',
      passwordHash,
      role: Role.SAFETY_OFFICER,
    },
  });

  const financialAnalyst = await prisma.user.upsert({
    where: { email: 'finance@transitops.com' },
    update: {},
    create: {
      name: 'Dave Finance',
      email: 'finance@transitops.com',
      passwordHash,
      role: Role.FINANCIAL_ANALYST,
    },
  });

  console.log('Users seeded.');

  // 2. Vehicles
  const vehiclesData = [
    { regNo: 'V-1001', nameModel: 'Ford Transit', type: VehicleType.VAN, capacityKg: 1500, acquisitionCost: 35000, odometerKm: 12000, status: VehicleStatus.AVAILABLE },
    { regNo: 'V-1002', nameModel: 'Mercedes Sprinter', type: VehicleType.VAN, capacityKg: 1800, acquisitionCost: 42000, odometerKm: 45000, status: VehicleStatus.AVAILABLE },
    { regNo: 'V-1003', nameModel: 'Volvo FH16', type: VehicleType.TRUCK, capacityKg: 25000, acquisitionCost: 150000, odometerKm: 125000, status: VehicleStatus.ON_TRIP },
    { regNo: 'V-1004', nameModel: 'Scania R500', type: VehicleType.TRUCK, capacityKg: 24000, acquisitionCost: 145000, odometerKm: 89000, status: VehicleStatus.IN_SHOP },
    { regNo: 'V-1005', nameModel: 'Piaggio Ape', type: VehicleType.MINI, capacityKg: 500, acquisitionCost: 8000, odometerKm: 5000, status: VehicleStatus.AVAILABLE },
    { regNo: 'V-1006', nameModel: 'Renault Kangoo', type: VehicleType.MINI, capacityKg: 650, acquisitionCost: 12000, odometerKm: 95000, status: VehicleStatus.RETIRED },
  ];

  const vehicles = [];
  for (const v of vehiclesData) {
    const created = await prisma.vehicle.upsert({
      where: { regNo: v.regNo },
      update: {},
      create: v,
    });
    vehicles.push(created);
  }
  
  console.log('Vehicles seeded.');

  // 3. Drivers
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const driversData = [
    { name: 'John Doe', licenseNo: 'DL-1001', licenseCategory: LicenseCategory.LMV, licenseExpiry: oneYearFromNow, contact: '555-0101', status: DriverStatus.AVAILABLE },
    { name: 'Jane Smith', licenseNo: 'DL-1002', licenseCategory: LicenseCategory.HMV, licenseExpiry: oneYearFromNow, contact: '555-0102', status: DriverStatus.AVAILABLE },
    { name: 'Sam Wilson', licenseNo: 'DL-1003', licenseCategory: LicenseCategory.HMV, licenseExpiry: oneYearFromNow, contact: '555-0103', status: DriverStatus.ON_TRIP },
    { name: 'Expired Driver', licenseNo: 'DL-1004', licenseCategory: LicenseCategory.LMV, licenseExpiry: oneMonthAgo, contact: '555-0104', status: DriverStatus.SUSPENDED },
    { name: 'Off Duty Driver', licenseNo: 'DL-1005', licenseCategory: LicenseCategory.LMV, licenseExpiry: oneYearFromNow, contact: '555-0105', status: DriverStatus.OFF_DUTY },
  ];

  const drivers = [];
  for (const d of driversData) {
    const created = await prisma.driver.upsert({
      where: { licenseNo: d.licenseNo },
      update: {},
      create: d,
    });
    drivers.push(created);
  }

  console.log('Drivers seeded.');

  // 4. Trips
  const tripsData = [
    { 
      tripCode: 'TR-1001', source: 'Warehouse A', destination: 'Store 1', vehicleId: vehicles[0].id, driverId: drivers[0].id, cargoWeightKg: 1000, plannedDistanceKm: 150, status: TripStatus.COMPLETED,
      revenue: 500, finalOdometerKm: vehicles[0].odometerKm + 150, fuelConsumedLiters: 15, dispatchedAt: new Date(Date.now() - 86400000), completedAt: new Date()
    },
    { 
      tripCode: 'TR-1002', source: 'Warehouse B', destination: 'Store 2', vehicleId: vehicles[1].id, driverId: drivers[1].id, cargoWeightKg: 1200, plannedDistanceKm: 300, status: TripStatus.COMPLETED,
      revenue: 900, finalOdometerKm: vehicles[1].odometerKm + 300, fuelConsumedLiters: 35, dispatchedAt: new Date(Date.now() - 172800000), completedAt: new Date(Date.now() - 86400000)
    },
    { 
      tripCode: 'TR-1003', source: 'Warehouse A', destination: 'City Center', vehicleId: vehicles[2].id, driverId: drivers[2].id, cargoWeightKg: 18000, plannedDistanceKm: 850, status: TripStatus.DISPATCHED,
      dispatchedAt: new Date()
    },
    { 
      tripCode: 'TR-1004', source: 'Supplier X', destination: 'Warehouse A', cargoWeightKg: 500, plannedDistanceKm: 50, status: TripStatus.DRAFT 
    },
    { 
      tripCode: 'TR-1005', source: 'Warehouse C', destination: 'Store 3', vehicleId: vehicles[0].id, driverId: drivers[0].id, cargoWeightKg: 1000, plannedDistanceKm: 200, status: TripStatus.CANCELLED, cancelReason: 'Weather condition'
    },
  ];

  const trips = [];
  for (const t of tripsData) {
    const created = await prisma.trip.upsert({
      where: { tripCode: t.tripCode },
      update: {},
      create: t,
    });
    trips.push(created);
  }

  console.log('Trips seeded.');

  // 5. Maintenance Logs
  await prisma.maintenanceLog.create({
    data: {
      vehicleId: vehicles[3].id,
      serviceType: 'Engine Repair',
      cost: 1500,
      serviceDate: new Date(),
      status: MaintenanceStatus.IN_SHOP,
      notes: 'Knocking sound from engine'
    }
  });

  await prisma.maintenanceLog.create({
    data: {
      vehicleId: vehicles[1].id,
      serviceType: 'Oil Change',
      cost: 150,
      serviceDate: new Date(Date.now() - 2592000000),
      status: MaintenanceStatus.COMPLETED
    }
  });

  console.log('Maintenance Logs seeded.');

  // 6. Fuel Logs
  // Create fuel logs for the completed trips
  await prisma.fuelLog.create({
    data: {
      vehicleId: vehicles[0].id,
      tripId: trips[0].id,
      date: trips[0].completedAt as Date,
      liters: 15,
      cost: 22.50
    }
  });

  await prisma.fuelLog.create({
    data: {
      vehicleId: vehicles[1].id,
      tripId: trips[1].id,
      date: trips[1].completedAt as Date,
      liters: 35,
      cost: 52.50
    }
  });

  console.log('Fuel Logs seeded.');

  // 7. Expenses
  await prisma.expense.create({
    data: {
      tripId: trips[0].id,
      vehicleId: vehicles[0].id,
      category: ExpenseCategory.TOLL,
      toll: 15,
      other: 0,
      total: 15,
    }
  });

  await prisma.expense.create({
    data: {
      tripId: trips[1].id,
      vehicleId: vehicles[1].id,
      category: ExpenseCategory.MISC,
      toll: 0,
      other: 50,
      total: 50,
    }
  });

  console.log('Expenses seeded. Database setup complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
