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


