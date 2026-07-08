// ===================================================
//                 CONFIGURATION
// ===================================================

const API_KEY = "a1e05814";
const BASE_URL = "https://www.omdbapi.com/";

function getPosterUrl(movie) {
  return movie.Poster && movie.Poster !== "N/A"
    ? movie.Poster
    : "./img/default_poster.jpg";
}

// ===================================================
//                  DOM ELEMENTS
// ===================================================

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const errorMsg = document.getElementById("error-msg");
const loader = document.getElementById("loader");
const emptyState = document.getElementById("empty-state");
const noResults = document.getElementById("no-results");
const fetchError = document.getElementById("fetch-error");
const moviesGrid = document.getElementById("movies-grid");

const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");

const homePage = document.getElementById("home-page");
const favoritesPage = document.getElementById("favorites-page");

const favoritesGrid = document.getElementById("favorites-grid");
const favEmpty = document.getElementById("fav-empty");
const favCount = document.getElementById("fav-count");

const logo = document.querySelector(".logo");
const navHome = document.getElementById("nav-home");
const navFavorites = document.getElementById("nav-favorites");

// =====================================
// STATE MANAGEMENT
// =====================================

let currentMovies = [];
let favorites = JSON.parse(localStorage.getItem("cineFavorites")) || [];
let currentMovieDetails = null;

// ================ UI STATE ================

function showState(stateName) {
  errorMsg.classList.remove("show");
  loader.classList.remove("show");
  emptyState.classList.remove("show");
  noResults.classList.remove("show");
  fetchError.classList.remove("show");
  modal.classList.remove("show");

  if (stateName === "error") errorMsg.classList.add("show");
  else if (stateName === "loading") loader.classList.add("show");
  else if (stateName === "empty") emptyState.classList.add("show");
  else if (stateName === "noResults") noResults.classList.add("show");
  else if (stateName === "fetchError") fetchError.classList.add("show");
  else if (stateName === "modal") modal.classList.add("show");
}

// ==================================================
// SEARCH FUNCTIONALITY
// ==================================================

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = searchInput.value.trim();

  if (!title) {
    showState("error");
    searchInput.focus();
    return;
  }

  moviesGrid.innerHTML = "";
  searchMovie(title);
});

// -------------- movie searching --------------

async function searchMovie(title) {
  showState("loading");
  try {
    const response = await fetch(
      `${BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(title)}&type=movie`,
    );

    if (!response.ok) throw new Error("Failed to fetch data");

    const data = await response.json();

    if (data.Response === "False") {
      showState("noResults");
      currentMovies = [];
      moviesGrid.innerHTML = "";
    } else {
      currentMovies = data.Search || [];
      renderMovies(currentMovies, moviesGrid);
      showState("results");
    }
  } catch (error) {
    showState("fetchError");
    currentMovies = [];
    moviesGrid.innerHTML = "";
  }
}

// -------------- display movies cards --------------

function renderMovies(movies, container) {
  container.innerHTML = ``;

  movies.forEach((movie) => {
    const isfav = favorites.some((f) => f.imdbID === movie.imdbID); //some() = true or falsE of if isfave is true so isfavorite is active
    const card = createMovieCard(movie, isfav);
    container.appendChild(card);
  });
}

// -------------- create movie card --------------

function createMovieCard(movie, isFavorite) {
  const card = document.createElement("div");
  card.classList.add("movie-card");
  card.dataset.imdbId = movie.imdbID;

  // here check if movie.Poster got value which means true the check if it !== "N/A".
  const posterUrl = getPosterUrl(movie);

  //  prevent broken image icons for removed or unavailable Amazon poster URLs buy using onerror.
  const posterHTML = posterUrl
    ? `<img
    src="${posterUrl}"
    alt="${movie.Title}"
    class="movie-poster"
    onerror="this.onerror=null; this.src='./img/default_poster.jpg';">
  `
    : `<div class="movie-poster">🎬</div>`;

  // card's HTML
  card.innerHTML = `${posterHTML}
    <button class="fav-btn ${isFavorite ? "active" : ""}" > 
        <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
    </button>
    <div class="movie-info">
        <h3 class="movie-title">${movie.Title}</h3>
        <div class="movie-meta">
            <span class="movie-year">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><path d="M16 2v4M8 2v4M3 10h18"></path></svg>
                ${movie.Year}
            </span>
        </div>
    </div>`;

  return card;
}

// ==================================================
//  TOGGLE FAVORITES
// ==================================================

function toggleFavorite(movieId, favBtn) {
  const index = favorites.findIndex((movie) => movie.imdbID === movieId);

  if (index === -1) {
    // add to favorites
    const movie = currentMovies.find((movie) => movie.imdbID === movieId);
    favorites.push(movie);
  } else {
    // remove from favorites
    favorites.splice(index, 1);
  }

  localStorage.setItem("cineFavorites", JSON.stringify(favorites));
  updateFavCount();

  // Update the heart button
  favBtn.classList.toggle("active");
}

function updateFavCount() {
  favCount.textContent = `(${favorites.length})`
}

// ==================================================
//  MODAL
// ==================================================

async function fetchMovieDetails(imdbID) {
  showState("modal");

  modalBody.innerHTML = `
  <div style="grid-column: 1 / -1; display: flex; justify-content: center; padding: 60px;">
      <div class="spinner"></div>
  </div>
`;

  try {
    const response = await fetch(
      `${BASE_URL}?apikey=${API_KEY}&i=${imdbID}&plot=full`,
    );

    if (!response.ok) throw new Error("Failed to fetch data");

    const data = await response.json();

    if (data.Response === "True") {
      currentMovieDetails = data;
      renderMovieModal(currentMovieDetails);
    }
  } catch (error) {
    console.log("Detail error:", error);
    showState("fetchError");
  }
}

moviesGrid.addEventListener("click", (e) => {
  const card = e.target.closest(".movie-card");
  if (!card) return;

  const movieId = card.dataset.imdbId;

  const favBtn = e.target.closest(".fav-btn");

  if (favBtn) {
    toggleFavorite(movieId, favBtn);// so here when the cursor taget only the fav icon it count as favorite then retun no need to display the movie's card details
    return;
  }

  fetchMovieDetails(movieId);
});


favoritesGrid.addEventListener("click", (e) => {
  const card = e.target.closest(".movie-card");
  if (!card) return;

  const movieId = card.dataset.imdbId;

  const favBtn = e.target.closest(".fav-btn");

  if (favBtn) {
    toggleFavorite(movieId, favBtn);// so here when the cursor taget only the fav icon it count as favorite then retun no need to display the movie's card details
    return;
  }

  fetchMovieDetails(movieId);
});

// -------------- render modal --------------

function renderMovieModal(movie) {
  const genres = movie.Genre ? movie.Genre.split(",") : [];
  const isFav = favorites.some((f) => f.imdbID === movie.imdbID);
  const posterUrl = getPosterUrl(movie);

  const posterHTML = posterUrl
    ? ` <img
  src="${posterUrl}"
  alt="${movie.Title}"
  class="modal-poster"
  onerror="this.onerror=null; this.src='./img/default_poster.jpg';">`
    : `<div class="modal-poster placeholder">🎬</div>`;

  modalBody.innerHTML = ` ${posterHTML}
        <div class="modal-info">
          <h2 class="modal-title">${movie.Title}</h2>
          <div class="modal-meta">
              <span class="modal-meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                  ${movie.Year}
              </span>
              <span class="modal-meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  ${movie.Runtime}
              </span>
              <span class="modal-meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                  ${movie.Rated || "N/A"}
              </span>
              <span class="modal-meta-item rating">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                   ${movie.imdbRating || "N/A"}/10
              </span>
          </div>
          <div class="modal-genres">
            ${genres.map((g) => `<span class = "genre-tag">${g}</span>`).join("")}
          </div>
          <p class="modal-plot">${movie.Plot || "No plot available."}</p>
          <div class="modal-details">
              <div class="detail-item">
                  <span class="detail-label">Director</span>
                  <span class="detail-value">${movie.Director || "N/A"}</span>
              </div>
              <div class="detail-item">
                  <span class="detail-label">Cast</span>
                  <span class="detail-value">${movie.Actors || "N/A"}</span>
              </div>
          </div>
          <button class="modal-fav-btn ${isFav ? "active" : ""}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${isFav ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            ${isFav ? "Remove from Favorites" : "Add to Favorites"} 
          </button>
        
        </div>`;
}

// close modal
modal.addEventListener("click", (event) => {
  if (
    !event ||
    event.target === modal ||
    event.target.closest(".modal-close")
  ) {
    modal.classList.remove("show");
    document.body.style.overflow = "";
    currentMovieDetails = null;
  }
});

// ==================================================
// PAGE NAVIGATION
// ==================================================

function showHome() {
  homePage.style.display = "block";
  favoritesPage.classList.remove("show");

  navHome.classList.add("active");
  navFavorites.classList.remove("active");

  document.title = "CineSearch - Movie Search App";
}

function showFavorites() {
  homePage.style.display = "none";
  favoritesPage.classList.add("show");

  navHome.classList.remove("active");
  navFavorites.classList.add("active");

  document.title = "My Favorites • CineSearch";

  renderMovies(favorites, favoritesGrid);

  favEmpty.classList.toggle("show", favorites.length === 0);
}


navHome.addEventListener("click", (e) => {
  e.preventDefault();
  showHome();
});

navFavorites.addEventListener("click", (e) => {
  e.preventDefault();
  showFavorites();
});

document.querySelector(".logo").addEventListener("click", (e) => {
  e.preventDefault();
  showHome();
});

document.addEventListener('DOMContentLoaded', () => {
  updateFavCount();

  // Check if API key is set
  if (API_KEY === 'YOUR_API_KEY_HERE') {
      console.log('%c⚠️ OMDb API Key Required', 'color: #e50914; font-size: 16px; font-weight: bold;');
      console.log('%cGet your FREE API key at: http://www.omdbapi.com/apikey.aspx', 'color: #b3b3b3;');
      console.log('%cThe app will use demo data until you add your key.', 'color: #737373;');
  }
});