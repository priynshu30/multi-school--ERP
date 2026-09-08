import { Router } from 'express';
import { TransportController } from './transport.controller.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { requireTenant } from '../../middlewares/tenantMiddleware.js';

const router = Router();

router.use(authenticate);
router.use(requireTenant);

// Fleet / Buses
router.get('/buses', TransportController.getBuses);
router.post('/buses', TransportController.createBus);
router.put('/buses/:id', TransportController.updateBus);
router.delete('/buses/:id', TransportController.deleteBus);

// Drivers
router.get('/drivers', TransportController.getDrivers);
router.post('/drivers', TransportController.createDriver);
router.put('/drivers/:id', TransportController.updateDriver);
router.delete('/drivers/:id', TransportController.deleteDriver);

// Routes & Stops
router.get('/routes', TransportController.getRoutes);
router.post('/routes', TransportController.createRoute);
router.put('/routes/:id', TransportController.updateRoute);
router.delete('/routes/:id', TransportController.deleteRoute);

// Student Assignments
router.get('/assignments', TransportController.getAssignments);
router.post('/assignments', TransportController.assignStudent);
router.delete('/assignments/:id', TransportController.removeAssignment);

// Live GPS Tracking
router.get('/live', TransportController.getLiveFleet);
router.post('/buses/:id/location', TransportController.updateLocation);

export const transportRoutes = router;
