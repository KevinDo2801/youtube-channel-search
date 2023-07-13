import {apiKey, endpoint, channelParts, videoParts} from "./utilities.js"

async function fetchChannel(id) {
    try {
        const response = await fetch(`${endpoint}/channels?part=${channelParts}&id=${id}&key=${apiKey}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.items[0];
    } catch (error) {
        console.error('Failed to fetch the channel:', error);
    }
}

async function fetchChannelList(idArr) {
    const channelArr = await Promise.all(
        idArr.map(fetchChannel)
    );
    return channelArr;
}

async function fetchVideo(id) {
    try {
        const response = await fetch(`${endpoint}/videos?id=${id}&key=${apiKey}&part=${videoParts}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.items[0];
    } catch (error) {
        console.error('Failed to fetch the video:', error);
    }
}

async function fetchVideoList(idChannel, searchQuery, maxResults = 6) {
    const endpoint = `${endpoint}/search`;
    const url = `${endpoint}?key=${apiKey}&q=${searchQuery}&maxResults=${maxResults}&type=video&part=${videoParts}&channelId=${idChannel}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.items;
    } catch (error) {
        console.error('Failed to fetch video list:', error);
    }
}

async function fetchVideoStatistics(videoId) {
    const url = `${endpoint}/videos?id=${videoId}&part=statistics&key=${apiKey}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.items && data.items.length > 0) {
            return data.items[0].statistics.viewCount;
        } else {
            console.error("No video found with the provided ID");
        }
    } catch (error) {
        console.error('Failed to fetch video statistics:', error);
    }
}

async function fetchSearchChannelQuery(query, maxResults = 6) {
    const url = `${endpoint}/search?part=${channelParts}&maxResults=${maxResults}&q=${query}&type=channel&key=${apiKey}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const channelIds = data.items.map(channel => channel.id.channelId);
        return channelIds;
    } catch (error) {
        console.error('Failed to fetch the channel:', error);
    }
}


export {fetchChannel, fetchChannelList, fetchVideo, fetchVideoList, fetchVideoStatistics, fetchSearchChannelQuery}
