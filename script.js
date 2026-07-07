// ===================================================
//                 CONFIGURATION
// ===================================================

const API_KEY = "a1e05814";
const BASE_URL = "https://www.omdbapi.com/";

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

const navHome = document.getElementById("nav-home");
const navFavorites = document.getElementById("nav-favorites");

// =====================================
// STATE MANAGEMENT
// =====================================

let currentMovies = [];
let favorites = JSON.parse(localStorage.getItem("cineFavorites")) || [];
let currentMovieDetails = null;



console.log(`${BASE_URL}?apikey=${API_KEY}&s=batman`);
console.log(`${BASE_URL}?apikey=${API_KEY}&i=tt0372784&plot=full`);

// ================ UI STATE ================

function showState(stateName) {
  errorMsg.classList.remove("show");
  loader.classList.remove("show");
  emptyState.classList.remove("show");
  noResults.classList.remove("show");
  fetchError.classList.remove("show");

  if (stateName === "error") errorMsg.classList.add("show");
  else if (stateName === "loading") loader.classList.add("show");
  else if (stateName === "empty") emptyState.classList.add("show");
  else if (stateName === "noResults") noResults.classList.add("show");
  else if (stateName === "fetchError") fetchError.classList.add("show");
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
  searchMovies(title);
});

// -------------- movie searching --------------

async function searchMovies(title) {
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

  const posterUrl =
    // here check if movie.Poster got value which means true the check if it !== "N/A".
    movie.Poster && movie.Poster !== "N/A"
      ? movie.Poster
      : "./img/default_poster.jpg";

  //  prevent broken image icons for removed or unavailable Amazon poster URLs buy using onerror.
  const posterHTML = posterUrl
    ? `  <img
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

moviesGrid.addEventListener("click", (e) => {
  const favButton = e.target.closest(".fav-btn");

  if (!favButton) return;

  const card = favButton.closest(".movie-card");
  const movieId = card.dataset.imdbId;

  toggleFavorite(movieId, favButton);
});

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

  // Update the heart button
  favBtn.classList.toggle("active");
}

// ==================================================
//  MODAL
// ==================================================

async function fetchMovieDetails(movieId) {
  modal.classList("show");

  modalBody.innerHTML = `
  <div style="grid-column: 1 / -1; display: flex; justify-content: center; padding: 60px;">
      <div class="spinner"></div>
  </div>
`;

  try {
    const response = await fetch(`${BASE_URL}?apikey=${API_KEY}&i=${movieId}&plot=full`);
    const data = await response.json();

    if(data.Response === 'True') {
      currentMovieDetails = data;
    }
  } catch(error) {
    console.log("Detail error:", error);
  }
}
