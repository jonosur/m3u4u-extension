console.log('Content script loaded');

let alertShown = false;

class InputFieldManager {
    constructor(inputField, validList, suggestionContainer) {
        this.inputField = inputField;
        this.validList = validList;
        this.suggestionContainer = suggestionContainer;

        this.init();
    }

    init() {
        this.inputField.addEventListener('input', this.handleInput.bind(this));
    }

    checkAndUpdateInputField() {
        const colElement = this.inputField.closest('.col');
        const value = this.inputField.value.trim();

        if (!colElement.classList.contains('input-green') && this.validList.includes(value)) {
            if (!colElement.classList.contains('input-teal')) {
                colElement.classList.remove('input-red');
                colElement.classList.add('input-teal');
                console.log(`Updated field to input-teal: ${value}`);
                this.suggestionContainer.innerHTML = '';
            }
        } else {
            colElement.classList.remove('input-teal');
        }
    }

    handleInput(event) {
        const value = event.target.value.trim();
        const colElement = this.inputField.closest('.col');
        colElement.classList.remove('input-teal', 'input-green');

        if (this.validList.includes(value)) {
            console.log('Value is in the valid list');
            if (!colElement.classList.contains('input-green')) {
                colElement.classList.remove('input-red');
                colElement.classList.add('input-teal');
                this.suggestionContainer.innerHTML = '';
            }
        } else {
            console.log('Value is not in the valid list');
            colElement.classList.remove('input-teal');
            this.showSuggestions(value);
        }

        if (isValidInternal(value)) {
            colElement.classList.add('input-green');
        } else {
            colElement.classList.remove('input-green');
        }

        if (value === '') {
            this.showSuggestions('');
        }
    }

    showSuggestions(value) {
        const rect = this.inputField.getBoundingClientRect();
        this.suggestionContainer.style.top = `${rect.bottom + window.scrollY}px`;
        this.suggestionContainer.style.left = `${rect.left + window.scrollX}px`;
        this.suggestionContainer.style.width = `${rect.width}px`;

        const suggestions = this.validList.filter(item => item.toLowerCase().includes(value.toLowerCase())).slice(0, 100);
        console.log('Suggestions:', suggestions);

        this.suggestionContainer.innerHTML = '';

        suggestions.forEach(item => {
            const displayItem = `${item}`;
            const button = document.createElement('button');
            button.className = 'dropdown-item';
            button.textContent = displayItem;
            button.style.width = '100%';
            button.style.textAlign = 'left';
            button.style.cursor = 'pointer';
            button.style.color = 'white';
            button.style.backgroundColor = '#008080';
            button.style.borderWidth = '0px';
            button.style.transition = 'background-color 0.3s';
            button.onmouseover = () => button.style.backgroundColor = '#005757';
            button.onmouseout = () => button.style.backgroundColor = '#008080';
            this.suggestionContainer.appendChild(button);

            button.addEventListener('dblclick', () => {
                console.log(`Selected suggestion: ${item}`);
                this.inputField.value = item;

                const event = new Event('input', { bubbles: true });
                this.inputField.dispatchEvent(event);

                this.handleInput({ target: { value: item } });
                this.suggestionContainer.innerHTML = '';
                this.suggestionContainer.style.display = 'none';
            });
        });

        if (suggestions.length > 0) {
            this.suggestionContainer.style.display = 'block';
        } else {
            this.suggestionContainer.style.display = 'none';
        }
    }
}

function findAndSetupInputField() {
    if (!window.location.href.includes('https://m3u4u.com/epgeditor')) {
        return;
    }

    chrome.storage.local.get('validList', ({ validList }) => {
        console.log('Retrieved validList from storage:', validList);

        if (!validList || validList.length === 0) {
            console.log('Valid list is empty or not found');
            return;
        }

        if (!alertShown) {
            alert(`Extension has added ${validList.length} channels from EPGSHARE01, confirmed channels will appear as teal!`);
            alertShown = true;
        }

        let suggestionContainer = document.querySelector('.typeahead-container');
        if (!suggestionContainer) {
            suggestionContainer = document.createElement('div');
            suggestionContainer.className = 'typeahead-container';
            suggestionContainer.style.position = 'absolute';
            suggestionContainer.style.backgroundColor = '#008080';
            suggestionContainer.style.padding = '15px 15px';
            suggestionContainer.style.zIndex = '1000';
            suggestionContainer.style.maxHeight = '250px';
            suggestionContainer.style.overflowY = 'auto';
            suggestionContainer.style.display = 'none'; 
            document.body.appendChild(suggestionContainer);
            console.log('Suggestion container created');

            suggestionContainer.style.cursor = 'move';
            suggestionContainer.onmousedown = function(event) {
                let shiftX = event.clientX - suggestionContainer.getBoundingClientRect().left;
                let shiftY = event.clientX - suggestionContainer.getBoundingClientRect().top;

                function moveAt(pageX, pageY) {
                    suggestionContainer.style.left = pageX - shiftX + 'px';
                    suggestionContainer.style.top = pageY - shiftY + 'px';
                }

                function onMouseMove(event) {
                    moveAt(event.pageX, event.pageY);
                }

                document.addEventListener('mousemove', onMouseMove);

                suggestionContainer.onmouseup = function() {
                    document.removeEventListener('mousemove', onMouseMove);
                    suggestionContainer.onmouseup = null;
                };
            };

            suggestionContainer.ondragstart = function() {
                return false;
            };
        }

        setInterval(() => {
            let inputFields = document.querySelectorAll('input[formcontrolname="channelNewTvgId"]');
            inputFields.forEach(inputField => {
                new InputFieldManager(inputField, validList, suggestionContainer).checkAndUpdateInputField();
            });
        }, 1000);

        setInterval(() => {
            let inputFields = document.querySelectorAll('input[formcontrolname="channelNewTvgId"]');
            inputFields.forEach(inputField => {
                inputField.addEventListener('focus', () => {
                    new InputFieldManager(inputField, validList, suggestionContainer).showSuggestions(inputField.value.trim());
                });
            });
        }, 500);
    });
}

function isValidInternal(value) {
    return false;
}

function debounce(func, delay) {
    let debounceTimer;
    return function (...args) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(this, args), delay);
    };
}

findAndSetupInputField();

