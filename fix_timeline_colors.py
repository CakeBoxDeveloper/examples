#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для исправления цветов timeline-status - делаем их более яркими и соответствующими акценту
"""

import os
import re

# Список файлов для обработки
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

# CSS для замены - используем более яркие и насыщенные цвета с акцентом
new_timeline_css = """    /* ════════════════════════════════════════
       ANIMATED TIMELINE STATUS (отдельная строка вне таблицы)
    ════════════════════════════════════════ */
    .timeline-status {
      width: 100%;
      max-width: 640px;
      margin: 0 auto;
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
      background: hsl(var(--hue), 65%, 50%);
      border: none;
      font-size: 0.65rem;
      font-weight: 600;
      color: hsl(var(--hue), 40%, 4%);
      white-space: nowrap;
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
    }

    /* Левый пузырь - скругление только слева */
    .timeline-status__date-bubble:first-child {
      border-radius: 10px 0 0 10px;
      border-right: none;
    }

    /* Правый пузырь - скругление только справа */
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
        hsl(var(--hue), 65%, 50%) 0,
        hsl(var(--hue), 65%, 50%) 10px,
        hsl(var(--hue), 55%, 40%) 10px,
        hsl(var(--hue), 55%, 40%) 20px
      );
      background-size: 28.28px 28.28px; /* диагональ 20px при 45deg = 20*sqrt(2) ≈ 28.28px */
      animation: stripes-move 2s infinite linear;
    }

    /* Фейдаут градиент: прозрачный в центре, сплошной светлый цвет у краёв */
    .timeline-status__line::before {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 1;
      background: linear-gradient(
        to right,
        hsl(var(--hue), 65%, 50%) 0%,
        transparent 20%,
        transparent 80%,
        hsl(var(--hue), 65%, 50%) 100%
      );
    }

    @keyframes stripes-move {
      0% {
        background-position: 0 0;
      }
      100% {
        background-position: 28.28px 0; /* движение вправо = положительный сдвиг */
      }
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
      background: hsl(var(--hue), 65%, 50%);
      color: hsl(var(--hue), 40%, 4%);
      border: none;
      position: relative;
      z-index: 2;
      white-space: nowrap;
      overflow: hidden;
    }

    .timeline-status__badge--done {
      background: hsl(120, 65%, 50%);
      color: hsl(120, 40%, 4%);
      border: none;
    }

    .timeline-status__badge--wip {
      background: hsl(var(--hue), 65%, 50%);
      color: hsl(var(--hue), 40%, 4%);
      border: none;
    }

    @media (max-width: 640px) {
      .timeline-status {
        padding: 24px 16px;
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

      .timeline-status__shimmer {
        width: 80px;
      }
    }

    @media (max-width: 480px) {
      .timeline-status {
        flex-direction: column;
        gap: 16px;
        padding: 20px 16px;
      }

      .timeline-status__date-bubble {
        width: auto;
        text-align: center;
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
    }"""

updated = 0
failed = 0

print('🎨 Исправляем цвета timeline-status...\n')

for filepath in files:
    if not os.path.exists(filepath):
        print(f'⚠️  {os.path.basename(filepath)} - файл не найден')
        failed += 1
        continue
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Ищем существующий блок timeline-status CSS и заменяем его
        pattern = r'/\*\s*═+\s*ANIMATED TIMELINE STATUS.*?@media \(max-width: 480px\) \{[^}]*\}[^}]*\}[^}]*\}[^}]*\}'
        
        if re.search(pattern, content, re.DOTALL):
            content = re.sub(pattern, new_timeline_css, content, flags=re.DOTALL)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f'✅ {os.path.basename(filepath)} - цвета обновлены')
            updated += 1
        else:
            print(f'⚠️  {os.path.basename(filepath)} - блок timeline-status не найден')
            failed += 1
    
    except Exception as e:
        print(f'❌ {os.path.basename(filepath)} - ошибка: {e}')
        failed += 1

print(f'\n✨ Готово! Обновлено: {updated}/{len(files)}')
if failed > 0:
    print(f'⚠️  Ошибок: {failed}')
