import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.use(authenticate);

// Everyone has access to the dashboard (viewers of dashboard: FLEET_MANAGER, DRIVER)
router.get('/dashboard', authorize(['FLEET_MANAGER', 'DRIVER']), AnalyticsController.getDashboard);

// KPIs, revenue, and charts available to FLEET_MANAGER, SAFETY_OFFICER, FINANCIAL_ANALYST
const analyticRoles = ['FLEET_MANAGER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'];
router.get('/kpis', authorize(analyticRoles), AnalyticsController.getKPIs);
router.get('/monthly-revenue', authorize(analyticRoles), AnalyticsController.getMonthlyRevenue);
router.get('/top-costliest-vehicles', authorize(analyticRoles), AnalyticsController.getTopCostliestVehicles);

// Full exports are limited to FINANCIAL_ANALYST and FLEET_MANAGER
router.get('/export/:type', authorize(['FLEET_MANAGER', 'FINANCIAL_ANALYST']), AnalyticsController.exportCsv);

export default router;
