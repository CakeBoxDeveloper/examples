// Анимация кнопок с самолётиком (адаптация из React)
(function() {
  'use strict';

  // Находим обе кнопки
  const scrollBtn = document.getElementById('scrollBtn');
  const orderBtn = document.getElementById('orderBtn');

  if (!scrollBtn || !orderBtn) return;

  // Конвертируем текст в span'ы для анимации букв
  function wrapLetters(button) {
    const textSpan = button.querySelector('span');
    if (!textSpan) return;
    
    const text = textSpan.textContent;
    const letters = text.split('');
    
    textSpan.innerHTML = letters.map((char, i) => 
      `<span class="letter" style="--i: ${i}">${char}</span>`
    ).join('');
  }

  // Анимация при клике
  function animateButton(button) {
    if (button.classList.contains('is-animating')) return;
    
    button.classList.add('is-animating');
    
    setTimeout(() => {
      button.classList.remove('is-animating');
    }, 2100);
  }

  // Инициализация
  wrapLetters(scrollBtn);
  wrapLetters(orderBtn);

  // Обработчики кликов
  scrollBtn.addEventListener('click', function() {
    animateButton(this);
  });

  orderBtn.addEventListener('click', function() {
    animateButton(this);
  });

})();
