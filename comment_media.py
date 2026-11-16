import re

with open(r"C:\Users\I am\Desktop\Portfolio\style.css", "r", encoding="utf-8") as f:
    content = f.read()

# Закомментировать все @media (max-width: 860px) { ... }
# Используем стек скобок для точного определения границ

lines = content.split('\n')
result = []
media_level = 0
in_media = False
brace_count = 0

for i, line in enumerate(lines):
    # Проверяем начало медиа-запроса
    if '@media (max-width: 860px)' in line and not in_media:
        in_media = True
        brace_count = 0
        result.append('/* ' + line)
        brace_count += line.count('{') - line.count('}')
        continue
    
    if in_media:
        result.append(line)
        brace_count += line.count('{') - line.count('}')
        
        # Если скобки закрылись
        if brace_count == 0:
            # Добавляем закрывающий комментарий к предыдущей строке
            result[-1] = result[-1] + ' */'
            in_media = False
    else:
        result.append(line)

output = '\n'.join(result)

with open(r"C:\Users\I am\Desktop\Portfolio\style.css", "w", encoding="utf-8") as f:
    f.write(output)

print("Done: commented out all @media (max-width: 860px) blocks")
