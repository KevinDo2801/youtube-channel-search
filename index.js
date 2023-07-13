import { fetchChannelList } from "./fetchAPI.js"
import { defaultChannelList, identifyVideoLink, identifyChannelLink } from "./utilities.js"
import { getChannelListHtml, getChannelHtml, getVideoListHtml, getVideoHtml, getSearchChannelHtml } from "./getHtml.js"

const alertText = document.querySelector(".alert-text");

function handleError() {
    alertText.style.display = "block";
    alertText.textContent = "Oops! Something went wrong. Please try again later.";
}

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

async function updateNameWrapper(idArr) {
    try {
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
    } catch {
        handleError();
    }
}

selectBtn.addEventListener("click", () => wrapper.classList.toggle("active"));

// main
const updateUI = ({ mainClass, informUserContent, searchText, videoHTML, channelListHTML }) => {
    const main = document.querySelector("main");
    const informUser = document.querySelector("#inform-user");
    const searchTextEl = document.getElementById('search-text');
    const videoEl = document.querySelector(".video");
    const channelList = document.querySelector('.channel-list');
    if (mainClass) main.classList.remove(mainClass);
    if (informUserContent !== undefined) informUser.textContent = informUserContent;
    if (searchText !== undefined) searchTextEl.textContent = searchText;
    if (videoHTML !== undefined) videoEl.innerHTML = videoHTML;
    if (channelListHTML !== undefined) channelList.innerHTML = channelListHTML;
};

async function handleYourChannel() {
    const channelListHtml = await getChannelListHtml(defaultChannelList);
    alertText.style.display = "none";
    updateUI({
        mainClass: "default",
        informUserContent: '',
        searchText: '',
        videoHTML: '',
        channelListHTML: channelListHtml
    });
}

async function handleSearchVideo() {
    const searchQuery = document.getElementById("search-video-input").value;
    if (searchQuery.trim().length == 0) {
        alertText.style.display = "block";
        return;
    } else {
        alertText.style.display = "none";
        const channelPicker = document.querySelector('div[data-idChannel]');
        const channelId = channelPicker.getAttribute('data-idChannel');
        document.getElementById("search-video-input").value = "";

        const html = await getVideoListHtml(channelId, searchQuery);
        if (html.trim().length == 0) {
            updateUI({
                mainClass: "default",
                informUserContent: "Unable to find what you’re looking for. Please try another search."
            });
            return;
        }

        updateUI({
            mainClass: "default",
            informUserContent: '',
            searchText: searchQuery,
            videoHTML: html,
            channelListHTML: ''
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

function handleRemoveChannel(idChannel) {
    if (defaultChannelList.includes(idChannel)) {
        const index = defaultChannelList.indexOf(idChannel);
        if (index !== -1) {
            defaultChannelList.splice(index, 1);
        }
        updateNameWrapper(defaultChannelList);
        if (document.querySelector('.channel-list').innerHTML !== "") {
            handleYourChannel()
        }
        document.querySelectorAll(`p[data-addChannel="${idChannel}"]`).forEach(p => {
            p.innerHTML = `<i class="fa fa-plus-circle"></i> Add channel`;
        });
    }
}

async function handleAddChannelLink() {
    const inputEl = document.querySelector(".add-channel-from-link").querySelector("input");

    if (inputEl.value.trim().length == 0) {
        alertText.style.display = "block";
        return;
    } else {
        alertText.style.display = "none";
        let informUserContent = '';
        let videoHTML = '';
        let channelListHTML = '';

        if (identifyVideoLink(inputEl.value)) {
            videoHTML = await getVideoHtml(inputEl.value);
            videoHTML += videoHTML + videoHTML;
        } else if (identifyChannelLink(inputEl.value)) {
            channelListHTML = await getChannelHtml(inputEl.value);
        } else {
            informUserContent = "Unable to find what you’re looking for. Please try another link.";
            updateUI({
                mainClass: "default",
                informUserContent: informUserContent,
                searchText: '',
                videoHTML: '',
                channelListHTML: ''
            });
            return;
        }

        informUserContent = "From link: " + inputEl.value;
        inputEl.value = "";

        updateUI({
            mainClass: "default",
            informUserContent: informUserContent,
            searchText: '',
            videoHTML: videoHTML,
            channelListHTML: channelListHTML
        });
    }

}

async function handleAddChannelText() {
    const query = document.querySelector(".add-channel").querySelector("input");
    if (query.value.trim().length == 0) {
        alertText.style.display = "block";
        return;
    } else {
        alertText.style.display = "none";
        let html = await getSearchChannelHtml(query.value);
        document.querySelector("main").classList.remove("default");


        if (html.trim().length == 0) {
            updateUI({
                mainClass: "default",
                informUserContent: "Unable to find what you’re looking for. Please try another search.",
                searchText: '',
                videoHTML: '',
                channelListHTML: ''
            });
            return;
        }

        updateUI({
            mainClass: "",
            informUserContent: query.value,
            searchText: '',
            videoHTML: '',
            channelListHTML: html
        });

        query.value = "";
    }

}

document.addEventListener("click", (event) => {
    const eventId = event.target.id;
    const eventParentId = event.target.parentNode ? event.target.parentNode.id : null;

    if (eventId.includes("your-channel")) {
        handleYourChannel();
    } else if (eventId.includes("search-video-btn") || (eventParentId && eventParentId.includes("search-video-btn"))
    ) {
        handleSearchVideo();
    } else if (event.target.getAttribute('data-addChannel')) {
        const idChannel = event.target.getAttribute('data-addChannel');
        const operation = event.target.textContent.trim();
        if (operation === "Add channel") {
            handleAddChannel(idChannel);
        } else if (operation === "Remove") {
            handleRemoveChannel(idChannel);
        }
    } else if (eventId.includes("add-channel-link") || (eventParentId && eventParentId.includes("add-channel-link"))) {
        handleAddChannelLink();
    } else if (eventId.includes("add-channel-text") || (eventParentId && eventParentId.includes("add-channel-text"))) {
        handleAddChannelText()
    }
});

updateNameWrapper(defaultChannelList);

