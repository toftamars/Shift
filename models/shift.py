from odoo import models, fields, api, _
from odoo.exceptions import ValidationError
from datetime import datetime, timedelta


class Shift(models.Model):
    _name = 'shift.shift'
    _description = 'Vardiya'
    _order = 'date, start_time'

    name = fields.Char('Vardiya Adı', required=True)
    date = fields.Date('Tarih', required=True, default=fields.Date.today)
    start_time = fields.Float('Başlangıç Saati', required=True)
    end_time = fields.Float('Bitiş Saati', required=True)
    duration = fields.Float('Süre (Saat)', compute='_compute_duration', store=True)
    
    # Analitik hesap ve departman bağlantıları
    analytic_account_id = fields.Many2one('account.analytic.account', string='Analitik Hesap', required=True)
    department_id = fields.Many2one('shift.department', string='Departman', 
                                   domain="[('analytic_account_id', '=', analytic_account_id)]")
    
    employee_ids = fields.Many2many('hr.employee', string='Çalışanlar',
                                   domain="[('analytic_account_id', '=', analytic_account_id)]")
    shift_type = fields.Selection([
        ('morning', 'Sabah Vardiyası'),
        ('afternoon', 'Öğleden Sonra Vardiyası'),
        ('night', 'Gece Vardiyası'),
        ('custom', 'Özel Vardiya')
    ], string='Vardiya Tipi', required=True, default='morning')
    
    state = fields.Selection([
        ('draft', 'Taslak'),
        ('confirmed', 'Onaylandı'),
        ('in_progress', 'Devam Ediyor'),
        ('completed', 'Tamamlandı'),
        ('cancelled', 'İptal Edildi')
    ], string='Durum', default='draft', required=True)
    
    notes = fields.Text('Notlar')
    company_id = fields.Many2one('res.company', string='Şirket', 
                                default=lambda self: self.env.company)
    
    @api.depends('start_time', 'end_time')
    def _compute_duration(self):
        for shift in self:
            if shift.start_time and shift.end_time:
                if shift.end_time > shift.start_time:
                    shift.duration = shift.end_time - shift.start_time
                else:
                    # Gece vardiyası için (örn: 22:00 - 06:00)
                    shift.duration = (24 - shift.start_time) + shift.end_time
            else:
                shift.duration = 0.0
    
    @api.constrains('start_time', 'end_time')
    def _check_times(self):
        for shift in self:
            if shift.start_time and shift.end_time:
                if shift.start_time >= shift.end_time and shift.shift_type != 'night':
                    raise ValidationError(_('Başlangıç saati bitiş saatinden küçük olmalıdır.'))
    
    def action_confirm(self):
        self.write({'state': 'confirmed'})
    
    def action_start(self):
        self.write({'state': 'in_progress'})
    
    def action_complete(self):
        self.write({'state': 'completed'})
    
    def action_cancel(self):
        self.write({'state': 'cancelled'})
    
    def action_draft(self):
        self.write({'state': 'draft'})
    
    @api.model
    def create(self, vals):
        if not vals.get('name'):
            date = vals.get('date', fields.Date.today())
            shift_type = vals.get('shift_type', 'morning')
            vals['name'] = f"{date} - {dict(self._fields['shift_type'].selection).get(shift_type)}"
        return super().create(vals) 