from odoo import models, fields, api
from datetime import datetime, timedelta


class HrEmployee(models.Model):
    _inherit = 'hr.employee'

    # Analitik hesap ve departman bağlantıları
    analytic_account_id = fields.Many2one('account.analytic.account', string='Analitik Hesap')
    shift_department_id = fields.Many2one('shift.department', string='Vardiya Departmanı')
    
    shift_ids = fields.Many2many('shift.shift', string='Vardiyalar')
    preferred_shift_type = fields.Selection([
        ('morning', 'Sabah Vardiyası'),
        ('afternoon', 'Öğleden Sonra Vardiyası'),
        ('night', 'Gece Vardiyası'),
        ('any', 'Fark Etmez')
    ], string='Tercih Edilen Vardiya Tipi', default='any')
    
    max_hours_per_week = fields.Float('Haftalık Maksimum Çalışma Saati', default=40.0)
    current_week_hours = fields.Float('Bu Hafta Çalışılan Saat', compute='_compute_current_week_hours')
    
    @api.depends('shift_ids', 'shift_ids.duration', 'shift_ids.date')
    def _compute_current_week_hours(self):
        for employee in self:
            today = fields.Date.today()
            week_start = today - timedelta(days=today.weekday())
            week_end = week_start + timedelta(days=6)
            
            week_shifts = employee.shift_ids.filtered(
                lambda s: s.date >= week_start and s.date <= week_end and s.state in ['confirmed', 'in_progress', 'completed']
            )
            employee.current_week_hours = sum(week_shifts.mapped('duration'))
    
    def get_shift_schedule(self, start_date=None, end_date=None):
        """Belirli tarih aralığındaki vardiya programını döndürür"""
        if not start_date:
            start_date = fields.Date.today()
        if not end_date:
            end_date = start_date + timedelta(days=7)
        
        return self.shift_ids.filtered(
            lambda s: s.date >= start_date and s.date <= end_date
        ).sorted('date') 