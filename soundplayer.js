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

function play_sound() {
    if (!isMuted) {
        new Audio(sound).play()
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
    var lastMessage = null
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
}, 1000)

setTimeout(() => {
    insertMuteButton()
}, 1000);