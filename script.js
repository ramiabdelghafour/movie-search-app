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

  searchMovies(title);
});

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
    } else {
      currentMovies = data.Search || [];
      loader.classList.remove("show");
      //still missing rendering moviesGrid;
    }
  } catch (error) {
    console.log("Error: ", error);
    showState("fetchError");
    currentMovies = [];
  }
  console.log(currentMovies)
}