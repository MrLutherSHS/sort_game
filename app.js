let timeStarted = undefined;

function getHistoryContainer() {
    return document.getElementById('historyContainer');
}

function getItemContainer() {
    return document.getElementById('itemContainer');
}

function getItems() {
    return getItemContainer().children;
}

function getSelectedItems() {
    return document.querySelectorAll('item.selected');
}

function getItemCountElement() {
    return document.getElementById('itemCount');
}


/**
 * Reset the timer, empty the history area, reset lives,
 * read in number of elements, make sure right number of elements, fill them in
 */
function init() {
    timeStarted = undefined;

    clearHistory();

    document.getElementById('lives').textContent = 3;
    const targetLength = Number.parseInt(getItemCountElement().value);

    const itemContainer = getItemContainer();
    const items = itemContainer.children;
    while (items.length > targetLength) {
        itemContainer.removeChild(itemContainer.lastChild);
    }
    for (let i = 0; i < targetLength; ++i) {
        if (i >= items.length) {
            itemContainer.appendChild(document.createElement('item'));
        }
        items[i].textContent = (Math.random() * 100).toFixed(0);
    }

    selectItem(0);
}


/**
 * Iterates through the history section and removes all children
 */
function clearHistory() {
    const history = getHistoryContainer();
    while (history.firstChild) {
        history.removeChild(history.firstChild);
    }
}

function selectItem(index) {
    const items = getItems();
    for (let i = 0; i < items.length; ++i) {
        if (i >= index) {
            items[i].classList.remove('dirty');
        }

        // Item at index + index + 1 are 'selected'
        if (i === index || i === index + 1) {
            if (!items[i].classList.contains('selected')) {
                items[i].classList.add('selected');
            }
        } else {
            items[i].classList.remove('selected');
        }
    }
}


function swap() {
    const selectedItems = getSelectedItems();

    if (selectedItems.length === 2) {
        if (shouldSwapItems(selectedItems[0], selectedItems[1])) {
            swapItems(selectedItems[0], selectedItems[1]);
            // If there was a swap, mark it as having been done
            selectedItems[0].classList.add('dirty');
        } else {
            removeLife("You should not swap these items.");
            return;
        }
    }

    next();
}

function next() {
    if (timeStarted === undefined) {
        timeStarted = Date.now();
    }

    const items = getItems();
    let selectedIndex = -1;

    for (let i = 0; i < items.length; ++i) {
        if (items[i].classList.contains('selected')) {
            selectedIndex = i;
            break;
        }
    }

    if (selectedIndex >= 0 || selectedIndex < items.length - 2) {
        if (shouldSwapItems(items[selectedIndex], items[selectedIndex + 1])) {
            removeLife("You should swap these items.");
            return;
        }
    }

    if (selectedIndex >= items.length - 2) {
        window.setTimeout(promptForEndState);
    } else {
        selectItem(selectedIndex + 1);
    }
}


function promptForEndState() {
    if (window.confirm("Have you finished sorting the numbers?")) {
        if (hasDirtyItems()) {
            // If there were any swaps, it's not the end
            removeLife("You must continue making passes until you do a pass without making a swap.");
        } else if (checkItemsAreSorted()) {
            // Sorted? Tell them time and increment number of elements by 2
            window.alert("Well done, you've sorted the numbers in " + ((Date.now() - timeStarted) / 1000) + " seconds");
            const itemCountElement = getItemCountElement();
            itemCountElement.value = Number.parseInt(itemCountElement.value) + 2;
            init();
            return;
        } else {
            removeLife("The list still needs more passes to be fully sorted.");
        }
    } else {
        if (!hasDirtyItems() && checkItemsAreSorted()) {
            removeLife("You finished a pass without making a swap. The list is sorted.")
            window.setTimeout(promptForEndState);
            return;
        }
    }
    newPass();
}

function newPass() {
    const historyContainer = getHistoryContainer();
    historyContainer.appendChild(document.createElement('div'));

    for (const item of getItems()) {
        const historyElement = document.createElement('item');
        historyElement.textContent = item.textContent;
        historyContainer.lastChild.appendChild(historyElement);
    }
    historyContainer.lastChild.appendChild(document.createTextNode("After pass " + historyContainer.children.length));
    selectItem(0);
}

function shouldSwapItems(lhs, rhs) {
    return Number.parseInt(lhs.textContent) > Number.parseInt(rhs.textContent)
}

function swapItems(lhs, rhs) {
    const tempValue = lhs.textContent;
    lhs.textContent = rhs.textContent;
    rhs.textContent = tempValue;
}

function hasDirtyItems() {
    return !!document.querySelector('item.dirty');
}

function checkItemsAreSorted() {
    const items = getItems();

    for (let i = 1; i < items.length; ++i) {
        if (Number.parseInt(items[i - 1].textContent) > Number.parseInt(items[i].textContent)) {
            return false;
        }
    }

    return true;
}

function removeLife(promptText) {
    const livesElement = document.getElementById('lives');
    let lives = Number.parseInt(livesElement.textContent);

    if (lives > 0) {
        livesElement.textContent = --lives;
        window.setTimeout(window.alert, 0, promptText + " Lose a life.");
    } else {
        const itemCountElement = getItemCountElement();
        itemCountElement.value = Math.max(Number.parseInt(itemCountElement.value) - 2, 4);
        window.alert(promptText + " You've run out of lives, please try again.");
        // Lives run out? Back to default list size of 4
        itemCountElement.value = 4
        init();
    }
}


document.addEventListener('keyup', (event) => {
    if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
    }

    switch (event.key) {
        case "s":
            swap();
            break;
        case "n":
            next();
            break;
        default:
            return;
    }

    event.preventDefault();
}, true)

window.addEventListener('load', init);
document.getElementById('next').addEventListener('click', next);
document.getElementById('swap').addEventListener('click', swap);
document.getElementById('restart').addEventListener('click', init);