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
