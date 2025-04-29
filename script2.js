document.addEventListener('DOMContentLoaded', () => {
    const elementsContainer = document.getElementById('elements');
    const swapButton = document.getElementById('swap');
    const nextButton = document.getElementById('next');
    const restartButton = document.getElementById('restart');
    const numElementsInput = document.getElementById('numElements');
    const livesDisplay = document.getElementById('lives');
    const timerDisplay = document.getElementById('timer');
    const messageDisplay = document.getElementById('message');

    let elements = [];
    let cursor = 0;
    let lives = 3;
    let swapsInPass = false;
    let playing = false;
    let startTime;
    let timerInterval;

    function generateElements(num) {
        elements = Array.from({ length: num }, () => Math.floor(Math.random() * 100) + 1);
        renderElements();
    }

    function renderElements() {
        elementsContainer.innerHTML = '';
        elements.forEach((el, index) => {
            const elementDiv = document.createElement('div');
            elementDiv.className = 'element';
            elementDiv.textContent = el;
            if (index === cursor || index === cursor + 1) {
                elementDiv.style.backgroundColor = '#FF5722';
            } else {
                elementDiv.style.backgroundColor = '#4CAF50';
            }
            elementsContainer.appendChild(elementDiv);
        });
    }

    function swapElements() {
        if (cursor < elements.length - 1) {
            if (elements[cursor] > elements[cursor + 1]) {
                [elements[cursor], elements[cursor + 1]] = [elements[cursor + 1], elements[cursor]];
                swapsInPass = true;
                cursor++;
                renderElements();
            } else {
                mistakeMade();
            }
        }
        endPass();
    }

    function nextElement() {
        if (cursor < elements.length - 1) {
            if (elements[cursor] <= elements[cursor + 1]) {
                cursor++;
                renderElements();
            } else {
                mistakeMade();
            }
        }
        endPass();
    }

    function mistakeMade() {
        lives--;
        livesDisplay.textContent = `Lives: ${lives}`;
        if (lives === 0) {
            messageDisplay.textContent = 'Game Over!';
            playing = false;
            swapButton.disabled = true;
            nextButton.disabled = true;
            clearInterval(timerInterval);
        } else {
            messageDisplay.textContent = 'Mistake made! Try again.';
            cursor = 0;
            renderElements();
        }
    }

    function endPass() {
        if (cursor >= elements.length - 1) {
            const needsAnotherPass = window.confirm('Do you need another pass?');
            if (needsAnotherPass) {
                if (!swapsInPass) {
                    mistakeMade();
                    if (playing) {
                        messageDisplay.textContent = 'Sorted! Well done!';
                        clearInterval(timerInterval);
                    }
                } else {
                    cursor = 0;
                    swapsInPass = false;
                    renderElements();
                }
            } else {
                if (swapsInPass) {
                    mistakeMade();
                    cursor = 0;
                    swapsInPass = false;
                    renderElements();
                } else {
                    if (checkSorted()) {
                        messageDisplay.textContent = 'Sorted! Well done!';
                        clearInterval(timerInterval);
                        const endTime = new Date();
                        const timeTaken = Math.floor((endTime - startTime) / 1000);
                        timerDisplay.textContent = `Time: ${timeTaken}s`;
                    } else {
                        mistakeMade();
                    }
                }
            }
        }
    }

    function checkSorted() {
        for (let i = 0; i < elements.length - 1; i++) {
            if (elements[i] > elements[i + 1]) {
                return false;
            }
        }
        return true;
    }

    function startTimer() {
        startTime = new Date();
        timerInterval = setInterval(() => {
            const currentTime = new Date();
            const timeElapsed = Math.floor((currentTime - startTime) / 1000);
            timerDisplay.textContent = `Time: ${timeElapsed}s`;
        }, 1000);
    }

    swapButton.addEventListener('click', swapElements);
    nextButton.addEventListener('click', nextElement);
    numElementsInput.addEventListener('change', init);
    restartButton.addEventListener('click', init);

    document.addEventListener('keydown', (e) => {
        if (e.key === 's') swapElements();
        if (e.key === 'n') nextElement();
        if (e.key === 'r') init();
    });

    function init() {
        const numElements = parseInt(numElementsInput.value, 10);
        generateElements(numElements);
        playing = true;
        lives = 3;
        cursor = 0;
        swapsInPass = false;
        livesDisplay.textContent = `Lives: ${lives}`;
        messageDisplay.textContent = '';
        swapButton.disabled = false;
        nextButton.disabled = false;
        clearInterval(timerInterval);
        timerDisplay.textContent = 'Time: 0s';
        startTimer();
    }

    init();
});
