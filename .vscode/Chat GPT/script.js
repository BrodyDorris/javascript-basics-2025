// public/script.js

const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// A Map to hold keyword-response pairs
const hardcodedResponses = new Map([
    ["hello", "Hello there! How can I assist you today?"],
    ["hi", "Hello there! How can I assist you today?"],
    ["how are you", "I'm just a simple program, but I'm doing well. Thanks for asking!"],
    ["what is your name", "I am a chat bot designed to demonstrate the limitations of hard-coded responses."],
    ["tell me a joke", "Why don't scientists trust atoms? Because they make up everything!"],
    ["what can you do", "I can respond to a very small, specific set of commands. But not much else."],
    ["capital of france", "The capital of France is Paris."],
    ["weather", "I'm sorry, I do not have access to real-time information like the weather."],
    ["thank you", "You're welcome!"],
    ["goodbye", "Goodbye! Please come back and try out the better version of me."],
    ["bye", "Goodbye! Please come back and try out the better version of me."],
    ["javascript", "JavaScript is a programming language commonly used to create interactive effects within web browsers."],
    ["html", "HTML stands for HyperText Markup Language. It's the standard markup language for documents designed to be displayed in a web browser."],
    ["css", "CSS stands for Cascading Style Sheets. It is a style sheet language used for describing the presentation of a document written in a markup language like HTML."],
    ["who created you", "I was created as an example to show how inefficient hard-coding is for a chat bot."],
    ["how does a computer work", "A computer processes instructions by performing calculations and operations on data. It consists of hardware components like a CPU, memory, and storage, which all work together."],
    ["best programming language", "That depends on what you want to do! There is no single 'best' language, as each one has strengths and weaknesses for different applications."],
    ["what is ai", "AI stands for Artificial Intelligence. It refers to the simulation of human intelligence in machines that are programmed to think like humans."],
    ["what is a chatbot", "A chatbot is a software application used to conduct an online chat conversation via text or text-to-speech, in place of direct human-to-human communication."],
    ["how do i make coffee", "To make coffee, you can use a coffee maker, a French press, or a pour-over. The exact steps depend on the method you choose."],
    ["what is the meaning of life", "The meaning of life is a philosophical and spiritual question that has puzzled humanity for centuries. Many believe it is about finding purpose and happiness."],
    ["what is the universe", "The universe is all of space and time and their contents, including planets, stars, galaxies, and all other forms of matter and energy."],
    ["how does gravity work", "Gravity is a fundamental force of nature that attracts objects with mass toward one another. The more massive an object, the stronger its gravitational pull."],
    ["what is photosynthesis", "Photosynthesis is the process used by plants, algae, and certain bacteria to convert light energy into chemical energy."],
    ["how to bake a cake", "To bake a cake, you will need ingredients like flour, sugar, and eggs. The specific instructions depend on the recipe."],
    ["what is a paradox", "A paradox is a statement or proposition that, despite sound reasoning from acceptable premises, leads to a conclusion that seems senseless, logically unacceptable, or self-contradictory."],
    ["why can't you understand me", "I have a limited vocabulary and can only respond to a few hard-coded phrases. I am not a true AI."],
    ["why are you so repetitive", "My responses are not dynamically generated. I can only choose from a pre-defined set of answers, which is why I seem repetitive."],
    ["are you a real ai", "No, I am not a real AI. I am a simple program with hard-coded responses."],
    ["do you have memory", "No, I do not have memory. Every time you send a new message, I forget the previous conversation and look for a keyword in your new message."],
    ["how were you coded", "I was coded with a series of hard-coded keyword-to-response pairs in JavaScript to demonstrate the flaws of this approach."],
    // The list continues...
]);

sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

async function sendMessage() {
    const messageText = userInput.value.trim();
    if (messageText === '') return;

    appendMessage(messageText, 'user-message');
    userInput.value = '';

    // Simulate a network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // --- Start of hard-coded, rule-based logic ---
    const lowerCaseMessage = messageText.toLowerCase();
    let responseText = "I'm sorry, I don't understand that. Please try asking something else.";

    // Check if any part of the user's message matches a hardcoded key
    for (let [key, value] of hardcodedResponses) {
        if (lowerCaseMessage.includes(key)) {
            responseText = value;
            break; // Stop after finding the first match
        }
    }
    // --- End of hard-coded logic ---

    appendMessage(responseText, 'assistant-message');
}

function appendMessage(text, className) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', className);
    messageElement.textContent = text;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
