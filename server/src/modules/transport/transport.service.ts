import { Bus, Driver, Route, TransportAssignment } from './transport.model.js';
import { NotFoundError, ConflictError } from '../../utils/appError.js';

export class TransportService {
  // ==========================================
  // BUSES
  // ==========================================
  static async getBuses(schoolId: string) {
    return Bus.find({ schoolId })
      .populate('driverId', 'name phone licenseNumber status')
      .sort({ busNumber: 1 })
      .lean();
  }

  static async createBus(schoolId: string, data: any) {
    const existing = await Bus.findOne({ schoolId, busNumber: data.busNumber });
    if (existing) {
      throw new ConflictError(`Bus with number "${data.busNumber}" already exists.`);
    }

    const bus = await Bus.create({
      ...data,
      schoolId,
    });

    if (data.driverId) {
      await Driver.findByIdAndUpdate(data.driverId, { assignedBusId: bus._id });
    }

    return bus;
  }

  static async updateBus(schoolId: string, busId: string, data: any) {
    const bus = await Bus.findOne({ _id: busId, schoolId });
    if (!bus) throw new NotFoundError('Bus not found');

    Object.assign(bus, data);
    await bus.save();

    if (data.driverId) {
      await Driver.findByIdAndUpdate(data.driverId, { assignedBusId: bus._id });
    }

    return bus;
  }

  static async deleteBus(schoolId: string, busId: string) {
    const bus = await Bus.findOne({ _id: busId, schoolId });
    if (!bus) throw new NotFoundError('Bus not found');

    await Driver.updateMany({ assignedBusId: bus._id }, { $set: { assignedBusId: null } });
    await Route.updateMany({ busId: bus._id }, { $set: { busId: null } });
    await TransportAssignment.deleteMany({ busId: bus._id });
    await bus.deleteOne();
  }

  // ==========================================
  // DRIVERS
  // ==========================================
  static async getDrivers(schoolId: string) {
    return Driver.find({ schoolId })
      .populate('assignedBusId', 'busNumber registrationNumber capacity status')
      .sort({ name: 1 })
      .lean();
  }

  static async createDriver(schoolId: string, data: any) {
    const driver = await Driver.create({
      ...data,
      schoolId,
    });

    if (data.assignedBusId) {
      await Bus.findByIdAndUpdate(data.assignedBusId, { driverId: driver._id });
    }

    return driver;
  }

  static async updateDriver(schoolId: string, driverId: string, data: any) {
    const driver = await Driver.findOne({ _id: driverId, schoolId });
    if (!driver) throw new NotFoundError('Driver not found');

    Object.assign(driver, data);
    await driver.save();

    if (data.assignedBusId) {
      await Bus.findByIdAndUpdate(data.assignedBusId, { driverId: driver._id });
    }

    return driver;
  }

  static async deleteDriver(schoolId: string, driverId: string) {
    const driver = await Driver.findOne({ _id: driverId, schoolId });
    if (!driver) throw new NotFoundError('Driver not found');

    await Bus.updateMany({ driverId: driver._id }, { $set: { driverId: null } });
    await driver.deleteOne();
  }

  // ==========================================
  // ROUTES & STOPS
  // ==========================================
  static async getRoutes(schoolId: string) {
    return Route.find({ schoolId })
      .populate({
        path: 'busId',
        select: 'busNumber registrationNumber capacity status driverId currentLocation',
        populate: { path: 'driverId', select: 'name phone' },
      })
      .sort({ name: 1 })
      .lean();
  }

  static async createRoute(schoolId: string, data: any) {
    return Route.create({
      ...data,
      schoolId,
    });
  }

  static async updateRoute(schoolId: string, routeId: string, data: any) {
    const route = await Route.findOne({ _id: routeId, schoolId });
    if (!route) throw new NotFoundError('Route not found');

    Object.assign(route, data);
    await route.save();
    return route;
  }

  static async deleteRoute(schoolId: string, routeId: string) {
    const route = await Route.findOne({ _id: routeId, schoolId });
    if (!route) throw new NotFoundError('Route not found');

    await TransportAssignment.deleteMany({ routeId: route._id });
    await route.deleteOne();
  }

  // ==========================================
  // STUDENT ASSIGNMENTS
  // ==========================================
  static async getAssignments(schoolId: string) {
    return TransportAssignment.find({ schoolId })
      .populate('studentId', 'firstName lastName admissionNumber rollNumber grade section')
      .populate('busId', 'busNumber registrationNumber')
      .populate('routeId', 'name')
      .sort({ createdAt: -1 })
      .lean();
  }

  static async assignStudent(schoolId: string, data: any) {
    const existing = await TransportAssignment.findOne({
      schoolId,
      studentId: data.studentId,
    });

    if (existing) {
      Object.assign(existing, data, { status: 'ACTIVE' });
      await existing.save();
      return existing;
    }

    return TransportAssignment.create({
      ...data,
      schoolId,
    });
  }

  static async removeAssignment(schoolId: string, assignmentId: string) {
    const assignment = await TransportAssignment.findOne({ _id: assignmentId, schoolId });
    if (!assignment) throw new NotFoundError('Transport assignment not found');
    await assignment.deleteOne();
  }

  // ==========================================
  // GPS TRACKING
  // ==========================================
  static async updateLocation(
    schoolId: string,
    busId: string,
    locationData: { lat: number; lng: number; speed?: number; heading?: number }
  ) {
    const bus = await Bus.findOne({ _id: busId, schoolId });
    if (!bus) throw new NotFoundError('Bus not found');

    bus.currentLocation = {
      lat: locationData.lat,
      lng: locationData.lng,
      speed: locationData.speed ?? 0,
      heading: locationData.heading ?? 0,
      updatedAt: new Date(),
    };

    await bus.save();
    return bus.currentLocation;
  }

  static async getLiveFleet(schoolId: string) {
    return Bus.find({ schoolId, status: 'ACTIVE' })
      .select('busNumber registrationNumber model status currentLocation driverId')
      .populate('driverId', 'name phone')
      .lean();
  }
}
