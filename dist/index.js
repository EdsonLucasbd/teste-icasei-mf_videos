"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function checkFavorites() {
    document.querySelectorAll('.star-checkbox').forEach((checkbox, index) => {
        checkbox.addEventListener('change', function () {
            const starButton = this.closest('.star-button');
            const videoIndex = starButton.getAttribute('data-index');
            const videoTitle = starButton.getAttribute('data-title');
            if (this.checked) {
                addToFavorites({ videoId: videoIndex !== null && videoIndex !== void 0 ? videoIndex : '000', title: videoTitle !== null && videoTitle !== void 0 ? videoTitle : 'Ocorreu um erro nesse video' });
            }
            else {
                removeFromFavorites({ videoId: videoIndex !== null && videoIndex !== void 0 ? videoIndex : '000' });
            }
        });
    });
}
function isChecked(videoId) {
    const storedData = localStorage.getItem(`video-${videoId}`);
    if (!storedData) {
        return false;
    }
    try {
        const parsedData = JSON.parse(storedData);
        return parsedData.videoId === videoId;
    }
    catch (e) {
        console.error('Error parsing stored data', e);
        return false;
    }
}
function searchVideos() {
    return __awaiter(this, void 0, void 0, function* () {
        const input = document.getElementById('query');
        const query = input === null || input === void 0 ? void 0 : input.value;
        const response = yield fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=AIzaSyBzPMVEXZ04Wg5OPQac8_ttH73M_-sp07k`);
        const data = yield response.json();
        const videosContainer = document.getElementById('videos');
        if (!videosContainer) {
            return;
        }
        videosContainer.innerHTML = '';
        data.items.forEach((video) => {
            const videoElement = document.createElement('div');
            const isFavorite = video.id.videoId ? isChecked(video.id.videoId) : false;
            videoElement.innerHTML = `
          <h3>${video.snippet.title}</h3>
          <iframe width="200" height="200" src="https://www.youtube.com/embed/${video.id.videoId}" alt="${video.snippet.title}"></iframe>
          <div class="star-button" data-index="${video.id.videoId}" data-title="${video.snippet.title}">
            <input type="checkbox" id="${video.id.videoId}" class="star-checkbox" ${isFavorite ? 'checked' : ''}>
            <label for="${video.id.videoId}" class="star-icon"></label>
          </div>
      `;
            videosContainer.appendChild(videoElement);
        });
        checkFavorites();
    });
}
function updateCount(type = 'add') {
    let currentValue = localStorage.getItem('favorites-count');
    if (currentValue !== null) {
        let newValue = 0;
        type === 'add'
            ? (newValue = parseInt(currentValue) + 1)
            : parseInt(currentValue) > 0 ? newValue = parseInt(currentValue) - 1 : newValue = 0;
        localStorage.setItem('favorites-count', JSON.stringify(newValue));
    }
    else {
        let newValue = 0;
        type === 'add' ? newValue = 1 : newValue = 0;
        localStorage.setItem('favorites-count', JSON.stringify(newValue));
    }
}
function countDispathc(type = 'add') {
    updateCount(type);
    const socket = new WebSocket('ws://localhost:8080');
    socket.addEventListener('open', () => {
        socket.send(JSON.stringify({ favoritesUpdated: type }));
    });
}
function addToFavorites({ videoId, title }) {
    console.log('adding to favorites', title);
    const storageData = { videoId: videoId, title: title };
    localStorage.setItem(`video-${videoId}`, JSON.stringify(storageData));
    countDispathc('add');
    fetch('/mf_videos/add-favorite', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId, title }),
    });
}
function removeFromFavorites({ videoId }) {
    console.log('removing from favorites', videoId);
    localStorage.removeItem(`video-${videoId}`);
    countDispathc('remove');
    fetch('/mf_videos/add-favorite', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId }),
    });
}
function loadFavorites() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch('/mf_videos/favorites');
        const favorites = yield response.json();
        const favoritesDiv = document.getElementById('favorites');
        if (!favoritesDiv) {
            return;
        }
        favoritesDiv.innerHTML = '';
        favorites.forEach((video) => {
            const isFavorite = video.videoId ? isChecked(video.videoId) : false;
            const videoElement = document.createElement('div');
            videoElement.innerHTML = `
              <h3>${video.title}</h3>
              <iframe width="200" height="200" src="https://www.youtube.com/embed/${video.videoId}" alt="${video.title}"></iframe>
              <div class="star-button" data-index="${video.videoId}" data-title="${video.title}">
                <input type="checkbox" id="${video.videoId}" class="star-checkbox" ${isFavorite ? 'checked' : ''}>
                <label for="${video.videoId}" class="star-icon"></label>
              </div>
          `;
            favoritesDiv.appendChild(videoElement);
        });
    });
}
