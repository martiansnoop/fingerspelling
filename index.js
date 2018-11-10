const words = ["foo", "bar", "baz"];

const imagesByLetter = getImagesByLetter();
displayWord();

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

function displayWord() {
    const word = getRandomWord(words);
    const letters = word.split("");
    const wrapper = document.getElementById("image-wrapper");
    wrapper.appendChild(imagesByLetter[letters[0]]);
}


function getRandomWord(words) {
    // TODO for fun, check if there's a crypto api for true random numbers
    const index = Math.floor(Math.random() * words.length);
    return words[index];
}


