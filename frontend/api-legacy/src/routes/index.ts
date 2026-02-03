import { Router } from 'express';
import departmentsRoutes from './departments.routes';
import employeesRoutes from './employees.routes';
import shiftTypesRoutes from './shift-types.routes';
import schedulesRoutes from './schedules.routes';
import shiftsRoutes from './shifts.routes';

const router = Router();

// Health check (no auth)
router.get('/health', (_req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
});

router.use('/departments', departmentsRoutes);
router.use('/employees', employeesRoutes);
router.use('/shift-types', shiftTypesRoutes);
router.use('/schedules', schedulesRoutes);
router.use('/shifts', shiftsRoutes);

export default router;
