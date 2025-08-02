from odoo import models, fields, api, _


class AnalyticAccount(models.Model):
    _inherit = 'account.analytic.account'

    # Analitik hesaba bağlı personel listesi
    employee_ids = fields.One2many('hr.employee', 'analytic_account_id', string='Personel Listesi')
    employee_count = fields.Integer('Personel Sayısı', compute='_compute_employee_count', store=True)
    
    # Vardiya ile ilgili alanlar
    shift_ids = fields.One2many('shift.shift', 'analytic_account_id', string='Vardiyalar')
    shift_count = fields.Integer('Vardiya Sayısı', compute='_compute_shift_count', store=True)
    
    @api.depends('employee_ids')
    def _compute_employee_count(self):
        for record in self:
            record.employee_count = len(record.employee_ids)
    
    @api.depends('shift_ids')
    def _compute_shift_count(self):
        for record in self:
            record.shift_count = len(record.shift_ids)
    
    def action_view_employees(self):
        """Analitik hesaba bağlı personelleri görüntüle"""
        self.ensure_one()
        return {
            'name': _('Personel Listesi'),
            'type': 'ir.actions.act_window',
            'res_model': 'hr.employee',
            'view_mode': 'tree,form',
            'domain': [('analytic_account_id', '=', self.id)],
            'context': {'default_analytic_account_id': self.id},
        }
    
    def action_view_shifts(self):
        """Analitik hesaba bağlı vardiyaları görüntüle"""
        self.ensure_one()
        return {
            'name': _('Vardiyalar'),
            'type': 'ir.actions.act_window',
            'res_model': 'shift.shift',
            'view_mode': 'tree,form,calendar',
            'domain': [('analytic_account_id', '=', self.id)],
            'context': {'default_analytic_account_id': self.id},
        } 