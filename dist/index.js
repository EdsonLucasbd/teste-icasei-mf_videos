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
        data.items.forEach(video => {
            const videoElement = document.createElement('div');
            videoElement.innerHTML = `
          <h3>${video.snippet.title}</h3>
          <iframe width="200" height="200" src="https://www.youtube.com/embed/${video.id.videoId}" alt="${video.snippet.title}"></iframe>
          <button onclick="addToFavorites('${video.id.videoId}', '${video.snippet.title}', '${video.snippet.thumbnails.default.url}')" title="Adicionar aos Favoritos">
          </button>
      `;
            videosContainer.appendChild(videoElement);
        });
    });
}
function addToFavorites({ videoId, title, thumbnail }) {
    fetch('/mf_videos/add-favorite', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ videoId, title, thumbnail })
    });
}
