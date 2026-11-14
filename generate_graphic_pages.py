#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Генератор страниц Графика-портфолио на основе maya.html
Создаёт: photoshop.html, aftereffects.html, illustrator.html
"""

import os
import sys
import re

# Конфигурация страниц
PAGES = {
    'photoshop': {
        'hue': 210,
        'hue_comment': '🔵 Синяя тема для Photoshop',
        'title': 'Photoshop — Растровая графика',
        'h1': 'Photoshop',
        'tag': 'Растровая графика',
        'tag_icon': '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
        'description': 'Adobe Photoshop — профессиональный редактор растровой графики и стандарт индустрии. От ретуши фотографий до цифровой живописи и дизайна интерфейсов — Photoshop предоставляет безграничные возможности для креатива.',
        'logo_svg': 'https://raw.githubusercontent.com/CakeBoxDeveloper/examples/c8176c83ba0afa5e845385716c1a80fd2b85aab7/adobe-photoshop-svgrepo-com%20(1).svg',
        'tech_grid': [
            ('Платформа', 'Adobe Photoshop'),
            ('Инструменты', 'Layers · Masks · Brushes'),
            ('Ретушь', 'Healing · Clone Stamp'),
            ('Эффекты', 'Filters · Smart Objects'),
            ('Цвет', 'Adjustment Layers'),
            ('AI', 'Neural Filters · Generative Fill')
        ],
        'article_title': 'Индустриальный стандарт растровой графики',
        'article_intro': 'Adobe Photoshop — это эталонный инструмент для работы с растровой графикой, который используется фотографами, дизайнерами и цифровыми художниками по всему миру. От профессиональной ретуши до концепт-арта — Photoshop обеспечивает полный контроль над каждым пикселем.',
        'think_tree': [
            ('Подготовка', 'Импорт RAW-файлов, настройка цветового пространства, создание рабочей структуры слоёв'),
            ('Ретушь', 'Удаление дефектов через Healing Brush, коррекция тона и цвета, работа с масками'),
            ('Композитинг', 'Совмещение нескольких изображений, работа с blend modes, создание сложных эффектов'),
            ('Цветокоррекция', 'Adjustment Layers для точной работы с цветом, Camera Raw Filter, LUTs'),
            ('Экспорт', 'Подготовка для веба (Save for Web), печати (CMYK), или передачи в другие приложения')
        ],
        'file_tree': [
            ('I', 'Препродакшн', 'Подготовка', [
                'Импорт исходных изображений',
                'Настройка цветового профиля',
                'Создание структуры слоёв'
            ]),
            ('II', 'Продакшн', 'Основная работа', [
                'Ретушь и коррекция дефектов',
                'Композитинг и монтаж',
                'Цветокоррекция и грейдинг',
                'Применение эффектов и фильтров'
            ]),
            ('III', 'Постпродакшн', 'Финализация', [
                'Финальная цветокоррекция',
                'Sharpening и подготовка к выводу',
                'Экспорт в нужных форматах'
            ])
        ],
        'article_end': 'Photoshop выбирают за универсальность и глубину инструментария — это решение для любых задач с растровой графикой. От обложек журналов до киноп постеров — Photoshop остаётся незаменимым инструментом профессионалов.',
        'features': [
            'Неразрушающее редактирование через Smart Objects',
            'AI-инструменты: Generative Fill, Neural Filters',
            'Продвинутая работа с масками и выделениями',
            'Content-Aware Fill для удаления объектов',
            'Интеграция с Adobe Creative Cloud',
            'Поддержка RAW-файлов всех камер через Camera Raw'
        ]
    },
    'aftereffects': {
        'hue': 270,
        'hue_comment': '🟣 Фиолетовая тема для After Effects',
        'title': 'After Effects — Моушн-дизайн',
        'h1': 'After Effects',
        'tag': 'Моушн-дизайн',
        'tag_icon': '<polygon points="5 3 19 12 5 21 5 3"/>',
        'description': 'Adobe After Effects — профессиональное решение для создания motion graphics и визуальных эффектов. От анимированной графики до композитинга — After Effects является стандартом индустрии broadcast и digital.',
        'logo_svg': 'https://raw.githubusercontent.com/CakeBoxDeveloper/examples/c8176c83ba0afa5e845385716c1a80fd2b85aab7/adobe-after-effects-svgrepo-com.svg',
        'tech_grid': [
            ('Платформа', 'Adobe After Effects'),
            ('Анимация', 'Keyframes · Graph Editor'),
            ('Композитинг', 'Layers · Masks · Tracking'),
            ('Эффекты', '200+ встроенных эффектов'),
            ('3D', 'Camera · Lights · C4D Lite'),
            ('Скрипты', 'Expressions · JSXBIN')
        ],
        'article_title': 'Профессиональный motion design и VFX',
        'article_intro': 'Adobe After Effects — это индустриальный стандарт для создания motion graphics, визуальных эффектов и композитинга. Используется в производстве рекламы, music videos, broadcast-графики и кинематографа — After Effects предоставляет полный набор инструментов для анимации.',
        'think_tree': [
            ('Подготовка', 'Импорт ассетов, настройка композиции, создание структуры слоёв и pre-comps'),
            ('Анимация', 'Keyframe-анимация, работа с Graph Editor, использование expressions для процедурной анимации'),
            ('Эффекты', 'Применение встроенных эффектов, создание looks через Adjustment Layers'),
            ('Композитинг', 'Трекинг камеры и объектов, ротоскопинг, интеграция 3D-элементов'),
            ('Рендеринг', 'Настройка Output Module, рендеринг через Media Encoder, создание прокси для ускорения')
        ],
        'file_tree': [
            ('I', 'Препродакшн', 'Подготовка', [
                'Разработка концепции',
                'Раскадровка и аниматика',
                'Подготовка ассетов'
            ]),
            ('II', 'Продакшн', 'Основная работа', [
                'Keyframe-анимация элементов',
                'Настройка эффектов и looks',
                'Композитинг слоёв',
                'Sound design и синхронизация'
            ]),
            ('III', 'Постпродакшн', 'Финализация', [
                'Финальный композитинг',
                'Color grading',
                'Рендеринг и экспорт'
            ])
        ],
        'article_end': 'After Effects выбирают за мощность и гибкость — это универсальное решение для motion design любой сложности. От рекламных роликов до титров фильмов — After Effects остаётся главным инструментом моушн-дизайнеров.',
        'features': [
            'Expressions для процедурной анимации на JavaScript',
            'Интеграция с Cinema 4D Lite (C4D встроен)',
            'Мощный Graph Editor для точной работы с кривыми',
            'Tracking: planar, 3D camera, mocha AE',
            'Dynamic Link с Premiere Pro и Audition',
            'GPU-ускорение для эффектов и preview'
        ]
    },
    'illustrator': {
        'hue': 30,
        'hue_comment': '🟠 Оранжевая тема для Illustrator',
        'title': 'Illustrator — Векторная графика',
        'h1': 'Illustrator',
        'tag': 'Векторная графика',
        'tag_icon': '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
        'description': 'Adobe Illustrator — профессиональный редактор векторной графики и стандарт индустрии. От логотипов и иконок до иллюстраций и типографики — Illustrator предоставляет точные инструменты для создания масштабируемой графики.',
        'logo_svg': 'https://raw.githubusercontent.com/CakeBoxDeveloper/examples/c8176c83ba0afa5e845385716c1a80fd2b85aab7/adobe-illustrator-svgrepo-com%20(1).svg',
        'tech_grid': [
            ('Платформа', 'Adobe Illustrator'),
            ('Инструменты', 'Pen · Shapes · Pathfinder'),
            ('Типографика', 'Type Tool · Glyphs'),
            ('Цвет', 'Swatches · Gradients'),
            ('Эффекты', 'Appearance · Live Effects'),
            ('Экспорт', 'SVG · PDF · EPS')
        ],
        'article_title': 'Индустриальный стандарт векторной графики',
        'article_intro': 'Adobe Illustrator — это эталонный инструмент для создания векторной графики, который используется дизайнерами, иллюстраторами и типографами по всему миру. От фирменного стиля до технических иллюстраций — Illustrator обеспечивает абсолютную точность и бесконечную масштабируемость.',
        'think_tree': [
            ('Скетчинг', 'Создание базовых форм через Pen Tool, работа с сетками и направляющими'),
            ('Разработка форм', 'Комбинирование объектов через Pathfinder, работа с кривыми Безье'),
            ('Цвет и стиль', 'Настройка цветовых схем, создание градиентов, применение Appearance'),
            ('Типографика', 'Работа с текстом, создание кастомных начертаний, Type on Path'),
            ('Экспорт', 'Подготовка для веба (SVG), печати (PDF), или передачи в другие приложения')
        ],
        'file_tree': [
            ('I', 'Препродакшн', 'Концепт', [
                'Разработка концепции',
                'Скетчинг и референсы',
                'Создание мудборда'
            ]),
            ('II', 'Продакшн', 'Основная работа', [
                'Векторизация форм',
                'Работа с цветом и градиентами',
                'Типографика и композиция',
                'Создание вариаций'
            ]),
            ('III', 'Постпродакшн', 'Финализация', [
                'Финальная полировка',
                'Подготовка артбордов',
                'Экспорт в нужных форматах'
            ])
        ],
        'article_end': 'Illustrator выбирают за точность и масштабируемость — это решение для любых задач с векторной графикой. От логотипов стартапов до упаковки брендов — Illustrator остаётся незаменимым инструментом дизайнеров.',
        'features': [
            'Pen Tool — самый точный инструмент для создания кривых',
            'Pathfinder для булевых операций с объектами',
            'Live Corners для быстрого скругления углов',
            'Gradient Mesh для реалистичных иллюстраций',
            'Symbol Sprayer для работы с повторяющимися элементами',
            'Экспорт в SVG с чистым, оптимизированным кодом'
        ]
    }
}

# Конфигурация летающих плиток для графики (те же 3 Adobe-продукта)
TILES_CONFIG = """    // Конфигурация 6 плиток: Photoshop (210°), After Effects (270°), Illustrator (30°), повторяются дважды
    const tileConfigsBase = [
      { hue: 210, svg: 'https://raw.githubusercontent.com/CakeBoxDeveloper/examples/c8176c83ba0afa5e845385716c1a80fd2b85aab7/adobe-photoshop-svgrepo-com%20(1).svg' },
      { hue: 270, svg: 'https://raw.githubusercontent.com/CakeBoxDeveloper/examples/c8176c83ba0afa5e845385716c1a80fd2b85aab7/adobe-after-effects-svgrepo-com.svg' },
      { hue: 30,  svg: 'https://raw.githubusercontent.com/CakeBoxDeveloper/examples/c8176c83ba0afa5e845385716c1a80fd2b85aab7/adobe-illustrator-svgrepo-com%20(1).svg' },
      { hue: 210, svg: 'https://raw.githubusercontent.com/CakeBoxDeveloper/examples/c8176c83ba0afa5e845385716c1a80fd2b85aab7/adobe-photoshop-svgrepo-com%20(1).svg' },
      { hue: 270, svg: 'https://raw.githubusercontent.com/CakeBoxDeveloper/examples/c8176c83ba0afa5e845385716c1a80fd2b85aab7/adobe-after-effects-svgrepo-com.svg' },
      { hue: 30,  svg: 'https://raw.githubusercontent.com/CakeBoxDeveloper/examples/c8176c83ba0afa5e845385716c1a80fd2b85aab7/adobe-illustrator-svgrepo-com%20(1).svg' }
    ];"""

def generate_page(page_key, config, template_path, output_path):
    """Генерирует HTML страницу на основе шаблона maya.html"""
    
    print(f"📄 Создаю {page_key}.html...")
    
    # Читаем шаблон
    with open(template_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Заменяем конфигурацию плиток (адаптируем под графику)
    old_tiles = re.search(r'// Конфигурация 6 плиток:.*?\];', content, re.DOTALL)
    if old_tiles:
        content = content.replace(old_tiles.group(0), TILES_CONFIG.strip())
    
    # Заменяем hue
    content = content.replace('--hue: 180;', f'--hue: {config["hue"]};')
    content = content.replace('🔵 Бирюзовая тема для Maya', config['hue_comment'])
    
    # Заменяем title и заголовки
    content = content.replace('<title>Maya — 3D Анимация и VFX</title>', f'<title>{config["title"]}</title>')
    content = content.replace('<h1 class="hero__title">Maya</h1>', f'<h1 class="hero__title">{config["h1"]}</h1>')
    
    # Заменяем тег
    content = content.replace('3D Анимация', config['tag'])
    
    # Заменяем описание
    content = content.replace(
        'Autodesk Maya — комплексная платформа для создания 3D-анимации, моделирования, риггинга и VFX. Используется в кинематографе, игровой индустрии и анимационных студиях для производства высококачественного контента.',
        config['description']
    )
    
    # Заменяем логотип (полный URL, не только имя файла)
    content = content.replace(
        "const svgUrl = 'https://raw.githubusercontent.com/CakeBoxDeveloper/examples/342f465d59350c1b5846e26dc3922642163be4fe/maya-ewu1lp115nawqxstrdwva.svg';",
        f"const svgUrl = '{config['logo_svg']}';"
    )
    
    # Заменяем tech grid
    tech_replacements = [
        ('Autodesk Maya', config['tech_grid'][0][1]),
        ('Polygons · NURBS', config['tech_grid'][1][1]),
        ('Joints · IK/FK', config['tech_grid'][2][1]),
        ('Keyframes · Graph Editor', config['tech_grid'][3][1]),
        ('nParticles · Bifrost', config['tech_grid'][4][1]),
        ('Arnold · V-Ray', config['tech_grid'][5][1])
    ]
    
    for old, new in tech_replacements:
        content = content.replace(old, new)
    
    # Заменяем заголовок статьи
    content = content.replace('Индустриальный стандарт 3D-анимации', config['article_title'])
    
    # Заменяем первый абзац
    old_intro = 'Maya — это полнофункциональный пакет для создания 3D-контента, который используется крупнейшими студиями по всему миру. От Pixar и Industrial Light & Magic до независимых разработчиков игр — Maya обеспечивает полный пайплайн производства: моделирование, текстурирование, риггинг, анимация, симуляция и рендеринг.'
    content = content.replace(old_intro, config['article_intro'])
    
    # Заменяем think-tree элементы
    think_tree_items = [
        ('Моделирование', 'Создание 3D-геометрии: полигональное моделирование или NURBS-поверхности'),
        ('Риггинг', 'Построение скелета персонажа с системой костей (joints), настройка IK/FK, создание контроллеров'),
        ('Анимация', 'Покадровая анимация через ключевые кадры, работа с Graph Editor для полировки кривых'),
        ('VFX и симуляция', 'Создание эффектов (nParticles, Bifrost) — огонь, вода, дым, разрушение'),
        ('Рендеринг', 'Финальная визуализация с использованием Arnold, V-Ray или других движков')
    ]
    
    for i, (old_title, old_desc) in enumerate(think_tree_items):
        if i < len(config['think_tree']):
            new_title, new_desc = config['think_tree'][i]
            content = content.replace(f'<div class="think-tree__label">{old_title}</div>', 
                                     f'<div class="think-tree__label">{new_title}</div>')
            content = content.replace(f'<div class="think-tree__desc">{old_desc}</div>', 
                                     f'<div class="think-tree__desc">{new_desc}</div>')
    
    # Заменяем последний абзац
    old_ending = 'Индустрия выбирает Maya за универсальность — это единое решение для кинематографа, игр и рекламы. От блокбастеров Marvel до AAA-игр Ubisoft — Maya остаётся эталоном профессионального 3D-производства.'
    content = content.replace(old_ending, config['article_end'])
    
    # Заменяем список преимуществ
    old_features = [
        'Мощные инструменты риггинга для персонажей любой сложности',
        'Продвинутая анимация с нелинейным редактированием кривых',
        'Интеграция с другими Autodesk-продуктами (3ds Max, MotionBuilder)',
        'Обширная экосистема плагинов и расширений',
        'Поддержка индустриальных форматов (Alembic, USD, FBX)'
    ]
    
    for i, old_feature in enumerate(old_features):
        if i < len(config['features']):
            content = content.replace(f'<li>{old_feature}</li>', f'<li>{config["features"][i]}</li>')
    
    # Записываем результат
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ {page_key}.html создан!")

def main():
    """Основная функция"""
    
    # Путь к шаблону
    template_path = r'c:\Users\I am\Desktop\Portfolio\maya.html'
    
    # Проверяем существование шаблона
    if not os.path.exists(template_path):
        print(f"❌ Ошибка: файл {template_path} не найден!")
        sys.exit(1)
    
    print("🎨 Генерация страниц Графика-портфолио...\n")
    
    # Генерируем страницы
    for page_key, config in PAGES.items():
        output_path = rf'c:\Users\I am\Desktop\Portfolio\{page_key}.html'
        generate_page(page_key, config, template_path, output_path)
    
    print("\n🎉 Все страницы успешно созданы!")
    print("\n📋 Созданные файлы:")
    print("   • photoshop.html (синий, hue: 210)")
    print("   • aftereffects.html (фиолетовый, hue: 270)")
    print("   • illustrator.html (оранжевый, hue: 30)")

if __name__ == '__main__':
    main()
