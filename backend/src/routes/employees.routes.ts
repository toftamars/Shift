import { Router, Request, Response } from 'express';
import { query } from '../config/database';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', async (req: Request, res: Response) => {
  try {
    const { department_id: departmentId } = req.query;
    let sql =
      'SELECT e.id, e.employee_code, e.hire_date, e.max_weekly_hours, e.min_rest_hours, e.is_part_time, e.department_id, u.full_name as name FROM employees e LEFT JOIN users u ON e.user_id = u.id WHERE u.id IS NOT NULL';
    const params: string[] = [];

    if (departmentId && typeof departmentId === 'string') {
      sql += ' AND e.department_id = $1';
      params.push(departmentId);
    }

    sql += ' ORDER BY u.full_name';

    const result = await query(sql, params.length ? params : undefined);
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Personel listelenemedi' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT e.id, e.employee_code, e.hire_date, e.max_weekly_hours, e.min_rest_hours, e.is_part_time, e.department_id, e.skills, e.preferences, u.full_name as name, u.email
       FROM employees e LEFT JOIN users u ON e.user_id = u.id WHERE e.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Personel bulunamadı' });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Personel getirilemedi' });
  }
});

export default router;
