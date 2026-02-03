import { Router, Request, Response } from 'express';
import { query } from '../config/database';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Kullanıcılar arasında henüz personel kaydı olmayanlar (çalışan eklerken seçim için)
router.get('/available-users', async (_req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT u.id, u.full_name as name, u.email
       FROM users u
       LEFT JOIN employees e ON e.user_id = u.id
       WHERE e.id IS NULL AND u.is_active = TRUE
       ORDER BY u.full_name`
    );
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Kullanıcı listesi alınamadı' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { user_id: userId, department_id: departmentId, employee_code: employeeCode, hire_date: hireDate } = req.body;
    if (!userId || !employeeCode || !hireDate) {
      return res.status(400).json({ error: 'user_id, employee_code ve hire_date gerekli' });
    }
    const code = String(employeeCode).trim();
    if (code === '') {
      return res.status(400).json({ error: 'Sicil numarası gerekli' });
    }
    const result = await query(
      `INSERT INTO employees (user_id, department_id, employee_code, hire_date)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, department_id, employee_code, hire_date, max_weekly_hours, min_rest_hours, is_part_time, created_at`,
      [userId, departmentId && String(departmentId).trim() !== '' ? departmentId : null, code, hireDate]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('unique') || msg.includes('duplicate') || msg.includes('employee_code')) {
      return res.status(409).json({ error: 'Bu sicil numarası zaten kullanılıyor' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Çalışan eklenemedi' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const { department_id: departmentId } = req.query;
    let sql =
      'SELECT e.id, e.employee_code, e.hire_date, e.max_weekly_hours, e.min_rest_hours, e.is_part_time, e.department_id, u.full_name as name, d.name as department_name FROM employees e LEFT JOIN users u ON e.user_id = u.id LEFT JOIN departments d ON e.department_id = d.id WHERE u.id IS NOT NULL';
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
