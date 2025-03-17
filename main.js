   document.addEventListener('scroll', () => {
     const navbar = document.querySelector('.navbar');
     let lastScroll = 0;
     const currentScroll = window.scrollY;
 
     if (currentScroll > 50) {
         navbar.classList.add('scrolled');
         if (currentScroll > lastScroll && currentScroll > navbar.offsetHeight) {
             navbar.classList.add('hidden');
         } else {
             navbar.classList.remove('hidden');
         }
     } else {
         navbar.classList.remove('scrolled');
         navbar.classList.remove('hidden');
     }
     lastScroll = currentScroll;
 });
 
 document.addEventListener('DOMContentLoaded', () => {
   const playerHeader = document.querySelector('.player-header');
   const videoContainer = document.querySelector('.video-container');
   
   if (playerHeader && videoContainer) {
     let timeout;
     videoContainer.addEventListener('mousemove', () => {
       playerHeader.classList.remove('hidden');
       clearTimeout(timeout);
       timeout = setTimeout(() => {
         playerHeader.classList.add('hidden');
       }, 3000);
     });
     
     videoContainer.addEventListener('mouseleave', () => {
       playerHeader.classList.add('hidden');
     });
   }
 });
 // CineStream Class Definition
 class CineStream {
   constructor() {
     // Configuration
     this.TMDB_API_KEY = '431fb541e27bceeb9db2f4cab69b54e1';
     this.TMDB_BASE_URL = 'https://api.themoviedb.org/3';
     this.TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p';
     
     this.STREAMING_SOURCES = {
      TEST: {
        name: "Test Source",
        qualities: ["720p"],
        getUrl: (id) => {
          const [type, mediaId] = id.split('-');
          return type === 'movie'
            ? "https://archive.org/embed/big-buck-bunny"
            : "https://archive.org/embed/Sita_Sings_the_Blues";
        }
      },
      VIDSRC: {
        name: "VidSrc",
        qualities: ["360p", "480p", "720p", "1080p"],
        getUrl: (id, q) => {
          const [type, mediaId, season, episode] = id.split('-');
          if (type === 'tv' && season && episode) {
            return `https://vidsrc.to/embed/tv/${mediaId}/${season}/${episode}`;
          }
          return `https://vidsrc.to/embed/movie/${mediaId}`;
        }
      },
      VIDPRO: {
        name: "VidPro",
        qualities: ["720p", "1080p", "2K", "4K"],
        getUrl: (id, q) => `https://vidpro.stream/embed/${id}/${q}`
      },
      SUPEREMBED: {
        name: "SuperEmbed",
        qualities: ["1080p", "2K", "4K"],
        getUrl: (id, q) => `https://superembed.xyz/${id}?q=${q}`
      },
      VIDIN: {
        name: "Vid.in",
        qualities: ["480p", "720p", "1080p"],
        getUrl: (id, q) => `https://vid.in/player/${id}?res=${q}`
      },
      CUSTOM: {
        name: "Custom Source",
        qualities: ["720p", "1080p"],
        getUrl: (id, q) => {
          const [type, mediaId, season, episode] = id.split('-');
          return `https://example-streaming-service.com/embed/${type}/${mediaId}${season && episode ? `/${season}/${episode}` : ''}?quality=${q}`;
        }
      }
    };

    this.streamingNetworks = [
      { id: 213, name: 'Netflix', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg' },
      { id: 1024, name: 'Amazon Prime Video', logo: 'https://media.themoviedb.org/t/p/h60/w7HfLNm9CWwRmAMU58udl2L7We7.png' },
      { id: 453, name: 'Hulu', logo: 'https://www.logo.wine/a/logo/Hulu/Hulu-Logo.wine.svg' },
      { id: 49, name: 'Disney+', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg' },
      { id: 2, name: 'HBO Max', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/17/HBO_Max_Logo.svg' },
      { id: 2552, name: 'Peacock', logo: 'https://media.themoviedb.org/t/p/h60/gIAcGTjKKr0KOHL5s4O36roJ8p7.png' }
    ];
     
     // State Management
     this.state = {
      currentPage: 1,
      totalPages: 0,
      currentView: 'home',
      currentMedia: null,
      currentMediaType: null,
      currentSource: 'VIDSRC',
      currentQuality: '720p',
      searchQuery: '',
      currentPlayback: null,
      continueWatching: JSON.parse(localStorage.getItem('continueWatching')) || [],
      currentNetwork: null
    };

 
     this.themes = ['theme-dark', 'theme-light', 'theme-midnight-blue', 'theme-solarized'];
     this.state.currentTheme = localStorage.getItem('theme') || 'theme-dark';
     this.state.watchlist = JSON.parse(localStorage.getItem('watchlist')) || { movies: [], series: [] };
     this.watchlistOpen = false;
 
     console.log('Initial continueWatching from localStorage:', this.state.continueWatching);
 
     // Limit continueWatching to 10 items
    if (this.state.continueWatching.length > 40) {
      this.state.continueWatching = this.state.continueWatching.slice(0, 10);
      localStorage.setItem('continueWatching', JSON.stringify(this.state.continueWatching));
    }

    if (this.state.continueWatching.length === 0) {
      this.state.continueWatching = [{
        mediaType: 'movie',
        id: '550',
        title: 'Fight Club',
        time: 5,
        duration: 139,
        poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg'
      }];
      localStorage.setItem('continueWatching', JSON.stringify(this.state.continueWatching));
    }
     
     // Initialize the app when DOM is ready
     document.addEventListener('DOMContentLoaded', () => {
       this.initDOMReferences();
       this.setupEventListeners();
       this.applyTheme(this.state.currentTheme); // Apply saved theme
       this.renderHomePage();
     });
   }
   
   // Initialize DOM references
   initDOMReferences() {
     this.mainContent = document.getElementById('main-content');
     this.homeLink = document.getElementById('home-link');
     this.moviesLink = document.getElementById('movies-link');
     this.tvLink = document.getElementById('tv-link');
     this.trendingLink = document.getElementById('trending-link');
     this.themeSelect = document.getElementById('theme-select');
 
     this.watchlistLink = document.getElementById('watchlist-link');
     this.watchlistPanel = document.getElementById('watchlist-panel');
     this.closeWatchlistBtn = document.getElementById('close-watchlist');
     this.watchlistContent = document.getElementById('watchlist-content');
   
 
 
     // Check if all required elements exist
     if (!this.mainContent) {
       console.error("Required element #main-content not found!");
     }
     if (!this.homeLink || !this.moviesLink || !this.tvLink || !this.trendingLink) {
       console.warn("Navigation elements missing. Navigation may not work properly.");
     }
   }
   
   setupEventListeners() {
     const saveAndNavigate = (renderFunc) => (e) => {
     e.preventDefault();
     if (this.state.currentView === 'player' && this.state.currentPlayback) {
       console.log('Saving playback before navigation:', this.state.currentPlayback);
       this.savePlaybackPosition(
         this.state.currentPlayback.mediaType,
         this.state.currentPlayback.id,
         this.state.currentPlayback.title,
         this.state.currentPlayback.season,
         this.state.currentPlayback.episode
       );
     }
     renderFunc.call(this);
   };
 
   if (this.homeLink) this.homeLink.addEventListener('click', saveAndNavigate(this.renderHomePage));
   if (this.moviesLink) this.moviesLink.addEventListener('click', saveAndNavigate(this.renderMoviesPage));
   if (this.tvLink) this.tvLink.addEventListener('click', saveAndNavigate(this.renderTVShowsPage));
   if (this.trendingLink) this.trendingLink.addEventListener('click', saveAndNavigate(this.renderTrendingPage));
 
   if (this.themeSelect) {
     this.themeSelect.value = this.state.currentTheme;
     this.themeSelect.addEventListener('change', (e) => {
       const newTheme = e.target.value;
       this.applyTheme(newTheme);
       this.state.currentTheme = newTheme;
       localStorage.setItem('theme', newTheme);
     });
   }
 
     if (this.watchlistLink) {
       this.watchlistLink.addEventListener('click', (e) => {
         e.preventDefault();
         this.toggleWatchlist();
       });
     }
 
     if (this.closeWatchlistBtn) {
       this.closeWatchlistBtn.addEventListener('click', () => this.closeWatchlist());
     }
 
     // Watchlist tabs
     document.querySelectorAll('.watchlist-tabs .nav-link').forEach(tab => {
       tab.addEventListener('click', (e) => {
         e.preventDefault();
         document.querySelectorAll('.watchlist-tabs .nav-link').forEach(t => t.classList.remove('active'));
         document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
         e.target.classList.add('active');
         document.getElementById(`${e.target.dataset.tab}-content`).classList.add('active');
       });
     });
 
     if (this.watchlistPanel) {
     this.watchlistPanel.addEventListener('resize', () => {
       const panelWidth = (this.watchlistPanel.offsetWidth / window.innerWidth) * 100;
       const newWidth = `${100 - panelWidth}%`;
       document.getElementById('main-content').style.width = newWidth;
       document.querySelector('.navbar').style.width = newWidth;
       document.querySelector('footer').style.width = newWidth;
     });
     }
 
 
     this.homeLink.addEventListener('click', (e) => {
     e.preventDefault();
     this.savePlaybackPosition(this.state.currentPlayback?.mediaType, 
       this.state.currentPlayback?.id, 
       this.state.currentPlayback?.title, 
       this.state.currentPlayback?.season, 
       this.state.currentPlayback?.episode);
     this.renderHomePage();
   });
 
      window.addEventListener('resize', () => {
        if (this.watchlistOpen) {
        const panelWidth = (this.watchlistPanel.offsetWidth / window.innerWidth) * 100;
        const newWidth = `${100 - panelWidth}%`;
        document.getElementById('main-content').style.width = newWidth;
        document.querySelector('.navbar').style.width = newWidth;
        document.querySelector('footer').style.width = newWidth;
        }
       });

 }  
 
 
   addToWatchlist(mediaId, mediaType, title, posterPath) {
   const item = { id: mediaId, type: mediaType, title, poster_path: posterPath };
   const category = mediaType === 'movie' ? 'movies' : 'series';
 
   if (!this.state.watchlist[category].some(i => i.id === mediaId)) {
     this.state.watchlist[category].push(item);
     localStorage.setItem('watchlist', JSON.stringify(this.state.watchlist));
     this.showToast(`Added "${title}" to watchlist`, 'success');
     this.renderWatchlist();
   } else {
     this.showToast(`"${title}" is already in your watchlist`, 'info');
   }
 }
 
   // Remove from Watchlist
   removeFromWatchlist(mediaId, category) {
     this.state.watchlist[category] = this.state.watchlist[category].filter(i => i.id !== mediaId);
     localStorage.setItem('watchlist', JSON.stringify(this.state.watchlist));
     this.renderWatchlist();
   }
 
   // Toggle Watchlist Panel
   toggleWatchlist() {
   this.watchlistOpen = !this.watchlistOpen;
   this.watchlistPanel.classList.toggle('open', this.watchlistOpen);
   this.updateActiveNavLink(this.watchlistOpen ? 'watchlist-link' : null);
   
   const mainContent = document.getElementById('main-content');
   const navbar = document.querySelector('.navbar');
   const footer = document.querySelector('footer');
   
   if (this.watchlistOpen) {
     this.renderWatchlist();
     const panelWidth = (this.watchlistPanel.offsetWidth / window.innerWidth) * 100;
     const newWidth = `${100 - panelWidth}%`;
     mainContent.style.width = newWidth;
     navbar.style.width = newWidth;
     footer.style.width = newWidth;
   } else {
     mainContent.style.width = '100%';
     navbar.style.width = '100%';
     footer.style.width = '100%';
   }
 }
   // Close Watchlist
   closeWatchlist() {
   this.watchlistOpen = false;
   this.watchlistPanel.classList.remove('open');
   this.updateActiveNavLink(null);
   
   const mainContent = document.getElementById('main-content');
   const navbar = document.querySelector('.navbar');
   const footer = document.querySelector('footer');
   
   mainContent.style.width = '100%';
   navbar.style.width = '100%';
   footer.style.width = '100%';
 }
 
   // Render Watchlist
   renderWatchlist() {
   const moviesContent = document.getElementById('movies-content');
   const seriesContent = document.getElementById('series-content');
 
   const renderItems = (items, container, category) => {
     if (items.length === 0) {
       container.innerHTML = '<p class="text-center">No items in this category.</p>';
       return;
     }
     container.innerHTML = items.map(item => `
       <div class="watchlist-item">
         <button class="watchlist-item-link btn btn-link p-0 text-left" 
           data-id="${item.id}" 
           data-type="${item.type}" 
           style="width: calc(100% - 60px);">
           <img src="${this.TMDB_IMAGE_URL}/w92${item.poster_path}" alt="${this.escapeHTML(item.title)}">
           <div class="watchlist-info">
             <h4>${this.escapeHTML(item.title)}</h4>
             <p>${item.type === 'movie' ? 'Movie' : 'Series'}</p>
           </div>
         </button>
         <button class="btn btn-remove" data-id="${item.id}" data-category="${category}">
           <i class="fas fa-trash"></i>
         </button>
       </div>
     `).join('');
 
     // Add click listeners for item links with active state
     container.querySelectorAll('.watchlist-item-link').forEach(link => {
       link.addEventListener('click', (e) => {
         container.querySelectorAll('.watchlist-item-link').forEach(l => l.classList.remove('active'));
         e.currentTarget.classList.add('active');
         const { id, type } = e.currentTarget.dataset;
         this.renderMediaDetails(type, id);
         // this.closeWatchlist(); // Comment out to keep panel open
       });
     });
 
     // Add click listeners for remove buttons
     container.querySelectorAll('.btn-remove').forEach(btn => {
       btn.addEventListener('click', () => {
         this.removeFromWatchlist(btn.dataset.id, btn.dataset.category);
       });
     });
   };
 
   renderItems(this.state.watchlist.movies, moviesContent, 'movies');
   renderItems(this.state.watchlist.series, seriesContent, 'series');
 }
 
   applyTheme(theme) {
     const body = document.body;
     // Remove all theme classes
     this.themes.forEach(t => body.classList.remove(t));
     // Add the selected theme
     body.classList.add(theme);
   }
   
   // API Functions
   async fetchFromTMDB(endpoint, params = {}) {
    const query = new URLSearchParams({
      api_key: this.TMDB_API_KEY,
      ...params
    }).toString();
    const url = `${this.TMDB_BASE_URL}${endpoint}?${query}`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching from TMDB (${url}):`, error);
      return null;
    }
  }

   // Fetch trending media (movies and TV shows)
   async fetchTrending(mediaType = 'all', timeWindow = 'week', page = 1) {
     return this.fetchFromTMDB(`/trending/${mediaType}/${timeWindow}`, { page });
   }
   
   // Fetch popular movies
   async fetchPopularMovies(page = 1) {
     return this.fetchFromTMDB('/movie/popular', { page });
   }
   
   // Fetch top-rated movies
   async fetchTopRatedMovies(page = 1) {
     return this.fetchFromTMDB('/movie/top_rated', { page });
   }
   
   // Fetch upcoming movies
   async fetchUpcomingMovies(page = 1) {
     return this.fetchFromTMDB('/movie/upcoming', { page });
   }
   
   // Fetch popular TV shows
   async fetchPopularTVShows(page = 1) {
     return this.fetchFromTMDB('/tv/popular', { page });
   }
   
   // Fetch top-rated TV shows
   async fetchTopRatedTVShows(page = 1) {
     return this.fetchFromTMDB('/tv/top_rated', { page });
   }
   
   // Fetch TV shows airing today
   async fetchTVAiringToday(page = 1) {
     return this.fetchFromTMDB('/tv/airing_today', { page });
   }
   
   // Fetch media details (movie or TV show)
   async fetchMediaDetails(mediaType, id) {
     return this.fetchFromTMDB(`/${mediaType}/${id}`, { append_to_response: 'credits,videos,similar' });
   }
   
   // Fetch TV show seasons
   async fetchTVShowSeason(tvId, seasonNumber) {
     return this.fetchFromTMDB(`/tv/${tvId}/season/${seasonNumber}`);
   }
   
   // Search for movies or TV shows
   async searchMedia(query, page = 1) {
     return this.fetchFromTMDB('/search/multi', { query, page });
   }

   async fetchRecommendations(mediaType, id) {
  return this.fetchFromTMDB(`/${mediaType}/${id}/recommendations`);
}

async renderRecommendations() {
  const watched = this.state.continueWatching.slice(0, 5);
  const recommendations = await Promise.all(watched.map(item => this.fetchRecommendations(item.mediaType, item.id)));
  const flatRecommendations = recommendations.flatMap(r => r?.results || []).slice(0, 8);
  this.renderMediaCards(flatRecommendations, 'recommendations-section');
}
   
   // Rendering Functions
   setupWatchParty(roomId, mediaType, id, title, season, episode) {
  this.state.watchParty = { roomId, participants: [], chat: [] };
  this.renderPlayerPage(mediaType, id, title, season, episode);
  // Add chat UI to player page
  const playerHTML = this.mainContent.querySelector('.player-container');
  playerHTML.innerHTML += `
    <div class="chat-sidebar">
      <div class="chat-messages" id="chat-messages"></div>
      <input type="text" id="chat-input" placeholder="Type a message...">
    </div>
  `;
  document.getElementById('chat-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') this.sendChatMessage(roomId, e.target.value);
  });
}

sendChatMessage(roomId, message) {
  this.state.watchParty.chat.push({ user: this.state.users.current, message, timestamp: Date.now() });
  // Update UI and sync with others (e.g., via WebSocket)
}

async cacheForOffline() {
  const popularMovies = await this.fetchPopularMovies();
  const popularTV = await this.fetchPopularTVShows();
  const offlineData = { movies: popularMovies.results, tv: popularTV.results, timestamp: Date.now() };
  localStorage.setItem('offlineCache', JSON.stringify(offlineData));
}

renderOfflineMode() {
  const offlineData = JSON.parse(localStorage.getItem('offlineCache'));
  if (offlineData) {
    this.renderMediaCards(offlineData.movies, 'popular-movies');
    this.renderMediaCards(offlineData.tv, 'popular-tv');
  } else {
    this.mainContent.innerHTML += '<p>No offline content available.</p>';
  }
}

async searchMedia(query, page = 1, filters = {}) {
  const params = { query, page, ...filters };
  return this.fetchFromTMDB('/search/multi', params);
}

renderSearchFilters() {
  const filterHTML = `
    <div class="search-filters">
      <select id="genre-filter">
        <option value="">All Genres</option>
        ${this.genres.map(g => `<option value="${g.id}">${g.name}</option>`).join('')}
      </select>
      <input type="number" id="year-filter" placeholder="Year" min="1900" max="${new Date().getFullYear()}">
      <button id="apply-filters">Apply</button>
    </div>
  `;
  document.querySelector('.search-header').innerHTML += filterHTML;
  document.getElementById('apply-filters').addEventListener('click', () => {
    const filters = {
      with_genres: document.getElementById('genre-filter').value,
      primary_release_year: document.getElementById('year-filter').value
    };
    this.renderSearchResults(this.state.searchQuery, filters);
  });
}



 
   
   async loadHomepageData() {
     // Fetch trending media
     const trendingData = await this.fetchTrending();
     if (trendingData && trendingData.results) {
       this.renderMediaCards(trendingData.results.slice(0, 8) || [], 'trending-media');
     }
     
     // Fetch popular movies
     const popularMovies = await this.fetchPopularMovies();
     if (popularMovies && popularMovies.results) {
       this.renderMediaCards(popularMovies.results.slice(0, 8) || [], 'popular-movies');
     }
     
     // Fetch popular TV shows
     const popularTV = await this.fetchPopularTVShows();
     if (popularTV && popularTV.results) {
       this.renderMediaCards(popularTV.results.slice(0, 8) || [], 'popular-tv');
     }
   }
   
   renderMediaCards(mediaList, containerId) {
     const container = document.getElementById(containerId);
     if (!container) {
       console.error(`Container #${containerId} not found`);
       return;
     }
     
     if (mediaList && mediaList.length > 0) {
       const cardsHTML = mediaList.map(item => {
         // Determine media type if not specified
         const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
         return this.createMediaCard(item, mediaType);
       }).join('');
       
       container.innerHTML = cardsHTML;
       
       // Add event listeners to watch buttons
       container.querySelectorAll('.btn-watch').forEach(btn => {
         btn.addEventListener('click', (e) => this.handleWatchClick(e));
       });
     } else {
       container.innerHTML = '<div class="col-12"><p>No content available</p></div>';
     }
   }
   
   renderMoviesPage() {
     this.updateActiveNavLink('movies-link');
     this.state.currentView = 'movies';
     this.state.currentPage = 1;
     
     // Create hero section
     const heroHTML = `
       <section class="hero" style="padding: 80px 0;">
         <div class="container">
           <div class="row">
             <div class="col-lg-8 col-md-10 mx-auto text-center">
               <h1 style="margin-top: 40px;">Explore Movies</h1>
               <p>Discover the latest blockbusters, classics, and everything in between.</p>
             </div>
           </div>
         </div>
       </section>
     `;
     
     // Create tabs and content section
     const contentHTML = `
       <div class="container">
         <ul class="nav nav-tabs category-tabs mb-4" id="movieTabs">
           <li class="nav-item">
             <a class="nav-link active" id="popular-tab" data-category="popular">Popular</a>
           </li>
           <li class="nav-item">
             <a class="nav-link" id="top-rated-tab" data-category="top_rated">Top Rated</a>
           </li>
           <li class="nav-item">
             <a class="nav-link" id="upcoming-tab" data-category="upcoming">Upcoming</a>
           </li>
         </ul>
         
         <div class="tab-content">
           <div id="movies-content">
             <div class="loader"><div class="spinner"></div></div>
           </div>
           
           <nav aria-label="Page navigation" class="mt-4">
             <ul class="pagination" id="movies-pagination">
             </ul>
           </nav>
         </div>
       </div>
     `;
     
     // Set the content
     if (this.mainContent) {
       this.mainContent.innerHTML = heroHTML + contentHTML;
       
       // Add event listeners to tabs
       document.querySelectorAll('#movieTabs .nav-link').forEach(tab => {
         tab.addEventListener('click', (e) => {
           e.preventDefault();
           // Update active tab
           document.querySelectorAll('#movieTabs .nav-link').forEach(t => t.classList.remove('active'));
           e.target.classList.add('active');
           
           // Reset pagination
           this.state.currentPage = 1;
           
           // Load movies based on selected category
           this.loadMovies(e.target.dataset.category);
         });
       });
       
       // Load initial movies (popular)
       this.loadMovies('popular');
     } else {
       console.error('Cannot render movies page: mainContent element not found');
     }
   }
   
   async loadMovies(category) {
     const moviesContent = document.getElementById('movies-content');
     if (!moviesContent) {
       console.error('Movies content container not found');
       return;
     }
     
     moviesContent.innerHTML = '<div class="loader"><div class="spinner"></div></div>';
     
     let data;
     switch (category) {
       case 'top_rated':
         data = await this.fetchTopRatedMovies(this.state.currentPage);
         break;
       case 'upcoming':
         data = await this.fetchUpcomingMovies(this.state.currentPage);
         break;
       case 'popular':
       default:
         data = await this.fetchPopularMovies(this.state.currentPage);
         break;
     }
     
     if (data && data.results) {
       // Update total pages
       this.state.totalPages = data.total_pages > 500 ? 500 : data.total_pages;
       
       // Render movies
       const moviesHTML = `
         <div class="row">
           ${data.results.map(movie => this.createMediaCard(movie, 'movie')).join('')}
         </div>
       `;
       moviesContent.innerHTML = moviesHTML;
       
       // Add event listeners to watch buttons
       document.querySelectorAll('.btn-watch').forEach(btn => {
         btn.addEventListener('click', (e) => this.handleWatchClick(e));
       });
       
       // Update pagination
       this.renderPagination('movies-pagination', () => this.loadMovies(category));
     } else {
       moviesContent.innerHTML = '<div class="alert alert-danger">Failed to load movies. Please try again later.</div>';
     }
   }
   
   renderTVShowsPage() {
     this.updateActiveNavLink('tv-link');
     this.state.currentView = 'tv';
     this.state.currentPage = 1;
     
     // Create hero section
     const heroHTML = `
       <section class="hero" style="padding: 80px 0;">
         <div class="container">
           <div class="row">
             <div class="col-lg-8 col-md-10 mx-auto text-center">
               <h1 style="margin-top: 40px;">Explore TV Shows</h1>
               <p>Discover popular series, new episodes, and binge-worthy content.</p>
             </div>
           </div>
         </div>
       </section>
     `;
     
     // Create tabs and content section
     const contentHTML = `
       <div class="container">
         <ul class="nav nav-tabs category-tabs mb-4" id="tvTabs">
           <li class="nav-item">
             <a class="nav-link active" id="popular-tv-tab" data-category="popular">Popular</a>
           </li>
           <li class="nav-item">
             <a class="nav-link" id="top-rated-tv-tab" data-category="top_rated">Top Rated</a>
           </li>
           <li class="nav-item">
             <a class="nav-link" id="airing-today-tab" data-category="airing_today">Airing Today</a>
           </li>
         </ul>
         
         <div class="tab-content">
           <div id="tv-content">
             <div class="loader"><div class="spinner"></div></div>
           </div>
           
           <nav aria-label="Page navigation" class="mt-4">
             <ul class="pagination" id="tv-pagination">
             </ul>
           </nav>
         </div>
       </div>
     `;
     
     // Set the content
     if (this.mainContent) {
       this.mainContent.innerHTML = heroHTML + contentHTML;
       
       // Add event listeners to tabs
       document.querySelectorAll('#tvTabs .nav-link').forEach(tab => {
         tab.addEventListener('click', (e) => {
           e.preventDefault();
           // Update active tab
           document.querySelectorAll('#tvTabs .nav-link').forEach(t => t.classList.remove('active'));
           e.target.classList.add('active');
           
           // Reset pagination
           this.state.currentPage = 1;
           
           // Load TV shows based on selected category
           this.loadTVShows(e.target.dataset.category);
         });
       });
       
       // Load initial TV shows (popular)
       this.loadTVShows('popular');
     } else {
       console.error('Cannot render TV shows page: mainContent element not found');
     }
   }
   
   async loadTVShows(category) {
     const tvContent = document.getElementById('tv-content');
     if (!tvContent) {
       console.error('TV content container not found');
       return;
     }
     
     tvContent.innerHTML = '<div class="loader"><div class="spinner"></div></div>';
     
     let data;
     switch (category) {
       case 'top_rated':
         data = await this.fetchTopRatedTVShows(this.state.currentPage);
         break;
       case 'airing_today':
         data = await this.fetchTVAiringToday(this.state.currentPage);
         break;
       case 'popular':
       default:
         data = await this.fetchPopularTVShows(this.state.currentPage);
         break;
     }
     
     if (data && data.results) {
       // Update total pages
       this.state.totalPages = data.total_pages > 500 ? 500 : data.total_pages;
       
       // Render TV shows
       const tvShowsHTML = `
         <div class="row">
           ${data.results.map(show => this.createMediaCard(show, 'tv')).join('')}
         </div>
       `;
       tvContent.innerHTML = tvShowsHTML;
       
       // Add event listeners to watch buttons
       document.querySelectorAll('.btn-watch').forEach(btn => {
         btn.addEventListener('click', (e) => this.handleWatchClick(e));
       });
       
       // Update pagination
       this.renderPagination('tv-pagination', () => this.loadTVShows(category));
     } else {
       tvContent.innerHTML = '<div class="alert alert-danger">Failed to load TV shows. Please try again later.</div>';
     }
   }
   
   renderTrendingPage() {
     this.updateActiveNavLink('trending-link');
     this.state.currentView = 'trending';
     this.state.currentPage = 1;
     
     // Create hero section
     const heroHTML = `
       <section class="hero" style="padding: 80px 0;">
         <div class="container">
           <div class="row">
             <div class="col-lg-8 col-md-10 mx-auto text-center">
               <h1 style="margin-top: 40px;">Trending Content</h1>
               <p>See what everyone is watching right now.</p>
             </div>
           </div>
         </div>
       </section>
     `;
     
     // Create tabs and content section
     const contentHTML = `
       <div class="container">
         <ul class="nav nav-tabs category-tabs mb-4" id="trendingTabs">
           <li class="nav-item">
             <a class="nav-link active" id="trending-all-tab" data-type="all">All</a>
           </li>
           <li class="nav-item">
             <a class="nav-link" id="trending-movies-tab" data-type="movie">Movies</a>
           </li>
           <li class="nav-item">
             <a class="nav-link" id="trending-tv-tab" data-type="tv">TV Shows</a>
           </li>
         </ul>
         
         <ul class="nav nav-pills time-window mb-4" id="trendingTime">
           <li class="nav-item">
             <a class="nav-link active" id="trending-day" data-time="day">Today</a>
           </li>
           <li class="nav-item">
             <a class="nav-link" id="trending-week" data-time="week">This Week</a>
           </li>
         </ul>
         
         <div class="tab-content">
           <div id="trending-content">
             <div class="loader"><div class="spinner"></div></div>
           </div>
           
           <nav aria-label="Page navigation" class="mt-4">
             <ul class="pagination" id="trending-pagination">
             </ul>
           </nav>
         </div>
       </div>
     `;
     
     // Set the content
     if (this.mainContent) {
       this.mainContent.innerHTML = heroHTML + contentHTML;
       
       // Add event listeners to media type tabs
       document.querySelectorAll('#trendingTabs .nav-link').forEach(tab => {
         tab.addEventListener('click', (e) => {
           e.preventDefault();
           // Update active tab
           document.querySelectorAll('#trendingTabs .nav-link').forEach(t => t.classList.remove('active'));
           e.target.classList.add('active');
           
           // Reset pagination
           this.state.currentPage = 1;
           
           // Get current time window
           const activeTimeWindow = document.querySelector('#trendingTime .nav-link.active').dataset.time;
           
           // Load trending based on selected type and time window
           this.loadTrending(e.target.dataset.type, activeTimeWindow);
         });
       });
       
       // Add event listeners to time window pills
       document.querySelectorAll('#trendingTime .nav-link').forEach(pill => {
         pill.addEventListener('click', (e) => {
           e.preventDefault();
           // Update active pill
           document.querySelectorAll('#trendingTime .nav-link').forEach(p => p.classList.remove('active'));
           e.target.classList.add('active');
           
           // Reset pagination
           this.state.currentPage = 1;
           
           // Get current media type
           const activeType = document.querySelector('#trendingTabs .nav-link.active').dataset.type;
           
           // Load trending based on selected type and time window
           this.loadTrending(activeType, e.target.dataset.time);
         });
       });
       
       // Load initial trending content (all, week)
       this.loadTrending('all', 'week');
     } else {
       console.error('Cannot render trending page: mainContent element not found');
     }
   }
   
   async loadTrending(mediaType = 'all', timeWindow = 'week') {
     const trendingContent = document.getElementById('trending-content');
     if (!trendingContent) {
       console.error('Trending content container not found');
       return;
     }
     
     trendingContent.innerHTML = '<div class="loader"><div class="spinner"></div></div>';
     
     const data = await this.fetchTrending(mediaType, timeWindow, this.state.currentPage);
     
     if (data && data.results) {
       // Update total pages
       this.state.totalPages = data.total_pages > 500 ? 500 : data.total_pages;
       
       // Render trending content
       const trendingHTML = `
         <div class="row">
           ${data.results.map(item => this.createMediaCard(item, item.media_type || (item.title ? 'movie' : 'tv'))).join('')}
         </div>
       `;
       trendingContent.innerHTML = trendingHTML;
       
       // Add event listeners to watch buttons
       document.querySelectorAll('.btn-watch').forEach(btn => {
         btn.addEventListener('click', (e) => this.handleWatchClick(e));
       });
       
       // Update pagination
       this.renderPagination('trending-pagination', () => this.loadTrending(mediaType, timeWindow));
     } else {
       trendingContent.innerHTML = '<div class="alert alert-danger">Failed to load trending content. Please try again later.</div>';
     }
   }
   
   async renderSearchResults(query) {
     this.updateActiveNavLink(null);
     this.state.currentView = 'search';
     this.state.searchQuery = query;
     this.state.currentPage = 1;
     
     // Create search results layout
     const searchHTML = `
       <div class="container">
         <div class="search-header py-4">
           <h1>Search Results for "${this.escapeHTML(query)}"</h1>
         </div>
         
         <div id="search-results">
           <div class="loader"><div class="spinner"></div></div>
         </div>
         
         <nav aria-label="Page navigation" class="mt-4">
           <ul class="pagination" id="search-pagination">
           </ul>
         </nav>
       </div>
     `;
     
     // Set the content
     if (this.mainContent) {
       this.mainContent.innerHTML = searchHTML;
       
       // Load search results
       await this.loadSearchResults();
     } else {
       console.error('Cannot render search results: mainContent element not found');
     }
   }
   
   async loadSearchResults() {
     const searchResultsContainer = document.getElementById('search-results');
     if (!searchResultsContainer) {
       console.error('Search results container not found');
       return;
     }
     
     const data = await this.searchMedia(this.state.searchQuery, this.state.currentPage);
     
     if (data && data.results) {
       // Update total pages
       this.state.totalPages = data.total_pages > 500 ? 500 : data.total_pages;
       
       // Filter results to only include movies and TV shows
       const filteredResults = data.results.filter(item => 
         item.media_type === 'movie' || item.media_type === 'tv'
       );
       
       if (filteredResults.length > 0) {
         // Render search results
         const resultsHTML = `
           <div class="row">
             ${filteredResults.map(item => this.createMediaCard(item, item.media_type)).join('')}
           </div>
         `;
         searchResultsContainer.innerHTML = resultsHTML;
         
         // Add event listeners to watch buttons
         document.querySelectorAll('.btn-watch').forEach(btn => {
           btn.addEventListener('click', (e) => this.handleWatchClick(e));
         });
       } else {
         searchResultsContainer.innerHTML = '<div class="alert alert-info">No movies or TV shows found matching your search.</div>';
       }
       
       // Update pagination
       this.renderPagination('search-pagination', () => this.loadSearchResults());
     } else {
       searchResultsContainer.innerHTML = '<div class="alert alert-danger">Failed to load search results. Please try again later.</div>';
     }
   }
   
   async renderMediaDetails(mediaType, id) {
    this.updateActiveNavLink(null);
    this.state.currentView = 'details';
    this.state.currentMediaType = mediaType;

    const placeholderHTML = `
      <div class="container">
        <div class="loader my-5"><div class="spinner"></div></div>
      </div>
    `;

    if (this.mainContent) {
      this.mainContent.innerHTML = placeholderHTML;

      const data = await this.fetchFromTMDB(`/${mediaType}/${id}`, { append_to_response: 'credits,videos,similar' });

      if (data) {
        this.state.currentMedia = data;

        const backdropPath = data.backdrop_path
          ? `${this.TMDB_IMAGE_URL}/original${data.backdrop_path}`
          : null;
        const posterPath = data.poster_path
          ? `${this.TMDB_IMAGE_URL}/w500${data.poster_path}`
          : 'img/no-poster.jpg';
        const watchlistPosterPath = data.poster_path || '/no-poster.jpg';
        data.poster_path = watchlistPosterPath;

        const genres = data.genres?.map(genre => genre.name).join(', ') || 'N/A';
        let directors = data.credits?.crew?.filter(crew => crew.job === 'Director').map(d => d.name) || [];
        let cast = data.credits?.cast?.slice(0, 8).map(actor => actor.name) || [];
        let trailerKey = data.videos?.results?.find(video => video.type === 'Trailer' && video.site === 'YouTube')?.key || null;

        const heroStyle = backdropPath
          ? `background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.9)), url('${backdropPath}');`
          : 'background-color: #121212;';

        console.log('Fetched Rating for', data.title || data.name, ':', data.vote_average);

        const heroHTML = `
          <section class="media-hero" style="${heroStyle}">
            <div class="container">
              <div class="row py-5">
                <div class="col-md-4 mb-4">
                  <img src="${posterPath}" alt="${this.escapeHTML(data.title || data.name)}" class="img-fluid rounded shadow">
                </div>
                <div class="col-md-8 text-white">
                  <h1>${this.escapeHTML(data.title || data.name)}</h1>
                  <div class="media-meta mb-3">
                    ${mediaType === 'movie' ? `<span>${data.release_date?.substring(0, 4) || 'N/A'}</span>` : `<span>${data.first_air_date?.substring(0, 4) || 'N/A'}</span>`}
                    <span class="mx-2">•</span>
                    <span>${genres}</span>
                    <span class="mx-2">•</span>
                    <span>${mediaType === 'movie' ? `${data.runtime || 'N/A'} min` : `${data.number_of_seasons || 'N/A'} season${data.number_of_seasons !== 1 ? 's' : ''}`}</span>
                  </div>
                  <div class="rating mb-4">
                    <div class="star-rating">
                      ${this.generateStarRating(data.vote_average || 0)}
                      <span class="rating-value">${data.vote_average ? data.vote_average.toFixed(1) : 'N/A'}/10</span>
                    </div>
                  </div>
                  <p class="overview mb-4">${this.escapeHTML(data.overview || 'No overview available.')}</p>
                  ${directors.length > 0 ? `<p><strong>Director${directors.length > 1 ? 's' : ''}:</strong> ${this.escapeHTML(directors.join(', '))}</p>` : ''}
                  ${cast.length > 0 ? `<p><strong>Cast:</strong> ${this.escapeHTML(cast.join(', '))}</p>` : ''}
                  <div class="action-buttons mt-4">
                    <button class="btn btn-primary btn-lg btn-watch" data-media-id="${data.id}" data-media-type="${mediaType}">
                      <i class="fas fa-play-circle"></i> Watch Now
                    </button>
                    ${trailerKey ? `
                      <button class="btn btn-outline-light btn-lg ml-3" data-toggle="modal" data-target="#trailerModal">
                        <i class="fas fa-film"></i> Watch Trailer
                      </button>
                    ` : ''}
                    <button class="btn btn-outline-light btn-lg ml-3 btn-add-watchlist" 
                      data-media-id="${data.id}" 
                      data-media-type="${mediaType}" 
                      data-title="${this.escapeHTML(data.title || data.name)}" 
                      data-poster-path="${watchlistPosterPath}">
                      <i class="fas fa-plus"></i> Add to Watchlist
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        `;

        let contentHTML = `
          <div class="container py-4">
        `;

        if (mediaType === 'tv' && data.seasons) {
          contentHTML += `
            <section class="seasons-section mb-5">
              <h2 class="section-title">Seasons</h2>
              <div class="seasons-accordion" id="accordionSeasons">
                ${data.seasons.map((season, index) => `
                  <div class="card season-card">
                    <div class="card-header" id="heading${season.season_number}">
                      <h3 class="mb-0">
                        <button class="btn btn-link${index !== 0 ? ' collapsed' : ''}" 
                          type="button" 
                          data-toggle="collapse" 
                          data-target="#collapse${season.season_number}" 
                          aria-expanded="${index === 0 ? 'true' : 'false'}" 
                          aria-controls="collapse${season.season_number}">
                          Season ${season.season_number} ${season.name !== `Season ${season.season_number}` ? `- ${this.escapeHTML(season.name)}` : ''}
                          <span class="season-info ml-2">(${season.episode_count} episodes)</span>
                        </button>
                      </h3>
                    </div>
                    <div id="collapse${season.season_number}" 
                      class="collapse${index === 0 ? ' show' : ''}" 
                      aria-labelledby="heading${season.season_number}" 
                      data-parent="#accordionSeasons">
                      <div class="card-body" id="season-${season.season_number}-episodes">
                        <div class="loader"><div class="spinner"></div></div>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </section>
          `;
        }

        if (data.similar?.results?.length > 0) {
          contentHTML += `
            <section class="similar-section mb-5">
              <h2 class="section-title">Similar ${mediaType === 'movie' ? 'Movies' : 'TV Shows'}</h2>
              <div class="row">
                ${data.similar.results.slice(0, 8).map(item => this.createMediaCard(item, mediaType)).join('')}
              </div>
            </section>
          `;
        }

        contentHTML += `
          </div>
        `;

        if (trailerKey) {
          contentHTML += `
            <div class="modal fade" id="trailerModal" tabindex="-1" role="dialog" aria-labelledby="trailerModalLabel" aria-hidden="true">
              <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="trailerModalLabel">Trailer: ${this.escapeHTML(data.title || data.name)}</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">×</span>
                    </button>
                  </div>
                  <div class="modal-body p-0">
                    <div class="embed-responsive embed-responsive-16by9">
                      <iframe class="embed-responsive-item" src="https://www.youtube.com/embed/${trailerKey}" allowfullscreen></iframe>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `;
        }

        this.mainContent.innerHTML = heroHTML + contentHTML;

        document.querySelectorAll('.btn-watch').forEach(btn => {
          btn.addEventListener('click', (e) => this.handleWatchClick(e));
        });

        document.querySelectorAll('.btn-add-watchlist').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const { mediaId, mediaType, title, posterPath } = e.target.closest('.btn-add-watchlist').dataset;
            this.addToWatchlist(mediaId, mediaType, title, posterPath);
          });
        });

        if (mediaType === 'tv') {
          const firstSeason = data.seasons.find(s => s.season_number >= 0) || data.seasons[0];
          if (firstSeason) {
            this.loadSeasonEpisodes(data.id, firstSeason.season_number);
          }

          document.querySelectorAll('.season-card .btn-link').forEach(btn => {
            btn.addEventListener('click', (e) => {
              const seasonNumber = e.target.closest('.card-header').id.replace('heading', '');
              const collapseElement = document.getElementById(`collapse${seasonNumber}`);

              if (collapseElement && !collapseElement.classList.contains('loaded') && collapseElement.classList.contains('show')) {
                collapseElement.classList.add('loaded');
                this.loadSeasonEpisodes(data.id, seasonNumber);
              }
            });
          });
        }
      } else {
        this.mainContent.innerHTML = `
          <div class="container">
            <div class="alert alert-danger my-5">Failed to load details. Please try again later.</div>
          </div>
        `;
      }
    } else {
      console.error('Cannot render media details: mainContent element not found');
    }
  }

  generateStarRating(voteAverage) {
    const maxStars = 10;
    const rating = Math.min(Math.max(voteAverage, 0), maxStars);
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

    console.log(`Vote Average: ${voteAverage}, Full: ${fullStars}, Half: ${hasHalfStar}, Empty: ${emptyStars}`);

    let starsHtml = '';
    for (let i = 0; i < fullStars; i++) {
      starsHtml += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
      starsHtml += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
      starsHtml += '<i class="far fa-star"></i>';
    }

    return starsHtml;
  }
 
  async loadSeasonEpisodes(tvId, seasonNumber) {
    const episodesContainer = document.getElementById(`season-${seasonNumber}-episodes`);
    if (!episodesContainer) {
      console.error(`Episodes container for season ${seasonNumber} not found`);
      return;
    }
    
    const data = await this.fetchTVShowSeason(tvId, seasonNumber);
    
    if (data && data.episodes) {
      const episodesHTML = data.episodes.map(episode => {
        const episodeImage = episode.still_path
          ? `${this.TMDB_IMAGE_URL}/w300${episode.still_path}`
          : 'img/no-still.jpg';
          
        return `
          <div class="episode-item mb-3">
            <div class="row">
              <div class="col-md-3">
                <img src="${episodeImage}" alt="Episode ${episode.episode_number}" class="img-fluid rounded">
              </div>
              <div class="col-md-9">
                <h4>${episode.episode_number}. ${this.escapeHTML(episode.name || `Episode ${episode.episode_number}`)}</h4>
                <div class="episode-meta">
                  <span>${episode.air_date || 'TBA'}</span>
                  <span class="mx-2">•</span>
                  <span>${episode.runtime ? `${episode.runtime} min` : 'N/A'}</span>
                </div>
                <p class="mt-2">${this.escapeHTML(episode.overview || 'No overview available.')}</p>
                <button class="btn btn-sm btn-primary btn-watch-episode" data-tv-id="${tvId}" data-season="${seasonNumber}" data-episode="${episode.episode_number}">
                  <i class="fas fa-play"></i> Watch Episode
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
      
      episodesContainer.innerHTML = episodesHTML;
      
      // Add event listeners to watch episode buttons
      episodesContainer.querySelectorAll('.btn-watch-episode').forEach(btn => {
        btn.addEventListener('click', (e) => this.handleWatchEpisodeClick(e));
      });
    } else {
      episodesContainer.innerHTML = '<div class="alert alert-info">Failed to load episodes for this season.</div>';
    }
  }
  
  renderPlayerPage(mediaType, id, title, season = null, episode = null) {
    this.updateActiveNavLink(null);
    this.state.currentView = 'player';

    console.log('Rendering player with:', { mediaType, id, title, season, episode });

    const sourceOptions = Object.keys(this.STREAMING_SOURCES)
      .map(key => {
        const source = this.STREAMING_SOURCES[key];
        return `<option value="${key}" ${this.state.currentSource === key ? 'selected' : ''}>${source.name}</option>`;
      })
      .join('');

    const sourceQualities = this.STREAMING_SOURCES[this.state.currentSource].qualities;
    const qualityOptions = sourceQualities
      .map(quality => {
        return `<option value="${quality}" ${this.state.currentQuality === quality ? 'selected' : ''}>${quality}</option>`;
      })
      .join('');

    const sourceConfig = this.STREAMING_SOURCES[this.state.currentSource];
    const mediaIdentifier = mediaType === 'tv' && season && episode
      ? `${mediaType}-${id}-${season}-${episode}`
      : `${mediaType}-${id}`;
    let playerUrl = sourceConfig.getUrl(mediaIdentifier, this.state.currentQuality);
    console.log('Generated player URL:', playerUrl);

    const continueItem = this.state.continueWatching.find(i =>
      i.id === id && i.mediaType === mediaType &&
      (!season || (i.season === season && i.episode === episode))
    );
    if (continueItem && continueItem.time > 0) {
      playerUrl += `&t=${Math.floor(continueItem.time * 60)}`; // Convert minutes to seconds
      console.log('Resuming at time:', continueItem.time, 'URL:', playerUrl);
    }

    const playerHTML = `
      <div class="player-container">
        <div class="player-header">
          <div class="header-content">
            <a href="#" id="back-to-details" class="back-button" aria-label="Back to details">
              <i class="fas fa-arrow-left"></i>
              <span>Back to ${this.escapeHTML(title)}</span>
            </a>
            <h1 class="player-title">
              ${this.escapeHTML(title)}
              ${mediaType === 'tv' && season !== null ? ` - S${season} E${episode}` : ''}
            </h1>
            <button id="save-progress" class="btn btn-sm btn-secondary">Save Progress</button>
          </div>
        </div>
        <div class="video-container">
          <iframe 
            src="${playerUrl}" 
            frameborder="0" 
            allowfullscreen
            allow="autoplay; encrypted-media; fullscreen"
            class="video-player"
            id="video-player"
          ></iframe>
          <div class="error-message" id="error-message">
            This media is unavailable at the moment.
          </div>
          <div class="player-controls-overlay" id="player-controls-overlay">
            <div class="control-group">
              <label for="source-select">Source:</label>
              <select id="source-select" class="control-select">${sourceOptions}</select>
            </div>
            <div class="control-group">
              <label for="quality-select">Quality:</label>
              <select id="quality-select" class="control-select">${qualityOptions}</select>
            </div>
          </div>
        </div>
      </div>
    `;

    if (this.mainContent) {
      this.mainContent.innerHTML = playerHTML;

      const backButton = document.getElementById('back-to-details');
      const iframe = document.getElementById('video-player');
      const errorMessage = document.getElementById('error-message');
      const sourceSelect = document.getElementById('source-select');
      const qualitySelect = document.getElementById('quality-select');
      const controlsOverlay = document.getElementById('player-controls-overlay');
      const saveProgressBtn = document.getElementById('save-progress');

      if (backButton) {
        backButton.addEventListener('click', (e) => {
          e.preventDefault();
          console.log('Back button clicked, saving playback');
          this.savePlaybackPosition(mediaType, id, title, season, episode);
          this.renderMediaDetails(mediaType, id);
        });
      }

      if (saveProgressBtn) {
        saveProgressBtn.addEventListener('click', () => {
          this.savePlaybackPosition(mediaType, id, title, season, episode);
          this.showToast('Progress saved!', 'success');
        });
      }

      if (sourceSelect) {
        sourceSelect.addEventListener('change', (e) => {
          this.state.currentSource = e.target.value;
          const newSourceQualities = this.STREAMING_SOURCES[this.state.currentSource].qualities;
          qualitySelect.innerHTML = newSourceQualities.map(quality => `<option value="${quality}">${quality}</option>`).join('');
          this.state.currentQuality = newSourceQualities[0];
          qualitySelect.value = this.state.currentQuality;
          this.renderPlayerPage(mediaType, id, title, season, episode);
        });
      }

      if (qualitySelect) {
        qualitySelect.addEventListener('change', (e) => {
          this.state.currentQuality = e.target.value;
          this.renderPlayerPage(mediaType, id, title, season, episode);
        });
      }

      if (iframe && errorMessage) {
        iframe.addEventListener('error', () => {
          errorMessage.style.display = 'block';
          this.showToast('Failed to load video. Trying next source...', 'warning');
          this.tryNextSource(mediaType, id, title, season, episode);
        });
        iframe.addEventListener('load', () => {
          errorMessage.style.display = 'none';
          console.log('Iframe loaded successfully');
          this.trackPlayback(mediaType, id, title, season, episode);
        });
      }

      if (controlsOverlay) {
        const videoContainer = controlsOverlay.closest('.video-container');
        videoContainer.addEventListener('mouseenter', () => {
          controlsOverlay.style.opacity = '1';
        });
        videoContainer.addEventListener('mouseleave', () => {
          controlsOverlay.style.opacity = '0';
        });
      }
    } else {
      console.error('Cannot render player page: mainContent element not found');
    }
  }

  trackPlayback(mediaType, id, title, season, episode) {
    console.log('Starting playback tracking for:', { mediaType, id, title, season, episode });

    const iframe = document.getElementById('video-player');
    if (!iframe) {
      console.error('No video-player iframe found');
      return;
    }

    const continueItem = this.state.continueWatching.find(i =>
      i.id === id && i.mediaType === mediaType &&
      (!season || (i.season === season && i.episode === episode))
    );
    let currentTime = continueItem?.time || 0;
    let duration = continueItem?.duration || (mediaType === 'movie' ? 120 : 45);

    // Fetch duration from TMDB if not already saved
    if (!continueItem?.duration) {
      this.fetchMediaDetails(mediaType, id).then(data => {
        duration = mediaType === 'movie' 
          ? data.runtime || 120 
          : (data.seasons?.find(s => s.season_number == season)?.episodes?.find(e => e.episode_number == episode)?.runtime || 45);
        continueItem.duration = duration;
        localStorage.setItem('continueWatching', JSON.stringify(this.state.continueWatching));
      }).catch(err => {
        console.error('Failed to fetch duration:', err);
        duration = mediaType === 'movie' ? 120 : 45; // Fallback
      });
    }

    this.state.currentPlayback = { mediaType, id, title, season, episode, time: currentTime, duration };
    console.log('Initialized currentPlayback:', this.state.currentPlayback);

    const interval = setInterval(() => {
      currentTime += 0.08333; // Increment by 5 seconds (0.08333 minutes) per 5-second interval
      this.state.currentPlayback.time = Math.min(currentTime, duration);
      console.log('Updated playback time:', this.state.currentPlayback);
      this.savePlaybackPosition(mediaType, id, title, season, episode);
    }, 5000); // Update every 5 seconds

    const cleanup = () => {
      clearInterval(interval);
      this.savePlaybackPosition(mediaType, id, title, season, episode);
      console.log('Playback tracking stopped');
    };

    const backButton = document.getElementById('back-to-details');
    if (backButton) {
      backButton.removeEventListener('click', cleanup);
      backButton.addEventListener('click', cleanup, { once: true });
    }
    window.removeEventListener('beforeunload', cleanup);
    window.addEventListener('beforeunload', cleanup, { once: true });
  }

 startFallbackTimer(mediaType, id, title, season, episode) {
   let simulatedTime = 0;
   const interval = setInterval(() => {
     simulatedTime += 1;
     this.state.currentPlayback = { mediaType, id, title, season, episode, time: simulatedTime };
     console.log('Fallback playback:', this.state.currentPlayback);
   }, 60000);
 
   // Cleanup on exit
   const backButton = document.getElementById('back-to-details');
   if (backButton) {
     backButton.addEventListener('click', () => {
       clearInterval(interval);
       console.log('Timer stopped on back button');
     });
   }
   window.addEventListener('beforeunload', () => {
     clearInterval(interval);
     console.log('Timer stopped on page unload');
   });
 }
 
 // New method to save playback position
 savePlaybackPosition(mediaType, id, title, season, episode) {
    if (!mediaType || !id || !title) {
      console.warn('Invalid playback data:', { mediaType, id, title, season, episode });
      return;
    }

    const playbackTime = this.state.currentPlayback?.time || 0;
    const duration = this.state.currentPlayback?.duration || (mediaType === 'movie' ? 120 : 45);
    const posterPath = this.state.currentMedia?.poster_path || '/no-poster.jpg';

    // Remove if less than 1 minute watched or 100% completed
    if (playbackTime < 1 || (playbackTime >= duration)) {
      this.state.continueWatching = this.state.continueWatching.filter(item =>
        !(item.id === id && item.mediaType === mediaType &&
          (!season || (item.season === season && item.episode === episode)))
      );
    } else {
      const playbackItem = {
        mediaType,
        id,
        title,
        season: season || null,
        episode: episode || null,
        time: playbackTime,
        duration,
        poster_path: posterPath
      };

      const existingIndex = this.state.continueWatching.findIndex(item =>
        item.id === id && item.mediaType === mediaType &&
        (!season || (item.season === season && item.episode === episode))
      );

      if (existingIndex > -1) {
        this.state.continueWatching[existingIndex] = playbackItem;
      } else {
        this.state.continueWatching.push(playbackItem);
        if (this.state.continueWatching.length > 10) {
          this.state.continueWatching = this.state.continueWatching.slice(0, 10);
        }
      }
    }

    localStorage.setItem('continueWatching', JSON.stringify(this.state.continueWatching));
    console.log('Saved continueWatching:', this.state.continueWatching);
  }

  renderHomePage() {
    this.updateActiveNavLink('home-link');
    this.state.currentView = 'home';
    this.state.currentPage = 1;

    const heroHTML = `
      <section class="hero">
        <div class="container">
          <div class="row">
            <div class="col-lg-8 col-md-10 mx-auto text-center">
              <h1>Discover Your Next Favorite</h1>
              <p>Explore thousands of movies and TV shows. Watch them online instantly.</p>
              <div class="search-container">
                <input type="text" class="search-input" id="search-input" placeholder="Search for movies, TV shows, actors...">
                <button class="search-btn" id="search-btn">Search</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;

    const continueWatchingHTML = this.state.continueWatching.length > 0 ? `
      <section class="continue-watching py-4">
        <div class="container">
          <h2 class="section-title">Continue Watching</h2>
          <div class="continue-watching-scroll">
            ${this.state.continueWatching.map(item => {
              const imageUrl = `${this.TMDB_IMAGE_URL}/w200${item.poster_path || '/no-poster.jpg'}`;
              const progress = Math.min((item.time / (item.duration || (item.mediaType === 'movie' ? 120 : 45))) * 100, 100);
              return `
                <div class="continue-watching-item" 
                  data-id="${item.id}" 
                  data-type="${item.mediaType}" 
                  ${item.season ? `data-season="${item.season}" data-episode="${item.episode}"` : ''}>
                  <div class="media-card-horizontal">
                    <div class="media-card-img-wtch">
                      <img src="${imageUrl}" alt="${this.escapeHTML(item.title)}">
                      <div class="progress-bar" style="width: ${progress}%"></div>
                      <button class="play-overlay">
                        <i class="fas fa-play"></i>
                      </button>
                      <button class="remove-overlay">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                    <div class="media-card-body">
                      <h5>${this.escapeHTML(item.title)}</h5>
                      <p>${item.season ? `S${item.season} E${item.episode}` : ''} • ${Math.floor(item.time)} min watched of ${item.duration || (item.mediaType === 'movie' ? 120 : 45)} min</p>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </section>
    ` : '<p>No continue watching items yet.</p>';

    const streamingPlatformsHTML = `
      <section class="streaming-platforms py-4">
        <div class="container">
          <h2 class="section-title">Streaming Platforms</h2>
          <div class="platforms-grid">
            ${this.streamingNetworks.map(network => `
              <div class="platform-item" data-network-id="${network.id}" data-network-name="${network.name}">
                <img src="${network.logo}" alt="${network.name} logo" class="platform-logo">
                <div class="platform-overlay">
                  <span>${network.name}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;

    const contentHTML = `
      <div class="container">
        <section class="trending-section mb-5">
          <h2 class="section-title">Trending Now</h2>
          <div class="row" id="trending-media">
            <div class="loader"><div class="spinner"></div></div>
          </div>
        </section>
        <section class="popular-movies-section mb-5">
          <h2 class="section-title">Popular Movies</h2>
          <div class="row" id="popular-movies">
            <div class="loader"><div class="spinner"></div></div>
          </div>
        </section>
        <section class="popular-tv-section mb-5">
          <h2 class="section-title">Popular TV Shows</h2>
          <div class="row" id="popular-tv">
            <div class="loader"><div class="spinner"></div></div>
          </div>
        </section>
      </div>
    `;

    if (this.mainContent) {
      this.mainContent.innerHTML = heroHTML + continueWatchingHTML + streamingPlatformsHTML + contentHTML;

      document.querySelectorAll('.continue-watching-item').forEach(item => {
        item.addEventListener('click', () => {
          const { id, type, season, episode } = item.dataset;
          this.resumePlayback(type, id, item.querySelector('h5').textContent, season, episode);
        });

        const removeBtn = item.querySelector('.remove-overlay');
        if (removeBtn) {
          removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const { id, type, season, episode } = item.dataset;
            this.removeContinueWatchingItem(id, type, season, episode);
            this.renderHomePage();
          });
        }
      });

      document.querySelectorAll('.platform-item').forEach(item => {
        item.addEventListener('click', () => {
          const networkId = item.dataset.networkId;
          const networkName = item.dataset.networkName;
          this.renderNetworkDetails(networkId, networkName);
        });
      });

      const searchBtn = document.getElementById('search-btn');
      const searchInput = document.getElementById('search-input');
      if (searchBtn) searchBtn.addEventListener('click', () => this.handleSearch());
      if (searchInput) searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.handleSearch();
      });

      this.loadHomepageData();
    } else {
      console.error('Cannot render home page: mainContent element not found');
    }
  }

  async renderNetworkDetails(networkId, networkName) {
  this.updateActiveNavLink(null);
  this.state.currentView = 'network-details';
  this.state.currentNetwork = { id: networkId, name: networkName };

  const placeholderHTML = `
    <div class="container">
      <div class="loader my-5"><div class="spinner"></div></div>
    </div>
  `;

  if (this.mainContent) {
    this.mainContent.innerHTML = placeholderHTML;

    const movies = await this.fetchFromTMDB('/discover/movie', { with_networks: networkId, sort_by: 'popularity.desc', region: 'US' });
    const series = await this.fetchFromTMDB('/discover/tv', { with_networks: networkId, sort_by: 'popularity.desc', region: 'US' });

    if (movies && series) {
      const networkLogo = this.streamingNetworks.find(n => n.id == networkId)?.logo || '';
      const heroHTML = `
        <section class="network-hero">
          <div class="container">
            <div class="row align-items-center py-5">
              <div class="col-md-2">
                <img src="${networkLogo}" alt="${networkName} logo" class="network-logo-hero">
              </div>
              <div class="col-md-10">
                <h1 class="text-white">${this.escapeHTML(networkName)}</h1>
                <p class="text-secondary">Explore movies and series available on ${this.escapeHTML(networkName)}.</p>
              </div>
            </div>
          </div>
        </section>
      `;

      const contentHTML = `
        <div class="container py-4">
          ${movies.results?.length > 0 ? `
            <section class="network-movies mb-5">
              <h2 class="section-title">Movies on ${this.escapeHTML(networkName)}</h2>
              <div class="row">
                ${movies.results.slice(0, 8).map(item => this.createMediaCard(item, 'movie')).join('')}
              </div>
            </section>
          ` : `
            <section class="network-movies mb-5">
              <p>No movies available from ${this.escapeHTML(networkName)} at this time. This may be due to limited data or regional restrictions. Try another network.</p>
            </section>
          `}
          ${series.results?.length > 0 ? `
            <section class="network-series mb-5">
              <h2 class="section-title">Series on ${this.escapeHTML(networkName)}</h2>
              <div class="row">
                ${series.results.slice(0, 8).map(item => this.createMediaCard(item, 'tv')).join('')}
              </div>
            </section>
          ` : `
            <section class="network-series mb-5">
              <p>No series available from ${this.escapeHTML(networkName)} at this time. This may be due to limited data or regional restrictions. Try another network.</p>
            </section>
          `}
        </div>
      `;

      this.mainContent.innerHTML = heroHTML + contentHTML;

      document.querySelectorAll('.btn-watch').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const { mediaId, mediaType } = e.target.closest('.btn-watch').dataset;
          this.handleWatchClick({ target: e.target.closest('.btn-watch'), mediaId, mediaType });
        });
      });

      document.querySelectorAll('.btn-details').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const { mediaId, mediaType } = e.target.closest('.btn-details').dataset;
          this.renderMediaDetails(mediaType, mediaId);
        });
      });
    } else {
      this.mainContent.innerHTML = `
        <div class="container">
          <div class="alert alert-danger my-5">Failed to load content for ${this.escapeHTML(networkName)}. Please try again later or check your internet connection.</div>
        </div>
      `;
    }
  } else {
    console.error('Cannot render network details: mainContent element not found');
  }
}

 
  removeContinueWatchingItem(id, mediaType, season, episode) {
    this.state.continueWatching = this.state.continueWatching.filter(item =>
      !(item.id === id && item.mediaType === mediaType &&
        (!season || (item.season === season && item.episode === episode)))
    );
    localStorage.setItem('continueWatching', JSON.stringify(this.state.continueWatching));
    console.log('Removed from continueWatching:', this.state.continueWatching);
    this.showToast('Removed from Continue Watching', 'info');
  }

   async loadHomepageData() {
     // Fetch trending media
     const trendingData = await this.fetchTrending();
     if (trendingData && trendingData.results) {
       this.renderMediaCards(trendingData.results.slice(0, 8) || [], 'trending-media');
     }
     
     // Fetch popular movies
     const popularMovies = await this.fetchPopularMovies();
     if (popularMovies && popularMovies.results) {
       this.renderMediaCards(popularMovies.results.slice(0, 8) || [], 'popular-movies');
     }
     
     // Fetch popular TV shows
     const popularTV = await this.fetchPopularTVShows();
     if (popularTV && popularTV.results) {
       this.renderMediaCards(popularTV.results.slice(0, 8) || [], 'popular-tv');
     }
   }
 // New method to resume playback
resumePlayback(mediaType, id, title, season, episode) {
    console.log('Resuming playback with:', { mediaType, id, title, season, episode });

    season = season && season !== 'undefined' ? season : null;
    episode = episode && episode !== 'undefined' ? episode : null;

    const item = this.state.continueWatching.find(i =>
      i.id === id && i.mediaType === mediaType &&
      (!season || (i.season === season && i.episode === episode))
    );

    if (item) {
      this.renderPlayerPage(mediaType, id, title, season, episode);
    } else {
      console.error('No matching item found in continueWatching:', { mediaType, id, title, season, episode });
      this.showToast('Item not found. Starting from beginning...', 'warning');
      this.renderPlayerPage(mediaType, id, title, season, episode);
    }
  }
 
 tryNextSource(mediaType, id, title, season, episode) {
   const sources = Object.keys(this.STREAMING_SOURCES);
   const currentIndex = sources.indexOf(this.state.currentSource);
   const nextIndex = (currentIndex + 1) % sources.length;
   
   if (nextIndex !== currentIndex) {
     this.state.currentSource = sources[nextIndex];
     this.state.currentQuality = this.STREAMING_SOURCES[this.state.currentSource].qualities[0];
     this.renderPlayerPage(mediaType, id, title, season, episode);
   } else {
     this.showToast('No working streaming sources available.', 'danger');
   }
 }
 
  // Utility Functions
  updateActiveNavLink(linkId) {
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });
    
    // Add active class to specified link if provided
    if (linkId) {
      const activeLink = document.getElementById(linkId);
      if (activeLink) {
        activeLink.classList.add('active');
      }
    }
  }
  
  renderPagination(containerId, loadFunction) {
    const paginationContainer = document.getElementById(containerId);
    if (!paginationContainer) {
      console.error(`Pagination container #${containerId} not found`);
      return;
    }
    
    // Don't render pagination if there's only one page
    if (this.state.totalPages <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }
    
    // Determine page range to display
    // Determine page range to display
  const totalPages = this.state.totalPages;
  const currentPage = this.state.currentPage;
  
  // Calculate start and end page numbers
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);
  
  // Adjust start and end to always show 5 pages when possible
  if (endPage - startPage < 4) {
    if (startPage === 1) {
      endPage = Math.min(startPage + 4, totalPages);
    } else if (endPage === totalPages) {
      startPage = Math.max(endPage - 4, 1);
    }
  }
  
  // Build pagination HTML
  let paginationHTML = '';
  
  // Previous button
  paginationHTML += `
    <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Previous">
        <span aria-hidden="true">&laquo;</span>
      </a>
    </li>
  `;
  
  // First page
  if (startPage > 1) {
    paginationHTML += `
      <li class="page-item">
        <a class="page-link" href="#" data-page="1">1</a>
      </li>
    `;
    
    if (startPage > 2) {
      paginationHTML += `
        <li class="page-item disabled">
          <a class="page-link" href="#">...</a>
        </li>
      `;
    }
  }
  
  // Page numbers
  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
      <li class="page-item ${i === currentPage ? 'active' : ''}">
        <a class="page-link" href="#" data-page="${i}">${i}</a>
      </li>
    `;
  }
  
  // Last page
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      paginationHTML += `
        <li class="page-item disabled">
          <a class="page-link" href="#">...</a>
        </li>
      `;
    }
    
    paginationHTML += `
      <li class="page-item">
        <a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a>
      </li>
    `;
  }
  
  // Next button
  paginationHTML += `
    <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Next">
        <span aria-hidden="true">&raquo;</span>
      </a>
    </li>
  `;
  
  // Set pagination HTML
  paginationContainer.innerHTML = paginationHTML;
  
  // Add event listeners to pagination links
  paginationContainer.querySelectorAll('.page-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const page = parseInt(e.target.closest('.page-link').dataset.page);
      if (page && page !== this.state.currentPage && page >= 1 && page <= totalPages) {
        this.state.currentPage = page;
        loadFunction();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
 }
 
 createMediaCard(mediaItem, mediaType) {
    const posterPath = mediaItem.poster_path
      ? `${this.TMDB_IMAGE_URL}/w500${mediaItem.poster_path}`
      : 'img/no-poster.jpg';
  
    const title = mediaItem.title || mediaItem.name || 'Unknown Title';
    const year = mediaItem.release_date || mediaItem.first_air_date || '';
    const yearText = year ? `(${year.substring(0, 4)})` : '';
  
    return `
      <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
        <div class="media-card">
          <div class="media-card-img">
            <img src="${posterPath}" alt="${this.escapeHTML(title)}" class="img-fluid">
            <div class="media-card-overlay">
              <div class="media-card-buttons">
                <button class="btn btn-primary btn-sm btn-watch" data-media-id="${mediaItem.id}" data-media-type="${mediaType}">
                  <i class="fas fa-play"></i> Watch
                </button>
                <button class="btn btn-outline-light btn-sm btn-details" data-media-id="${mediaItem.id}" data-media-type="${mediaType}">
                  <i class="fas fa-info-circle"></i> Details
                </button>
              </div>
            </div>
          </div>
          <div class="media-card-body">
            <h5 class="media-card-title" title="${this.escapeHTML(title)}">${this.escapeHTML(title)} ${yearText}</h5>
            <div class="media-card-meta">
              ${mediaItem.vote_average ? `
                <div class="media-card-rating">
                  <i class="fas fa-star"></i> ${(mediaItem.vote_average / 2).toFixed(1)}
                </div>
              ` : ''}
              <div class="media-card-type">${mediaType === 'movie' ? 'Movie' : 'TV Show'}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  handleWatchClick(event) {
    const { mediaId, mediaType } = event.target.closest('.btn-watch').dataset;
    console.log(`Watch clicked for ${mediaType} with ID ${mediaId}`);
    this.renderPlayerPage(mediaType, mediaId, event.target.closest('.media-card').querySelector('.media-card-title').textContent);
  }
 
 
 
 handleWatchEpisodeClick(e) {
  e.preventDefault();
  const tvId = e.target.closest('.btn-watch-episode').dataset.tvId;
  const season = e.target.closest('.btn-watch-episode').dataset.season;
  const episode = e.target.closest('.btn-watch-episode').dataset.episode;
  
  // Render player for specific episode
  this.renderPlayerPage('tv', tvId, this.state.currentMedia.name, season, episode);
 }
 
 handleSearch() {
  const searchInput = document.getElementById('search-input');
  if (searchInput && searchInput.value.trim() !== '') {
    this.renderSearchResults(searchInput.value.trim());
  }
 }
 
 showToast(message, type = 'info') {
  const toastContainer = document.getElementById('toast-container');
  
  // Create toast container if it doesn't exist
  if (!toastContainer) {
    const newToastContainer = document.createElement('div');
    newToastContainer.id = 'toast-container';
    document.body.appendChild(newToastContainer);
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerText = message;
  
  // Add toast to container
  document.getElementById('toast-container').appendChild(toast);
  
  // Remove toast after animation
  setTimeout(() => {
    toast.classList.add('toast-hide');
    setTimeout(() => toast.remove(), 500);
  }, 3000);
 }
 
 escapeHTML(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
 }
 }
 
 // Initialize the app
 const cineStream = new CineStream();
