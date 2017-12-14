
let expressBriefingObj = {
    fourthEventSent: false,
    halfEventSent: false,
    threeQuartersEventSent: false
};

function destroyDuplicateZone5() {
    const mobileZone = document.querySelector('div.zone-5a.narrow-only');
    const wideZone = document.querySelector('div.zone-5.wide-only');

    if (window.innerWidth < 768) {
        deleteElement(wideZone);
    } else {
        deleteElement(mobileZone);
    }
    function deleteElement(element) {
        element.parentElement.removeChild(element);
    }
}

try {
    destroyDuplicateZone5();
} catch (e) {

}

const audioContainer = document.querySelector('div.audioContainer');
const audioElement = audioContainer.querySelector('audio');
const playButton = audioContainer.querySelector('p.play');

playButton.addEventListener('click', toggleAudioPlay);
playButton.addEventListener('click', sendPodcastPlayToGA);
audioElement.addEventListener('ended', handleAudioEnd);
audioElement.addEventListener('ended', sendPodcastEndToGA);
audioElement.addEventListener('timeupdate', handleAudioTimeUpdate);
audioElement.addEventListener('canplay', displayAudioFileDuration);

// Setting up event handlers for our click-to-change-time function.
// The progress bar sits atop the time bar, so we listen on both
// to make sure users can click to move forward or back.
const timeBar = audioContainer.querySelector('div.length');
const progressBar = audioContainer.querySelector('div.progress');

timeBar.addEventListener('click', handleTimeBarClick);
progressBar.addEventListener('click', handleTimeBarClick);


function toggleAudioPlay() {
    const isAudioPaused = audioElement.paused;
    if (isAudioPaused === true) {
        audioElement.play();
    } else {
        audioElement.pause();
    }

    togglePlayButtonText();
}

function togglePlayButtonText() {
    const playButtonText = playButton.textContent;
    if (playButtonText === '||') {
        playButton.textContent = '►';
    } else {
        playButton.innerHTML = '||';
    }
}

function calculateNewProgressBarWidth(percent) {

    if (percent > 100) {
        percent = 100;
    }

    if (percent < 0) {
        percent = 0;
    }

    const lengthBar = document.querySelector('div.scrubberContainer').querySelector('div.length');
    const lengthBarWidth = lengthBar.getBoundingClientRect().width;

    const newProgressWidth = lengthBarWidth * (percent / 100);

    const progressBar = document.querySelector('div.scrubberContainer').querySelector('div.progress');

    return newProgressWidth;
}

function calculateCurrentPlayPercentage() {
    const currentAudioTime = getCurrentAudioTime();

    if (currentAudioTime === 0) {
        return 0;
    }

    const audioDuration = getAudioFileDuration();

    return (currentAudioTime / audioDuration) * 100;
}

function handleAudioTimeUpdate() {
    updateAudioPlayTime();
    const currentPlayPercentage = calculateCurrentPlayPercentage();

    const podcastTitle = generatePodcastGATitle();
    if (currentPlayPercentage >= 25 && expressBriefingObj.fourthEventSent === false) {
        sendPodcastEventToGA('Podcast 1/4 Playthrough', podcastTitle);
        expressBriefingObj.fourthEventSent = true;
    } else if (currentPlayPercentage >= 50 && expressBriefingObj.halfEventSent === false) {
        sendPodcastEventToGA('Podcast 1/2 Playthrough', podcastTitle);
        expressBriefingObj.halfEventSent = true;
    } else if (currentPlayPercentage >= 75 && expressBriefingObj.threeQuartersEventSent === false) {
        sendPodcastEventToGA('Podcast 3/4 Playthrough', podcastTitle);
        expressBriefingObj.threeQuartersEventSent = true;
    }

    const newProgressBarWidth = calculateNewProgressBarWidth(currentPlayPercentage);

    setProgressBarWidth(newProgressBarWidth);
}

function setProgressBarWidth(number) {
    const progressBar = document.querySelector('div.scrubberContainer').querySelector('div.progress');

    progressBar.style.width = number + 'px';
}

function getAudioFileDuration() {
    return audioElement.duration;
}

function displayAudioFileDuration() {
    const durationSpan = document.querySelector('div.time').querySelector('span.duration');

    const audioFileDurationInSeconds = getAudioFileDuration();

    const timeString = getTimeAsString(audioFileDurationInSeconds);

    durationSpan.textContent = timeString;
}

function updateAudioPlayTime() {
    const currentTime = getCurrentAudioTime();

    let timeString;

    if (currentTime === 0) {
        timeString = '0:00';
    } else {
        timeString = getTimeAsString(currentTime);
    }

    const currentTimeSpan = document.querySelector('div.time').querySelector('span.current');

    currentTimeSpan.textContent = timeString;
}

function getTimeAsString(seconds) {
    const fullMinutes = Math.floor(seconds / 60);

    const remainingSeconds = addLeadingZeroIfNecessary(Math.floor(seconds - (fullMinutes * 60)));

    const timeString = `${fullMinutes}:${remainingSeconds}`;

    return timeString;

    function addLeadingZeroIfNecessary(number) {
        const numberAsString = number.toString();
        if (numberAsString.length === 1) {
            return `0${numberAsString}`;
        } else {
            return numberAsString;
        }
    }
}

function getCurrentAudioTime() {
    return audioElement.currentTime;
}

function handleTimeBarClick(event) {
    const eventX = event.clientX;
    const lengthBar = document.querySelector('div.scrubberContainer').querySelector('div.length');
    const lengthBarRectangle = lengthBar.getBoundingClientRect();
    const percentagePlayed = (eventX - lengthBarRectangle.left) / lengthBarRectangle.width;

    audioElement.currentTime = getAudioFileDuration() * percentagePlayed;
}

function handleAudioEnd() {
    togglePlayButtonText();
    setProgressBarWidth(0);
}

function generatePodcastGATitle() {
    const podcastTitle = 'Express Briefing - ' + new Date().toLocaleDateString();
    return podcastTitle;
}

function sendPodcastEventToGA(eventAction, eventLabel) {
    ens_specialEvent('Podcasts', eventAction, eventLabel);
}

function sendPodcastPlayToGA(event) {
    const podcastTitle = generatePodcastGATitle();
    sendPodcastEventToGA('Podcast Play', podcastTitle);
    removePodcastPlayListener();
}

function sendPodcastEndToGA(event) {
    const podcastTitle = generatePodcastGATitle();
    sendPodcastEventToGA('Podcast Full Playthrough', podcastTitle);
    removePodcastEndListener();
}

function removePodcastPlayListener(event) {
    playButton.removeEventListener('click', sendPodcastPlayToGA);
}

function removePodcastEndListener(event) {
    playButton.removeEventListener('click', sendPodcastEndToGA);
}


