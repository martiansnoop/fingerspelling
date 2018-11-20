const defaultIntervalMillis = 500;
const intervalKey = "intervalMillis";

let words = [];
let currentWord;
let loading = true;
let intervalMillis = getIntervalMillis(); 

const imagesByLetter = getImagesByLetter();
const imageWrapper = document.getElementById("image-wrapper");
const guessInput = document.getElementById("guess-input");
const retryButton = document.getElementById("retry-button");
const nextWordButton = document.getElementById("next-word-button");
const nextWordMessage = document.getElementById("next-word-message");
const adjustSpeedForm = document.getElementById("adjust-speed-form");
const adjustSpeedInput = document.getElementById("adjust-speed-input");
const guessForm = document.getElementById("guess-form");
const successMessage = document.getElementById("success-message");
const retryMessage = document.getElementById("retry-message");

adjustSpeedInput.value = intervalMillis;

// current word list is taken from here, with all 1 and 2 letter words removed:
// https://github.com/first20hours/google-10000-english/blob/master/google-10000-english-usa.txt
fetch("words.txt")
    .then(response => response.text(), error => console.log("fetch error", error))
    .then(file => {
        words = file.split("\n");
        currentWord = getRandomWord(words);
        guessInput.disabled = false;
        retryButton.disabled = false;
        nextWordButton.disabled = false;
        nextWordMessage.focus();
        loading = false;
    });

retryButton.addEventListener("click", retryHandler);
retryMessage.addEventListener("click", retryHandler);
function retryHandler(event) {
    nextWordMessage.classList.add("hidden");
    successMessage.classList.add("hidden");
    retryMessage.classList.add("hidden");
    imageWrapper.classList.remove("hidden");
    displayWord(currentWord);
}

nextWordMessage.addEventListener("click", showNextWordHandler);
nextWordMessage.addEventListener("keydown", showNextWordHandlerEnterKey);
nextWordButton.addEventListener("click", showNextWordHandler);
successMessage.addEventListener("click", showNextWordHandler);
successMessage.addEventListener("keydown", showNextWordHandlerEnterKey);
function showNextWordHandlerEnterKey(event) {
    if (event.key === "Enter") {
        showNextWordHandler(event);
    }
}
function showNextWordHandler(event) {
    nextWordMessage.classList.add("hidden")
    successMessage.classList.add("hidden")
    retryMessage.classList.add("hidden")
    imageWrapper.classList.remove("hidden")
    guessInput.value = "";
    currentWord = getRandomWord(words);
    displayWord(currentWord);
}

guessForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const guess = guessInput.value;
    const success = guess.toLowerCase() === currentWord;
    if (success) {
        console.log("Success!");
        successMessage.classList.remove("hidden");
        retryMessage.classList.add("hidden");
        nextWordMessage.classList.add("hidden");
        imageWrapper.classList.add("hidden");
        nextWordButton.focus()
    } else {
        console.log("Try again.");
        retryMessage.classList.remove("hidden");
        successMessage.classList.add("hidden");
        nextWordMessage.classList.add("hidden");
        imageWrapper.classList.add("hidden");
        retryButton.focus();
    }
});

adjustSpeedForm.addEventListener("submit", function(event) {
    event.preventDefault();
    intervalMillis = adjustSpeedInput.value;
    localStorage.setItem(intervalKey, intervalMillis);
    nextWordButton.focus();
});

function displayWord(word) {
    const letters = word.split("");
    const wrapper = document.getElementById("image-wrapper");
    displayLetter(0);
    function displayLetter(index) {
        if (currentWord !== word) {
            console.log("interrupted; canceling future letters for word", word);
            return;
        }
        const doubleLetter = index > 0 && word[index] === word[index - 1];
        console.log("displayLetter", index, letters[index]);
        const letter = letters[index];
        const newImg = imagesByLetter[letter];
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
        if (index < word.length - 1) {
            setTimeout(() => displayLetter(index+1), intervalMillis);
        } else {
            // The complete word has been displayed, so move focus to the guess input
            // use a timeout here too so user can see the last letter for the full interval
            setTimeout(() => {
                guessInput.focus();
                wrapper.classList.add("hidden");
                nextWordMessage.classList.remove("hidden");
            }, intervalMillis);
        }
    }
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
