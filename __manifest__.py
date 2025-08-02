{
    'name': 'Shift Management',
    'version': '1.0',
    'category': 'Human Resources',
    'summary': 'Vardiya yönetimi modülü',
    'description': """
        Bu modül vardiya yönetimi için geliştirilmiştir.
        Özellikler:
        - Vardiya planlaması
        - Çalışan vardiya atamaları
        - Vardiya takvimi görünümü
        - Vardiya raporları
    """,
    'author': 'Your Company',
    'website': 'https://www.yourcompany.com',
    'depends': ['base', 'hr', 'hr_attendance', 'analytic'],
    'data': [
        'security/ir.model.access.csv',
        'views/shift_views.xml',
        'views/hr_employee_views.xml',
        'views/department_views.xml',
        'views/menu_views.xml',
    ],
    'demo': [
        'demo/shift_demo.xml',
    ],
    'installable': True,
    'application': True,
    'auto_install': False,
    'license': 'LGPL-3',
} 