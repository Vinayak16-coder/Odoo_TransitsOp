import { PrismaClient, VehicleStatus, TripStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class AnalyticsService {
  static async getDashboard() {
    const activeVehicles = await prisma.vehicle.count({ where: { status: VehicleStatus.ON_TRIP } });
    const availableVehicles = await prisma.vehicle.count({ where: { status: VehicleStatus.AVAILABLE } });
    const inShopVehicles = await prisma.vehicle.count({ where: { status: VehicleStatus.IN_SHOP } });
    const activeTrips = await prisma.trip.count({ where: { status: TripStatus.DISPATCHED } });
    const pendingTrips = await prisma.trip.count({ where: { status: TripStatus.DRAFT } });
    const driversOnDuty = await prisma.driver.count({ where: { status: 'ON_TRIP' } });

    // BR-7: Fleet Utilization % = ON_TRIP / non-RETIRED * 100
    const nonRetiredVehicles = await prisma.vehicle.count({ where: { status: { not: VehicleStatus.RETIRED } } });
    const fleetUtilizationPct = nonRetiredVehicles > 0 ? (activeVehicles / nonRetiredVehicles) * 100 : 0;

    return {
      activeVehicles,
      availableVehicles,
      inShopVehicles,
      activeTrips,
      pendingTrips,
      driversOnDuty,
      fleetUtilizationPct: Number(fleetUtilizationPct.toFixed(2))
    };
  }

  static async getKPIs() {
    // 1. Fleet Utilization % (same as dashboard)
    const activeVehicles = await prisma.vehicle.count({ where: { status: VehicleStatus.ON_TRIP } });
    const nonRetiredVehicles = await prisma.vehicle.count({ where: { status: { not: VehicleStatus.RETIRED } } });
    const fleetUtilizationPct = nonRetiredVehicles > 0 ? (activeVehicles / nonRetiredVehicles) * 100 : 0;

    // 2. Operational Cost = Fuel + Maintenance only
    const fuelAgg = await prisma.fuelLog.aggregate({ _sum: { cost: true } });
    const maintAgg = await prisma.maintenanceLog.aggregate({ _sum: { cost: true } });
    const operationalCost = Number(fuelAgg._sum.cost || 0) + Number(maintAgg._sum.cost || 0);

    // 3. Fuel Efficiency = distance / fuel
    const tripsAgg = await prisma.trip.aggregate({ 
      where: { status: TripStatus.COMPLETED }, 
      _sum: { plannedDistanceKm: true } 
    });
    const fuelLitersAgg = await prisma.fuelLog.aggregate({ _sum: { liters: true } });
    const totalDistance = Number(tripsAgg._sum.plannedDistanceKm || 0);
    const totalFuelLiters = Number(fuelLitersAgg._sum.liters || 0);
    const fuelEfficiency = totalFuelLiters > 0 ? (totalDistance / totalFuelLiters) : 0;

    // 4. Vehicle ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
    // We compute this globally as an average of all non-retired vehicles
    const vehicles = await prisma.vehicle.findMany({
      where: { status: { not: VehicleStatus.RETIRED } },
      select: { 
        acquisitionCost: true,
        trips: { where: { status: TripStatus.COMPLETED }, select: { revenue: true } },
        fuelLogs: { select: { cost: true } },
        maintenanceLogs: { select: { cost: true } }
      }
    });

    let totalRoiSum = 0;
    let vehiclesWithCost = 0;

    for (const v of vehicles) {
      const acq = Number(v.acquisitionCost || 0);
      if (acq <= 0) continue;
      
      const rev = v.trips.reduce((sum, t) => sum + Number(t.revenue || 0), 0);
      const fuel = v.fuelLogs.reduce((sum, f) => sum + Number(f.cost || 0), 0);
      const maint = v.maintenanceLogs.reduce((sum, m) => sum + Number(m.cost || 0), 0);
      
      const roi = (rev - (maint + fuel)) / acq;
      totalRoiSum += roi;
      vehiclesWithCost++;
    }

    const avgVehicleROI = vehiclesWithCost > 0 ? (totalRoiSum / vehiclesWithCost) * 100 : 0; // as %

    return {
      fleetUtilizationPct: Number(fleetUtilizationPct.toFixed(2)),
      operationalCost,
      fuelEfficiency: Number(fuelEfficiency.toFixed(2)),
      avgVehicleROI: Number(avgVehicleROI.toFixed(2))
    };
  }

  static async getMonthlyRevenue() {
    const trips = await prisma.trip.findMany({
      where: { status: TripStatus.COMPLETED, completedAt: { not: null } },
      select: { completedAt: true, revenue: true }
    });

    const monthlyMap: Record<string, number> = {};
    for (const t of trips) {
      if (!t.completedAt) continue;
      const monthYear = `${t.completedAt.getFullYear()}-${String(t.completedAt.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap[monthYear] = (monthlyMap[monthYear] || 0) + Number(t.revenue || 0);
    }

    return Object.keys(monthlyMap).sort().map(key => ({
      month: key,
      revenue: monthlyMap[key]
    }));
  }

  static async getTopCostliestVehicles(limit: number = 5) {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { avgCostPerKm: 'desc' },
      take: limit,
      select: { id: true, regNo: true, nameModel: true, avgCostPerKm: true }
    });
    return vehicles;
  }

  // --- CSV Export Streaming Logic ---
  static async *generateCsvStream(type: string): AsyncGenerator<string> {
    const BATCH_SIZE = 100;
    
    if (type === 'vehicles') {
      yield 'id,regNo,nameModel,type,capacityKg,odometerKm,acquisitionCost,avgCostPerKm,status,createdAt\n';
      let cursor: string | undefined = undefined;
      while (true) {
        const batch: any[] = await prisma.vehicle.findMany({
          take: BATCH_SIZE, skip: cursor ? 1 : 0, cursor: cursor ? { id: cursor } : undefined, orderBy: { id: 'asc' }
        });
        if (batch.length === 0) break;
        for (const r of batch) {
          yield `${r.id},${r.regNo},${r.nameModel},${r.type},${r.capacityKg},${r.odometerKm},${r.acquisitionCost},${r.avgCostPerKm},${r.status},${r.createdAt.toISOString()}\n`;
        }
        cursor = batch[batch.length - 1].id;
      }
    } else if (type === 'drivers') {
      yield 'id,name,licenseNo,licenseCategory,licenseExpiry,status,createdAt\n';
      let cursor: string | undefined = undefined;
      while (true) {
        const batch: any[] = await prisma.driver.findMany({
          take: BATCH_SIZE, skip: cursor ? 1 : 0, cursor: cursor ? { id: cursor } : undefined, orderBy: { id: 'asc' }
        });
        if (batch.length === 0) break;
        for (const r of batch) {
          yield `${r.id},${r.name},${r.licenseNo},${r.licenseCategory},${r.licenseExpiry.toISOString()},${r.status},${r.createdAt.toISOString()}\n`;
        }
        cursor = batch[batch.length - 1].id;
      }
    } else if (type === 'trips') {
      yield 'id,tripCode,source,destination,vehicleId,driverId,cargoWeightKg,revenue,status,createdAt\n';
      let cursor: string | undefined = undefined;
      while (true) {
        const batch: any[] = await prisma.trip.findMany({
          take: BATCH_SIZE, skip: cursor ? 1 : 0, cursor: cursor ? { id: cursor } : undefined, orderBy: { id: 'asc' }
        });
        if (batch.length === 0) break;
        for (const r of batch) {
          yield `${r.id},${r.tripCode},${r.source},${r.destination},${r.vehicleId||''},${r.driverId||''},${r.cargoWeightKg},${r.revenue||0},${r.status},${r.createdAt.toISOString()}\n`;
        }
        cursor = batch[batch.length - 1].id;
      }
    } else if (type === 'expenses') {
      yield 'id,tripId,vehicleId,category,toll,other,total,createdAt\n';
      let cursor: string | undefined = undefined;
      while (true) {
        const batch: any[] = await prisma.expense.findMany({
          take: BATCH_SIZE, skip: cursor ? 1 : 0, cursor: cursor ? { id: cursor } : undefined, orderBy: { id: 'asc' }
        });
        if (batch.length === 0) break;
        for (const r of batch) {
          yield `${r.id},${r.tripId||''},${r.vehicleId||''},${r.category},${r.toll},${r.other},${r.total},${r.createdAt.toISOString()}\n`;
        }
        cursor = batch[batch.length - 1].id;
      }
    } else {
      throw { status: 400, message: 'Invalid export type' };
    }
  }
}
