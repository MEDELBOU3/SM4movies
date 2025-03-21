  // TMDB API Configuration
const TMDB_API_KEY = '431fb541e27bceeb9db2f4cab69b54e1';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

// Image sizes
const POSTER_SIZE = 'w500';
const BACKDROP_SIZE = 'original';

// Function to fetch data from TMDB API
async function fetchFromTMDB(endpoint, params = {}) {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  
  // Add additional parameters
  Object.keys(params).forEach(key => {
    url.searchParams.append(key, params[key]);
  });
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching data from TMDB:', error);
    return null;
  }
}

// Function to get hero backgrounds (mix of movies and TV shows)
async function getHeroBackgrounds() {
  // Get popular movies
  const movieData = await fetchFromTMDB('/movie/popular', { page: 1 });
  // Get popular TV shows
  const tvData = await fetchFromTMDB('/tv/popular', { page: 1 });
  
  let backgrounds = [];
  
  if (movieData && movieData.results) {
    // Filter movies with good backdrop images
    const movieBackgrounds = movieData.results
      .filter(movie => movie.backdrop_path)
      .map(movie => ({
        id: movie.id,
        type: 'movie',
        title: movie.title,
        backdrop_path: movie.backdrop_path,
        overview: movie.overview,
        vote_average: movie.vote_average
      }));
    backgrounds = backgrounds.concat(movieBackgrounds);
  }
  
  if (tvData && tvData.results) {
    // Filter TV shows with good backdrop images
    const tvBackgrounds = tvData.results
      .filter(show => show.backdrop_path)
      .map(show => ({
        id: show.id,
        type: 'tv',
        title: show.name,
        backdrop_path: show.backdrop_path,
        overview: show.overview,
        vote_average: show.vote_average
      }));
    backgrounds = backgrounds.concat(tvBackgrounds);
  }
  
  // Shuffle the array to mix movies and TV shows
  backgrounds.sort(() => Math.random() - 0.5);
  
  return backgrounds.slice(0, 5); // Return 5 random backgrounds
}

// Function to get featured title (for the hero section)
async function getFeaturedTitle() {
  // Get from either trending movies or trending TV shows
  const useTVShow = Math.random() > 0.5;
  
  if (useTVShow) {
    const data = await fetchFromTMDB('/trending/tv/day');
    if (data && data.results && data.results.length > 0) {
      const show = data.results[0];
      return {
        id: show.id,
        type: 'tv',
        title: show.name,
        backdrop_path: show.backdrop_path,
        overview: show.overview,
        vote_average: show.vote_average
      };
    }
  } else {
    const data = await fetchFromTMDB('/trending/movie/day');
    if (data && data.results && data.results.length > 0) {
      const movie = data.results[0];
      return {
        id: movie.id,
        type: 'movie',
        title: movie.title,
        backdrop_path: movie.backdrop_path,
        overview: movie.overview,
        vote_average: movie.vote_average
      };
    }
  }
  
  return null;
}

// Function to get top picks
async function getTopPicks() {
  const data = await fetchFromTMDB('/movie/top_rated', { page: 1 });
  if (data && data.results) {
    // Return top 8 movies
    return data.results.slice(0, 8);
  }
  return [];
}

// Function to get trending movies
async function getTrendingMovies() {
  const data = await fetchFromTMDB('/trending/movie/week');
  if (data && data.results) {
    // Return top 3 trending movies
    return data.results.slice(0, 3);
  }
  return [];
}

// Function to get award-winning movies (using top rated as a proxy)
async function getAwardWinningMovies() {
  const data = await fetchFromTMDB('/movie/top_rated', { page: 2 });
  if (data && data.results) {
    // Return different set of top rated movies
    return data.results.slice(0, 3);
  }
  return [];
}

// Function to get movie genre name from ID
async function getGenreName(genreId) {
  // Cache genres to avoid multiple API calls
  if (!window.movieGenres) {
    const data = await fetchFromTMDB('/genre/movie/list');
    if (data && data.genres) {
      window.movieGenres = data.genres;
    } else {
      window.movieGenres = [];
    }
  }
  
  const genre = window.movieGenres.find(g => g.id === genreId);
  return genre ? genre.name : 'Unknown';
}

// Create rotating hero backgrounds
async function createRotatingHeroBackgrounds() {
  const backgrounds = await getHeroBackgrounds();
  if (!backgrounds || backgrounds.length === 0) return;
  
  const heroSection = document.getElementById('hero');
  
  // Remove existing background image
  const existingBg = heroSection.querySelector('.hero-bg');
  if (existingBg) {
    existingBg.remove();
  }
  
  // Create slideshow container
  const slideshowContainer = document.createElement('div');
  slideshowContainer.className = 'hero-slideshow';
  heroSection.insertAdjacentElement('afterbegin', slideshowContainer);
  
  // Add all background images to the slideshow
  backgrounds.forEach((item, index) => {
    const bgImage = document.createElement('img');
    bgImage.src = `${TMDB_IMAGE_BASE_URL}${BACKDROP_SIZE}${item.backdrop_path}`;
    bgImage.alt = `${item.title} backdrop`;
    bgImage.className = 'hero-bg';
    bgImage.setAttribute('data-title', item.title);
    bgImage.setAttribute('data-overview', item.overview);
    bgImage.setAttribute('data-rating', item.vote_average);
    bgImage.setAttribute('data-type', item.type);
    
    // Only show the first image initially
    if (index === 0) {
      bgImage.classList.add('active');
    }
    
    slideshowContainer.appendChild(bgImage);
  });
  
  // Update hero content with first background's info
  updateHeroContent(backgrounds[0]);
  
  // Set up rotation
  let currentBgIndex = 0;
  
  setInterval(() => {
    const heroImages = document.querySelectorAll('.hero-bg');
    if (!heroImages.length) return;
    
    // Hide current image
    heroImages[currentBgIndex].classList.remove('active');
    
    // Move to next image
    currentBgIndex = (currentBgIndex + 1) % heroImages.length;
    
    // Show new image
    heroImages[currentBgIndex].classList.add('active');
    
    // Update hero content with new background's info
    const nextItem = backgrounds[currentBgIndex];
    updateHeroContent(nextItem);
  }, 8000); // Change every 8 seconds
}

// Update hero content based on the active background
function updateHeroContent(item) {
  const heroTitle = document.querySelector('.hero-title');
  const heroSubtitle = document.querySelector('.hero-subtitle');
  const heroButtons = document.querySelector('.hero-cta');

  if (heroTitle && heroSubtitle && heroButtons) {
    // Update title with fixed height container
    heroTitle.innerHTML = `Premium <span>${item.title}</span>`;
    
    // Smart truncate subtitle with max lines
    let overview = item.overview;
    const maxLength = 150;
    if (overview.length > maxLength) {
      overview = overview.substring(0, maxLength) + '...';
    }
    heroSubtitle.textContent = overview;

    // Update buttons with consistent sizing
    heroButtons.innerHTML = `
      <a href="movie.html" class="hero-btn btn-primary">
        Start Streaming ${item.type === 'movie' ? 'Movie' : 'Show'}
      </a>
      <a href="movies.html?mediaType=${item.type}&id=${item.id}" class="hero-btn btn-secondary">
        More Info
      </a>
    `;
  }
}

// Update top picks section with real movie data
async function updateTopPicks() {
  const topPicks = await getTopPicks();
  const topPicksContainer = document.getElementById('topPicks');
  
  if (topPicks.length > 0) {
    topPicksContainer.innerHTML = ''; // Clear existing content
    
    for (let i = 0; i < topPicks.length; i++) {
      const movie = topPicks[i];
      const genreName = movie.genre_ids && movie.genre_ids.length > 0 ? 
                       await getGenreName(movie.genre_ids[0]) : 'Drama';
      
      const card = document.createElement('div');
      card.className = 'top-pick-card';
      card.setAttribute('data-aos', 'fade-up');
      card.setAttribute('data-aos-delay', 100 + (i * 50));
      
      card.innerHTML = `
        <div class="top-pick-image">
          <img src="${TMDB_IMAGE_BASE_URL}${POSTER_SIZE}${movie.poster_path}" alt="${movie.title}">
          <div class="top-pick-rating">
            <i class="fas fa-star"></i> ${movie.vote_average.toFixed(1)}
          </div>
        </div>
        <div class="top-pick-info">
          <h3 class="top-pick-title">${movie.title}</h3>
          <div class="top-pick-meta">
            <div class="top-pick-genre"><span>${genreName}</span></div>
            <div>${new Date(movie.release_date).getFullYear()}</div>
          </div>
        </div>
      `;
      
      topPicksContainer.appendChild(card);
    }
  }
}

// Update watchlist section with real movie data
async function updateWatchlistSection() {
  const trendingMovies = await getTrendingMovies();
  const awardWinningMovies = await getAwardWinningMovies();
  
  // Update Trending Now column
  const trendingCol = document.querySelector('.watchlist-col:nth-child(1)');
  if (trendingMovies.length > 0) {
    // Remove existing movie items
    trendingCol.querySelectorAll('.movie-item').forEach(item => item.remove());
    
    for (const movie of trendingMovies) {
      const genreName = movie.genre_ids && movie.genre_ids.length > 0 ? 
                       await getGenreName(movie.genre_ids[0]) : 'Drama';
      
      const movieItem = document.createElement('div');
      movieItem.className = 'movie-item';
      movieItem.setAttribute('draggable', 'true');
      
      movieItem.innerHTML = `
        <img src="${TMDB_IMAGE_BASE_URL}w185${movie.poster_path}" alt="${movie.title} Poster">
        <div class="movie-info">
          <h4>${movie.title}</h4>
          <div class="movie-meta">
            <span>${genreName}</span>
            <div class="rating">
              <i class="fas fa-star" style="color: gold;"></i>
              <span>${movie.vote_average.toFixed(1)}</span>
            </div>
          </div>
        </div>
      `;
      
      trendingCol.appendChild(movieItem);
      
      // Add drag events to new items
      movieItem.addEventListener('dragstart', function(e) {
        e.dataTransfer.setData('text/plain', 'dragging');
        this.classList.add('dragging');
      });
      
      movieItem.addEventListener('dragend', function() {
        this.classList.remove('dragging');
      });
    }
  }
  
  // Update Award Winners column
  const awardsCol = document.querySelector('.watchlist-col:nth-child(2)');
  if (awardWinningMovies.length > 0) {
    // Remove existing movie items
    awardsCol.querySelectorAll('.movie-item').forEach(item => item.remove());
    
    for (const movie of awardWinningMovies) {
      const genreName = movie.genre_ids && movie.genre_ids.length > 0 ? 
                       await getGenreName(movie.genre_ids[0]) : 'Drama';
      
      const movieItem = document.createElement('div');
      movieItem.className = 'movie-item';
      movieItem.setAttribute('draggable', 'true');
      
      movieItem.innerHTML = `
        <img src="${TMDB_IMAGE_BASE_URL}w185${movie.poster_path}" alt="${movie.title} Poster">
        <div class="movie-info">
          <h4>${movie.title}</h4>
          <div class="movie-meta">
            <span>${genreName}</span>
            <div class="rating">
              <i class="fas fa-star" style="color: gold;"></i>
              <span>${movie.vote_average.toFixed(1)}</span>
            </div>
          </div>
        </div>
      `;
      
      awardsCol.appendChild(movieItem);
      
      // Add drag events to new items
      movieItem.addEventListener('dragstart', function(e) {
        e.dataTransfer.setData('text/plain', 'dragging');
        this.classList.add('dragging');
      });
      
      movieItem.addEventListener('dragend', function() {
        this.classList.remove('dragging');
      });
    }
  }
}

// Initialize everything once the DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
  // Initialize AOS Animation
  AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true
  });

  // Navbar Scroll Effect
  window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Back to Top Button
  const backToTopBtn = document.querySelector('.back-to-top');
  window.addEventListener('scroll', function() {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }
  });

  backToTopBtn.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // Drag and Drop Functionality for Watchlist
  const dropZone = document.getElementById('userWatchlist');
  
  dropZone.addEventListener('dragover', function(e) {
    e.preventDefault();
    this.classList.add('drag-over');
  });
  
  dropZone.addEventListener('dragleave', function() {
    this.classList.remove('drag-over');
  });
  
  dropZone.addEventListener('drop', function(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    
    const draggingItem = document.querySelector('.dragging');
    if (draggingItem) {
      const clonedItem = draggingItem.cloneNode(true);
      this.appendChild(clonedItem);
      
      // Remove empty watchlist message
      const emptyMessage = this.querySelector('.empty-watchlist');
      if (emptyMessage) {
        emptyMessage.remove();
      }
    }
  });

  // Update all sections with real TMDB data
  try {
    await createRotatingHeroBackgrounds();
    await updateTopPicks();
    await updateWatchlistSection();
  } catch (error) {
    console.error('Error updating content with TMDB data:', error);
  }
});
