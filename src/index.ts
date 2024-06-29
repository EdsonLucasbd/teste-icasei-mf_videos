
interface FavoritesProps {
  videoId: string;
  title: string;
  thumbnail: string;
}

interface YoutubeSearchResponse {
  kind: string;
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  regionCode?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: YoutubeSearchResult[];
}

interface YoutubeSearchResult {
  kind: string;
  etag: string;
  id: {
    kind: string;
    videoId: string;
    channelId?: string;
    playlistId?: string;
  };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description?: string;
    thumbnails: { [key: string]: YoutubeThumbnail };
    channelTitle: string;
    liveBroadcastContent?: string;
  };
}

interface YoutubeThumbnail {
  url: string;
  width: number;
  height: number;
}

async function searchVideos() {
  const input = document.getElementById('query') as HTMLInputElement;
  const query = input?.value;
  const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=AIzaSyBzPMVEXZ04Wg5OPQac8_ttH73M_-sp07k`);
  const data: YoutubeSearchResponse = await response.json();
  const videosContainer = document.getElementById('videos');

  if (!videosContainer) { return }
  
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
}

function addToFavorites({videoId, title, thumbnail}: FavoritesProps) {
  fetch('/mf_videos/add-favorite', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ videoId, title, thumbnail })
  });
}
