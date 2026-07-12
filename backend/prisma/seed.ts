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
    update: { name: 'Aarav Sharma' },
    create: {
      name: 'Aarav Sharma',
      email: 'fleet@transitops.com',
      passwordHash,
      role: Role.FLEET_MANAGER,
    },
  });

  const dispatcher = await prisma.user.upsert({
    where: { email: 'driver@transitops.com' },
    update: { name: 'Rohan Patel' },
    create: {
      name: 'Rohan Patel',
      email: 'driver@transitops.com',
      passwordHash,
      role: Role.DRIVER,
    },
  });

  const safetyOfficer = await prisma.user.upsert({
    where: { email: 'safety@transitops.com' },
    update: { name: 'Priya Mehta' },
    create: {
      name: 'Priya Mehta',
      email: 'safety@transitops.com',
      passwordHash,
      role: Role.SAFETY_OFFICER,
    },
  });

  const financialAnalyst = await prisma.user.upsert({
    where: { email: 'finance@transitops.com' },
    update: { name: 'Nisha Desai' },
    create: {
      name: 'Nisha Desai',
      email: 'finance@transitops.com',
      passwordHash,
      role: Role.FINANCIAL_ANALYST,
    },
  });

  console.log('Users seeded.');

  // 2. Vehicles
  const vehiclesData = [
    { regNo: 'TOP-GJ-001', nameModel: 'Tata Ace Gold', type: VehicleType.MINI, capacityKg: 710, acquisitionCost: 550000, odometerKm: 12000, status: VehicleStatus.AVAILABLE },
    { regNo: 'TOP-GJ-002', nameModel: 'Mahindra Bolero Pickup', type: VehicleType.MINI, capacityKg: 1300, acquisitionCost: 850000, odometerKm: 45000, status: VehicleStatus.AVAILABLE },
    { regNo: 'TOP-GJ-003', nameModel: 'BharatBenz 1217R', type: VehicleType.TRUCK, capacityKg: 12000, acquisitionCost: 2200000, odometerKm: 125000, status: VehicleStatus.ON_TRIP },
    { regNo: 'TOP-GJ-004', nameModel: 'Eicher Pro 2049', type: VehicleType.TRUCK, capacityKg: 4900, acquisitionCost: 1200000, odometerKm: 89000, status: VehicleStatus.IN_SHOP },
    { regNo: 'TOP-GJ-005', nameModel: 'Ashok Leyland Dost+', type: VehicleType.MINI, capacityKg: 1500, acquisitionCost: 750000, odometerKm: 5000, status: VehicleStatus.AVAILABLE },
    { regNo: 'TOP-GJ-006', nameModel: 'Tata Ultra T7', type: VehicleType.TRUCK, capacityKg: 7000, acquisitionCost: 1600000, odometerKm: 95000, status: VehicleStatus.RETIRED },
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
    { name: 'Rahul Patel', licenseNo: 'DL-1001', licenseCategory: LicenseCategory.LMV, licenseExpiry: oneYearFromNow, contact: '9876543210', status: DriverStatus.AVAILABLE },
    { name: 'Karan Joshi', licenseNo: 'DL-1002', licenseCategory: LicenseCategory.HMV, licenseExpiry: oneYearFromNow, contact: '9876543211', status: DriverStatus.AVAILABLE },
    { name: 'Vivek Shah', licenseNo: 'DL-1003', licenseCategory: LicenseCategory.HMV, licenseExpiry: oneYearFromNow, contact: '9876543212', status: DriverStatus.ON_TRIP },
    { name: 'Amit Solanki', licenseNo: 'DL-1004', licenseCategory: LicenseCategory.LMV, licenseExpiry: oneMonthAgo, contact: '9876543213', status: DriverStatus.SUSPENDED },
    { name: 'Hardik Parmar', licenseNo: 'DL-1005', licenseCategory: LicenseCategory.LMV, licenseExpiry: oneYearFromNow, contact: '9876543214', status: DriverStatus.OFF_DUTY },
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
      tripCode: 'TOP-24001', source: 'Ahmedabad Logistics Hub', destination: 'Surat Distribution Center', vehicleId: vehicles[0].id, driverId: drivers[0].id, cargoWeightKg: 500, plannedDistanceKm: 260, status: TripStatus.COMPLETED,
      revenue: 8500, finalOdometerKm: vehicles[0].odometerKm + 260, fuelConsumedLiters: 18, dispatchedAt: new Date(Date.now() - 86400000), completedAt: new Date()
    },
    { 
      tripCode: 'TOP-24002', source: 'Vadodara Depot', destination: 'Rajkot Warehouse', vehicleId: vehicles[1].id, driverId: drivers[1].id, cargoWeightKg: 1100, plannedDistanceKm: 290, status: TripStatus.COMPLETED,
      revenue: 12000, finalOdometerKm: vehicles[1].odometerKm + 290, fuelConsumedLiters: 25, dispatchedAt: new Date(Date.now() - 172800000), completedAt: new Date(Date.now() - 86400000)
    },
    { 
      tripCode: 'TOP-24003', source: 'Ahmedabad Logistics Hub', destination: 'Vapi Industrial Estate', vehicleId: vehicles[2].id, driverId: drivers[2].id, cargoWeightKg: 10500, plannedDistanceKm: 350, status: TripStatus.DISPATCHED,
      dispatchedAt: new Date()
    },
    { 
      tripCode: 'TOP-24004', source: 'Bhavnagar Port', destination: 'Gandhinagar Warehouse', cargoWeightKg: 400, plannedDistanceKm: 180, status: TripStatus.DRAFT 
    },
    { 
      tripCode: 'TOP-24005', source: 'Anand Distribution Center', destination: 'Surat Distribution Center', vehicleId: vehicles[0].id, driverId: drivers[0].id, cargoWeightKg: 650, plannedDistanceKm: 130, status: TripStatus.CANCELLED, cancelReason: 'Vehicle Breakdown'
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
      serviceType: 'Engine Inspection',
      cost: 15000,
      serviceDate: new Date(),
      status: MaintenanceStatus.IN_SHOP,
      notes: 'Knocking sound from engine'
    }
  });

  await prisma.maintenanceLog.create({
    data: {
      vehicleId: vehicles[1].id,
      serviceType: 'Preventive Service',
      cost: 4500,
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
      liters: 18,
      cost: 1650
    }
  });

  await prisma.fuelLog.create({
    data: {
      vehicleId: vehicles[1].id,
      tripId: trips[1].id,
      date: trips[1].completedAt as Date,
      liters: 25,
      cost: 2300
    }
  });

  console.log('Fuel Logs seeded.');

  // 7. Expenses
  await prisma.expense.create({
    data: {
      tripId: trips[0].id,
      vehicleId: vehicles[0].id,
      category: ExpenseCategory.TOLL,
      toll: 350,
      other: 0,
      total: 350,
    }
  });

  await prisma.expense.create({
    data: {
      tripId: trips[1].id,
      vehicleId: vehicles[1].id,
      category: ExpenseCategory.MISC,
      toll: 0,
      other: 1200,
      total: 1200,
    }
  });

  console.log('Expenses seeded.');

  // 8. Role Permissions
  const modules = ['Dashboard', 'Fleet', 'Drivers', 'Trips', 'Maintenance', 'FuelAndExpenses', 'Analytics', 'Settings'];
  const roles = [Role.FLEET_MANAGER, Role.DRIVER, Role.SAFETY_OFFICER, Role.FINANCIAL_ANALYST];
  
  for (const role of roles) {
    for (const mod of modules) {
      let access = 'NONE';
      if (role === Role.FLEET_MANAGER) {
        access = 'FULL';
      } else if (role === Role.DRIVER) {
        if (['Dashboard', 'Fleet'].includes(mod)) access = 'VIEW';
        if (['Drivers', 'Trips'].includes(mod)) access = 'FULL';
      } else if (role === Role.SAFETY_OFFICER) {
        if (['Dashboard', 'Drivers', 'Maintenance', 'Analytics'].includes(mod)) access = 'VIEW';
      } else if (role === Role.FINANCIAL_ANALYST) {
        if (['FuelAndExpenses', 'Analytics'].includes(mod)) access = 'VIEW';
      }

      await prisma.rolePermission.upsert({
        where: {
          role_module: { role, module: mod }
        },
        update: { access: access as any },
        create: { role, module: mod, access: access as any }
      });
    }
  }
  
  console.log('RolePermissions seeded. Database setup complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
