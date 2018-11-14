// user enters page, and indicates they want to start playing
// select a random word and display it
// once the word is finished playing, direct focus to a textbox so user can guess
// Allow user to skip to next word
// keep track of correct, correct on first try, skipped
// also would be fun to track all time vs this session
//

let words = [];
let currentWord;
let loading = true;
let intervalMillis = 500;

const imagesByLetter = getImagesByLetter();
const guessInput = document.getElementById("guess-input");
const checkButton = document.getElementById("check-button");
const retryButton = document.getElementById("retry-button");
const nextWordButton = document.getElementById("next-word-button");
const adjustSpeedForm = document.getElementById("adjust-speed-form");
const adjustSpeedInput = document.getElementById("adjust-speed-input");
const guessForm = document.getElementById("guess-form");
const successIndicator = document.getElementById("success-indicator");
const failureIndicator = document.getElementById("failure-indicator");

adjustSpeedInput.value = intervalMillis;

// current word list is taken from here, with all 1 and 2 letter words removed:
// https://github.com/first20hours/google-10000-english/blob/master/google-10000-english-usa.txt
fetch("words.txt")
    .then(response => response.text(), error => console.log("fetch error", error))
    .then(file => {
        words = file.split("\n");
        currentWord = getRandomWord(words);
        guessInput.disabled = false;
        checkButton.disabled = false;
        retryButton.disabled = false;
        nextWordButton.disabled = false;
        nextWordButton.focus();
        loading = false;
    });

retryButton.addEventListener("click", function(event) {
    successIndicator.style.display = "none";
    failureIndicator.style.display = "none";
    displayWord(currentWord);
});

nextWordButton.addEventListener("click", function(event) {
    successIndicator.style.display = "none";
    failureIndicator.style.display = "none";
    guessInput.value = "";
    currentWord = getRandomWord(words);
    displayWord(currentWord);
});

guessForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const guess = guessInput.value;
    const success = guess.toLowerCase() === currentWord;
    if (success) {
        console.log("Success!");
        successIndicator.style.display = "inline"
        nextWordButton.focus();
    } else {
        console.log("Try again.");
        failureIndicator.style.display = "inline"
    }
});

adjustSpeedForm.addEventListener("submit", function(event) {
    event.preventDefault();
    intervalMillis = adjustSpeedInput.value;
    nextWordButton.focus();
});

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
            child.style.paddingLeft = "0px";
            wrapper.removeChild(child);
        }
        // add this padding after removing the previous block because the code
        // makes one image tag per letter and reuses it.
        if (doubleLetter) {
            newImg.style.paddingLeft = "100px";
        }
        wrapper.appendChild(newImg);
        if (index < word.length - 1) {
            setTimeout(() => displayLetter(index+1), intervalMillis);
        } else {
            // The complete word has been displayed, so move focus to the guess input
            // use a timeout here too so user can see the last letter for the full interval
            setTimeout(() => guessInput.focus(), intervalMillis);
        }
    }
}


function getRandomWord(words) {
    // TODO for fun, check if there's a crypto api for true random numbers
    const index = Math.floor(Math.random() * words.length);
    return words[index];
}


