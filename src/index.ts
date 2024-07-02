interface FavoritesProps {
  videoId: string
  title?: string
}

interface YoutubeSearchResponse {
  kind: string
  etag: string
  nextPageToken?: string
  prevPageToken?: string
  regionCode?: string
  pageInfo: {
    totalResults: number
    resultsPerPage: number
  }
  items: YoutubeSearchResult[]
}

interface YoutubeSearchResult {
  kind: string
  etag: string
  id: {
    kind: string
    videoId: string
    channelId?: string
    playlistId?: string
  }
  snippet: {
    publishedAt: string
    channelId: string
    title: string
    description?: string
    thumbnails: { [key: string]: YoutubeThumbnail }
    channelTitle: string
    liveBroadcastContent?: string
  }
}

interface YoutubeThumbnail {
  url: string
  width: number
  height: number
}

function checkFavorites() {
  document.querySelectorAll('.star-checkbox').forEach((checkbox, index) => {
    checkbox.addEventListener('change', function (this: HTMLInputElement) {
      const starButton = this.closest('.star-button') as HTMLElement;
      const videoIndex = starButton.getAttribute('data-index');
      const videoTitle = starButton.getAttribute('data-title');
  
      if (this.checked) {
        addToFavorites({ videoId: videoIndex ?? '000', title: videoTitle ?? 'Ocorreu um erro nesse video' });
      } else {
        removeFromFavorites({ videoId: videoIndex ?? '000' });
      }
    });
  });
}

function isChecked(videoId: string): boolean {
  const storedData = localStorage.getItem(`video-${videoId}`);
  if (!storedData) {
    return false;
  }
  try {
    const parsedData: FavoritesProps = JSON.parse(storedData);
    return parsedData.videoId === videoId;
  } catch (e) {
    console.error('Error parsing stored data', e);
    return false;
  }
}

async function searchVideos() {
  const input = document.getElementById('query') as HTMLInputElement
  const query = input?.value
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=AIzaSyBzPMVEXZ04Wg5OPQac8_ttH73M_-sp07k`
  )
  const data: YoutubeSearchResponse = await response.json()
  const videosContainer = document.getElementById('videos')

  if (!videosContainer) {
    return
  }

  videosContainer.innerHTML = ''
  data.items.forEach((video) => {
    const videoElement = document.createElement('div')
    const isFavorite = video.id.videoId ? isChecked(video.id.videoId) : false
    videoElement.innerHTML = `
          <h3>${video.snippet.title}</h3>
          <iframe width="200" height="200" src="https://www.youtube.com/embed/${video.id.videoId}" alt="${video.snippet.title}"></iframe>
          <div class="star-button" data-index="${video.id.videoId}" data-title="${video.snippet.title}">
            <input type="checkbox" id="${video.id.videoId}" class="star-checkbox" ${isFavorite ? 'checked' : ''}>
            <label for="${video.id.videoId}" class="star-icon"></label>
          </div>
      `
    videosContainer.appendChild(videoElement)
  })

  checkFavorites()
}

function updateCount(type: 'add' | 'remove' = 'add') {
  let currentValue = localStorage.getItem('favorites-count');
  if (currentValue !== null) {
    let newValue = 0;
    type === 'add' 
    ? ( newValue = parseInt(currentValue) + 1 )
    : parseInt(currentValue) > 0 ? newValue = parseInt(currentValue) - 1 : newValue = 0;
    
    localStorage.setItem('favorites-count', JSON.stringify(newValue));
  } else {
    let newValue = 0;
    type === 'add' ? newValue = 1 : newValue = 0;
    localStorage.setItem('favorites-count', JSON.stringify(newValue));
  }
  
}

function countDispathc(type: 'add' | 'remove' = 'add') {
  updateCount(type)

  const socket = new WebSocket('ws://localhost:8080');
  socket.addEventListener('open', () => {
    socket.send(JSON.stringify({ favoritesUpdated: type }));
  });

}

function addToFavorites({ videoId, title }: FavoritesProps) {
  console.log('adding to favorites', title)
  const storageData = {videoId: videoId, title: title}
  localStorage.setItem(`video-${videoId}`, JSON.stringify(storageData))
  
  countDispathc('add')

  fetch('/mf_videos/add-favorite', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ videoId, title }),
  })
}

function removeFromFavorites({ videoId }: FavoritesProps) {
  console.log('removing from favorites', videoId)
  localStorage.removeItem(`video-${videoId}`)

  countDispathc('remove')

  fetch('/mf_videos/add-favorite', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ videoId }),
  })
}


async function loadFavorites() {
  const response = await fetch('/mf_videos/favorites')
  const favorites: FavoritesProps[] = await response.json()
  const favoritesDiv = document.getElementById('favorites')
  
  if (!favoritesDiv) {
    return
  }
  favoritesDiv.innerHTML = ''
  favorites.forEach((video) => {
    const isFavorite = video.videoId ? isChecked(video.videoId) : false
    const videoElement = document.createElement('div')
    videoElement.innerHTML = `
              <h3>${video.title}</h3>
              <iframe width="200" height="200" src="https://www.youtube.com/embed/${video.videoId}" alt="${video.title}"></iframe>
              <div class="star-button" data-index="${video.videoId}" data-title="${video.title}">
                <input type="checkbox" id="${video.videoId}" class="star-checkbox" ${isFavorite ? 'checked' : ''}>
                <label for="${video.videoId}" class="star-icon"></label>
              </div>
          `
    favoritesDiv.appendChild(videoElement)
  })
}