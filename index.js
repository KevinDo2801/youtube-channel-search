// Wrapper 
const wrapper = document.querySelector(".wrapper");
const options = wrapper.querySelector(".options");
const selectBtn = wrapper.querySelector(".select-btn");

function updateList(selectedOption) {
    options.querySelectorAll('li').forEach(li => {
        li.innerHTML = li.innerHTML.replace('<i class="fa fa-check"></i>', '');
        if (li.textContent === selectedOption) {
            li.classList.add('selected');
            li.innerHTML += `<i class="fa fa-check"></i>`;
        } else {
            li.classList.remove('selected');
            li.innerHTML = li.innerHTML;
        }
    });
}

function updateName(selectedLi) {
    updateList(selectedLi.textContent);
    wrapper.classList.remove("active");
    let text = selectedLi.innerHTML;
    text = selectedLi.innerHTML.replace('<i class="fa fa-check"></i>', '');
    document.getElementById("channel-picker").innerHTML = text;
}

document.addEventListener("click", (event) => {
    const target = event.target;
    if (!wrapper.contains(target)) {
        wrapper.classList.remove("active");
    }
});

selectBtn.addEventListener("click", () => wrapper.classList.toggle("active"));

// default function
const apiKey = 'AIzaSyBbtIwT2evvIo19XmO1vKUphn6vjqmdOPQ';
const endpoint = "https://www.googleapis.com/youtube/v3/search"
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

function convertSubscriber(subscriberCount) {
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
        return subscriberCount;
    }
}

function formatNumber(number, decimalPlaces) {
    const fixedNumber = number.toFixed(decimalPlaces);
    if (fixedNumber.endsWith('.0')) {
        return fixedNumber.slice(0, -2);
    }
    return fixedNumber;
}

async function fetchChannel(id) {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${id}&key=${apiKey}`);
    const data = await response.json();
    return data.items[0];
}

async function fetchChannelList(idArr) {
    const channelArr = await Promise.all(
        idArr.map(async (idChannel) => {
            const response = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${idChannel}&key=${apiKey}`);
            const data = await response.json();
            return data.items[0];
        })
    );

    return channelArr;
}

async function updateNameWrapper(idArr) {
    const channelArr = await fetchChannelList(idArr)

    let html = `
            <li class="selected">
                <div data-idChannel="nope">
                    <img src="./youtube-icon.png"> YouTube
                </div>
                <i class="fa fa-check"></i></li>   
            </li>
            `
    channelArr.forEach((channel) => {
        html += `
            <li>
                <div data-idChannel="${channel.id}">
                    <img src="${channel.snippet.thumbnails.default.url}"> ${channel.snippet.title}    
                </div>
            </li>
            `
    })

    options.innerHTML = html;

    options.querySelectorAll('li').forEach(li => {
        li.addEventListener('click', function () {
            updateName(this);
        });
    });
}

async function fetchVideoList(idChannel, searchQuery) {
    const maxResults = 6;

    let url = `${endpoint}?key=${apiKey}&q=${searchQuery}&maxResults=${maxResults}&type=video&channelId=${idChannel}&part=snippet`
    if (idChannel === "nope") {
        url = `${endpoint}?key=${apiKey}&q=${searchQuery}&maxResults=${maxResults}&type=video&part=snippet`
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
    let url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=statistics&key=${apiKey}`;

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

// solve the problem
async function getChannelListHtml(idArr) {
    const channelArr = await fetchChannelList(idArr)

    let channelHtml = "";

    channelArr.forEach((channel) => {
        const newNumSubscribers = convertSubscriber(channel.statistics.subscriberCount);
        let newDescription = channel.snippet.description;
        if (channel.snippet.description.length > 140) {
            newDescription = channel.snippet.description.substring(0, 140) + `<span>...<a href="https://www.youtube.com/channel/${channel.id}" target="_blank">Read more</a></span>`;
        }
        
        let iconAdd = '';
        if (!defaultChannelList.includes(channel.id)) {
            iconAdd = `<i class="fa fa-plus-circle"></i> Add channel`
        } else {
            iconAdd = `<i class="fa fa-minus-circle"></i> Remove`
        }

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

async function handleYourChannel() {
    document.querySelector("main").classList.remove("default");
    document.querySelector("#inform-user").innerHTML = '';
    document.getElementById('search-text').textContent = '';
    document.querySelector(".video").innerHTML = '';
    document.querySelector('.channel-list').innerHTML = await getChannelListHtml(defaultChannelList);
}

async function getVideoListHtml(idChannel, searchQuery) {
    const videoArr = await fetchVideoList(idChannel, searchQuery);
    const channelIds = [...new Set(videoArr.map((video) => video.snippet.channelId))];
    const channelArr = await fetchChannelList(channelIds);
    let html = '';

    for (let i = 0; i < videoArr.length; i++) {
        const video = videoArr[i];
        const videoStatistics = await fetchVideoStatistics(video.id.videoId);
        const countView = convertSubscriber(videoStatistics);

        const channel = channelArr.find(channel => channel.id === video.snippet.channelId);

        let iconAdd = '';
        if (!defaultChannelList.includes(idChannel)) {
            iconAdd = `<i class="fa fa-plus-circle"></i> Add channel`
        } else {
            iconAdd = `<i class="fa fa-minus-circle"></i> Remove`
        }


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

async function handleSearchVideo() {
    const channelPicker = document.querySelector('div[data-idChannel]');
    const channelId = channelPicker.getAttribute('data-idChannel');
    const searchQuery = document.getElementById("search-video-input").value;
    document.getElementById("search-video-input").value = "";
    document.querySelector(".channel-list").innerHTML = '';
    document.querySelector("main").classList.remove("default");
    document.querySelector("#inform-user").textContent = '';

    let html = await getVideoListHtml(channelId, searchQuery);
    if (html.trim().length == 0) {
        document.querySelector("main").classList.add("default");
        document.querySelector("#inform-user").textContent = "Unable to find what you’re looking for. Please try another search.";
        return;
    }

    document.getElementById('search-text').textContent = searchQuery;
    document.querySelector(".video").innerHTML = html;
}

function handleRemoveChannel(idChannel) {
    if (defaultChannelList.includes(idChannel)) {
        defaultChannelList = defaultChannelList.filter(id => id !== idChannel);
        updateNameWrapper(defaultChannelList);
        if (document.querySelector('.channel-list').innerHTML !== "") {
            handleYourChannel()
        }
        document.querySelectorAll(`p[data-addChannel="${idChannel}"]`).forEach(p => {
            p.innerHTML = `<i class="fa fa-plus-circle"></i> Add channel`;
        });
    }


}

function handleAddChannel(idChannel) {
    if (!defaultChannelList.includes(idChannel)) {
        defaultChannelList.unshift(idChannel);
        updateNameWrapper(defaultChannelList);
        document.querySelectorAll(`p[data-addChannel="${idChannel}"]`).forEach(p => {
            p.innerHTML = `<i class="fa fa-minus-circle"></i> Remove`;
        });
    }
}

function identifyYoutubeLink(link) {
    var videoPattern = /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=[\w-]+$/;
    var channelPattern = /^https?:\/\/(?:www\.)?youtube\.com\/@[\w-]+$/;

    if (videoPattern.test(link)) {
        return 1;
    } else if (channelPattern.test(link)) {
        return 0;
    } else {
        return -1;
    }
}

async function getVideoData(url) {
    const videoId = url.match(/(?:https?:\/\/(?:www\.)?)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-]+)(?:&(?:amp;)?[\w?=]*)?/i)[1];

    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        const video = data.items[0];
        const channel = await fetchChannel(video.snippet.channelId);
        const videoStatistics = await fetchVideoStatistics(video.id);
        const countView = convertSubscriber(videoStatistics);

        let iconAdd = '';
        if (!defaultChannelList.includes(video.snippet.channelId)) {
            iconAdd = `<i class="fa fa-plus-circle"></i> Add channel`
        } else {
            iconAdd = `<i class="fa fa-minus-circle"></i> Remove`
        }

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

function getUserName(url) {
    const matches = url.match(/https:\/\/www\.youtube\.com\/@(.+)/);
    if (matches && matches[1]) {
        return matches[1];
    } else {
        return null;
    }
}

async function getChannel(url) {
    const customUserName = getUserName(url);
    let channelHtml = '';

    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${customUserName}&type=channel&key=${apiKey}`);
        const data = await response.json();

        const channel = await fetchChannel(data.items[0].id.channelId);
        let iconAdd = '';
        if (!defaultChannelList.includes(data.items[0].id.channelId)) {
            iconAdd = `<i class="fa fa-plus-circle"></i> Add channel`
        } else {
            iconAdd = `<i class="fa fa-minus-circle"></i> Remove`
        }

        const newNumSubscribers = convertSubscriber(channel.statistics.subscriberCount);
        let newDescription = channel.snippet.description;

        if (channel.snippet.description.length > 140) {
            newDescription = channel.snippet.description.substring(0, 140) + `<span>...<a href="https://www.youtube.com/channel/${channel.id}" target="_blank">Read more</a></span>`;
        }

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

async function handleAddChannelLink() {
    document.querySelector(".channel-list").innerHTML = '';
    document.querySelector("main").classList.remove("default");
    document.querySelector("#inform-user").textContent = '';
    document.getElementById("search-text").textContent = "";

    let html = '';
    const inputEl = document.querySelector(".add-channel-from-link").querySelector("input");
    if (identifyYoutubeLink(inputEl.value) == 1) {
        html = await getVideoData(inputEl.value);
        document.querySelector(".video").innerHTML = html + html + html;
    } else if (identifyYoutubeLink(inputEl.value) == 0) {
        html = await getChannel(inputEl.value);
        document.querySelector(".channel-list").innerHTML = html;
    } else {
        html = "Unable to find what you’re looking for. Please try another link.";
        document.querySelector("main").classList.add("default");
        document.querySelector("#inform-user").textContent = html;
        return;
    }

    document.querySelector("#inform-user").textContent = "From link: " + inputEl.value;
    inputEl.value = ""
}

async function searchChannel(query) {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=6&q=${query}&type=channel&key=${apiKey}`;
  
    try {
        const response = await fetch(url);
        const data = await response.json();

        const channelIds = data.items.map(channel => channel.id.channelId)
        return await getChannelListHtml(channelIds);
    } catch (error) {
        console.error('Failed to fetch the channel:', error);
    }
}

async function handleAddChannelText(){
    const query = document.querySelector(".add-channel").querySelector("input");
    let html = await searchChannel(query.value);

    document.querySelector("main").classList.remove("default");
    document.querySelector("#inform-user").innerHTML = query.value;
    document.getElementById('search-text').textContent = '';
    document.querySelector(".video").innerHTML = '';
    document.querySelector('.channel-list').innerHTML = html;

    if (html.trim().length == 0) {
        document.querySelector("main").classList.add("default");
        document.querySelector("#inform-user").textContent = "Unable to find what you’re looking for. Please try another search.";
        return;
    }

    query.value = ""
}

document.addEventListener("click", (event) => {
    const e = event.target.id;

    if (e.includes("your-channel")) {
        handleYourChannel();
    } else if (e.includes("search-video-btn")) {
        const searchQuery = document.getElementById("search-video-input").value;
        if (searchQuery.trim().length == 0) {
            alert("Please type a search");
            return;
        } else {
            handleSearchVideo();
        }
    } else if (event.target.getAttribute('data-addChannel')) {
        const idChannel = event.target.getAttribute('data-addChannel');
        const operation = event.target.textContent.trim();
        if (operation === "Add channel") {
            handleAddChannel(idChannel);
        } else if (operation === "Remove") {
            handleRemoveChannel(idChannel);
        }
    } else if (e.includes("add-channel-link")) {
        handleAddChannelLink();
    } else if(e.includes("add-channel-text")) {
        handleAddChannelText()
    }
});

updateNameWrapper(defaultChannelList);
handleYourChannel();


