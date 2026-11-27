import os
import re

# Список файлов проектов для обновления
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
    'project.html',
    'panacea.html'
]

# Путь к директории
portfolio_dir = r'C:\Users\I am\Desktop\Portfolio'

def update_tech_section(filepath):
    """Обновляет секцию tech, убирая статус из таблицы и вынося его отдельной строкой"""
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Проверяем, есть ли уже timeline-status (чтобы не делать дважды)
    if 'timeline-status' in content:
        print(f"⏭️  {os.path.basename(filepath)} - уже обновлён, пропускаем")
        return False
    
    # Ищем секцию tech с таблицей и статусом внутри
    # Паттерн: находим tech__grid и tech__status-wrap
    tech_pattern = r'(<section class="tech">.*?<div class="tech__grid">.*?</div>\s*</div>\s*)<div class="tech__status-wrap">.*?</div>\s*</div>\s*</section>'
    
    match = re.search(tech_pattern, content, re.DOTALL)
    
    if not match:
        print(f"❌ {os.path.basename(filepath)} - не найдена структура tech__status-wrap")
        return False
    
    # Извлекаем статус из старой структуры
    status_match = re.search(r'<span class="badge badge--(\w+)">([^<]+)</span>', match.group(0))
    
    if not status_match:
        print(f"❌ {os.path.basename(filepath)} - не найден badge статуса")
        return False
    
    status_type = status_match.group(1)  # done, wip, nda
    status_text = status_match.group(2)   # текст статуса
    
    # Создаём новую структуру без статуса внутри таблицы
    new_tech_section = match.group(1) + '</div>\n  </section>\n\n'
    
    # Создаём timeline-status блок (пока с заглушками для дат)
    timeline_html = f'''  <!-- Timeline Status (отдельная строка вне таблицы) -->
  <div class="timeline-status">
    <div class="timeline-status__date-bubble">Дата старта</div>

    <div class="timeline-status__center">
      <div class="timeline-status__line"></div>

      <span class="timeline-status__badge timeline-status__badge--{status_type}">{status_text}</span>

      <div class="timeline-status__line"></div>
    </div>

    <div class="timeline-status__date-bubble">Дата окончания</div>
  </div>

'''
    
    # Заменяем старую секцию на новую + timeline
    content = content.replace(match.group(0), new_tech_section + timeline_html)
    
    # Сохраняем
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ {os.path.basename(filepath)} - обновлён")
    return True

# Обновляем все файлы
print("🚀 Начинаем обновление tech секций...")
print()

updated_count = 0
for filename in project_files:
    filepath = os.path.join(portfolio_dir, filename)
    if os.path.exists(filepath):
        if update_tech_section(filepath):
            updated_count += 1
    else:
        print(f"⚠️  {filename} - файл не найден")

print()
print(f"✨ Готово! Обновлено файлов: {updated_count}/{len(project_files)}")
