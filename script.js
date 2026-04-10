const profileBtn = document.querySelector(".profile");
const profileMenu = document.getElementById("profileMenu");
document.addEventListener("click", (e) => {
    if (profileBtn.contains(e.target)) {
        profileMenu.classList.toggle("active");
    } else if (!profileMenu.contains(e.target)) {
        profileMenu.classList.remove("active")
    }
});
const menuToggle = document.getElementById("menuToggle");
const sideBar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

menuToggle.addEventListener("click", () => {
    const screenWidth = window.innerWidth;

    if (screenWidth <= 1310) {
        sideBar.classList.toggle("active");
        overlay.style.display = sideBar.classList.contains("active") ? "block" : "none";
    } else {
        sideBar.classList.toggle("collapsed");
    }
});

overlay.addEventListener("click", () => {
    sideBar.classList.remove("active");
    overlay.style.display = "none";
});
const filterList = document.querySelector(".filter-list");
const leftArrow = document.querySelector(".filters .fa-angle-left");
const rightArrow = document.querySelector(".filters .fa-angle-right");

leftArrow.addEventListener("click", () => {
    filterList.scrollBy({ left: -150, behavior: "smooth" });
})

rightArrow.addEventListener("click", () => {
    filterList.scrollBy({ left: 150, behavior: "smooth" });
})

function togglerArrows() {
    const scrollLeft = filterList.scrollLeft;
    const maxScrollLeft = filterList.scrollWidth - filterList.clientWidth;

    if (scrollLeft > 0) {
        leftArrow.style.display = "flex";
    } else {
        leftArrow.style.display = "none";
    }

    if (scrollLeft >= maxScrollLeft) {
        rightArrow.style.display = "none";
    } else {
        rightArrow.style.display = "flex";
    }
}

filterList.addEventListener("scroll", togglerArrows);
window.addEventListener("load", togglerArrows);


const videoGrid = document.getElementById("videoGrid");
const mainContent = document.querySelector(".content");
const videoModal = document.getElementById("videoModal");
const videoPlayer = document.getElementById("videoPlayer");
const closeVideo = document.getElementById("closeVideo");
let nextPageToken = "";
let loading = false;

const API_KEY = "AIzaSyB252gskonA6mNQdI51TkHdaZI_N3N4xcY";
const REGION_CODE = "IN";
const MAX_RESULTS = 9;


async function fetchTrendingVideos() {
    if (loading) return;
    loading = true;
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&chart=mostPopular&maxResults=${MAX_RESULTS}&regionCode=${REGION_CODE}&key=${API_KEY}${nextPageToken ? `&pageToken=${nextPageToken}` : ""}`;
    try {
        const res = await fetch(url);
        const data = await res.json();

        nextPageToken = data.nextPageToken;
        renderVideos(data.items);
    } catch (error) {
        console.error("Failed to load videos:", error);
    } finally {
        loading = false;
    }
}

function formatDuration(isoDuration) {
    const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const h = (match[1] || "").replace("H", "") || 0;
    const m = (match[2] || "").replace("M", "") || 0;
    const s = (match[3] || "").replace("S", "") || 0;
    const parts = [h, m, s].map((num) => String(num).padStart(2, "0"));
    return h > 0 ? `${parts[0]}:${parts[1]}:${parts[2]}` : `${parts[1]}:${parts[2]}`;
}

function formatViews(views) {
    views = Number(views);
    if (views >= 1_000_000)
        return (views / 1_000_000).toFixed(1) + "M views"
    if (views >= 1_000)
        return (views / 1_000).toFixed(1) + "K views"

    return views + "views"
}

function timeAgo(dateStr) {
    const now = new Date()
    const then = new Date(dateStr);
    const diffMs = now - then;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffMonths / 12);

    if (diffHrs < 24)
        return `${diffHrs} hours ago`;
    if (diffDays < 30)
        return `${diffDays} days ago`;
    if (diffMonths < 12)
        return `${diffMonths} months ago`;
    return `${diffYears} years ago`;
}

async function renderVideos(videos) {
    for (const video of videos) {
        const { title, channelTitle, channelId, thumbnails, publishedAt } = video.snippet;
        const viewCount = formatViews(video.statistics?.viewCount || 0);

        const duration = formatDuration(video.contentDetails?.duration || 'PT0M0S');
        const trimmedTitle = title.length > 60 ? title.slice(0, 57) + "..." : title;

        const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${API_KEY}`;
        let channelAvatar = "https://via.placeholder.com/36";
        try {
            const res = await fetch(channelUrl);
            const data = await res.json();
            channelAvatar = data.items?.[0]?.snippet?.thumbnails?.default?.url || channelAvatar;
        } catch (error) {
            console.error("Failed to load:", error);
        }

        const card = document.createElement("div")
        card.className = "video-card";
        card.dataset.videoId = video.id;
        card.innerHTML = `
        <div class="thumbnail-wrapper">
            <img class="video-thumbnail" src="${thumbnails.high.url}" alt="video Thumbnail"/>
            <span class="video-duration">${duration}</span>
        </div >
        <div class="video-details">
            <img class="channel-avatar" src="${channelAvatar}" alt=" Channel Avatar"/>
            <div class="video-meta">
                <div class="video-title">${trimmedTitle}</div>
                <div class="video-channel">${channelTitle}</div>
                <div class="video-stats">${viewCount} .${timeAgo(publishedAt)}</div>
            </div>
            <i class="fa-solid fa-ellipsis-vertical"></i>
        </div>
        `;
        card.addEventListener("click", () => {
            openVideoModal(video.id);
        });
        videoGrid.appendChild(card);
    }
}

function openVideoModal(videoId) {
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    videoPlayer.src = embedUrl;
    videoModal.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeVideoModal() {
    videoModal.classList.remove("active");
    videoPlayer.src = "";
    document.body.style.overflow = "";
}

closeVideo.addEventListener("click", closeVideoModal);
videoModal.addEventListener("click", (event) => {
    if (event.target === videoModal) {
        closeVideoModal();
    }
});

mainContent.addEventListener("scroll",()=>{
    const bottomReached=mainContent.scrollTop+mainContent.clientHeight >= mainContent.scrollHeight-200;
    if (bottomReached){
        fetchTrendingVideos();
    }
});

fetchTrendingVideos();