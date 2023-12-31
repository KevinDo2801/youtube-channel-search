const apiKey = 'AIzaSyAPhbejNr-9Kq1Y1idaJhF3yTSEtNEgfp4';
const endpoint = "https://www.googleapis.com/youtube/v3"
const channelParts = 'snippet,statistics';
const videoParts = 'snippet';
const maxResults = 6;

async function fetchChannel(id) {
    const response = await fetch(`${endpoint}/channels?part=${channelParts}&id=${id}&key=${apiKey}`);
    const data = await response.json();
    return data.items[0];
}

async function fetchChannelList(idArr) {
    const channelArr = await Promise.all(
        idArr.map(async (idChannel) => fetchChannel(idChannel))
    );

    return channelArr;
}

async function fetchVideo(id) {
    const response = await fetch(`${endpoint}/videos?id=${id}&key=${apiKey}&part=${videoParts}`);
    const data = await response.json();
    return data.items[0];
}

async function fetchVideoList(idChannel, searchQuery) {
    let url = `${endpoint}/search?key=${apiKey}&q=${searchQuery}&maxResults=${maxResults}&type=video&channelId=${idChannel}&part=${videoParts}`;
    if (idChannel === "nope") {
        url = `${endpoint}/search?key=${apiKey}&q=${searchQuery}&maxResults=${maxResults}&type=video&part=${videoParts}`;
    }

    try {
        let response = await fetch(url);
        let data = await response.json();

        let items = data.items;
        return items;
    } catch (error) {
        console.log('error', error);
    }

}

async function fetchVideoStatistics(videoId) {
    let url = `${endpoint}/videos?id=${videoId}&part=statistics&key=${apiKey}`;

    try {
        let response = await fetch(url);
        let data = await response.json();

        if (data.items && data.items.length > 0) {
            return data.items[0].statistics.viewCount;
        } else {
            console.error("No video found with the provided ID");
        }
    } catch (error) {
        console.error('error', error);
    }
}

async function fetchSearchChannelQuery(query) {
    const url = `${endpoint}/search?part=snippet&maxResults=${maxResults}&q=${query}&type=channel&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        const channelIds = data.items.map(channel => channel.id.channelId)
        return channelIds;
    } catch (error) {
        console.error('Failed to fetch the channel:', error);
        throw error; 
    }
}

async function fetchChannelIdByUserName(customUserName) {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${customUserName}&type=channel&key=${apiKey}`);
    const data = await response.json();
    const channelId = data.items[0].id.channelId;
    return channelId;
}

export { fetchChannel, fetchChannelList, fetchVideo, fetchVideoList, fetchVideoStatistics, fetchSearchChannelQuery, fetchChannelIdByUserName }
