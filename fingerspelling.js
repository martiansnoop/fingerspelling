const defaultIntervalMillis = 500;
const intervalKey = "intervalMillis";
const messages = {
    init: {
        text: "Let's go!",
        emoji: "🚴",
        emojiText: "bicyclist",
        clickAction: "next"
    },
    waiting: {
        text: "Show me that again.",
        emoji: "🦖",
        emojiText: "t-rex",
        clickAction: "retry"
    },
    success: {
        text: "Success!",
        emoji: "🎉",
        emojiText: "party popper",
        clickAction: "next"
    },
    tryAgain: {
        text: "Close! Try again.",
        emoji: "🤔",
        emojiText: "confused face",
        clickAction: "retry"
    }
};

let words = [];
let currentWord;
let loading = true;
let intervalMillis = getIntervalMillis();
let currentMessage = messages.init;

const imagesByLetter = getImagesByLetter();
const imageWrapper = document.getElementById("image-wrapper");
const messageWrapper = document.getElementById("message-wrapper");
const answerInput = document.getElementById("answer-input");
const retryButton = document.getElementById("retry-button");
const nextWordButton = document.getElementById("next-word-button");
const adjustSpeedForm = document.getElementById("adjust-speed-form");
const adjustSpeedInput = document.getElementById("adjust-speed-input");
const answerForm = document.getElementById("answer-form");
const submitAnswerInput = document.getElementById("submit-answer");

adjustSpeedInput.value = intervalMillis;

// current word list is taken from here, with all 1 and 2 letter words removed:
// https://github.com/first20hours/google-10000-english/blob/master/google-10000-english-usa.txt
fetch("words.txt")
    .then(response => response.text(), error => console.log("fetch error", error))
    .then(file => {
        words = file.split("\n");
        transition("init");
        loading = false;
    });

imageWrapper.addEventListener("click", retryHandler);
retryButton.addEventListener("click", retryHandler);
function retryHandler(event) {
    transition("playing");
    displayWord(currentWord);
}

nextWordButton.addEventListener("click", showNextWordHandler);
function showNextWordHandler(event) {
    transition("playing");
    currentWord = getRandomWord(words);
    displayWord(currentWord);
}

messageWrapper.addEventListener("click", messageWrapperHandler);
messageWrapper.addEventListener("keydown", messageWrapperHandlerEnterKey);
function messageWrapperHandlerEnterKey(event) {
    if (event.key === "Enter") {
        messageWrapperHandler(event);
    }
}
function messageWrapperHandler(event) {
    switch(currentMessage.clickAction) {
        case "next":
            showNextWordHandler(event);
            break;
        case "retry":
            retryHandler(event);
            break;
        default:
            console.warn("unknown click action", currentMessage.clickAction);
    }
}

answerForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const answer = answerInput.value;
    const success = answer.toLowerCase() === currentWord;
    if (success) {
        console.log("Success!");
        transition("success");
    } else {
        console.log("Try again.");
        transition("fail");
    }
});

adjustSpeedForm.addEventListener("submit", function(event) {
    event.preventDefault();
    intervalMillis = adjustSpeedInput.value;
    localStorage.setItem(intervalKey, intervalMillis);
    nextWordButton.focus();
});

function displayMessage(message) {
    currentMessage = message;
    messageWrapper.classList.remove("hidden");
    const emoji = messageWrapper.querySelector("#message-emoji");
    const text = messageWrapper.querySelector("#message-text");
    emoji.innerText = message.emoji;
    emoji.setAttribute("aria-label", message.emojiText);
    text.innerText = message.text;
}

function transition(state) {
    switch (state) {
        case "init":
            displayMessage(messages.init);
            imageWrapper.classList.add("hidden");

            nextWordButton.disabled = false;
            nextWordButton.focus();
            break;
        case "playing":
            // answer and retry start out as disabled, so need to enable them
            // the first time a word plays.
            answerInput.disabled = false;
            submitAnswerInput.disabled = false;
            retryButton.disabled = false;

            messageWrapper.classList.add("hidden");
            imageWrapper.classList.remove("hidden");
            answerInput.value = "";
            break;
        case "waiting":
            displayMessage(messages.waiting);
            imageWrapper.classList.add("hidden");
            answerInput.focus();
            break;
        case "success":
            displayMessage(messages.success);
            imageWrapper.classList.add("hidden");
            nextWordButton.focus()
            break;
        case "fail":
            displayMessage(messages.tryAgain);
            imageWrapper.classList.add("hidden");
            retryButton.focus();
            break;
        default:
            console.warn("unknown state", state);
    }
}

let id = 0;
function displayWord(word) {
    const letters = word.split("");
    const myId = ++id;
    displayLetter(0);
    function displayLetter(index) {
        if (myId !== id) {
            console.log("interrupted; canceling future letters for word/id", word, myId);
            return;
        }
        const doubleLetter = index > 0 && word[index] === word[index - 1];
        console.log("displayLetter", index, letters[index]);
        const letter = letters[index];
        displayLetterImage(letter, doubleLetter);

        if (index < word.length - 1) {
            setTimeout(() => displayLetter(index+1), intervalMillis);
        } else {
            // use a timeout here too so user can see the last letter for the full interval
            setTimeout(finishWord, intervalMillis);
        }
    }
}

function finishWord() {
    transition("waiting");
}

function displayLetterImage(letter, doubleLetter) {
    const newImg = imagesByLetter[letter];
    const wrapper = document.getElementById("image-wrapper");
    if (wrapper.children.length > 0) {
        const child = wrapper.children[0];
        wrapper.removeChild(child);
        wrapper.classList.remove("double-letter");
        wrapper.classList.add("single-letter");
    }
    // add this padding after removing the previous block because the code
    // makes one image tag per letter and reuses it.
    if (doubleLetter) {
        wrapper.classList.add("double-letter");
        wrapper.classList.remove("single-letter");
    }
    wrapper.appendChild(newImg);
}

function getRandomWord(words) {
    // TODO for fun, check if there's a crypto api for true random numbers
    const index = getRandomInt(words.length);
    return words[index];
}

// The actual maxRand differs by browser, so pick the lowest value, 2**32
const maxRand = 2**32;
function getRandomInt(n) {
    const max = maxRand - (maxRand % n); // higest multiple of n that is < maxRand
    let rand;
    do {
        // A random int in the range [0, 2**32) is not subject to modulo bias because
        // the maximum number of values Math.random() can produce is 2**32 or 2**64,
        // (differing by browser) and 2**32 divides both of those evenly.
        rand = Math.floor(Math.random() * maxRand);
    } while (rand > max); // try again if `n` does not divide `rand` cleanly
    return rand % n;
}

function getImagesByLetter() {
    const letters = "abcdefghijklmnopqrstuvwxyz".split("");
    console.log("letters", letters);
    const imagesByLetter = {};
    for (letter of letters) {
        const img = document.createElement("img");
        img.src = `images/${letter}.gif`;
        imagesByLetter[letter] = img;
    }
    return imagesByLetter;
}

function getIntervalMillis() {
    let num = parseInt(localStorage.getItem(intervalKey));
    // note: Number.isNan doesn't work in IE so might want
    // a polyfill if I turn this into a real app
    return Number.isNaN(num) ? defaultIntervalMillis : num;
}
