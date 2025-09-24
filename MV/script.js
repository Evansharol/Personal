const words = ["ஆகையால்", "குமாரன்", "உங்களை", "விடுதலையாக்கினால்", "மெய்யாகவே", "விடுதலையாவீர்கள்"];
const audios = [
    "audio/word1.mp3",
    "audio/word2.mp3",
    "audio/word3.mp3",
    "audio/word4.mp3",
    "audio/word5.mp3",
    "audio/word6.mp3"
];

let currentIndex = 0;
let waitingForChild = false;

const startBtn = document.getElementById('start-btn');
const character = document.getElementById('character');
const hand = document.querySelector('.hand');
const mouth = document.querySelector('.mouth');
const verseDisplay = document.getElementById('verse-display');
const feedback = document.getElementById('feedback');

let audio = new Audio();

// Speech Recognition
const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'ta-IN';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

// Start learning
startBtn.addEventListener('click', () => {
    startBtn.style.display = "none";
    currentIndex = 0;
    playAudio(currentIndex);
});

// Play audio for current word
function playAudio(index){
    if(index >= audios.length){
        verseDisplay.textContent = "🎉 You completed the verse!";
        feedback.textContent = "";
        hand.classList.remove('show-speak','show-listen');
        mouth.classList.remove('talk');
        return;
    }

    const word = words[index];
    verseDisplay.textContent = word;

    // Hands below while speaking
    hand.classList.remove('show-listen');
    hand.classList.add('show-speak');
    mouth.classList.add('talk');
    feedback.textContent = "Listen carefully!";

    audio.src = audios[index];
    audio.play();

    // When audio ends → start waiting for child
    audio.onended = () => {
        hand.classList.remove('show-speak');
        hand.classList.add('show-listen');
        mouth.classList.remove('talk');
        feedback.textContent = "Say something to continue!";
        waitingForChild = true;
        recognition.start(); // start listening only after audio finishes
    };
}

// When kid speaks → move to next word
recognition.onresult = function(event){
    if(!waitingForChild) return; // ignore if not waiting

    const spoken = event.results[0][0].transcript.trim();
    console.log("Child said:", spoken);

    // Move to next word
    waitingForChild = false;
    recognition.stop();
    currentIndex++;
    playAudio(currentIndex);
};

// Error handling
recognition.onerror = function(event){
    if(waitingForChild){
        feedback.textContent = "❌ Please speak clearly!";
        // retry listening
        setTimeout(()=> recognition.start(), 500);
    }
};
