const words = ["foo", "bar", "baz"];
const intervalMillis = 2000;

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
    displayLetter(0);
    function displayLetter(index) {
        console.log("displayLetter", index, letters[index]);
        const letter = letters[index];
        const newImg = imagesByLetter[letter];
        if (wrapper.children.length > 0) {
            wrapper.removeChild(wrapper.children[0]);
        }
        wrapper.appendChild(newImg);
        if (index < word.length - 1) {
            setTimeout(() => displayLetter(index+1), intervalMillis);
        }
    }
}


function getRandomWord(words) {
    // TODO for fun, check if there's a crypto api for true random numbers
    const index = Math.floor(Math.random() * words.length);
    return words[index];
}


