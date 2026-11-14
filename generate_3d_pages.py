#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Генератор страниц 3D-портфолио на основе maya.html
Создаёт: blender.html, cinema4d.html, bambulab.html
"""

import os
import sys

# Конфигурация страниц
PAGES = {
    'blender': {
        'hue': 30,
        'hue_comment': '🟠 Оранжевая тема для Blender',
        'title': 'Blender — 3D Моделирование',
        'h1': 'Blender',
        'tag': '3D Моделирование',
        'tag_icon': '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
        'description': 'Blender — свободное программное обеспечение для создания 3D-графики. Open-source решение с полным пайплайном: моделирование, скульптинг, анимация, симуляция, рендеринг и композитинг в одном пакете.',
        'logo_svg': 'blender.svg',
        'tech_grid': [
            ('Платформа', 'Blender Foundation'),
            ('Моделирование', 'Mesh · Sculpting'),
            ('Текстурирование', 'Shader Editor · UV'),
            ('Анимация', 'Keyframes · Grease Pencil'),
            ('Симуляция', 'Fluid · Cloth · Rigid Body'),
            ('Рендеринг', 'Cycles · Eevee')
        ],
        'article_title': 'Open-source стандарт 3D-графики',
        'article_intro': 'Blender — это мощное свободное ПО для создания 3D-контента, которое используется художниками, студиями и разработчиками по всему миру. От инди-проектов до полнометражных фильмов — Blender предоставляет полный набор инструментов: моделирование, скульптинг, текстурирование, анимация, симуляция и рендеринг.',
        'think_tree': [
            ('Моделирование', 'Полигональное моделирование, скульптинг в Sculpt Mode, процедурная генерация через Geometry Nodes'),
            ('Текстурирование', 'Node-based материалы в Shader Editor, UV-развёртка, процедурные текстуры'),
            ('Анимация', 'Риггинг персонажей, анимация по ключевым кадрам, NLA Editor для нелинейной анимации'),
            ('Симуляция', 'Физика жидкостей, ткани, разрушений, частиц через Mantaflow и встроенные симуляторы'),
            ('Рендеринг', 'Path-traced рендеринг в Cycles, real-time рендеринг в Eevee, композитинг в Compositor')
        ],
        'file_tree': [
            ('I', 'Препродакшн', 'Концепт', [
                'Концепт-арты и референсы',
                'Блокинг сцены и композиция',
                'Технические требования'
            ]),
            ('II', 'Продакшн', 'Основная работа', [
                'Моделирование и скульптинг',
                'UV-развёртка и текстурирование',
                'Риггинг и анимация',
                'Настройка освещения и материалов'
            ]),
            ('III', 'Постпродакшн', 'Финализация', [
                'Рендеринг в Cycles/Eevee',
                'Композитинг и цветокоррекция',
                'Финальный вывод'
            ])
        ],
        'article_end': 'Blender выбирают за свободу и гибкость — это полностью бесплатное решение без ограничений, с активным комьюнити и постоянными обновлениями. От короткометражек студии Blender до коммерческих проектов Netflix — Blender доказал свою состоятельность как профессиональный инструмент.',
        'features': [
            'Полностью бесплатное и open-source решение без подписок',
            'Мощный скульптинг с динамической топологией',
            'Geometry Nodes для процедурного моделирования',
            'Два рендер-движка: Cycles (path-tracing) и Eevee (real-time)',
            'Grease Pencil для 2D-анимации в 3D-пространстве',
            'Встроенный композитор и video editor'
        ]
    },
    'cinema4d': {
        'hue': 240,
        'hue_comment': '🔵 Тёмно-синяя тема для Cinema 4D',
        'title': 'Cinema 4D — Motion Design',
        'h1': 'Cinema 4D',
        'tag': 'Motion Design',
        'tag_icon': '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
        'description': 'Cinema 4D от Maxon — профессиональное решение для 3D-моушн дизайна и визуальных эффектов. Интуитивный интерфейс, мощные инструменты моделирования и интеграция с After Effects делают его стандартом в индустрии.',
        'logo_svg': 'Cinema-4d-Logo--Streamline-Ultimate.svg',
        'tech_grid': [
            ('Платформа', 'Maxon Cinema 4D'),
            ('Моделирование', 'Parametric · Splines'),
            ('Текстурирование', 'BodyPaint 3D · UV'),
            ('Анимация', 'MoGraph · Dynamics'),
            ('Рендеринг', 'Redshift · Arnold'),
            ('Интеграция', 'After Effects · Cineware')
        ],
        'article_title': 'Индустриальный стандарт motion design',
        'article_intro': 'Cinema 4D — это профессиональный 3D-пакет, созданный специально для моушн-дизайнеров и визуальных художников. Благодаря интуитивному интерфейсу, мощной системе MoGraph и тесной интеграции с After Effects, Cinema 4D стал стандартом в индустрии broadcast и рекламы.',
        'think_tree': [
            ('Моделирование', 'Параметрическое моделирование, работа со сплайнами, генераторы и деформеры'),
            ('MoGraph', 'Процедурная анимация через клонеры, эффекторы и поля (Fields) для motion design'),
            ('Анимация', 'Keyframe-анимация, система тегов, Character Animation Tools'),
            ('Динамика', 'Rigid Body, Soft Body, симуляция ткани и частиц через Thinking Particles'),
            ('Рендеринг', 'GPU-рендеринг в Redshift, интеграция с Arnold, физически корректное освещение')
        ],
        'file_tree': [
            ('I', 'Препродакшн', 'Концепт', [
                'Разработка концепции и стиля',
                'Раскадровка и аниматика',
                'Планирование таймингов'
            ]),
            ('II', 'Продакшн', 'Основная работа', [
                'Моделирование объектов',
                'Настройка MoGraph-систем',
                'Анимация камеры и объектов',
                'Lighting и shading'
            ]),
            ('III', 'Постпродакшн', 'Финализация', [
                'Рендеринг с Redshift/Arnold',
                'Композитинг в After Effects',
                'Финальный монтаж'
            ])
        ],
        'article_end': 'Cinema 4D выбирают за скорость и удобство — это самый быстрый путь от идеи до результата в motion design. От рекламных роликов Nike до заставок для ТВ-шоу — Cinema 4D остаётся первым выбором для моушн-дизайнеров по всему миру.',
        'features': [
            'Интуитивный интерфейс с низким порогом входа',
            'MoGraph — мощнейшая система для motion design',
            'Fields (поля) для процедурного контроля анимации',
            'Тесная интеграция с After Effects через Cineware',
            'GPU-рендеринг Redshift в комплекте',
            'Volume Builder и VDB-workflow для работы с вокселями'
        ]
    },
    'bambulab': {
        'hue': 120,
        'hue_comment': '🟢 Зелёная тема для Bambu Lab',
        'title': 'Bambu Lab — 3D Печать',
        'h1': 'Bambu Lab',
        'tag': '3D Печать',
        'tag_icon': '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/><path d="M5 2v20M19 2v20"/>',
        'description': 'Bambu Lab — новое поколение 3D-принтеров с высокой скоростью печати, автоматической калибровкой и интеллектуальной системой контроля. Инновационное решение для быстрого прототипирования и мелкосерийного производства.',
        'logo_svg': 'bambulablogo.svg',
        'tech_grid': [
            ('Платформа', 'Bambu Lab X1/P1'),
            ('Технология', 'FDM · CoreXY'),
            ('Материалы', 'PLA · PETG · ABS · TPU'),
            ('Скорость', 'До 500 мм/с'),
            ('ПО', 'Bambu Studio · Slicer'),
            ('Управление', 'Wi-Fi · Cloud · AI')
        ],
        'article_title': 'Новое поколение 3D-печати',
        'article_intro': 'Bambu Lab — это революция в мире 3D-печати. Принтеры X1 Carbon и P1P сочетают высочайшую скорость печати (до 500 мм/с), автоматическую калибровку, AI-контроль качества и облачное управление. От прототипов до функциональных деталей — Bambu Lab открывает новые возможности.',
        'think_tree': [
            ('Подготовка модели', 'Импорт STL/3MF в Bambu Studio, настройка ориентации и поддержек'),
            ('Слайсинг', 'Генерация G-code с оптимизацией скорости и качества, подбор параметров печати'),
            ('Калибровка', 'Автоматическая калибровка стола через LiDAR, настройка Flow Rate для материала'),
            ('Печать', 'Мониторинг через встроенную камеру, AI-детекция дефектов, удалённое управление'),
            ('Постобработка', 'Удаление поддержек, шлифовка, покраска или сборка функциональной детали')
        ],
        'file_tree': [
            ('I', 'Препродакшн', 'Подготовка', [
                'CAD-моделирование детали',
                'Проверка геометрии на печатаемость',
                'Выбор материала и параметров'
            ]),
            ('II', 'Продакшн', 'Печать', [
                'Слайсинг в Bambu Studio',
                'Автоматическая калибровка принтера',
                'Печать с AI-мониторингом',
                'Контроль качества через камеру'
            ]),
            ('III', 'Постпродакшн', 'Финализация', [
                'Удаление поддержек',
                'Постобработка поверхности',
                'Сборка и тестирование'
            ])
        ],
        'article_end': 'Bambu Lab выбирают за скорость и надёжность — это самые быстрые и точные FDM-принтеры на рынке. От инженерных прототипов до мелкосерийного производства — Bambu Lab устанавливает новый стандарт качества 3D-печати.',
        'features': [
            'Скорость печати до 500 мм/с с сохранением качества',
            'Автоматическая калибровка стола через LiDAR',
            'AI-детекция дефектов печати в реальном времени',
            'Multi-material печать с AMS (Automatic Material System)',
            'Облачное управление и мониторинг через приложение',
            'Закрытая камера с активным подогревом для ABS/ASA'
        ]
    }
}

def generate_page(page_key, config, template_path, output_path):
    """Генерирует HTML страницу на основе шаблона maya.html"""
    
    print(f"📄 Создаю {page_key}.html...")
    
    # Читаем шаблон
    with open(template_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
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
    
    # Заменяем логотип
    content = content.replace('maya-ewu1lp115nawqxstrdwva.svg', config['logo_svg'])
    
    # Заменяем tech grid (первая ячейка для примера, остальные аналогично)
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
    
    print("🚀 Генерация страниц 3D-портфолио...\n")
    
    # Генерируем страницы
    for page_key, config in PAGES.items():
        output_path = rf'c:\Users\I am\Desktop\Portfolio\{page_key}.html'
        generate_page(page_key, config, template_path, output_path)
    
    print("\n🎉 Все страницы успешно созданы!")
    print("\n📋 Созданные файлы:")
    print("   • blender.html (оранжевый, hue: 30)")
    print("   • cinema4d.html (тёмно-синий, hue: 240)")
    print("   • bambulab.html (зелёный, hue: 120)")

if __name__ == '__main__':
    main()
