import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function recalculateVehicleCostPerKm(vehicleId: string) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    select: { odometerKm: true }
  });

  if (!vehicle) return;

  const fuelAgg = await prisma.fuelLog.aggregate({
    where: { vehicleId },
    _sum: { cost: true }
  });
  
  const maintAgg = await prisma.maintenanceLog.aggregate({
    where: { vehicleId },
    _sum: { cost: true }
  });
  
  const expenseAgg = await prisma.expense.aggregate({
    where: { vehicleId },
    _sum: { total: true }
  });

  const totalCost = 
    Number(fuelAgg._sum.cost || 0) + 
    Number(maintAgg._sum.cost || 0) + 
    Number(expenseAgg._sum.total || 0);

  const avgCostPerKm = vehicle.odometerKm > 0 ? (totalCost / vehicle.odometerKm) : 0;

  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: { avgCostPerKm }
  });
}
