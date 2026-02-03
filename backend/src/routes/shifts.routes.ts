import { Router, Request, Response } from 'express';
import { query } from '../config/database';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', async (req: Request, res: Response) => {
  try {
    const { schedule_id: scheduleId, from_date: fromDate, to_date: toDate } = req.query;

    if (scheduleId && typeof scheduleId === 'string') {
      const result = await query(
        `SELECT s.id, s.schedule_id, s.employee_id, s.shift_type_id, s.shift_date, s.start_time, s.end_time, s.status,
                u.full_name as employee_name
         FROM shifts s
         LEFT JOIN employees e ON s.employee_id = e.id
         LEFT JOIN users u ON e.user_id = u.id
         WHERE s.schedule_id = $1
         ORDER BY s.shift_date, s.start_time`,
        [scheduleId]
      );
      const rows = result.rows.map((row) => ({
        ...row,
        start_time: row.start_time?.toString?.()?.slice(0, 5) ?? row.start_time,
        end_time: row.end_time?.toString?.()?.slice(0, 5) ?? row.end_time,
      }));
      return res.json(rows);
    }

    if (fromDate && toDate && typeof fromDate === 'string' && typeof toDate === 'string') {
      const result = await query(
        `SELECT s.id, s.schedule_id, s.employee_id, s.shift_type_id, s.shift_date, s.start_time, s.end_time, s.status,
                u.full_name as employee_name
         FROM shifts s
         LEFT JOIN employees e ON s.employee_id = e.id
         LEFT JOIN users u ON e.user_id = u.id
         WHERE s.shift_date >= $1 AND s.shift_date <= $2
         ORDER BY s.shift_date, s.start_time`,
        [fromDate, toDate]
      );
      const rows = result.rows.map((row) => ({
        ...row,
        start_time: row.start_time?.toString?.()?.slice(0, 5) ?? row.start_time,
        end_time: row.end_time?.toString?.()?.slice(0, 5) ?? row.end_time,
      }));
      return res.json(rows);
    }

    return res.status(400).json({ error: 'schedule_id veya from_date ve to_date gerekli' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Vardiyalar listelenemedi' });
  }
});

export default router;
