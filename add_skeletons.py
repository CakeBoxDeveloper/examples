import re

skeleton_html = '''<div class="image-placeholder" role="img" aria-label="Загрузка изображения">
        <svg class="image-placeholder__icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="23.5" cy="18.5" r="4.5" fill="currentColor"/>
          <path d="M10.5 48 C7.5 48 7.5 48 7.5 45 L7.5 19 C7.5 16 7.5 16 10.5 16 L53.5 16 C56.5 16 56.5 16 56.5 19 L56.5 45 C56.5 48 56.5 48 53.5 48 Z M15 42 L28 29 L38 39 L45 32 L52 42 Z" fill="currentColor"/>
        </svg>
      </div>

      '''

files = [
    'aftereffects.html',
    'prism.html', 
    'blender.html',
    'illustrator.html',
    'cinema4d.html',
    'maya.html',
    'photoshop.html',
    'mse.html',
    'glitch.html'
]

for filename in files:
    filepath = f'C:\\Users\\I am\\Desktop\\Portfolio\\{filename}'
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Найдём все article__h1 и добавим skeleton после 2-го и 4-го заголовка
        h1_pattern = r'(<p class="article__h1">.*?</p>\s*<p>.*?</p>)'
        matches = list(re.finditer(h1_pattern, content, re.DOTALL))
        
        if len(matches) >= 2:
            # Добавляем после 2-го h1
            pos1 = matches[1].end()
            content = content[:pos1] + '\n\n      ' + skeleton_html + content[pos1:]
        
        # Снова ищем matches после первой вставки
        matches = list(re.finditer(h1_pattern, content, re.DOTALL))
        if len(matches) >= 4:
            # Добавляем после 4-го h1
            pos2 = matches[3].end()
            content = content[:pos2] + '\n\n      ' + skeleton_html + content[pos2:]
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f'✅ {filename} - добавлено 2 skeleton loader')
    
    except Exception as e:
        print(f'❌ {filename} - ошибка: {e}')

print('\nГотово!')
