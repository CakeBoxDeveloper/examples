#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Добавляет поворот на -30 градусов для 3D логотипов во всех файлах кроме panacea.html
"""

import re
import os

# Все файлы кроме panacea
files = [
    "aftereffects.html",
    "bambulab.html",
    "bentobox.html",
    "blender.html", 
    "cinema4d.html",
    "glitch.html",
    "illustrator.html",
    "maya.html",
    "mse.html",
    "photoshop.html",
    "prism.html",
    "project.html",
    "glitch — копия.html"
]

base_path = r"C:\Users\I am\Desktop\Portfolio"

for filename in files:
    filepath = os.path.join(base_path, filename)
    print(f"\n{'='*60}")
    print(f"Processing: {filename}")
    print('='*60)
    
    if not os.path.exists(filepath):
        print(f"  File not found, skipping")
        continue
    
    # Читаем файл
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    changes = []
    
    # Ищем строку где устанавливается position лого:
    # logoGroup.position.set(0,0.12,depth/2+0.04); card.add(logoGroup);
    
    # Вариант 1: position и add на одной строке
    pattern1 = r'(logoGroup\.position\.set\([^)]+\);)\s*(card\.add\(logoGroup\);)'
    replacement1 = r'\1 logoGroup.rotation.z = -30 * Math.PI / 180; \2'
    
    if re.search(pattern1, content):
        # Проверяем что rotation.z ещё не добавлен
        if 'logoGroup.rotation.z' not in content:
            content = re.sub(pattern1, replacement1, content)
            changes.append("+ Added -30 degree rotation to logo")
    
    # Сохраняем если были изменения
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"  Changes applied:")
        for change in changes:
            print(f"    {change}")
        print(f"  File updated successfully")
    else:
        if 'logoGroup.rotation.z' in content:
            print(f"  Already has rotation")
        else:
            print(f"  No matching pattern found")

print(f"\n{'='*60}")
print("All files processed!")
print('='*60)
