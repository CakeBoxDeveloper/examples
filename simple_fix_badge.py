#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Простое исправление: меняем фон бейджа статуса на светлый цвет полосок
"""

import os
import re

files = [
    'C:\\Users\\I am\\Desktop\\Portfolio\\mse.html',
    'C:\\Users\\I am\\Desktop\\Portfolio\\prism.html',
    'C:\\Users\\I am\\Desktop\\Portfolio\\glitch.html',
    'C:\\Users\\I am\\Desktop\\Portfolio\\aftereffects.html',
    'C:\\Users\\I am\\Desktop\\Portfolio\\bambulab.html',
    'C:\\Users\\I am\\Desktop\\Portfolio\\blender.html',
    'C:\\Users\\I am\\Desktop\\Portfolio\\cinema4d.html',
    'C:\\Users\\I am\\Desktop\\Portfolio\\illustrator.html',
    'C:\\Users\\I am\\Desktop\\Portfolio\\maya.html',
    'C:\\Users\\I am\\Desktop\\Portfolio\\photoshop.html',
    'C:\\Users\\I am\\Desktop\\Portfolio\\panacea.html',
]

updated = 0

print('🎨 Исправляем цвет бейджа статуса...\n')

for filepath in files:
    if not os.path.exists(filepath):
        print(f'⚠️  {os.path.basename(filepath)} - файл не найден')
        continue
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Меняем background в .timeline-status__badge на var(--accent)
        # Было: background: hsl(var(--hue), 65%, 50%); или другие цвета
        # Станет: background: var(--accent);
        
        # Ищем блок .timeline-status__badge {
        pattern = r'(\.timeline-status__badge\s*\{[^}]*background:\s*)([^;]+)(;[^}]*\})'
        
        def replace_badge_bg(match):
            return match.group(1) + 'var(--accent)' + match.group(3)
        
        content_new = re.sub(pattern, replace_badge_bg, content, flags=re.DOTALL)
        
        # Также меняем .timeline-status__badge--wip
        pattern_wip = r'(\.timeline-status__badge--wip\s*\{[^}]*background:\s*)([^;]+)(;[^}]*\})'
        content_new = re.sub(pattern_wip, replace_badge_bg, content_new, flags=re.DOTALL)
        
        if content_new != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content_new)
            
            print(f'✅ {os.path.basename(filepath)} - фон бейджа изменён на var(--accent)')
            updated += 1
        else:
            print(f'⚠️  {os.path.basename(filepath)} - изменений не найдено')
    
    except Exception as e:
        print(f'❌ {os.path.basename(filepath)} - ошибка: {e}')

print(f'\n✨ Готово! Обновлено: {updated}/{len(files)}')
