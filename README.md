# 242d.com.ua

gpt_task

"Створи беклог для простого додатку для управління фінансами. Хочу, щоб користувач міг додавати транзакції, бачити загальний баланс і категорії витрат. З технічних обмежень: лише HTML, CSS і JavaScript, без серверної частини. Проект має бути готовий через 5 днів. Ти потім перевіриш його як замовник."

class

class ContextBox {
constructor(width = 300, height = 100, padding = 10) {
this.width = width;
this.height = height;
this.padding = padding;
this.box = document.createElement('div');
this.box.style.position = 'absolute';
this.box.style.width = `${this.width}px`;
this.box.style.height = `${this.height}px`;
this.box.style.padding = `${this.padding}px`;
this.box.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
this.box.style.borderRadius = '5px';
this.box.style.zIndex = 1000;
this.box.style.display = 'none';
document.body.appendChild(this.box);
}

setTheme(bgColor, textColor, borderColor) {
this.box.style.background = bgColor;
this.box.style.color = textColor;
this.box.style.border = `1px solid ${borderColor}`;
}

show(event, message, accentColor, hoverColor, onConfirm, onCancel) {
const { x, y } = this.getInScreenCoords(event);
this.box.style.left = `${x}px`;
this.box.style.top = `${y}px`;
this.box.innerHTML = `      <p>${message}</p>
      <div style="justify-content: space-around; display: flex;">
        <button id="yes-btn" style="background:${accentColor}; color:white; border:none; padding:5px 10px; margin-right:5px; border-radius:5px">Так</button>
        <button id="no-btn" style="background:${hoverColor}; color:white; border:none; padding:5px 10px; border-radius:5px">Ні</button>
      </div>
   `;

    document.getElementById('yes-btn').addEventListener('click', () => {
      onConfirm();
      this.hide();
    });
    document.getElementById('no-btn').addEventListener('click', () => {
      onCancel();
      this.hide();
    });

    this.box.style.display = 'block';

}

hide() {
this.box.style.display = 'none';
}

getInScreenCoords(event) {
const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;
let xPos = event.pageX;
let yPos = event.pageY;

    if (xPos + this.width + this.padding > screenWidth) {
      xPos = screenWidth - this.width - this.padding;
    }
    if (yPos + this.height + this.padding > screenHeight) {
      yPos = screenHeight - this.height - this.padding;
    }

    return { x: xPos, y: yPos };

}
}
