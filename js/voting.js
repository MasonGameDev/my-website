
// Pull HTML elements from voting.html
const questionElement = document.getElementById('pollQuestion');
const optionsElement = document.getElementById('pollOptions');
const submitButton = document.getElementById('submitVote');
const voteMessage = document.getElementById('voteMessage');
const resultsContainer = document.getElementById('resultsContainer');

// Cloudflare Worker API
const apiUrl = 'https://damp-mountain-1c90.masonlstewart2010.workers.dev';

// Store the currently loaded poll
let currentPoll = null;
let selectedOption = null;


// Load active poll from the database
async function loadPoll() {
    try {
        const response = await fetch(`${apiUrl}/polls`);
        const data = await response.json();

        if (!response.ok || data.polls.length === 0) {
            questionElement.textContent = 'No active polls available.';
            return;
        }

        currentPoll = data.polls[0];

        questionElement.textContent = currentPoll.question;
        optionsElement.innerHTML = '';

        currentPoll.options.forEach(option => {
            const optionLabel = document.createElement('label');

            const optionInput = document.createElement('input');
            optionInput.type = 'radio';
            optionInput.name = 'pollOption';
            optionInput.value = option.label;

            optionInput.addEventListener('change', () => {
                selectedOption = option.label;
            });

            optionLabel.appendChild(optionInput);
            optionLabel.append(` ${option.label}. ${option.text}`);

            optionsElement.appendChild(optionLabel);
            optionsElement.appendChild(document.createElement('br'));
        });

    } catch (error) {
        questionElement.textContent = 'Unable to load poll.';
        console.error(error);
    }
}


// Submit selected vote to the database
async function submitVote() {
    if (!currentPoll || !selectedOption) {
        voteMessage.textContent = 'Please select an option first.';
        return;
    }

    try {
        submitButton.disabled = true;

        const response = await fetch(`${apiUrl}/polls/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                pollId: currentPoll.pollId,
                option: selectedOption
            })
        });

        const data = await response.json();

        voteMessage.textContent = data.message;

    } catch (error) {
        voteMessage.textContent = 'Unable to submit your vote.';
        console.error(error);

    } finally {
        submitButton.disabled = false;
    }
}


// Connect submit button
submitButton.addEventListener('click', submitVote);


// Start application
loadPoll();
