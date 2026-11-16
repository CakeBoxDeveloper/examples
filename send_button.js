// Анимация кнопок отправки
(function() {
  'use strict';

  const buttons = document.querySelectorAll('.send-btn');
  
  buttons.forEach(button => {
    // Обрабатываем текст первого состояния
    const defaultText = button.querySelector('.send-btn__state--default .send-btn__text');
    if (defaultText) {
      const text = defaultText.textContent.trim();
      defaultText.innerHTML = text.split('').map((char, i) => 
        `<span class="send-letter" style="--i: ${i}">${char}</span>`
      ).join('');
    }

    // Обрабатываем текст второго состояния
    const sentText = button.querySelector('.send-btn__state--sent .send-btn__text');
    if (sentText) {
      const text = sentText.textContent.trim();
      sentText.innerHTML = text.split('').map((char, i) => 
        `<span class="send-letter" style="--i: ${i}">${char}</span>`
      ).join('');
    }

    // Клик
    button.addEventListener('click', function(e) {
      if (this.classList.contains('is-sending')) {
        e.preventDefault();
        return;
      }
      
      this.classList.add('is-sending');
      
      setTimeout(() => {
        this.classList.remove('is-sending');
      }, 2500);
    });
  });

})();
