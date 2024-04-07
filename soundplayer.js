const TAG = "SoundPlayer: "

const isFirefox = typeof InstallTrigger !== 'undefined';
const isChrome = !!window.chrome
const isOpera = !!window.opera

var sound;
if(isFirefox) {
   sound = browser.runtime.getURL("sound/powerUp7.mp3")
} else if(isChrome || isOpera) {
   sound = chrome.runtime.getURL("sound/powerUp7.mp3")
}

var person_entered_sound;
if(isFirefox) {
    person_entered_sound = browser.runtime.getURL("sound/pepSound1.mp3")
} else if(isChrome || isOpera) {
    person_entered_sound = chrome.runtime.getURL("sound/pepSound1.mp3")
}

const newMessageAudio = new Audio(sound);
const newPersonEnteredAudio = new Audio(person_entered_sound);

var $ = window.jQuery;
var isMuted = true
var isDebug = true

function debugLog(...args) {
    if (!isDebug) return
    console.debug(TAG, ...args)
}

function log(...args) {
    console.log(TAG, ...args)
}

// ##############################           last chat message            #############################################

function play_sound() {
    if (!isMuted) {
        newMessageAudio.play()
    }
}

function getLastChatMessage() {
    const chatbox = document.querySelector("div[data-id='container-messages']")
    if(chatbox == null) {
        debugLog("couldn't find chatbox element")
        return
    }

    const otherMessages = chatbox.getElementsByClassName("chat-message-other")
    if(otherMessages.length == 0) {
        debugLog("couldn't find other message elements")
        return
    }

    const lastMessage = otherMessages[otherMessages.length - 1]
    if(lastMessage.length == 0) {
        debugLog("couldn't find last message element")
    }

    return lastMessage
}

// ##############################           person entered            #############################################

function play_person_entered() {
    if(!isMuted) {
        debugLog("will play person entered sound")
        new Audio(person_entered_sound).play()
        debugLog("finished playing person entered sound")
    }
}

function getLastPersonEnteredMessage() {
    const chatbox = document.querySelector("div[data-id='container-messages']")
    if(chatbox == null) {
        debugLog("couldn't find chatbox element")
        return
    }

    const allPersonEntered = [...chatbox.querySelectorAll("div > i.fa.fa-user")]
    if(allPersonEntered == null || allPersonEntered.length == 0) {
        debugLog("couldn't find a person entered message")
        return
    }

    const lastPersonEnteredMessage = allPersonEntered.pop().parentElement
    if(lastPersonEnteredMessage == null) {
        debugLog("couldn't find person entered message elements")
        return
    }

    return lastPersonEnteredMessage
}

// ##############################           user interface            #############################################

function insertMuteButton() {
    var muteImage
    var soundImage
    if (isFirefox) {
        muteImage = browser.runtime.getURL("img/musicOff.png")
        soundImage = browser.runtime.getURL("img/musicOn.png")
    } else if(isChrome || isOpera) {
        muteImage = chrome.runtime.getURL("img/musicOff.png")
        soundImage = chrome.runtime.getURL("img/musicOn.png")
    }

    debugLog(muteImage)
    debugLog(soundImage)

    var muteButton = document.createElement("button")
    muteButton.classList.add("btn", "rounded", "btn-white")
    muteButton.style = "background-color: white; max-width: 35.7667px; height: 100%; z-index: 1040; max-height: 35.7667px; padding: 3px; outline: 0 !important; box-shadow: none;"
    muteButton.title = "Click to enable or disable playing a notification sound when receiving a message in the current tab"

    var muteIcon = document.createElement("img")
    muteIcon.src = muteImage
    muteIcon.style = "max-height: 100%"
    muteButton.appendChild(muteIcon)

    document.querySelector("#navbar-main > nav > div > div:nth-child(1)").appendChild(muteButton)

    muteButton.addEventListener("click", () => {
        if (isMuted) {
            muteIcon.src = soundImage
            isMuted = false
            play_sound()
        } else {
            muteIcon.src = muteImage
            isMuted = true
        }
    })
    return muteButton
}

// ##############################           MAIN            #############################################

setTimeout(() => {
    var lastPersonEntered = null
    var lastMessage = null
    var personEntered = getLastPersonEnteredMessage()
    if (personEntered != undefined) {
        lastPersonEntered = personEntered
    }
    var message = getLastChatMessage()
    if (message != undefined) {
        lastMessage = message
    } else {
        debugLog("chat box is currently not visible")
    }

    setInterval(() => {
        var currentMessage = getLastChatMessage();
        if (currentMessage == null) {
            return;
        }

        debugLog("currently last received message: ", currentMessage)

        const hasLastMessageChanged = currentMessage !== lastMessage;
        if (hasLastMessageChanged) {
            debugLog("notification event occured")
            play_sound();
            lastMessage = currentMessage;
        }
    }, 500);

    setInterval(() => {
        var currentPerson = getLastPersonEnteredMessage()
        if (currentPerson == null) {
            return;
        }

        debugLog("currently last person entered: ", currentPerson)


        const hasLastPersonChanged = currentPerson !== lastPersonEntered;
        if (hasLastPersonChanged) {
            debugLog("person event occurred")
            play_person_entered()
            lastPersonEntered = currentPerson
        }
    }, 500)
}, 1000)

setTimeout(() => {
    insertMuteButton()
}, 1000);