import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Tabs } from '../components/ui/Tabs';
import { apiClient } from '../lib/apiClient';
import {
  Bus,
  MapPin,
  Users,
  Navigation,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Phone,
  ShieldCheck,
  Compass,
  Clock,
  Radio,
  Sparkles,
} from 'lucide-react';

interface IBusItem {
  _id: string;
  busNumber: string;
  registrationNumber: string;
  capacity: number;
  model: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
  driverId?: { _id: string; name: string; phone: string; status: string } | null;
  currentLocation?: {
    lat: number;
    lng: number;
    speed: number;
    heading: number;
    updatedAt: string;
  };
}

interface IDriverItem {
  _id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  assignedBusId?: { _id: string; busNumber: string; registrationNumber: string } | null;
  status: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';
}

interface IRouteStop {
  stopName: string;
  pickupTime: string;
  dropTime: string;
  order: number;
}

interface IRouteItem {
  _id: string;
  name: string;
  busId?: { _id: string; busNumber: string; driverId?: { name: string; phone: string } } | null;
  stops: IRouteStop[];
  status: 'ACTIVE' | 'INACTIVE';
}

interface IAssignmentItem {
  _id: string;
  studentId: {
    _id: string;
    firstName: string;
    lastName: string;
    admissionNumber: string;
  };
  busId: { _id: string; busNumber: string; registrationNumber: string };
  routeId: { _id: string; name: string };
  stopName: string;
  pickupTime?: string;
  dropTime?: string;
  status: 'ACTIVE' | 'CANCELLED';
}

export const TransportPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('fleet');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Data states
  const [buses, setBuses] = useState<IBusItem[]>([]);
  const [drivers, setDrivers] = useState<IDriverItem[]>([]);
  const [routes, setRoutes] = useState<IRouteItem[]>([]);
  const [assignments, setAssignments] = useState<IAssignmentItem[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  // Modals
  const [isBusModalOpen, setIsBusModalOpen] = useState(false);
  const [busForm, setBusForm] = useState({
    busNumber: '',
    registrationNumber: '',
    capacity: 35,
    model: 'Tata Starbus',
    status: 'ACTIVE',
    driverId: '',
  });

  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [driverForm, setDriverForm] = useState({
    name: '',
    phone: '',
    licenseNumber: '',
    assignedBusId: '',
    status: 'ACTIVE',
  });

  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [routeForm, setRouteForm] = useState({
    name: '',
    busId: '',
    stops: [
      { stopName: 'Campus Main Gate', pickupTime: '07:30 AM', dropTime: '03:45 PM', order: 1 },
      { stopName: 'Central Square', pickupTime: '07:45 AM', dropTime: '03:30 PM', order: 2 },
      { stopName: 'North Avenue', pickupTime: '08:00 AM', dropTime: '03:15 PM', order: 3 },
    ],
  });

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({
    studentId: '',
    busId: '',
    routeId: '',
    stopName: '',
    pickupTime: '07:45 AM',
    dropTime: '03:30 PM',
  });

  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Fetch all transport data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [busRes, driverRes, routeRes, assignRes, studentRes] = await Promise.all([
        apiClient.get('/transport/buses'),
        apiClient.get('/transport/drivers'),
        apiClient.get('/transport/routes'),
        apiClient.get('/transport/assignments'),
        apiClient.get('/students?limit=100'),
      ]);

      if (busRes.data.success) setBuses(busRes.data.data);
      if (driverRes.data.success) setDrivers(driverRes.data.data);
      if (routeRes.data.success) setRoutes(routeRes.data.data);
      if (assignRes.data.success) setAssignments(assignRes.data.data);
      if (studentRes.data.success) setStudents(studentRes.data.data.students || studentRes.data.data);
    } catch (err) {
      console.error('Failed to load transport data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Create Bus
  const handleCreateBus = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');
    try {
      const payload: any = { ...busForm };
      if (!payload.driverId) delete payload.driverId;
      const res = await apiClient.post('/transport/buses', payload);
      if (res.data.success) {
        setToastMessage(`Bus ${busForm.busNumber} registered successfully!`);
        setIsBusModalOpen(false);
        setBusForm({
          busNumber: '',
          registrationNumber: '',
          capacity: 35,
          model: 'Tata Starbus',
          status: 'ACTIVE',
          driverId: '',
        });
        fetchData();
      }
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to register bus');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBus = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bus?')) return;
    try {
      await apiClient.delete(`/transport/buses/${id}`);
      fetchData();
    } catch (err) {
      console.error('Failed to delete bus', err);
    }
  };

  // Create Driver
  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');
    try {
      const payload: any = { ...driverForm };
      if (!payload.assignedBusId) delete payload.assignedBusId;
      const res = await apiClient.post('/transport/drivers', payload);
      if (res.data.success) {
        setToastMessage(`Driver ${driverForm.name} added successfully!`);
        setIsDriverModalOpen(false);
        setDriverForm({
          name: '',
          phone: '',
          licenseNumber: '',
          assignedBusId: '',
          status: 'ACTIVE',
        });
        fetchData();
      }
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to add driver');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDriver = async (id: string) => {
    if (!confirm('Are you sure you want to delete this driver?')) return;
    try {
      await apiClient.delete(`/transport/drivers/${id}`);
      fetchData();
    } catch (err) {
      console.error('Failed to delete driver', err);
    }
  };

  // Create Route
  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');
    try {
      const payload: any = { ...routeForm };
      if (!payload.busId) delete payload.busId;
      const res = await apiClient.post('/transport/routes', payload);
      if (res.data.success) {
        setToastMessage(`Route "${routeForm.name}" created successfully!`);
        setIsRouteModalOpen(false);
        fetchData();
      }
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to create route');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRoute = async (id: string) => {
    if (!confirm('Delete route?')) return;
    try {
      await apiClient.delete(`/transport/routes/${id}`);
      fetchData();
    } catch (err) {
      console.error('Failed to delete route', err);
    }
  };

  // Assign Student
  const handleAssignStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');
    try {
      const res = await apiClient.post('/transport/assignments', assignForm);
      if (res.data.success) {
        setToastMessage('Student assigned to transport successfully!');
        setIsAssignModalOpen(false);
        fetchData();
      }
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to assign student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    try {
      await apiClient.delete(`/transport/assignments/${id}`);
      fetchData();
    } catch (err) {
      console.error('Failed to remove assignment', err);
    }
  };

  // Simulate Live GPS
  const handleSimulateGps = async (busId: string) => {
    try {
      const deltaLat = (Math.random() - 0.5) * 0.01;
      const deltaLng = (Math.random() - 0.5) * 0.01;
      const speed = Math.floor(25 + Math.random() * 25);
      const heading = Math.floor(Math.random() * 360);

      const targetBus = buses.find((b) => b._id === busId);
      const currentLat = targetBus?.currentLocation?.lat || 28.6139;
      const currentLng = targetBus?.currentLocation?.lng || 77.209;

      await apiClient.post(`/transport/buses/${busId}/location`, {
        lat: Number((currentLat + deltaLat).toFixed(6)),
        lng: Number((currentLng + deltaLng).toFixed(6)),
        speed,
        heading,
      });

      setToastMessage(`GPS update simulated for Bus ${targetBus?.busNumber}: ${speed} km/h`);
      fetchData();
    } catch (err) {
      console.error('Failed to simulate GPS update', err);
    }
  };

  // Metrics
  const activeBuses = buses.filter((b) => b.status === 'ACTIVE').length;
  const totalCapacity = buses.reduce((acc, b) => acc + (b.capacity || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900">Transport & Fleet Management</h1>
            <Badge variant="info">Sprint 9 Active</Badge>
          </div>
          <p className="text-xs text-slate-500">
            Real-time GPS bus tracking, route planning, driver assignments, and student transport subscriptions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            isLoading={loading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          {activeTab === 'fleet' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setModalError('');
                setIsBusModalOpen(true);
              }}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Bus
            </Button>
          )}
          {activeTab === 'routes' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setModalError('');
                setIsRouteModalOpen(true);
              }}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              New Route
            </Button>
          )}
          {activeTab === 'drivers' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setModalError('');
                setIsDriverModalOpen(true);
              }}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Driver
            </Button>
          )}
          {activeTab === 'assignments' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setModalError('');
                setIsAssignModalOpen(true);
              }}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Assign Student
            </Button>
          )}
        </div>
      </div>

      {/* Toast message */}
      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button className="text-emerald-700 font-bold ml-4" onClick={() => setToastMessage(null)}>
            ×
          </button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Fleet</p>
            <h3 className="text-xl font-bold text-slate-900">{buses.length} Buses</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Live On Route</p>
            <h3 className="text-xl font-bold text-emerald-700">{activeBuses} Active</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <Navigation className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Configured Routes</p>
            <h3 className="text-xl font-bold text-slate-900">{routes.length} Routes</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Students Transported</p>
            <h3 className="text-xl font-bold text-slate-900">{assignments.length} Enrolled</h3>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'fleet', label: 'Fleet / Buses' },
          { id: 'live', label: 'Live GPS Tracking' },
          { id: 'routes', label: 'Routes & Stops' },
          { id: 'drivers', label: 'Drivers' },
          { id: 'assignments', label: 'Student Subscriptions' },
        ]}
      />

      {/* TAB 1: FLEET / BUSES */}
      {activeTab === 'fleet' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Bus Identifier</th>
                  <th className="py-3 px-4">Registration</th>
                  <th className="py-3 px-4">Model & Capacity</th>
                  <th className="py-3 px-4">Assigned Driver</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {buses.map((bus) => (
                  <tr key={bus._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center">
                        <Bus className="w-4 h-4" />
                      </div>
                      {bus.busNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      {bus.registrationNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{bus.model || 'Standard Bus'}</div>
                      <div className="text-[11px] text-slate-400">{bus.capacity} Passenger Seats</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {bus.driverId ? (
                        <div>
                          <div className="font-semibold text-slate-800">{bus.driverId.name}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {bus.driverId.phone}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No driver assigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          bus.status === 'ACTIVE'
                            ? 'success'
                            : bus.status === 'MAINTENANCE'
                            ? 'warning'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {bus.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSimulateGps(bus._id)}
                        leftIcon={<Navigation className="w-3 h-3 text-brand-600" />}
                      >
                        Ping GPS
                      </Button>
                      <button
                        onClick={() => handleDeleteBus(bus._id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}

                {buses.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs italic">
                      No buses registered yet. Click "Add Bus" to build your transport fleet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE GPS TRACKING */}
      {activeTab === 'live' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Buses list */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                Live Fleet Radar ({buses.filter((b) => b.status === 'ACTIVE').length} Active)
              </h2>

              {buses
                .filter((b) => b.status === 'ACTIVE')
                .map((bus) => (
                  <div
                    key={bus._id}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                        <span className="font-bold text-slate-900 text-sm">{bus.busNumber}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          ({bus.registrationNumber})
                        </span>
                      </div>
                      <Badge variant="success" size="sm">
                        {bus.currentLocation?.speed || 0} km/h
                      </Badge>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                      <div className="flex justify-between text-slate-500 text-[11px]">
                        <span>GPS Coordinates:</span>
                        <span className="font-mono text-slate-700">
                          {bus.currentLocation?.lat.toFixed(4)}, {bus.currentLocation?.lng.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-500 text-[11px]">
                        <span>Driver:</span>
                        <span className="font-semibold text-slate-800">
                          {bus.driverId?.name || 'Unassigned'}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-500 text-[11px]">
                        <span>Last Satellite Ping:</span>
                        <span className="text-slate-400">
                          {bus.currentLocation?.updatedAt
                            ? new Date(bus.currentLocation.updatedAt).toLocaleTimeString()
                            : 'Just now'}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleSimulateGps(bus._id)}
                      leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                    >
                      Simulate Driving Ping (+Movement)
                    </Button>
                  </div>
                ))}
            </div>

            {/* Virtual Radar & Map Display */}
            <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 p-6 text-white relative min-h-[420px] flex flex-col justify-between overflow-hidden shadow-xl">
              {/* Grid overlay background effect */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-40 pointer-events-none" />

              <div className="relative z-10 flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-brand-400 animate-spin duration-1000" />
                  <span className="font-bold text-sm tracking-wide">Live Telemetry Map Engine</span>
                </div>
                <Badge variant="info" size="sm">
                  Active Coordinates Tracking
                </Badge>
              </div>

              {/* Map Route Simulation Visualization */}
              <div className="relative z-10 py-8">
                <div className="space-y-6">
                  {routes.map((route, rIdx) => (
                    <div key={route._id} className="bg-slate-800/80 rounded-xl p-4 border border-slate-700">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-xs text-brand-300">
                          Route #{rIdx + 1}: {route.name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {route.busId?.busNumber ? `Assigned to ${route.busId.busNumber}` : 'Pending Bus'}
                        </span>
                      </div>

                      {/* Route progression bar */}
                      <div className="flex items-center justify-between relative mt-4">
                        <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-700 -translate-y-1/2" />
                        {route.stops.map((stop, sIdx) => (
                          <div
                            key={sIdx}
                            className="relative z-10 flex flex-col items-center text-center max-w-[90px]"
                          >
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                sIdx === 0
                                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/50'
                                  : 'bg-slate-800 border-2 border-slate-600 text-slate-300'
                              }`}
                            >
                              {sIdx + 1}
                            </div>
                            <span className="text-[10px] font-semibold text-slate-200 mt-1.5 truncate w-full">
                              {stop.stopName}
                            </span>
                            <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" /> {stop.pickupTime}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {routes.length === 0 && (
                    <div className="text-center py-12 text-slate-500 text-xs italic">
                      No routes plotted on the live tracking radar. Create routes to visualize stops.
                    </div>
                  )}
                </div>
              </div>

              {/* Status bar */}
              <div className="relative z-10 border-t border-slate-800 pt-4 flex items-center justify-between text-xs text-slate-400">
                <span>GPS Protocol: WGS84 Standard GeoJSON</span>
                <span className="text-emerald-400 font-mono">Status: Connected & Streaming</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ROUTES & STOPS */}
      {activeTab === 'routes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {routes.map((route) => (
            <div
              key={route._id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-brand-600" />
                    <h3 className="font-bold text-slate-900 text-sm">{route.name}</h3>
                  </div>
                  <button
                    onClick={() => handleDeleteRoute(route._id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
                  <span>Assigned Vehicle:</span>
                  <span className="font-semibold text-slate-800">
                    {route.busId?.busNumber || 'None (Unassigned)'}
                  </span>
                </div>

                {/* Stops sequence */}
                <div className="mt-4 space-y-2">
                  <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                    Scheduled Stops ({route.stops.length})
                  </span>
                  <div className="space-y-1.5">
                    {route.stops.map((stop, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 font-bold text-[10px] flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-slate-800">{stop.stopName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-3">
                          <span>Pick: {stop.pickupTime}</span>
                          <span>Drop: {stop.dropTime}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <Badge variant={route.status === 'ACTIVE' ? 'success' : 'neutral'} size="sm">
                  {route.status}
                </Badge>
                <span className="text-[11px] text-slate-400">
                  {route.stops.length} checkpoints along route
                </span>
              </div>
            </div>
          ))}

          {routes.length === 0 && (
            <div className="col-span-2 bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs italic">
              No routes configured yet. Click "New Route" to add your school's bus routes and stops.
            </div>
          )}
        </div>
      )}

      {/* TAB 4: DRIVERS */}
      {activeTab === 'drivers' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {drivers.map((driver) => (
            <div
              key={driver._id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-700 font-bold flex items-center justify-center">
                      {driver.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{driver.name}</h3>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {driver.phone}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteDriver(driver._id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Driver License:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {driver.licenseNumber}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Assigned Vehicle:</span>
                    <span className="font-semibold text-brand-700">
                      {driver.assignedBusId?.busNumber || 'None'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                <Badge
                  variant={
                    driver.status === 'ACTIVE'
                      ? 'success'
                      : driver.status === 'ON_LEAVE'
                      ? 'warning'
                      : 'neutral'
                  }
                  size="sm"
                >
                  {driver.status}
                </Badge>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Driver
                </span>
              </div>
            </div>
          ))}

          {drivers.length === 0 && (
            <div className="col-span-3 bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs italic">
              No transport drivers registered. Click "Add Driver" to register certified drivers.
            </div>
          )}
        </div>
      )}

      {/* TAB 5: STUDENT SUBSCRIPTIONS */}
      {activeTab === 'assignments' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Bus</th>
                  <th className="py-3 px-4">Route</th>
                  <th className="py-3 px-4">Designated Stop</th>
                  <th className="py-3 px-4">Timings</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {assignments.map((asg) => (
                  <tr key={asg._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      <div>
                        {asg.studentId?.firstName} {asg.studentId?.lastName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Adm: {asg.studentId?.admissionNumber}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {asg.busId?.busNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {asg.routeId?.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="flex items-center gap-1 font-semibold text-slate-800">
                        <MapPin className="w-3.5 h-3.5 text-brand-600" /> {asg.stopName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      <div>Pickup: {asg.pickupTime || '07:45 AM'}</div>
                      <div>Drop: {asg.dropTime || '03:30 PM'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteAssignment(asg._id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 transition-colors"
                        title="Cancel transport subscription"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}

                {assignments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs italic">
                      No student transport subscriptions found. Click "Assign Student" to enroll students.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD BUS */}
      <Modal isOpen={isBusModalOpen} onClose={() => setIsBusModalOpen(false)} title="Register New Bus" size="sm">
        <form onSubmit={handleCreateBus} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <Input
            label="Bus Identifier / Code *"
            required
            placeholder="e.g. BUS-01"
            value={busForm.busNumber}
            onChange={(e) => setBusForm({ ...busForm, busNumber: e.target.value })}
          />

          <Input
            label="Registration / Number Plate *"
            required
            placeholder="e.g. MH-12-AB-4567"
            value={busForm.registrationNumber}
            onChange={(e) => setBusForm({ ...busForm, registrationNumber: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Seating Capacity *"
              type="number"
              required
              value={busForm.capacity}
              onChange={(e) => setBusForm({ ...busForm, capacity: Number(e.target.value) })}
            />
            <Input
              label="Vehicle Model"
              value={busForm.model}
              onChange={(e) => setBusForm({ ...busForm, model: e.target.value })}
            />
          </div>

          <Select
            label="Assign Driver"
            value={busForm.driverId}
            onChange={(e) => setBusForm({ ...busForm, driverId: e.target.value })}
            options={[
              { value: '', label: 'Unassigned' },
              ...drivers.map((d) => ({ value: d._id, label: `${d.name} (${d.phone})` })),
            ]}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsBusModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
              Register Bus
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: ADD DRIVER */}
      <Modal isOpen={isDriverModalOpen} onClose={() => setIsDriverModalOpen(false)} title="Register Driver" size="sm">
        <form onSubmit={handleCreateDriver} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <Input
            label="Full Name *"
            required
            placeholder="e.g. Rajesh Kumar"
            value={driverForm.name}
            onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })}
          />

          <Input
            label="Phone Number *"
            required
            placeholder="e.g. +91 98765 43210"
            value={driverForm.phone}
            onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })}
          />

          <Input
            label="Driver License Number *"
            required
            placeholder="e.g. DL-0420110012345"
            value={driverForm.licenseNumber}
            onChange={(e) => setDriverForm({ ...driverForm, licenseNumber: e.target.value })}
          />

          <Select
            label="Assign to Bus"
            value={driverForm.assignedBusId}
            onChange={(e) => setDriverForm({ ...driverForm, assignedBusId: e.target.value })}
            options={[
              { value: '', label: 'Unassigned' },
              ...buses.map((b) => ({ value: b._id, label: `${b.busNumber} (${b.registrationNumber})` })),
            ]}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsDriverModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
              Save Driver
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: CREATE ROUTE */}
      <Modal isOpen={isRouteModalOpen} onClose={() => setIsRouteModalOpen(false)} title="Create New Route" size="md">
        <form onSubmit={handleCreateRoute} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <Input
            label="Route Name *"
            required
            placeholder="e.g. Route 1 - North City Expressway"
            value={routeForm.name}
            onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })}
          />

          <Select
            label="Designate Vehicle"
            value={routeForm.busId}
            onChange={(e) => setRouteForm({ ...routeForm, busId: e.target.value })}
            options={[
              { value: '', label: 'Unassigned' },
              ...buses.map((b) => ({ value: b._id, label: `${b.busNumber} (${b.model})` })),
            ]}
          />

          {/* Stops List */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-slate-700">Route Checkpoint Stops</label>
            {routeForm.stops.map((stop, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded-xl">
                <span className="col-span-1 text-center font-bold text-xs text-brand-600">
                  #{idx + 1}
                </span>
                <div className="col-span-5">
                  <input
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                    placeholder="Stop Name"
                    value={stop.stopName}
                    onChange={(e) => {
                      const updated = [...routeForm.stops];
                      updated[idx].stopName = e.target.value;
                      setRouteForm({ ...routeForm, stops: updated });
                    }}
                  />
                </div>
                <div className="col-span-3">
                  <input
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                    placeholder="Pickup Time"
                    value={stop.pickupTime}
                    onChange={(e) => {
                      const updated = [...routeForm.stops];
                      updated[idx].pickupTime = e.target.value;
                      setRouteForm({ ...routeForm, stops: updated });
                    }}
                  />
                </div>
                <div className="col-span-3">
                  <input
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                    placeholder="Drop Time"
                    value={stop.dropTime}
                    onChange={(e) => {
                      const updated = [...routeForm.stops];
                      updated[idx].dropTime = e.target.value;
                      setRouteForm({ ...routeForm, stops: updated });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsRouteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
              Create Route
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: ASSIGN STUDENT */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Assign Student to Bus" size="sm">
        <form onSubmit={handleAssignStudent} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <Select
            label="Select Student *"
            value={assignForm.studentId}
            onChange={(e) => setAssignForm({ ...assignForm, studentId: e.target.value })}
            options={[
              { value: '', label: 'Select Student' },
              ...students.map((s) => ({
                value: s._id,
                label: `${s.firstName} ${s.lastName} (${s.admissionNumber})`,
              })),
            ]}
          />

          <Select
            label="Assign Bus *"
            value={assignForm.busId}
            onChange={(e) => setAssignForm({ ...assignForm, busId: e.target.value })}
            options={[
              { value: '', label: 'Select Bus' },
              ...buses.map((b) => ({ value: b._id, label: `${b.busNumber} (${b.capacity} Seats)` })),
            ]}
          />

          <Select
            label="Assign Route *"
            value={assignForm.routeId}
            onChange={(e) => setAssignForm({ ...assignForm, routeId: e.target.value })}
            options={[
              { value: '', label: 'Select Route' },
              ...routes.map((r) => ({ value: r._id, label: r.name })),
            ]}
          />

          <Input
            label="Designated Boarding / Drop Stop *"
            required
            placeholder="e.g. Central Square Stop"
            value={assignForm.stopName}
            onChange={(e) => setAssignForm({ ...assignForm, stopName: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Pickup Time"
              value={assignForm.pickupTime}
              onChange={(e) => setAssignForm({ ...assignForm, pickupTime: e.target.value })}
            />
            <Input
              label="Drop Time"
              value={assignForm.dropTime}
              onChange={(e) => setAssignForm({ ...assignForm, dropTime: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
              Enroll Student
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
