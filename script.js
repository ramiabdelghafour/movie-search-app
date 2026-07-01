// ===================================================
//                 CONFIGURATION
// ===================================================

const API_KEY = "API_KEY";
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

// ================ UI STATE ================

function showState(stateName){
    errorMsg.classList.remove("show");
    loader.classList.remove("show");
    emptyState.classList.remove("show");
    noResults.classList.remove("show");

    if (stateName === "error") errorMsg.classList.add("show");
    else if (stateName === "loading") loader.classList.add("show");
    else if (stateName === "empty") emptyState.classList.add("show");
    else if (stateName === "noResults") noResults.classList.add("show");
}