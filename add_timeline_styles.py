import os
import re

# Список файлов для обновления
project_files = [
    'mse.html',
    'prism.html',
    'glitch.html',
    'aftereffects.html',
    'bambulab.html',
    'blender.html',
    'cinema4d.html',
    'illustrator.html',
    'maya.html',
    'photoshop.html',
    'panacea.html'
]

portfolio_dir = r'C:\Users\I am\Desktop\Portfolio'

# CSS стили для timeline-status
timeline_styles = '''
    /* ════════════════════════════════════════
       ANIMATED TIMELINE STATUS (отдельная строка вне таблицы)
    ════════════════════════════════════════ */
    .timeline-status {
      width: 100%;
      max-width: 640px;
      margin: 0 auto 48px;
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
    }

    .timeline-status__badge--done {
      background: hsl(120, 55%, 35%);
      color: var(--bg);
    }

    .timeline-status__badge--wip {
      background: hsl(var(--hue), 55%, 35%);
      color: var(--bg);
    }

    @media (max-width: 480px) {
      .timeline-status {
        flex-direction: column;
        gap: 8px;
        margin-bottom: 32px;
      }
      .timeline-status__date-bubble:first-child {
        border-radius: 10px 10px 0 0;
      }
      .timeline-status__date-bubble:last-child {
        border-radius: 0 0 10px 10px;
      }
      .timeline-status__line {
        display: none;
      }
      .timeline-status__center {
        order: 2;
      }
      .timeline-status__date-bubble:first-child {
        order: 1;
      }
      .timeline-status__date-bubble:last-child {
        order: 3;
      }
    }
'''

def add_timeline_styles(filepath):
    """Добавляет стили timeline-status перед закрывающим тегом </style>"""
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Проверяем, есть ли уже стили timeline-status
    if '.timeline-status {' in content:
        print(f"⏭️  {os.path.basename(filepath)} - стили уже есть, пропускаем")
        return False
    
    # Находим закрывающий тег </style>
    if '</style>' not in content:
        print(f"❌ {os.path.basename(filepath)} - не найден тег </style>")
        return False
    
    # Вставляем стили перед </style>
    content = content.replace('  </style>', timeline_styles + '\n  </style>')
    
    # Сохраняем
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ {os.path.basename(filepath)} - стили добавлены")
    return True

# Обновляем все файлы
print("🎨 Добавляем стили timeline-status...")
print()

updated_count = 0
for filename in project_files:
    filepath = os.path.join(portfolio_dir, filename)
    if os.path.exists(filepath):
        if add_timeline_styles(filepath):
            updated_count += 1
    else:
        print(f"⚠️  {filename} - файл не найден")

print()
print(f"✨ Готово! Добавлено стилей в {updated_count}/{len(project_files)} файлов")
