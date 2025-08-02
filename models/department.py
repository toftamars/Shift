from odoo import models, fields, api, _


class ShiftDepartment(models.Model):
    _name = 'shift.department'
    _description = 'Vardiya Departmanı'
    _order = 'name'

    name = fields.Char('Departman Adı', required=True)
    code = fields.Char('Departman Kodu', required=True)
    description = fields.Text('Açıklama')
    
    # Departmana bağlı personel
    employee_ids = fields.One2many('hr.employee', 'shift_department_id', string='Personel')
    employee_count = fields.Integer('Personel Sayısı', compute='_compute_employee_count', store=True)
    
    # Analitik hesap bağlantısı
    analytic_account_id = fields.Many2one('account.analytic.account', string='Analitik Hesap', required=True)
    
    # Aktif/Pasif durumu
    active = fields.Boolean('Aktif', default=True)
    
    @api.depends('employee_ids')
    def _compute_employee_count(self):
        for record in self:
            record.employee_count = len(record.employee_ids)
    
    @api.model
    def create(self, vals):
        """Departman oluşturulurken kod kontrolü"""
        if not vals.get('code'):
            vals['code'] = vals.get('name', '').upper().replace(' ', '_')
        return super().create(vals)
    
    def action_view_employees(self):
        """Departmana bağlı personelleri görüntüle"""
        self.ensure_one()
        return {
            'name': _('Departman Personeli'),
            'type': 'ir.actions.act_window',
            'res_model': 'hr.employee',
            'view_mode': 'tree,form',
            'domain': [('shift_department_id', '=', self.id)],
            'context': {'default_shift_department_id': self.id},
        } 