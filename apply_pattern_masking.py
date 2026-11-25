#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для применения маскирования паттерна ко всем проектным файлам
Применяет изменения из panacea.html к остальным файлам
"""

import re
import os

files = [
    "bambulab.html",
    "blender.html", 
    "cinema4d.html",
    "illustrator.html",
    "maya.html",
    "photoshop.html",
    "project.html",
    "project 7-04.html",
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
    
    # 1. Добавляем patternReady flag после svgLoaded
    if 'let patternReady = false;' not in content:
        if 'let svgLoaded = false;' in content:
            content = content.replace(
                'let svgLoaded = false;',
                'let svgLoaded = false;\n      let patternReady = false;'
            )
            changes.append("+ Added patternReady flag")
    
    # 2. Добавляем manualPatternExclusionZone перед class Sparkle
    if 'manualPatternExclusionZone' not in content:
        insert_code = '''/**
       * Ручная зона исключения (в пикселях текстуры 1024x1365).
       * Экземпляры паттерна, которые хотя бы частично заходят в эту область, не отрисовываются.
       */
      const manualPatternExclusionZone = {
        x: 230,
        y: 300,
        width: 564,
        height: 750
      };

      '''
        content = content.replace('      class Sparkle {', insert_code + 'class Sparkle {')
        changes.append("✓ Added manualPatternExclusionZone")
    
    # 3. Добавляем isPatternItemMasked функцию перед function drawBase
    if 'function isPatternItemMasked' not in content:
        insert_code = '''/**
       * Проверяет, пересекается ли прямоугольник отдельного экземпляра паттерна
       * с ручной зоной исключения в центре карточки.
       */
      function isPatternItemMasked(x, y, w, h) {
        const zone = manualPatternExclusionZone;
        return (
          x < zone.x + zone.width &&
          x + w > zone.x &&
          y < zone.y + zone.height &&
          y + h > zone.y
        );
      }

      '''
        content = content.replace('      function drawBase()', insert_code + 'function drawBase()')
        changes.append("✓ Added isPatternItemMasked function")
    
    # 4. Обновляем drawBase - меняем проверку с svgLoaded на patternReady
    if 'function drawBase()' in content and 'if (!svgLoaded) return;' in content:
        # Находим drawBase и заменяем проверку
        pattern = r'(function drawBase\(\) \{[^\n]*\n[^\n]*if \()!svgLoaded(\) return;)'
        if re.search(pattern, content):
            content = re.sub(pattern, r'\1!patternReady\2', content)
            changes.append("✓ Updated drawBase check to patternReady")
    
    # 5. Удаляем отрисовку паттерна из drawBase (если она там есть)
    # Ищем секцию между началом drawBase и ctx.save() для shimmer
    pattern = r'(function drawBase\(\) \{[^\n]*\n[^\n]*if \(!patternReady\) return;[^\n]*\n[^\n]*const w = cvs\.width, h = cvs\.height;)[\s\S]*?(patCtx\.clearRect[\s\S]*?patCtx\.restore\(\);[\s\S]*?)(ctx\.save\(\);)'
    
    if re.search(pattern, content):
        replacement = r'\1\n        ctx.fillStyle=getHarmonicColor(hueShiftDeg,0.35,0.15); ctx.fillRect(0,0,w,h);\n        ctx.save(); ctx.globalAlpha=0.08; ctx.drawImage(patCvs,0,0); ctx.restore();\n        \3'
        content = re.sub(pattern, replacement, content)
        changes.append("✓ Removed pattern drawing from drawBase")
    
    # 6. Добавляем отрисовку паттерна в img.onload
    if 'img.onload=function(){' in content and 'patternReady = true;' not in content:
        pattern_draw_code = '''
        
        // Отрисовываем паттерн один раз
        const w = patCvs.width, h = patCvs.height;
        patCtx.clearRect(0,0,w,h);
        patCtx.save();
        patCtx.translate(w/2,h/2);
        patCtx.rotate(-30*Math.PI/180);
        const cell=180, nw=img.naturalWidth||cell, nh=img.naturalHeight||cell, ratio=nw/nh;
        const iW=ratio>=1?cell:cell*ratio, iH=ratio>=1?cell/ratio:cell, gX=280, gY=280;
        for (let r=-15;r<15;r++) {
          for (let c=-12;c<12;c++) { 
            const offX=(r%2!==0)?gX/2:0; 
            const drawX = c * gX + offX - iW / 2;
            const drawY = r * gY - iH / 2;
            
            // Проверяем маску с абсолютными координатами
            if (isPatternItemMasked(w / 2 + drawX, h / 2 + drawY, iW, iH)) continue;
            
            patCtx.drawImage(img,drawX,drawY,iW,iH); 
          }
        }
        patCtx.restore();
        patternReady = true;
        
        '''
        
        # Пробуем несколько вариантов
        if 'svgLoaded=true;\n\n        drawBase();' in content:
            content = content.replace(
                'svgLoaded=true;\n\n        drawBase();',
                'svgLoaded=true;' + pattern_draw_code + 'drawBase();'
            )
            changes.append("✓ Added pattern drawing to img.onload")
        elif 'svgLoaded=true;\n        drawBase();' in content:
            content = content.replace(
                'svgLoaded=true;\n        drawBase();',
                'svgLoaded=true;' + pattern_draw_code + 'drawBase();'
            )
            changes.append("✓ Added pattern drawing to img.onload")
        elif 'svgLoaded=true; drawBase();' in content:
            content = content.replace(
                'svgLoaded=true; drawBase();',
                'svgLoaded=true;' + pattern_draw_code + 'drawBase();'
            )
            changes.append("✓ Added pattern drawing to img.onload")
    
    # 7. Удаляем дублирующую SVG маску (первый loader.load после img.onload)
    # Ищем секцию загрузки маски между img.onload и загрузкой лого
    mask_pattern = r'(drawBase\(\);[\s\S]*?const loader=new THREE\.SVGLoader\(\);[\s\S]*?// МАСКА[\s\S]*?loader\.load\(svgUrl,\(data\)=>\{[\s\S]*?\}\);[\s\S]*?)'
    
    if re.search(mask_pattern, content):
        # Удаляем только если есть две загрузки (маска и лого)
        loader_count = content.count('loader.load(svgUrl,')
        if loader_count >= 2:
            # Удаляем первую (маску), оставляем вторую (лого)
            content = re.sub(
                r'(const loader=new THREE\.SVGLoader\(\);[\s\S]*?)// МАСКА[\s\S]*?loader\.load\(svgUrl,\(data\)=>\{[\s\S]*?card\.add\(svgMaskGroup\);[\s\S]*?\}\);[\s\S]*?',
                r'\1',
                content,
                count=1
            )
            changes.append("✓ Removed duplicate SVG mask load")
    
    # Сохраняем если были изменения
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"  Changes applied:")
        for change in changes:
            print(f"    {change}")
        print(f"  File updated successfully")
    else:
        print(f"  No changes needed (already up to date)")

print(f"\n{'='*60}")
print("All files processed!")
print('='*60)
