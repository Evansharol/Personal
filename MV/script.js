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
const progressFill = document.getElementById('progress');
const celebration = document.getElementById('celebration');

let audio = new Audio();

// Speech Recognition
const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
let recognition = null;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'ta-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
}

// Update progress bar
function updateProgress() {
    const progress = (currentIndex / words.length) * 100;
    progressFill.style.width = `${progress}%`;
}

// Add highlight effect to verse display
function highlightVerse() {
    verseDisplay.classList.add('highlight');
    setTimeout(() => verseDisplay.classList.remove('highlight'), 500);
}

// Show completion celebration
function showCelebration() {
    celebration.textContent = '🎉';
    celebration.style.animation = 'celebrate 2s ease-in-out';
    setTimeout(() => {
        celebration.style.animation = '';
    }, 2000);
}

// Start learning
startBtn.addEventListener('click', () => {
    if (!SpeechRecognition) {
        feedback.textContent = "❌ Speech recognition not supported in this browser!";
        feedback.classList.add('error');
        return;
    }
    
    startBtn.style.display = "none";
    currentIndex = 0;
    updateProgress();
    playAudio(currentIndex);
});

// Play audio for current word
function playAudio(index) {
    if (index >= audios.length) {
        verseDisplay.textContent = "🎉 பாராட்டுகள்! வசனம் முடிந்தது!";
        feedback.textContent = "வெற்றிகரமாக முடித்தீர்கள்!";
        feedback.className = '';
        hand.classList.remove('show-speak', 'show-listen');
        mouth.classList.remove('talk');
        updateProgress();
        showCelebration();
        
        // Show restart button after 3 seconds
        setTimeout(() => {
            startBtn.textContent = '🔄 மீண்டும் ஆரம்பிக்க';
            startBtn.style.display = 'inline-block';
        }, 3000);
        return;
    }

    const word = words[index];
    verseDisplay.textContent = word;
    highlightVerse();

    // Character speaking state
    hand.classList.remove('show-listen');
    hand.classList.add('show-speak');
    mouth.classList.add('talk');
    feedback.textContent = "🎧 கவனமாக கேளுங்கள்!";
    feedback.className = 'speaking';

    audio.src = audios[index];
    
    audio.onerror = () => {
        feedback.textContent = "⚠️ ஆடியோ கோப்பு கிடைக்கவில்லை!";
        feedback.classList.add('error');
        // Continue without audio
        setTimeout(() => {
            audio.onended();
        }, 1000);
    };

    audio.play().catch(err => {
        console.log("Audio play failed:", err);
        // Continue without audio
        setTimeout(() => {
            audio.onended();
        }, 1000);
    });

    // When audio ends → start waiting for child
    audio.onended = () => {
        hand.classList.remove('show-speak');
        hand.classList.add('show-listen');
        mouth.classList.remove('talk');
        feedback.textContent = "🎤 இப்போது நீங்கள் சொல்லுங்கள்!";
        feedback.className = 'listening';
        waitingForChild = true;
        
        if (recognition) {
            recognition.start();
        }
    };

    updateProgress();
}

// When kid speaks → move to next word
if (recognition) {
    recognition.onresult = function(event) {
        if (!waitingForChild) return;

        const spoken = event.results[0][0].transcript.trim();
        console.log("Child said:", spoken);

        // Visual feedback for successful recognition
        feedback.textContent = `✅ அருமை! "${spoken}" என்று சொன்னீர்கள்!`;
        feedback.className = '';
        
        // Move to next word after short delay
        waitingForChild = false;
        recognition.stop();
        
        setTimeout(() => {
            currentIndex++;
            playAudio(currentIndex);
        }, 1500);
    };

    // Error handling
    recognition.onerror = function(event) {
        console.log("Speech recognition error:", event.error);
        if (waitingForChild) {
            feedback.textContent = "🔄 மீண்டும் முயற்சிக்கவும்...";
            feedback.className = 'error';
            
            // Retry listening after a short delay
            setTimeout(() => {
                if (waitingForChild) {
                    try {
                        recognition.start();
                    } catch (err) {
                        console.log("Failed to restart recognition:", err);
                    }
                }
            }, 1000);
        }
    };

    recognition.onend = function() {
        // Automatically restart if still waiting and no error occurred
        if (waitingForChild) {
            setTimeout(() => {
                if (waitingForChild) {
                    try {
                        recognition.start();
                    } catch (err) {
                        console.log("Failed to restart recognition:", err);
                    }
                }
            }, 500);
        }
    };
}

// Add click handler for manual progression (fallback)
verseDisplay.addEventListener('click', () => {
    if (waitingForChild) {
        waitingForChild = false;
        if (recognition) {
            recognition.stop();
        }
        currentIndex++;
        playAudio(currentIndex);
    }
});