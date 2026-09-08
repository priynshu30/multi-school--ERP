import mongoose, { Document, Schema, Types } from 'mongoose';

// ==========================================
// BUS MODEL
// ==========================================
export type BusStatus = 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';

export interface IBusLocation {
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  updatedAt: Date;
}

export interface IBus extends Omit<Document, 'model'> {
  schoolId: Types.ObjectId;
  busNumber: string;
  registrationNumber: string;
  capacity: number;
  model?: string;
  status: BusStatus;
  driverId?: Types.ObjectId | null;
  currentLocation?: IBusLocation;
  createdAt: Date;
  updatedAt: Date;
}

const busSchema = new Schema<IBus>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    busNumber: { type: String, required: true, trim: true },
    registrationNumber: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, default: 30 },
    model: { type: String, trim: true, default: 'Standard Bus' },
    status: {
      type: String,
      enum: ['ACTIVE', 'MAINTENANCE', 'INACTIVE'],
      default: 'ACTIVE',
    },
    driverId: { type: Schema.Types.ObjectId, ref: 'Driver', default: null },
    currentLocation: {
      lat: { type: Number, default: 28.6139 },
      lng: { type: Number, default: 77.209 },
      speed: { type: Number, default: 0 },
      heading: { type: Number, default: 0 },
      updatedAt: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

busSchema.index({ schoolId: 1, busNumber: 1 }, { unique: true });

export const Bus = mongoose.model<IBus>('Bus', busSchema);

// ==========================================
// DRIVER MODEL
// ==========================================
export type DriverStatus = 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';

export interface IDriver extends Document {
  schoolId: Types.ObjectId;
  name: string;
  phone: string;
  licenseNumber: string;
  assignedBusId?: Types.ObjectId | null;
  status: DriverStatus;
  createdAt: Date;
  updatedAt: Date;
}

const driverSchema = new Schema<IDriver>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    licenseNumber: { type: String, required: true, trim: true },
    assignedBusId: { type: Schema.Types.ObjectId, ref: 'Bus', default: null },
    status: {
      type: String,
      enum: ['ACTIVE', 'ON_LEAVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

export const Driver = mongoose.model<IDriver>('Driver', driverSchema);

// ==========================================
// ROUTE & STOP MODEL
// ==========================================
export interface IRouteStop {
  _id?: Types.ObjectId;
  stopName: string;
  pickupTime: string;
  dropTime: string;
  order: number;
  lat?: number;
  lng?: number;
}

export interface IRoute extends Document {
  schoolId: Types.ObjectId;
  name: string;
  busId?: Types.ObjectId | null;
  stops: IRouteStop[];
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const routeSchema = new Schema<IRoute>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    name: { type: String, required: true, trim: true },
    busId: { type: Schema.Types.ObjectId, ref: 'Bus', default: null },
    stops: [
      {
        stopName: { type: String, required: true, trim: true },
        pickupTime: { type: String, required: true, trim: true },
        dropTime: { type: String, required: true, trim: true },
        order: { type: Number, required: true, default: 1 },
        lat: { type: Number, default: 28.6139 },
        lng: { type: Number, default: 77.209 },
      },
    ],
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

routeSchema.index({ schoolId: 1, name: 1 });

export const Route = mongoose.model<IRoute>('Route', routeSchema);

// ==========================================
// STUDENT TRANSPORT ASSIGNMENT
// ==========================================
export interface ITransportAssignment extends Document {
  schoolId: Types.ObjectId;
  studentId: Types.ObjectId;
  busId: Types.ObjectId;
  routeId: Types.ObjectId;
  stopName: string;
  pickupTime?: string;
  dropTime?: string;
  status: 'ACTIVE' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

const transportAssignmentSchema = new Schema<ITransportAssignment>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    busId: { type: Schema.Types.ObjectId, ref: 'Bus', required: true, index: true },
    routeId: { type: Schema.Types.ObjectId, ref: 'Route', required: true, index: true },
    stopName: { type: String, required: true, trim: true },
    pickupTime: { type: String, trim: true },
    dropTime: { type: String, trim: true },
    status: { type: String, enum: ['ACTIVE', 'CANCELLED'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

transportAssignmentSchema.index({ schoolId: 1, studentId: 1 }, { unique: true });

export const TransportAssignment = mongoose.model<ITransportAssignment>(
  'TransportAssignment',
  transportAssignmentSchema
);
