import { Router, Request, Response } from 'express';
import { query } from '../config/database';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT id, name, description, manager_id, is_active, created_at FROM departments WHERE is_active = TRUE ORDER BY name'
    );
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Departmanlar listelenemedi' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Departman adı gerekli' });
    }
    const result = await query(
      `INSERT INTO departments (name, description) VALUES ($1, $2)
       RETURNING id, name, description, manager_id, is_active, created_at`,
      [name.trim(), description && typeof description === 'string' ? description.trim() : null]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err: unknown) {
    console.error('POST /departments error:', err);
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('ECONNREFUSED') || msg.includes('connect')) {
      return res.status(503).json({ error: 'Veritabanı bağlantısı yok. Backend .env içinde DATABASE_URL kontrol edin.' });
    }
    return res.status(500).json({ error: 'Departman eklenemedi' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT id, name, description, manager_id, is_active, created_at FROM departments WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Departman bulunamadı' });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Departman getirilemedi' });
  }
});

export default router;
