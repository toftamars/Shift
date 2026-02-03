import { Router, Request, Response } from 'express';
import { query, getClient } from '../config/database';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Sayfadan doğrudan ekleme: name + email ile user + employee oluşturur (Supabase Auth’a gerek yok)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, department_id: departmentId, employee_code: employeeCode, hire_date: hireDate } = req.body;
    const fullName = name != null ? String(name).trim() : '';
    const emailStr = email != null ? String(email).trim() : '';
    const code = employeeCode != null ? String(employeeCode).trim() : '';
    if (!fullName || !emailStr || !code || !hireDate) {
      return res.status(400).json({ error: 'Ad soyad, e-posta, sicil no ve işe giriş tarihi gerekli' });
    }
    const deptId = departmentId && String(departmentId).trim() !== '' ? departmentId : null;

    const client = await getClient();
    try {
      await client.query('BEGIN');
      const userRes = await client.query(
        `INSERT INTO users (email, full_name, role) VALUES ($1, $2, 'EMPLOYEE')
         RETURNING id`,
        [emailStr, fullName]
      );
      const userId = userRes.rows[0].id;
      const empRes = await client.query(
        `INSERT INTO employees (user_id, department_id, employee_code, hire_date)
         VALUES ($1, $2, $3, $4)
         RETURNING id, user_id, department_id, employee_code, hire_date`,
        [userId, deptId, code, hireDate]
      );
      await client.query('COMMIT');
      const row = empRes.rows[0];
      return res.status(201).json({ ...row, name: fullName });
    } catch (txErr: unknown) {
      await client.query('ROLLBACK').catch(() => {});
      throw txErr;
    } finally {
      client.release();
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('unique') || msg.includes('duplicate')) {
      if (msg.includes('email')) return res.status(409).json({ error: 'Bu e-posta zaten kayıtlı' });
      if (msg.includes('employee_code')) return res.status(409).json({ error: 'Bu sicil numarası zaten kullanılıyor' });
      return res.status(409).json({ error: 'Bu e-posta veya sicil no zaten kayıtlı' });
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

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const getRes = await query('SELECT user_id FROM employees WHERE id = $1', [id]);
    if (getRes.rows.length === 0) {
      return res.status(404).json({ error: 'Personel bulunamadı' });
    }
    const userId = getRes.rows[0].user_id;
    await query('DELETE FROM users WHERE id = $1', [userId]);
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Personel silinemedi' });
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
