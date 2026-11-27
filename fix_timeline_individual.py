#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для индивидуальной настройки цветов timeline-status для каждого проекта
"""

import os
import re

# Словарь с индивидуальными цветами для каждого проекта
# Формат: файл -> (bubble_bg, line_color1, line_color2, badge_bg, text_color)
project_colors = {
    'mse.html': {
        'bubble_bg': 'hsl(0, 0%, 60%)',           # серый
        'line_color1': 'hsl(0, 0%, 60%)',         # серый
        'line_color2': 'hsl(0, 0%, 45%)',         # темнее серый
        'badge_bg': 'hsl(0, 0%, 60%)',            # серый
        'badge_done_bg': 'hsl(120, 55%, 40%)',    # зелёный для Done
        'text_color': 'hsl(0, 0%, 10%)',          # тёмный текст
        'gradient_color': 'hsl(0, 0%, 60%)',      # серый для градиента
    },
    'prism.html': {
        'bubble_bg': 'hsl(var(--hue), 55%, 35%)',
        'line_color1': 'hsl(var(--hue), 55%, 35%)',
        'line_color2': 'hsl(var(--hue), 45%, 28%)',
        'badge_bg': 'hsl(var(--hue), 55%, 35%)',
        'badge_done_bg': 'hsl(120, 55%, 35%)',
        'text_color': 'var(--bg)',
        'gradient_color': 'hsl(var(--hue), 55%, 35%)',
    },
    'glitch.html': {
        'bubble_bg': 'hsl(var(--hue), 55%, 35%)',
        'line_color1': 'hsl(var(--hue), 55%, 35%)',
        'line_color2': 'hsl(var(--hue), 45%, 28%)',
        'badge_bg': 'hsl(var(--hue), 55%, 35%)',
        'badge_done_bg': 'hsl(120, 55%, 35%)',
        'text_color': 'var(--bg)',
        'gradient_color': 'hsl(var(--hue), 55%, 35%)',
    },
    'aftereffects.html': {
        'bubble_bg': 'hsl(var(--hue), 55%, 35%)',
        'line_color1': 'hsl(var(--hue), 55%, 35%)',
        'line_color2': 'hsl(var(--hue), 45%, 28%)',
        'badge_bg': 'hsl(var(--hue), 55%, 35%)',
        'badge_done_bg': 'hsl(120, 55%, 35%)',
        'text_color': 'var(--bg)',
        'gradient_color': 'hsl(var(--hue), 55%, 35%)',
    },
    'bambulab.html': {
        'bubble_bg': 'hsl(var(--hue), 55%, 35%)',
        'line_color1': 'hsl(var(--hue), 55%, 35%)',
        'line_color2': 'hsl(var(--hue), 45%, 28%)',
        'badge_bg': 'hsl(var(--hue), 55%, 35%)',
        'badge_done_bg': 'hsl(120, 55%, 35%)',
        'text_color': 'var(--bg)',
        'gradient_color': 'hsl(var(--hue), 55%, 35%)',
    },
    'blender.html': {
        'bubble_bg': 'hsl(var(--hue), 55%, 35%)',
        'line_color1': 'hsl(var(--hue), 55%, 35%)',
        'line_color2': 'hsl(var(--hue), 45%, 28%)',
        'badge_bg': 'hsl(var(--hue), 55%, 35%)',
        'badge_done_bg': 'hsl(120, 55%, 35%)',
        'text_color': 'var(--bg)',
        'gradient_color': 'hsl(var(--hue), 55%, 35%)',
    },
    'cinema4d.html': {
        'bubble_bg': 'hsl(var(--hue), 55%, 35%)',
        'line_color1': 'hsl(var(--hue), 55%, 35%)',
        'line_color2': 'hsl(var(--hue), 45%, 28%)',
        'badge_bg': 'hsl(var(--hue), 55%, 35%)',
        'badge_done_bg': 'hsl(120, 55%, 35%)',
        'text_color': 'var(--bg)',
        'gradient_color': 'hsl(var(--hue), 55%, 35%)',
    },
    'illustrator.html': {
        'bubble_bg': 'hsl(var(--hue), 55%, 35%)',
        'line_color1': 'hsl(var(--hue), 55%, 35%)',
        'line_color2': 'hsl(var(--hue), 45%, 28%)',
        'badge_bg': 'hsl(var(--hue), 55%, 35%)',
        'badge_done_bg': 'hsl(120, 55%, 35%)',
        'text_color': 'var(--bg)',
        'gradient_color': 'hsl(var(--hue), 55%, 35%)',
    },
    'maya.html': {
        'bubble_bg': 'hsl(var(--hue), 55%, 35%)',
        'line_color1': 'hsl(var(--hue), 55%, 35%)',
        'line_color2': 'hsl(var(--hue), 45%, 28%)',
        'badge_bg': 'hsl(var(--hue), 55%, 35%)',
        'badge_done_bg': 'hsl(120, 55%, 35%)',
        'text_color': 'var(--bg)',
        'gradient_color': 'hsl(var(--hue), 55%, 35%)',
    },
    'photoshop.html': {
        'bubble_bg': 'hsl(var(--hue), 55%, 35%)',
        'line_color1': 'hsl(var(--hue), 55%, 35%)',
        'line_color2': 'hsl(var(--hue), 45%, 28%)',
        'badge_bg': 'hsl(var(--hue), 55%, 35%)',
        'badge_done_bg': 'hsl(120, 55%, 35%)',
        'text_color': 'var(--bg)',
        'gradient_color': 'hsl(var(--hue), 55%, 35%)',
    },
    'panacea.html': {
        'bubble_bg': 'hsl(var(--hue), 55%, 35%)',
        'line_color1': 'hsl(var(--hue), 55%, 35%)',
        'line_color2': 'hsl(var(--hue), 45%, 28%)',
        'badge_bg': 'hsl(var(--hue), 55%, 35%)',
        'badge_done_bg': 'hsl(120, 55%, 35%)',
        'text_color': 'var(--bg)',
        'gradient_color': 'hsl(var(--hue), 55%, 35%)',
    },
}

def generate_timeline_css(colors):
    """Генерирует CSS для timeline-status с индивидуальными цветами"""
    return f"""    /* ════════════════════════════════════════
       ANIMATED TIMELINE STATUS (отдельная строка вне таблицы)
    ════════════════════════════════════════ */
    .timeline-status {{
      width: 100%;
      max-width: 640px;
      margin: 0 auto;
      padding: 0;
      display: flex;
      align-items: stretch;
      gap: 0;
      position: relative;
      height: auto;
    }}

    .timeline-status__date-bubble {{
      flex-shrink: 0;
      padding: 8px 14px;
      background: {colors['bubble_bg']};
      border: none;
      font-size: 0.65rem;
      font-weight: 600;
      color: {colors['text_color']};
      white-space: nowrap;
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
    }}

    /* Левый пузырь - скругление только слева */
    .timeline-status__date-bubble:first-child {{
      border-radius: 10px 0 0 10px;
      border-right: none;
    }}

    /* Правый пузырь - скругление только справа */
    .timeline-status__date-bubble:last-child {{
      border-radius: 0 10px 10px 0;
      border-left: none;
    }}

    .timeline-status__center {{
      flex: 1;
      display: flex;
      align-items: stretch;
      gap: 0;
      position: relative;
      min-width: 0;
    }}

    .timeline-status__line {{
      flex: 1;
      height: auto;
      position: relative;
      overflow: hidden;
      align-self: stretch;
      background: repeating-linear-gradient(
        45deg,
        {colors['line_color1']} 0,
        {colors['line_color1']} 10px,
        {colors['line_color2']} 10px,
        {colors['line_color2']} 20px
      );
      background-size: 28.28px 28.28px; /* диагональ 20px при 45deg = 20*sqrt(2) ≈ 28.28px */
      animation: stripes-move 2s infinite linear;
    }}

    /* Фейдаут градиент: прозрачный в центре, сплошной светлый цвет у краёв */
    .timeline-status__line::before {{
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 1;
      background: linear-gradient(
        to right,
        {colors['gradient_color']} 0%,
        transparent 20%,
        transparent 80%,
        {colors['gradient_color']} 100%
      );
    }}

    @keyframes stripes-move {{
      0% {{
        background-position: 0 0;
      }}
      100% {{
        background-position: 28.28px 0; /* движение вправо = положительный сдвиг */
      }}
    }}

    .timeline-status__badge {{
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding: 7px 14px;
      border-radius: 0;
      font-size: 0.58rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      background: {colors['badge_bg']};
      color: {colors['text_color']};
      border: none;
      position: relative;
      z-index: 2;
      white-space: nowrap;
      overflow: hidden;
    }}

    .timeline-status__badge--done {{
      background: {colors['badge_done_bg']};
      color: {colors['text_color']};
      border: none;
    }}

    .timeline-status__badge--wip {{
      background: {colors['badge_bg']};
      color: {colors['text_color']};
      border: none;
    }}

    @media (max-width: 640px) {{
      .timeline-status {{
        padding: 24px 16px;
        gap: 16px;
      }}

      .timeline-status__date-bubble {{
        padding: 6px 12px;
        font-size: 0.72rem;
      }}

      .timeline-status__badge {{
        font-size: 0.65rem;
        padding: 5px 12px;
      }}

      .timeline-status__shimmer {{
        width: 80px;
      }}
    }}

    @media (max-width: 480px) {{
      .timeline-status {{
        flex-direction: column;
        gap: 16px;
        padding: 20px 16px;
      }}

      .timeline-status__date-bubble {{
        width: auto;
        text-align: center;
      }}

      .timeline-status__center {{
        width: 100%;
        order: -1;
      }}

      .timeline-status__line {{
        min-width: 40px;
      }}

      .timeline-status__badge {{
        width: 100%;
        justify-content: center;
      }}
    }}"""

updated = 0
failed = 0

print('🎨 Применяем индивидуальные цвета timeline-status...\n')

for filename, colors in project_colors.items():
    filepath = f'C:\\Users\\I am\\Desktop\\Portfolio\\{filename}'
    
    if not os.path.exists(filepath):
        print(f'⚠️  {filename} - файл не найден')
        failed += 1
        continue
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Генерируем CSS с индивидуальными цветами
        new_css = generate_timeline_css(colors)
        
        # Ищем существующий блок timeline-status CSS и заменяем его
        pattern = r'/\*\s*═+\s*ANIMATED TIMELINE STATUS.*?@media \(max-width: 480px\) \{[^}]*\}[^}]*\}[^}]*\}[^}]*\}'
        
        if re.search(pattern, content, re.DOTALL):
            content = re.sub(pattern, new_css, content, flags=re.DOTALL)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f'✅ {filename} - цвета применены')
            updated += 1
        else:
            print(f'⚠️  {filename} - блок timeline-status не найден')
            failed += 1
    
    except Exception as e:
        print(f'❌ {filename} - ошибка: {e}')
        failed += 1

print(f'\n✨ Готово! Обновлено: {updated}/{len(project_colors)}')
if failed > 0:
    print(f'⚠️  Ошибок: {failed}')
