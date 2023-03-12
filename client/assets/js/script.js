const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');
let loadInterval;

function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);
    return `id-${timestamp}-${hexadecimalString}`;
}

function loader(element) {
    clearInterval(loadInterval);
    element.textContent = '';
    loadInterval = setInterval(() => {
        element.textContent += '.';
        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);
}

function typeText(element, text) {
    let index = 0;
    const intervalId = setInterval(() => {
        if (index >= text.length) {
            clearInterval(intervalId);
            return;
        }
        element.innerHTML += text.charAt(index);
        index++;
    }, 30);
}

function chatStripe(isAi, value, uniqueId) {
    return `
    <div class="wrapper ${isAi ? 'ai' : ''}">
      <div class="chat">
        <div class="profile">
          <img src="/public/assets/${isAi ? 'bot' : 'user'}.svg" alt="${isAi ? 'bot' : 'user'}" />
        </div>
        <div class="message" id="${uniqueId}">${value}</div>
      </div>
    </div>
  `;
}

async function handleSubmit(e) {
    e.preventDefault();
    const data = new FormData(form);
    const prompt = data.get('prompt');

    // Add user's chatstripe
    chatContainer.innerHTML += chatStripe(false, prompt);
    form.reset();

    // Add bot's chatstripe
    const uniqueId = generateUniqueId();
    chatContainer.innerHTML += chatStripe(true, '', uniqueId);

    const messageDiv = document.getElementById(uniqueId);
    console.log(messageDiv);

    // Show loading indicator
    loader(messageDiv);

    try {
        const response = await fetch('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt }),
        });
        clearInterval(loadInterval);
        messageDiv.innerHTML = '';

        if (response.ok) {
            const data = await response.json();
            const parsedData = data.bot.trim(); // trims any trailing spaces/'\n'

            // add delay before typing out bot's response
            setTimeout(() => {
                typeText(messageDiv, parsedData);
            }, 1000); // adjust delay time as needed
        } else {
            const err = (await response.text()).trim();
            setTimeout(() => {
                typeText(messageDiv, err);
            }, 1000);
        }
    } catch (err) {
        console.error(err);
        clearInterval(loadInterval);
        messageDiv.innerHTML = '';
        typeText(messageDiv, 'Sorry, an error occurred. Please try again later.');
    }

    chatContainer.scrollTop = chatContainer.scrollHeight;
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const prompt = data.get('prompt');
    if (prompt.trim() !== '') {
        handleSubmit(e);
    }
});
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        const prompt = e.target.value.trim();
        if (prompt !== '') {
            handleSubmit(e);
        }
    }
})