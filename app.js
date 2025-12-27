const url =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=";
const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    "x-cg-demo-api-key": "CG-mDVVqLm5xBDjvcVq523LnAmB",
  },
};
let currentPageNumber = 1;
let coins = [];

const showShimmer = () =>
  (document.querySelector(".shimmer-container").style.display = "flex");

const hideShimmer = () =>
  (document.querySelector(".shimmer-container").style.display = "none");

async function initializePage() {
  await fetchCoins(currentPageNumber);
  renderCoins(coins, currentPageNumber, 25);
  updatePaginationControls();
}

async function fetchCoins(pageNumber) {
  try {
    showShimmer();
    const reponse = await fetch(url + pageNumber, options);
    coins = await reponse.json();
  } catch (error) {
    console.log(error);
  } finally {
    hideShimmer();
  }
}

function renderCoins(coins, pageNumber, coinsCount) {
  let startId = (pageNumber - 1) * coinsCount + 1;
  const favoriteCoins = getFavorite();
  const tableBodyElement = document.getElementById("coinsTableBody");
  tableBodyElement.innerHTML = "";
  let newRow = "";
  coins.forEach((coin, index) => {
    newRow = renderCoin(coin, index, startId++, favoriteCoins);
    attachRowEvents(newRow, coin.id);
    tableBodyElement.appendChild(newRow);
  });
}

function renderCoin(coin, index, start, favoriteCoins) {
  const isFavourite = favoriteCoins
    ? favoriteCoins.includes(coin.id)
      ? true
      : false
    : false;
  let rowEl = document.createElement("tr");

  let rowData = `<td>${start}</td>
    <td><img src=${
      coin.image
    } alt="coin image" style="width:24px;height:24px"/></td>
    <td>${coin.name}</td>
    <td>$${coin.current_price.toLocaleString()}</td>
    <td>$${coin.total_volume.toLocaleString()}</td>
    <td>$${coin.market_cap.toLocaleString()}</td>
    <td><i class="fa-solid fa-star favorite-icon ${
      isFavourite ? "favorite" : ""
    } " data-coinId=${coin.id}></i></td>`;

  rowEl.innerHTML = rowData;

  return rowEl;
}

function attachRowEvents(row, id) {
  row.addEventListener("click", (event) => {
    if (!event.target.classList.contains("favorite-icon")) {
      window.location.href = `coin.html?id=${id}`;
    }
  });
  row.querySelector(".favorite-icon").addEventListener("click", (event) => {
    event.stopPropagation();
    handleFavoriteClick(id);
  });
}

function updatePaginationControls() {
  if (currentPageNumber === 1) {
    document.getElementById("prev").disabled = true;
    document.getElementById("prev").style.backgroundColor = "#f1ecec";
    document.getElementById("prev").style.color = "black";
  } else {
    document.getElementById("prev").disabled = false;
    document.getElementById("prev").style.backgroundColor = "#df4824";
    document.getElementById("prev").style.color = "white";
  }
  if (coins.length < 25) {
    document.getElementById("next").disabled = true;
    document.getElementById("next").style.backgroundColor = "#f1ecec";
    document.getElementById("next").style.color = "black";
  } else {
    document.getElementById("next").disabled = false;
    document.getElementById("next").style.backgroundColor = "#df4824";
    document.getElementById("next").style.color = "white";
  }
}

async function handlePrevButtonClick() {
  if (currentPageNumber > 1) currentPageNumber--;
  await fetchCoins(currentPageNumber);
  renderCoins(coins, currentPageNumber, 25);
  updatePaginationControls();
}
async function handleNextButtonClick() {
  currentPageNumber++;
  await fetchCoins(currentPageNumber);
  renderCoins(coins, currentPageNumber, 25);
  updatePaginationControls();
}

function sortTable(field, order) {
  coins.sort((a, b) =>
    order === "asc" ? a[field] - b[field] : b[field] - a[field]
  );
  renderCoins(coins, currentPageNumber, 25);
}

async function handleSearchInput() {
  let searchTerm = document.getElementById("search").value;
  if (searchTerm) {
    const searchResult = await fetchSearchResult(searchTerm);
    displaySearchResult(searchResult);
  } else {
    closeSearchBox();
  }
}
async function fetchSearchResult(searchTerm) {
  const response = await fetch(
    "https://api.coingecko.com/api/v3/search?query=" + searchTerm,
    options
  );
  const result = await response.json();
  return result.coins;
}
function displaySearchResult(searchResult) {
  const searchResultBoxEl = document.getElementById("search-result");
  searchResultBoxEl.innerHTML = "";
  let ul = document.createElement("ul");
  let list = "";
  if (searchResult.length !== 0) {
    searchResult.slice(0, 10).forEach((coin) => {
      list =
        list +
        `<li data-id="${coin.id}" data-norecords='false'><img src='${coin.thumb}' alt="${coin.name}"/> <span>${coin.name}</span></li>`;
    });
  } else {
    list = "<li data-norecords='true'>No data found.</li>";
  }

  ul.innerHTML = list;

  // Attach click event to each list item
  ul.querySelectorAll("li").forEach((item) => {
    item.addEventListener("click", (event) => {
      if (event.currentTarget.dataset.norecords == "false") {
        const coinId = event.currentTarget.dataset.id; // Retrieve the coin ID from data attribute
        console.log(coinId); // Debugging purpose
        window.location.href = `coin.html?id=${coinId}`;
      }
    });
  });

  searchResultBoxEl.appendChild(ul);

  document.getElementById("search-box").style.display = "block";
}
function closeSearchBox() {
  document.getElementById("search-box").style.display = "none";
}

function getFavorite() {
  const favoriteCoins = localStorage.getItem("favoriteCoins");
  return favoriteCoins ? JSON.parse(favoriteCoins) : [];
}

function setFavorite(favoriteCoins) {
  localStorage.setItem("favoriteCoins", JSON.stringify(favoriteCoins));
}

function toggleFavorite(coinId) {
  let favoriteCoins = getFavorite() || [];
  if (favoriteCoins.includes(coinId)) {
    favoriteCoins = favoriteCoins.filter((favorite) => favorite != coinId);
  } else {
    favoriteCoins.push(coinId);
  }
  setFavorite(favoriteCoins);
}

function handleFavoriteClick(coinId) {
  toggleFavorite(coinId);
  renderCoins(coins, currentPageNumber, 25);
}

//

// addEventListener
if (window.location.href.includes("index.html")) {
  document
    .getElementById("prev")
    .addEventListener("click", handlePrevButtonClick);
  document
    .getElementById("next")
    .addEventListener("click", handleNextButtonClick);
  initializePage();

  document.getElementById("sort-price-asc").addEventListener("click", () => {
    sortTable("current_price", "asc");
  });

  document.getElementById("sort-price-desc").addEventListener("click", () => {
    sortTable("current_price", "desc");
  });

  document.getElementById("sort-vol-asc").addEventListener("click", () => {
    sortTable("total_volume", "asc");
  });

  document.getElementById("sort-vol-desc").addEventListener("click", () => {
    sortTable("total_volume", "desc");
  });

  document
    .getElementById("sort-market-cap-asc")
    .addEventListener("click", () => {
      sortTable("market_cap", "asc");
    });

  document
    .getElementById("sort-market-cap-desc")
    .addEventListener("click", () => {
      sortTable("market_cap", "desc");
    });
}

document.getElementById("search").addEventListener("input", handleSearchInput);
document
  .getElementById("search-icon")
  .addEventListener("click", handleSearchInput);
document
  .getElementById("close-search-box")
  .addEventListener("click", closeSearchBox);
