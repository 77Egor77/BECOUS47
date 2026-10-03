// ===== УВЕДОМЛЕНИЯ В TELEGRAM =====
const WORKER_URL = "https://broken-shape-b5ad.ugorkrav74.workers.dev";
const MY_CHAT_ID = "5586227573";   // ← замени на СВОЙ chat_id из getUpdates

function sendNotification(text) {
    fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: MY_CHAT_ID, text: text })
    }).catch(err => console.error('Ошибка уведомления:', err));
}

// ===== ЭЛЕМЕНТЫ =====
const wrapper   = document.querySelector(".wrapper");
const letter    = document.querySelector(".letter");

const btnNoWrap = document.querySelector('.btn-no-wrap');
const btnNo     = document.querySelector('.btn-no');

const slides      = document.querySelectorAll('.slide');
const mainButtons = document.getElementById('main-buttons');

const dateInput  = document.querySelector('.date-input');
const timeInput  = document.querySelector('.time-input');
const btnConfirm = document.querySelector('.btn-confirm');

// ===== СОСТОЯНИЕ =====
let currentSlide  = 0;
let selectedPlace = '';
let BbaseX = null;
let BbaseY = null;

// ===== КОНВЕРТ =====
wrapper.addEventListener("click", () => {
    if (!wrapper.classList.contains('open')) {
        wrapper.classList.add('open');
        return;
    }

    if (!wrapper.classList.contains('expand')) {
        const rect = letter.getBoundingClientRect();
        document.body.appendChild(letter);

        letter.style.setProperty('--start-left',   rect.left   + 'px');
        letter.style.setProperty('--start-top',    rect.top    + 'px');
        letter.style.setProperty('--start-width',  rect.width  + 'px');
        letter.style.setProperty('--start-height', rect.height + 'px');

        // форсируем пересчёт стилей
        letter.getBoundingClientRect();

        requestAnimationFrame(() => {
            letter.classList.add('expand');
        });

        wrapper.classList.add('expand');
    }
});

// ===== СЛАЙДЫ =====
function showSlide(index) {
    slides.forEach(s => s.classList.remove('active'));
    slides[index].classList.add('active');

    const type = slides[index].dataset.type;
    if (type === 'simple') {
        mainButtons.classList.remove('hidden');
    } else {
        mainButtons.classList.add('hidden');
    }

    if (index === 1) {
        btnNoWrap.style.display = 'none';
        document.querySelector('.btn-yes').textContent = 'Да-да-да';
    } else {
        btnNoWrap.style.display = 'block';
        document.querySelector('.btn-yes').textContent = 'Да';
    }

    // Сброс кнопки «Нет»
    btnNoWrap.style.transform = 'none';
    BbaseX = null;
    BbaseY = null;
}

// ===== КНОПКА «ДА» =====
document.querySelector('.btn-yes').addEventListener('click', () => {
    if (currentSlide < slides.length - 1) {
        currentSlide++;
        showSlide(currentSlide);

        if (currentSlide === 1) {
            sendNotification("💖 <b>Она нажала Да на первом вопросе!</b>");
        } else if (currentSlide === 2) {
            sendNotification("🥰 <b>Она нажала Да-да-да!</b>");
        }
    }
});

// ===== ВЫБОР МЕСТА =====
document.querySelectorAll('.place').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.parentElement.querySelectorAll('.place')
            .forEach(p => p.classList.remove('selected'));
        btn.classList.add('selected');

        selectedPlace = btn.dataset.place;

        sendNotification(`📍 <b>Выбрано место:</b> ${btn.dataset.place}`);

        if (currentSlide < slides.length - 1) {
            currentSlide++;
            showSlide(currentSlide);
        }
    });
});

// ===== ДАТА И ВРЕМЯ =====
function updateConfirmState() {
    const ready = dateInput.value && timeInput.value;
    btnConfirm.disabled = !ready;
    btnConfirm.textContent = ready ? 'Подтвердить' : 'Выбери дату и время';
}

['change', 'input'].forEach(evt => {
    dateInput.addEventListener(evt, updateConfirmState);
    timeInput.addEventListener(evt, updateConfirmState);
});
updateConfirmState();

// ===== ПОДТВЕРЖДЕНИЕ =====
btnConfirm.addEventListener('click', () => {
    if (!dateInput.value || !timeInput.value) return;

    sendNotification(
        `💕 <b>Она подтвердила!</b>\n\n` +
        `📍 Место: ${selectedPlace}\n` +
        `📅 Дата: ${dateInput.value}\n` +
        `⏰ Время: ${timeInput.value}`
    );

    document.querySelector('.slides').innerHTML = `
        <div class="slide active">
            <p class="p1">Жду тебя</p>
            <p class="p2">${dateInput.value} в ${timeInput.value}</p>
            <p class="p3">${selectedPlace}</p>
            <img src="final.gif" alt="" class="final-img">
        </div>`;
    mainButtons.classList.add('hidden');
});

// ===== КНОПКА «НЕТ» (убегает) =====
btnNo.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const minDistance = Math.min(300, window.innerWidth * 0.35);

    const rect = btnNoWrap.getBoundingClientRect();
    const btnW = rect.width;
    const btnH = rect.height;

    if (BbaseX === null) {
        BbaseX = rect.left;
        BbaseY = rect.top;
    }

    let baseX = rect.left;
    let baseY = rect.top;

    let dx, dy, targetX, targetY;
    let attempts = 0;

    const windowWidth  = window.innerWidth;
    const windowHeight = window.innerHeight;

    while (attempts === 0) {
        const minX = 15;
        const maxX = windowWidth - btnW - 15;
        targetX = minX + Math.random() * (maxX - minX);

        const minY = 15;
        const maxY = windowHeight - btnH - 15;
        targetY = minY + Math.random() * (maxY - minY);

        dx = targetX - baseX;
        dy = targetY - baseY;

        const distance = Math.hypot(dx, dy);

        if (distance >= minDistance) {
            break;
        }
    }

    dx = targetX - BbaseX;
    dy = targetY - BbaseY;

    btnNoWrap.style.transform = `translate(${dx}px, ${dy}px)`;

    btnNo.classList.remove('hopping');
    void btnNo.offsetWidth;
    btnNo.classList.add('hopping');
});
