const apiKey = 'AIzaSyCEljhRWv33r88Dg9nV5XFqBNYPGqOqdGw';
const endpoint = "https://www.googleapis.com/youtube/v3"
let defaultChannelList = [
    "UCNW7HDseZb6N3nKUEP6uLag",
    "UCxX9wt5FWQUAAz4UrysqK9A",
    "UCSJbGtTlrDami-tDGPUV9-w",
    "UCwRXb5dUK4cvsHbx-rGzSgw",
    "UCyU5wkjgQYGRB0hIHMwm2Sg",
    "UC8butISFwT-Wl7EV0hUK0BQ",
    "UCgzKCeDYLRzPhQ64R6AKyBQ",
    "UCW5YeuERMmlnqo4oq8vwUpg",
    "UCqHktcPJV7C7T3e9Cg4T4iw",
    "UCJbPGzawDH1njbqV-D5HqKw"
];

function getUserName(url) {
    const matches = url.match(/https:\/\/www\.youtube\.com\/@(.+)/);
    if (matches && matches[1]) {
        return matches[1];
    } else {
        return null;
    }
}

function getVideoId(url) {
    let urlParams = new URLSearchParams((new URL(url)).search);
    let videoId = urlParams.get("v");
    return videoId;
}

async function getChannelId(url) {
    let path = (new URL(url)).pathname;
    let pathSegments = path.split("/");
    let channelId = null;
    if(pathSegments.includes("channel")){
        channelId = pathSegments[pathSegments.indexOf("channel") + 1];
    } else {
        let customUserName = getUserName(url);
        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${customUserName}&type=channel&key=${apiKey}`);
        const data = await response.json();
        channelId = data.items[0].id.channelId;
    }   
    return channelId;
}


function identifyVideoLink(url) {
    let videoRegex = /(https?:\/\/www\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]*)/;
    let match = url.match(videoRegex);

    return match ? true : false;
}

function identifyChannelLink(url) {
    let channelRegex1 = /(https?:\/\/www\.youtube\.com\/channel\/)([a-zA-Z0-9_-]*)/;
    let channelRegex2 = /(https?:\/\/www\.youtube\.com\/@)([a-zA-Z0-9_-]*)/;
    let match1 = url.match(channelRegex1);
    let match2 = url.match(channelRegex2);

    return (match1 || match2) ? true : false;
}

function convertNumber(subscriberCount) {
    const billion = 1000000000;
    const million = 1000000;
    const thousand = 1000;

    if (subscriberCount >= billion) {
        return formatNumber(subscriberCount / billion, 2) + 'B';
    } else if (subscriberCount >= million) {
        return formatNumber(subscriberCount / million, 2) + 'M';
    } else if (subscriberCount >= thousand) {
        return formatNumber(subscriberCount / thousand, 1) + 'K';
    } else {
        return subscriberCount.toString();
    }
}

function formatNumber(number, decimalPlaces) {
    const fixedNumber = number.toFixed(decimalPlaces);
    if (fixedNumber.endsWith('.0')) {
        return fixedNumber.slice(0, -2);
    }
    return fixedNumber;
}

export { convertNumber, getUserName, getVideoId, getChannelId, identifyVideoLink, identifyChannelLink, apiKey, endpoint, defaultChannelList }