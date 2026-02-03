import { Router, Request, Response } from 'express';
import { query } from '../config/database';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT id, name, start_time, end_time, duration_hours, color_code, is_overnight
       FROM shift_types ORDER BY start_time`
    );
    const rows = result.rows.map((row) => ({
      ...row,
      start_time: row.start_time?.toString?.()?.slice(0, 5) ?? row.start_time,
      end_time: row.end_time?.toString?.()?.slice(0, 5) ?? row.end_time,
    }));
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Vardiya türleri listelenemedi' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT id, name, start_time, end_time, duration_hours, color_code, is_overnight FROM shift_types WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vardiya türü bulunamadı' });
    }
    const row = result.rows[0];
    return res.json({
      ...row,
      start_time: row.start_time?.toString?.()?.slice(0, 5) ?? row.start_time,
      end_time: row.end_time?.toString?.()?.slice(0, 5) ?? row.end_time,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Vardiya türü getirilemedi' });
  }
});

export default router;
