import { PrismaClient, Prisma, TripStatus, VehicleStatus, DriverStatus } from '@prisma/client';
import { recalculateVehicleCostPerKm } from '../../utils/cost-calculator';

const prisma = new PrismaClient();

export class TripService {
  static async getAllTrips(filters: { status?: string; vehicleId?: string; driverId?: string; search?: string }) {
    const where: Prisma.TripWhereInput = {};
    if (filters.status) where.status = filters.status as TripStatus;
    if (filters.vehicleId) where.vehicleId = filters.vehicleId;
    if (filters.driverId) where.driverId = filters.driverId;
    if (filters.search) {
      where.OR = [
        { tripCode: { contains: filters.search, mode: 'insensitive' } },
        { source: { contains: filters.search, mode: 'insensitive' } },
        { destination: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    return prisma.trip.findMany({ where, include: { vehicle: true, driver: true }, orderBy: { createdAt: 'desc' } });
  }

  static async getTripById(id: string) {
    return prisma.trip.findUnique({ where: { id }, include: { vehicle: true, driver: true } });
  }

  static async createTrip(data: Prisma.TripUncheckedCreateInput) {
    const tripCode = `TRP-${Date.now()}`;
    return prisma.trip.create({
      data: { ...data, tripCode, status: TripStatus.DRAFT }
    });
  }

  static async assignTrip(id: string, vehicleId: string, driverId: string) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    const driver = await prisma.driver.findUnique({ where: { id: driverId } });
    const trip = await prisma.trip.findUnique({ where: { id } });

    if (!vehicle || !driver || !trip) throw { status: 404, message: 'Entity not found' };
    if (trip.status !== TripStatus.DRAFT) throw { status: 422, message: 'Only DRAFT trips can be assigned' };

    // BR-1: Capacity validation
    if (trip.cargoWeightKg > vehicle.capacityKg) {
      throw { 
        status: 422, 
        message: `Vehicle Capacity ${vehicle.capacityKg} kg, Cargo Weight ${trip.cargoWeightKg} kg \u2014 Capacity exceeded by ${trip.cargoWeightKg - vehicle.capacityKg} kg \u2014 dispatch blocked.` 
      };
    }
    
    // BR-2 & BR-4: Availability and Expiry check
    if (vehicle.status !== VehicleStatus.AVAILABLE) throw { status: 409, message: 'Vehicle is not available' };
    if (driver.status !== DriverStatus.AVAILABLE) throw { status: 409, message: 'Driver is not available' };
    if (new Date(driver.licenseExpiry) < new Date()) throw { status: 422, message: 'Driver license is expired' };

    return prisma.trip.update({
      where: { id },
      data: { vehicleId, driverId }
    });
  }

  static async dispatchTrip(id: string) {
    return prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({ where: { id }, include: { vehicle: true, driver: true } });
      if (!trip) throw { status: 404, message: 'Trip not found' };
      if (trip.status !== TripStatus.DRAFT) throw { status: 422, message: 'Only DRAFT trips can be dispatched' };
      if (!trip.vehicleId || !trip.driverId) throw { status: 422, message: 'Trip must be assigned to vehicle and driver' };

      const vehicle = trip.vehicle!;
      const driver = trip.driver!;

      // Re-verify BR-1 & BR-2 & BR-4
      if (trip.cargoWeightKg > vehicle.capacityKg) {
        throw { status: 422, message: `Vehicle Capacity ${vehicle.capacityKg} kg, Cargo Weight ${trip.cargoWeightKg} kg \u2014 Capacity exceeded by ${trip.cargoWeightKg - vehicle.capacityKg} kg \u2014 dispatch blocked.` };
      }
      if (vehicle.status !== VehicleStatus.AVAILABLE) throw { status: 409, message: 'Vehicle is not available' };
      if (driver.status !== DriverStatus.AVAILABLE) throw { status: 409, message: 'Driver is not available' };
      if (new Date(driver.licenseExpiry) < new Date()) throw { status: 422, message: 'Driver license is expired' };

      // BR-3: Dispatched flip
      await tx.vehicle.update({ where: { id: vehicle.id }, data: { status: VehicleStatus.ON_TRIP } });
      await tx.driver.update({ where: { id: driver.id }, data: { status: DriverStatus.ON_TRIP } });
      
      return tx.trip.update({
        where: { id },
        data: { status: TripStatus.DISPATCHED, dispatchedAt: new Date() }
      });
    });
  }

  static async completeTrip(id: string, finalOdometerKm: number, fuelConsumedLiters: number, fuelCost: number, revenue?: number) {
    const updatedTrip = await prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({ where: { id }, include: { vehicle: true, driver: true } });
      if (!trip) throw { status: 404, message: 'Trip not found' };
      if (trip.status !== TripStatus.DISPATCHED) throw { status: 422, message: 'Only DISPATCHED trips can be completed' };
      
      const vehicle = trip.vehicle!;
      const driver = trip.driver!;

      if (finalOdometerKm < vehicle.odometerKm) {
        throw { status: 422, message: 'Final odometer cannot be less than current odometer' };
      }

      // BR-6: Complete flip, auto fuel log
      await tx.fuelLog.create({
        data: {
          vehicleId: vehicle.id,
          tripId: trip.id,
          date: new Date(),
          liters: fuelConsumedLiters,
          cost: fuelCost
        }
      });

      // BR-3: Release vehicle & driver
      await tx.vehicle.update({ 
        where: { id: vehicle.id }, 
        data: { status: VehicleStatus.AVAILABLE, odometerKm: finalOdometerKm } 
      });
      await tx.driver.update({ 
        where: { id: driver.id }, 
        data: { status: DriverStatus.AVAILABLE } 
      });

      return tx.trip.update({
        where: { id },
        data: { 
          status: TripStatus.COMPLETED, 
          completedAt: new Date(),
          finalOdometerKm,
          fuelConsumedLiters,
          revenue
        }
      });
    });

    if (updatedTrip.vehicleId) {
      await recalculateVehicleCostPerKm(updatedTrip.vehicleId);
    }
    return updatedTrip;
  }

  static async cancelTrip(id: string, cancelReason: string) {
    return prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({ where: { id } });
      if (!trip) throw { status: 404, message: 'Trip not found' };
      if (trip.status === TripStatus.COMPLETED || trip.status === TripStatus.CANCELLED) {
        throw { status: 422, message: 'Cannot cancel completed or already cancelled trips' };
      }

      if (trip.vehicleId) {
        const v = await tx.vehicle.findUnique({ where: { id: trip.vehicleId } });
        if (v && v.status === VehicleStatus.ON_TRIP) {
          await tx.vehicle.update({ where: { id: trip.vehicleId }, data: { status: VehicleStatus.AVAILABLE } });
        }
      }
      if (trip.driverId) {
        const d = await tx.driver.findUnique({ where: { id: trip.driverId } });
        if (d && d.status === DriverStatus.ON_TRIP) {
          await tx.driver.update({ where: { id: trip.driverId }, data: { status: DriverStatus.AVAILABLE } });
        }
      }

      return tx.trip.update({
        where: { id },
        data: { status: TripStatus.CANCELLED, cancelledAt: new Date(), cancelReason }
      });
    });
  }
}
