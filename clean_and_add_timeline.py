#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Чистим старые стили timeline и добавляем всё заново правильно
"""

import os
import re

# CSS для MSE (серый)
MSE_CSS = """
    /* ════════════════════════════════════════
       ANIMATED TIMELINE STATUS
    ════════════════════════════════════════ */
    .timeline-status {
      width: 100%;
      max-width: 640px;
      margin: 24px auto 0;
      padding: 0;
      display: flex;
      align-items: stretch;
      gap: 0;
      position: relative;
      height: auto;
    }

    .timeline-status__date-bubble {
      flex-shrink: 0;
      padding: 8px 14px;
      background: hsl(0, 0%, 35%);
      border: none;
      font-size: 0.65rem;
      font-weight: 600;
      color: var(--bg);
      white-space: nowrap;
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
    }

    .timeline-status__date-bubble:first-child {
      border-radius: 10px 0 0 10px;
      border-right: none;
    }

    .timeline-status__date-bubble:last-child {
      border-radius: 0 10px 10px 0;
      border-left: none;
    }

    .timeline-status__center {
      flex: 1;
      display: flex;
      align-items: stretch;
      gap: 0;
      position: relative;
      min-width: 0;
    }

    .timeline-status__line {
      flex: 1;
      height: auto;
      position: relative;
      overflow: hidden;
      align-self: stretch;
      background: repeating-linear-gradient(
        45deg,
        hsl(0, 0%, 35%) 0,
        hsl(0, 0%, 35%) 10px,
        hsl(0, 0%, 20%) 10px,
        hsl(0, 0%, 20%) 20px
      );
      background-size: 28.28px 28.28px;
      animation: stripes-move 2s infinite linear;
    }

    .timeline-status__line::before {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 1;
      background: linear-gradient(
        to right,
        hsl(0, 0%, 35%) 0%,
        transparent 20%,
        transparent 80%,
        hsl(0, 0%, 35%) 100%
      );
    }

    @keyframes stripes-move {
      0% { background-position: 0 0; }
      100% { background-position: 28.28px 0; }
    }

    .timeline-status__badge {
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
      background: hsl(0, 0%, 35%);
      color: var(--bg);
      border: none;
      position: relative;
      z-index: 2;
      white-space: nowrap;
      overflow: hidden;
    }

    .timeline-status__badge--done {
      background: hsl(120, 55%, 35%);
      color: var(--bg);
    }

    .timeline-status__badge--wip {
      background: hsl(0, 0%, 35%);
      color: var(--bg);
    }

    @media (max-width: 640px) {
      .timeline-status {
        gap: 16px;
      }

      .timeline-status__date-bubble {
        padding: 6px 12px;
        font-size: 0.72rem;
      }

      .timeline-status__badge {
        font-size: 0.65rem;
        padding: 5px 12px;
      }
    }

    @media (max-width: 480px) {
      .timeline-status {
        flex-direction: column;
        gap: 16px;
      }

      .timeline-status__date-bubble {
        width: auto;
        text-align: center;
        border-radius: 10px;
      }

      .timeline-status__center {
        width: 100%;
        order: -1;
      }

      .timeline-status__line {
        min-width: 40px;
      }

      .timeline-status__badge {
        width: 100%;
        justify-content: center;
      }
    }
"""

# CSS для остальных (цветной)
COLOR_CSS = """
    /* ════════════════════════════════════════
       ANIMATED TIMELINE STATUS
    ════════════════════════════════════════ */
    .timeline-status {
      width: 100%;
      max-width: 640px;
      margin: 24px auto 0;
      padding: 0;
      display: flex;
      align-items: stretch;
      gap: 0;
      position: relative;
      height: auto;
    }

    .timeline-status__date-bubble {
      flex-shrink: 0;
      padding: 8px 14px;
      background: hsl(var(--hue), 55%, 35%);
      border: none;
      font-size: 0.65rem;
      font-weight: 600;
      color: var(--bg);
      white-space: nowrap;
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
    }

    .timeline-status__date-bubble:first-child {
      border-radius: 10px 0 0 10px;
      border-right: none;
    }

    .timeline-status__date-bubble:last-child {
      border-radius: 0 10px 10px 0;
      border-left: none;
    }

    .timeline-status__center {
      flex: 1;
      display: flex;
      align-items: stretch;
      gap: 0;
      position: relative;
      min-width: 0;
    }

    .timeline-status__line {
      flex: 1;
      height: auto;
      position: relative;
      overflow: hidden;
      align-self: stretch;
      background: repeating-linear-gradient(
        45deg,
        hsl(var(--hue), 55%, 35%) 0,
        hsl(var(--hue), 55%, 35%) 10px,
        var(--border-accent) 10px,
        var(--border-accent) 20px
      );
      background-size: 28.28px 28.28px;
      animation: stripes-move 2s infinite linear;
    }

    .timeline-status__line::before {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 1;
      background: linear-gradient(
        to right,
        hsl(var(--hue), 55%, 35%) 0%,
        transparent 20%,
        transparent 80%,
        hsl(var(--hue), 55%, 35%) 100%
      );
    }

    @keyframes stripes-move {
      0% { background-position: 0 0; }
      100% { background-position: 28.28px 0; }
    }

    .timeline-status__badge {
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
      background: hsl(var(--hue), 55%, 35%);
      color: var(--bg);
      border: none;
      position: relative;
      z-index: 2;
      white-space: nowrap;
      overflow: hidden;
    }

    .timeline-status__badge--done {
      background: hsl(120, 55%, 35%);
      color: var(--bg);
    }

    .timeline-status__badge--wip {
      background: hsl(var(--hue), 55%, 35%);
      color: var(--bg);
    }

    @media (max-width: 640px) {
      .timeline-status {
        gap: 16px;
      }

      .timeline-status__date-bubble {
        padding: 6px 12px;
        font-size: 0.72rem;
      }

      .timeline-status__badge {
        font-size: 0.65rem;
        padding: 5px 12px;
      }
    }

    @media (max-width: 480px) {
      .timeline-status {
        flex-direction: column;
        gap: 16px;
      }

      .timeline-status__date-bubble {
        width: auto;
        text-align: center;
        border-radius: 10px;
      }

      .timeline-status__center {
        width: 100%;
        order: -1;
      }

      .timeline-status__line {
        min-width: 40px;
      }

      .timeline-status__badge {
        width: 100%;
        justify-content: center;
      }
    }
"""

# HTML
TIMELINE_HTML = '''
  <div class="timeline-status">
    <div class="timeline-status__date-bubble">Дата старта</div>

    <div class="timeline-status__center">
      <div class="timeline-status__line"></div>

      <span class="timeline-status__badge timeline-status__badge--wip">В РАЗРАБОТКЕ</span>

      <div class="timeline-status__line"></div>
    </div>

    <div class="timeline-status__date-bubble">Дата окончания</div>
  </div>
'''

files = {
    'mse.html': True,
    'prism.html': False,
    'glitch.html': False,
    'aftereffects.html': False,
    'bambulab.html': False,
    'blender.html': False,
    'cinema4d.html': False,
    'illustrator.html': False,
    'maya.html': False,
    'photoshop.html': False,
    'panacea.html': False,
}

updated = 0

print('🧹 Очистка и добавление timeline-status...\n')

for filename, is_mse in files.items():
    filepath = f'C:\\Users\\I am\\Desktop\\Portfolio\\{filename}'
    
    if not os.path.exists(filepath):
        print(f'⚠️  {filename} - файл не найден')
        continue
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Шаг 1: Удаляем старый CSS timeline
        pattern = r'/\*\s*═+\s*ANIMATED TIMELINE STATUS.*?@media \(max-width: 480px\) \{[^}]*\}[^}]*\}[^}]*\}[^}]*\}'
        content = re.sub(pattern, '', content, flags=re.DOTALL)
        
        # Шаг 2: Удаляем старый HTML timeline
        pattern_html = r'<div class="timeline-status">.*?</div>\s*</div>'
        content = re.sub(pattern_html, '', content, flags=re.DOTALL)
        
        # Шаг 3: Добавляем CSS перед </style>
        css = MSE_CSS if is_mse else COLOR_CSS
        style_pos = content.rfind('</style>')
        if style_pos != -1:
            content = content[:style_pos] + css + '\n  ' + content[style_pos:]
        
        # Шаг 4: Находим <section class="tech"> и добавляем HTML после её </section>
        tech_pattern = r'(<section class="tech">.*?</section>)'
        match = re.search(tech_pattern, content, re.DOTALL)
        if match:
            tech_end_pos = match.end()
            content = content[:tech_end_pos] + '\n' + TIMELINE_HTML + content[tech_end_pos:]
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        note = ' (серые тона)' if is_mse else ''
        print(f'✅ {filename} - timeline-status добавлен{note}')
        updated += 1
    
    except Exception as e:
        print(f'❌ {filename} - ошибка: {e}')

print(f'\n✨ Готово! Обновлено: {updated}/{len(files)}')
