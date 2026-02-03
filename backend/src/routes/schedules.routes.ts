import { Router, Request, Response } from 'express';
import { query } from '../config/database';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', async (req: Request, res: Response) => {
  try {
    const { department_id: departmentId, status } = req.query;
    let sql =
      'SELECT id, name, department_id, start_date, end_date, status, optimization_score, created_at FROM shift_schedules WHERE 1=1';
    const params: string[] = [];
    let paramIndex = 1;

    if (departmentId && typeof departmentId === 'string') {
      sql += ` AND department_id = $${paramIndex++}`;
      params.push(departmentId);
    }
    if (status && typeof status === 'string') {
      sql += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    sql += ' ORDER BY start_date DESC';

    const result = await query(sql, params.length ? params : undefined);
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Planlar listelenemedi' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT id, name, department_id, start_date, end_date, status, optimization_score, notes, created_at FROM shift_schedules WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Plan bulunamadı' });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Plan getirilemedi' });
  }
});

export default router;
