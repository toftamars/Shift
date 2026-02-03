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

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, start_time: startTime, end_time: endTime, color_code: colorCode } = req.body;
    const nameStr = name != null ? String(name).trim() : '';
    if (!nameStr || !startTime || !endTime) {
      return res.status(400).json({ error: 'Ad, başlangıç ve bitiş saati gerekli' });
    }
    const startStr = String(startTime).trim().slice(0, 5);
    const endStr = String(endTime).trim().slice(0, 5);
    const color = colorCode && String(colorCode).trim() !== '' ? String(colorCode).trim() : null;
    const result = await query(
      `INSERT INTO shift_types (name, start_time, end_time, duration_hours, color_code)
       VALUES ($1, $2, $3, EXTRACT(EPOCH FROM (($3::time - $2::time + interval '24 hours') % interval '24 hours'))/3600, $4)
       RETURNING id, name, start_time, end_time, duration_hours, color_code`,
      [nameStr, startStr, endStr, color]
    );
    const row = result.rows[0];
    return res.status(201).json({
      ...row,
      start_time: row.start_time?.toString?.()?.slice(0, 5) ?? row.start_time,
      end_time: row.end_time?.toString?.()?.slice(0, 5) ?? row.end_time,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Vardiya türü eklenemedi' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, start_time: startTime, end_time: endTime, color_code: colorCode } = req.body;
    const nameStr = name != null ? String(name).trim() : '';
    if (!nameStr || !startTime || !endTime) {
      return res.status(400).json({ error: 'Ad, başlangıç ve bitiş saati gerekli' });
    }
    const startStr = String(startTime).trim().slice(0, 5);
    const endStr = String(endTime).trim().slice(0, 5);
    const color = colorCode && String(colorCode).trim() !== '' ? String(colorCode).trim() : null;
    const result = await query(
      `UPDATE shift_types SET name = $1, start_time = $2, end_time = $3, duration_hours = EXTRACT(EPOCH FROM (($3::time - $2::time + interval '24 hours') % interval '24 hours'))/3600, color_code = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, name, start_time, end_time, duration_hours, color_code`,
      [nameStr, startStr, endStr, color, id]
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
    return res.status(500).json({ error: 'Vardiya türü güncellenemedi' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const check = await query('SELECT 1 FROM shifts WHERE shift_type_id = $1 LIMIT 1', [id]);
    if (check.rows.length > 0) {
      return res.status(409).json({ error: 'Bu vardiya türü kullanılıyor, önce vardiyaları kaldırın' });
    }
    const result = await query('DELETE FROM shift_types WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vardiya türü bulunamadı' });
    }
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Vardiya türü silinemedi' });
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
