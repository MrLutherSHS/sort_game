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
    
    // Create items with uniform styling
    for (let i = 0; i < targetLength; ++i) {
        if (i >= items.length) {
            itemContainer.appendChild(document.createElement('item'));
        }
        const randomValue = (Math.random() * 100).toFixed(0);
        items[i].textContent = randomValue;
        
        // Reset any custom styling that might have been applied
        items[i].style.backgroundColor = '';
        items[i].style.color = '';
    }

    selectItem(0);
}


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
        
        if (i == index || i == index + 1) {
            if (!items[i].classList.contains('selected')) {
                items[i].classList.add('selected');
            }
        } else {
            items[i].classList.remove('selected');
        }
    }
}

function swap() {
    console.log('swap function')
    const selectedItems = getSelectedItems();

    if (selectedItems.length == 2) {
        // Only swap if the first item is greater than the second item
        const shouldSwap = shouldSwapItems(selectedItems[0], selectedItems[1]);
        
        if (shouldSwap) {
            swapItems(selectedItems[0], selectedItems[1]);
            selectedItems[0].classList.add('dirty');
        } else {
            removeLife("You should not swap these items.");
            return;
        }
    }

    next();
    // if (selectedIndex >= items.length - 2) {
    //     window.setTimeout(promptForEndState);
    // } else {
    //     selectItem(selectedIndex + 1);
    // }

}

function next() {
    console.log('next function')
    if (timeStarted == undefined) {
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

    // Check if items should be swapped - only remove life if we should swap but we're trying to move on
    if (selectedIndex >= 0 && selectedIndex < items.length - 1) {
    console.log(items)
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
            removeLife("You must continue making passes until you do a pass without making a swap.");
        } else if (checkItemsAreSorted()) {
            const seconds = ((Date.now() - timeStarted) / 1000).toFixed(2);
            const message = `🎉 Well done! You've sorted the numbers in ${seconds} seconds!`;
            
            // Create a custom completion modal instead of using alert
            createCompletionModal(message);
            
            const itemCountElement = getItemCountElement();
            itemCountElement.value = Number.parseInt(itemCountElement.value) + 2;
            
            // Slight delay before initializing new game
            setTimeout(() => {
                init();
            }, 2000);
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

function createCompletionModal(message) {
    // Remove any existing modal
    const existingModal = document.querySelector('.completion-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal elements
    const modal = document.createElement('div');
    modal.className = 'completion-modal';
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.backgroundColor = '#a3c4f3';
    modal.style.color = '#333';
    modal.style.padding = '20px 30px';
    modal.style.borderRadius = '12px';
    modal.style.boxShadow = '0 5px 25px rgba(0, 0, 0, 0.2)';
    modal.style.zIndex = '1000';
    modal.style.textAlign = 'center';
    modal.style.fontFamily = 'Roboto, sans-serif';
    modal.style.animation = 'fadeIn 0.5s';
    
    // Add message
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messageElement.style.fontSize = '18px';
    messageElement.style.fontWeight = '500';
    modal.appendChild(messageElement);
    
    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translate(-50%, -60%); }
            to { opacity: 1; transform: translate(-50%, -50%); }
        }
        @keyframes fadeOut {
            from { opacity: 1; transform: translate(-50%, -50%); }
            to { opacity: 0; transform: translate(-50%, -60%); }
        }
    `;
    document.head.appendChild(style);
    
    // Add to document
    document.body.appendChild(modal);
    
    // Remove after delay
    setTimeout(() => {
        modal.style.animation = 'fadeOut 0.5s';
        setTimeout(() => {
            modal.remove();
        }, 500);
    }, 1500);
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
    // Returns true if left item is GREATER than right item (needs swapping)
    const leftValue = Number.parseInt(lhs.textContent);
    const rightValue = Number.parseInt(rhs.textContent);
    console.log(leftValue, rightValue)
    return leftValue > rightValue;
}

function swapItems(lhs, rhs) {
    // Store value
    const tempValue = lhs.textContent;
    
    // Animate the swap
    animateSwap(lhs, rhs, () => {
        // After animation completes, swap the actual values
        lhs.textContent = rhs.textContent;
        rhs.textContent = tempValue;
    });
}

function animateSwap(elementA, elementB, onComplete) {
    // Get positions
    const rectA = elementA.getBoundingClientRect();
    const rectB = elementB.getBoundingClientRect();
    
    // Calculate distances to move
    const distanceX = rectB.left - rectA.left;
    
    // Set initial styles for animation
    elementA.style.transition = 'transform 0.3s ease-in-out';
    elementB.style.transition = 'transform 0.3s ease-in-out';
    
    // Start animation
    elementA.style.transform = `translateX(${distanceX}px)`;
    elementB.style.transform = `translateX(${-distanceX}px)`;
    
    // After animation completes
    setTimeout(() => {
        // Reset transforms
        elementA.style.transition = '';
        elementB.style.transition = '';
        elementA.style.transform = '';
        elementB.style.transform = '';
        
        // Execute callback
        if (onComplete) onComplete();
    }, 300);
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
        showNotification(promptText + " Lose a life.", "warning");
    } else {
        const itemCountElement = getItemCountElement();
        itemCountElement.value = Math.max(Number.parseInt(itemCountElement.value) - 2, 4);
        showNotification(promptText + " You've run out of lives, please try again.", "error");
        setTimeout(() => {
            init();
        }, 1500);
    }
}

function showNotification(message, type = "info") {
    // Remove any existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.padding = '12px 20px';
    notification.style.borderRadius = '8px';
    notification.style.fontFamily = 'Roboto, sans-serif';
    notification.style.fontSize = '15px';
    notification.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.2)';
    notification.style.maxWidth = '400px';
    notification.style.zIndex = '1000';
    notification.style.animation = 'slideIn 0.3s ease-out';
    
    // Set notification type-specific styles
    switch(type) {
        case "error":
            notification.style.backgroundColor = '#ffb3ba';
            notification.style.borderLeft = '4px solid #ff6b6b';
            break;
        case "warning":
            notification.style.backgroundColor = '#ffffb3';
            notification.style.borderLeft = '4px solid #ffd166';
            break;
        case "success":
            notification.style.backgroundColor = '#baffc9';
            notification.style.borderLeft = '4px solid #6bff8c';
            break;
        default:
            notification.style.backgroundColor = '#bde0fe';
            notification.style.borderLeft = '4px solid #3b82f6';
    }
    
    // Add message
    notification.textContent = message;
    
    // Add animation keyframes if not already added
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after delay
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Event listeners
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
}, true);

document.getElementById('next').addEventListener('click', next);
document.getElementById('swap').addEventListener('click', swap);
document.getElementById('restart').addEventListener('click', init);
window.addEventListener('load', init);