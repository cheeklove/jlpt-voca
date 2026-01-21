// flashcard.js - 공통 플래시카드 로직
// 사용법: HTML에서 words 배열과 STORAGE_KEY를 먼저 정의한 후 이 스크립트 로드

let currentIndex = 0;
let filteredWords = [...words];
let showReading = true;
let showMeaning = true;
let currentCategory = 'all';
let isNavigating = false;
let longPressTimer = null;
let isLongPress = false;

function saveState() {
    const state = { currentIndex, showReading, showMeaning, currentCategory };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        const state = JSON.parse(saved);
        currentIndex = state.currentIndex || 0;
        showReading = state.showReading !== undefined ? state.showReading : true;
        showMeaning = state.showMeaning !== undefined ? state.showMeaning : true;
        currentCategory = state.currentCategory || 'all';
        document.getElementById('categorySelect').value = currentCategory;
        if (currentCategory !== 'all') {
            filteredWords = words.filter(w => w.category === currentCategory);
        }
        if (currentIndex >= filteredWords.length) currentIndex = 0;
        updateToggleButtons();
    }
}

function updateToggleButtons() {
    const readingBtn = document.getElementById('toggleReading');
    const meaningBtn = document.getElementById('toggleMeaning');
    readingBtn.className = showReading ? 'toggle-btn active' : 'toggle-btn inactive';
    readingBtn.textContent = showReading ? '발음 표시' : '발음 숨김';
    meaningBtn.className = showMeaning ? 'toggle-btn active' : 'toggle-btn inactive';
    meaningBtn.textContent = showMeaning ? '정답 표시' : '정답 숨김';
}

function updateCard() {
    const word = filteredWords[currentIndex];
    document.getElementById('kanji').textContent = word.kanji;
    document.getElementById('reading').textContent = word.reading;
    document.getElementById('meaning').textContent = word.meaning;
    document.getElementById('categoryTag').textContent = word.category;
    document.getElementById('progress').textContent = `${currentIndex + 1} / ${filteredWords.length}`;
    applyVisibility();
    saveState();
}

function applyVisibility() {
    document.getElementById('reading').className = showReading ? 'reading' : 'reading hidden';
    document.getElementById('meaning').className = showMeaning ? 'meaning' : 'meaning hidden';
}

function toggleReading() {
    showReading = !showReading;
    updateToggleButtons();
    applyVisibility();
    saveState();
}

function toggleMeaning() {
    showMeaning = !showMeaning;
    updateToggleButtons();
    applyVisibility();
    saveState();
}

function revealTemporary() {
    document.getElementById('reading').className = 'reading';
    document.getElementById('meaning').className = 'meaning';
}

function hideTemporary() {
    applyVisibility();
}

function nextCard() {
    if (isNavigating) return;
    isNavigating = true;
    currentIndex = (currentIndex + 1) % filteredWords.length;
    updateCard();
    setTimeout(() => { isNavigating = false; }, 250);
}

function prevCard() {
    if (isNavigating) return;
    isNavigating = true;
    currentIndex = (currentIndex - 1 + filteredWords.length) % filteredWords.length;
    updateCard();
    setTimeout(() => { isNavigating = false; }, 250);
}

function changeCategory() {
    currentCategory = document.getElementById('categorySelect').value;
    if (currentCategory === 'all') {
        filteredWords = [...words];
    } else {
        filteredWords = words.filter(w => w.category === currentCategory);
    }
    currentIndex = 0;
    updateCard();
}

function shuffleCards() {
    for (let i = filteredWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filteredWords[i], filteredWords[j]] = [filteredWords[j], filteredWords[i]];
    }
    currentIndex = 0;
    updateCard();
}

function resetOrder() {
    if (currentCategory === 'all') {
        filteredWords = [...words];
    } else {
        filteredWords = words.filter(w => w.category === currentCategory);
    }
    currentIndex = 0;
    updateCard();
}

// 터치 이벤트
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;

document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
    isLongPress = false;
    longPressTimer = setTimeout(() => {
        isLongPress = true;
        revealTemporary();
    }, 300);
});

document.addEventListener('touchmove', e => {
    const moveX = Math.abs(e.changedTouches[0].screenX - touchStartX);
    const moveY = Math.abs(e.changedTouches[0].screenY - touchStartY);
    if (moveX > 10 || moveY > 10) {
        clearTimeout(longPressTimer);
    }
});

document.addEventListener('touchend', e => {
    clearTimeout(longPressTimer);
    if (isLongPress) {
        hideTemporary();
        isLongPress = false;
        return;
    }
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
        if (diff > 0) nextCard();
        else prevCard();
    }
}

// 키보드 이벤트
document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') nextCard();
    if (e.key === 'ArrowLeft') prevCard();
    if (e.key === ' ') { e.preventDefault(); revealTemporary(); }
});

document.addEventListener('keyup', e => {
    if (e.key === ' ') hideTemporary();
});

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    loadState();
    updateCard();
});
