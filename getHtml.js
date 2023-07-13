import { convertNumber, getChannelId, getVideoId, defaultChannelList } from "./utilities.js"
import { fetchChannel, fetchChannelList, fetchVideo, fetchVideoList, fetchVideoStatistics, fetchSearchChannelQuery } from "./fetchAPI.js"

function iconAddChange(channelId) {
    let iconAdd = '';
    if (!defaultChannelList.includes(channelId)) {
        iconAdd = `<i class="fa fa-plus-circle"></i> Add channel`
    } else {
        iconAdd = `<i class="fa fa-minus-circle"></i> Remove`
    }
    return iconAdd;
}

function limitDescription(description, channelId) {
    if (description.length > 140) {
        return description.substring(0, 140) + 
            `<span>...<a href="https://www.youtube.com/channel/${channelId}" target="_blank">Read more</a></span>`;
    } else {
        return description;
    }
}

async function getChannelListHtml(idArr) {
    const channelArr = await fetchChannelList(idArr)

    let channelHtml = "";

    channelArr.forEach((channel) => {
        const newNumSubscribers = convertNumber(channel.statistics.subscriberCount);
        let newDescription = limitDescription(channel.snippet.description, channel.id);
        let iconAdd = iconAddChange(channel.id);

        channelHtml += `
            <section>
                <div class="image">
                    <a href="https://www.youtube.com/channel/${channel.id}" target="_blank"><img src="${channel.snippet.thumbnails.default.url}" alt=""></a>
                </div>
                <div class="information-channel">
                    <div class="title">
                        <h3><a href="https://www.youtube.com/channel/${channel.id}" target="_blank">${channel.snippet.title}</a></h3>
                    </div>
                    <div class="middle">
                        <p>${channel.snippet.customUrl}</p>
                        <p>${newNumSubscribers} subscribers</p>
                        <p data-addChannel=${channel.id}>${iconAdd}</p>
                    </div>
                    <div class="descriptive">
                        ${newDescription}
                    </div>
                </div>
            </section>
        `
    })

    return channelHtml;
}

async function getChannelHtml(url) {
    let channelHtml = '';

    try {
        const channelId = await getChannelId(url);

        const channel = await fetchChannel(channelId);
        let iconAdd = iconAddChange(channelId);

        const newNumSubscribers = convertNumber(channel.statistics.subscriberCount);
        let newDescription = limitDescription(channel.snippet.description, channel.id);

        channelHtml = `
            <section>
                <div class="image">
                    <a href="https://www.youtube.com/channel/${channel.id}" target="_blank"><img src="${channel.snippet.thumbnails.default.url}" alt=""></a>
                </div>
                <div class="information-channel">
                    <div class="title">
                        <h3><a href="https://www.youtube.com/channel/${channel.id}" target="_blank">${channel.snippet.title}</a></h3>
                    </div>
                    <div class="middle">
                        <p>${channel.snippet.customUrl}</p>
                        <p>${newNumSubscribers} subscribers</p>
                        <p data-addChannel=${channel.id}>${iconAdd}</p>
                    </div>
                    <div class="descriptive">
                        ${newDescription}
                    </div>
                </div>
            </section>
        `;

        return channelHtml;

    } catch (error) {
        console.error(error);
    }
}

async function getVideoListHtml(idChannel, searchQuery) {
    const videoArr = await fetchVideoList(idChannel, searchQuery);
    const channelIds = [...new Set(videoArr.map((video) => video.snippet.channelId))];
    const channelArr = await fetchChannelList(channelIds);
    let html = '';

    for (let i = 0; i < videoArr.length; i++) {
        const video = videoArr[i];
        const videoStatistics = await fetchVideoStatistics(video.id.videoId);
        const countView = convertNumber(videoStatistics);

        const channel = channelArr.find(channel => channel.id === video.snippet.channelId);

        let iconAdd = iconAddChange(idChannel);

        html += `
            <section>
                <div class="thumbnail">
                <a href="https://www.youtube.com/watch?v=${video.id.videoId}" target="_blank">
                    <div class="image-container">
                        <img src="${video.snippet.thumbnails.default.url}" alt="">
                            <i class="fa fa-play-circle"></i>
                            </div>
                            </a>
                </div>
                <div class="information">
                    <div class="channel-img">
                        <img src="${channel.snippet.thumbnails.default.url}" alt="">
                    </div>
                    <div class="detail">
                        <h4>${video.snippet.title}</h4>
                        <div class="channel-add">
                            <p>${channel.snippet.title}</p>
                            <p data-addChannel=${video.snippet.channelId}>${iconAdd}</p>
                        </div>
                        <p>${countView} views</p>
                    </div>
                </div>
            </section>
        `;
    }

    return html;
}

async function getVideoHtml(url) {
    const videoId = getVideoId(url);

    try {
        const video = await fetchVideo(videoId);
        const channel = await fetchChannel(video.snippet.channelId);
        const videoStatistics = await fetchVideoStatistics(video.id);
        const countView = convertNumber(videoStatistics);
        let iconAdd = iconAddChange(video.snippet.channelId);

        let html = `
        <section>
            <div class="thumbnail">
            <a href="https://www.youtube.com/watch?v=${video.id}" target="_blank">
                <div class="image-container">
                    <img src="${video.snippet.thumbnails.default.url}" alt="">
                        <i class="fa fa-play-circle"></i>
                        </div>
                        </a>
            </div>
            <div class="information">
                <div class="channel-img">
                    <img src="${channel.snippet.thumbnails.default.url}" alt="">
                </div>
                <div class="detail">
                    <h4>${video.snippet.title}</h4>
                    <div class="channel-add">
                        <p>${channel.snippet.title}</p>
                        <p data-addChannel=${video.snippet.channelId}>${iconAdd}</p>
                    </div>
                    <p>${countView} views</p>
                </div>
            </div>
        </section>
    `;

        return html;

    } catch (error) {
        console.error('Error:', error);
    }
}

async function getSearchChannelHtml(query) {
    try {
        const channelIds = await fetchSearchChannelQuery(query);
        return await getChannelListHtml(channelIds);
    } catch (error) {
        console.error('Failed to get the search channel HTML:', error);
    }
}

export { getChannelListHtml, getChannelHtml, getVideoListHtml, getVideoHtml, getSearchChannelHtml }