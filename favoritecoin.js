//let coins = [];
let currentPage = 1;

const getFavorites = () => {
  return JSON.parse(localStorage.getItem("favoriteCoins")) || [];
};

const fetchFavoriteCoins = async (ids) => {
  try {
    showShimmer();
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids.join(
        ","
      )}`,
      options
    );

    const fetchedCoins = await response.json();
    hideShimmer();

    return fetchedCoins;
  } catch (err) {
    console.error(err);
    hideShimmer();
  }
};

const renderFavorites = (coins) => {
  const tableBody = document.querySelector("#favorite-table tbody");
  const noFavoritesMessage = document.querySelector("#no-favorite");
  tableBody.innerHTML = "";

  if (coins.length === 0) {
    noFavoritesMessage.style.display = "block";
    return;
  } else {
    noFavoritesMessage.style.display = "none";
  }

  coins.forEach((coin, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${index + 1}</td>
            <td><img src="${coin.image}" alt="${
      coin.name
    }" width="24" height="24" /></td>
            <td>${coin.name}</td>
            <td>$${coin.current_price.toLocaleString()}</td>
            <td>$${coin.total_volume.toLocaleString()}</td>
            <td>$${coin.market_cap.toLocaleString()}</td>
        `;
    row.addEventListener("click", () => {
      window.location.href = `coin.html?id=${coin.id}`;
    });
    tableBody.appendChild(row);
  });
};

let debounceTimeout;
const debounce = (func, delay) => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(func, delay);
};

const searchFavorites = (query, coins) => {
  const filteredCoins = coins.filter((coin) =>
    coin.name.toLowerCase().includes(query.toLowerCase())
  );

  if (filteredCoins.length === 0) {
    document.getElementById("no-favorite").textContent =
      "No matching coins found. Explore and add them to your favorites.";
    document.getElementById("no-favorite").style.display = "block";
  } else {
    document.getElementById("no-favorite").style.display = "none";
  }

  renderFavorites(filteredCoins);
};

document.addEventListener("DOMContentLoaded", async () => {
  const favorites = getFavorites();
  if (favorites.length === 0) {
    renderFavorites([]);
  } else {
    coins = await fetchFavoriteCoins(favorites);
    renderFavorites(coins);

    const searchBox = document.getElementById("search-liked-coins-box");
    searchBox.addEventListener("input", () => {
      const query = searchBox.value;
      searchFavorites(query, coins);
    });
  }
});

document
  .querySelector("#sort-price-asc")
  .addEventListener("click", () => sortCoinsByPrice("asc"));
document
  .querySelector("#sort-price-desc")
  .addEventListener("click", () => sortCoinsByPrice("desc"));
document
  .querySelector("#sort-vol-asc")
  .addEventListener("click", () => sortCoinsByVolume("asc"));
document
  .querySelector("#sort-vol-desc")
  .addEventListener("click", () => sortCoinsByVolume("desc"));
document
  .querySelector("#sort-market-cap-asc")
  .addEventListener("click", () => sortCoinsByMarketCap("asc"));
document
  .querySelector("#sort-market-cap-desc")
  .addEventListener("click", () => sortCoinsByMarketCap("desc"));

const sortCoinsByPrice = (order) => {
  if (order === "asc") {
    coins.sort((a, b) => a.current_price - b.current_price);
  } else if (order === "desc") {
    coins.sort((a, b) => b.current_price - a.current_price);
  }

  renderFavorites(coins);
};

const sortCoinsByVolume = (order) => {
  if (order === "asc") {
    coins.sort((a, b) => a.total_volume - b.total_volume);
  } else if (order === "desc") {
    coins.sort((a, b) => b.total_volume - a.total_volume);
  }

  renderFavorites(coins);
};
const sortCoinsByMarketCap = (order) => {
  if (order === "asc") {
    coins.sort((a, b) => a.market_cap - b.market_cap);
  } else if (order === "desc") {
    coins.sort((a, b) => b.market_cap - a.market_cap);
  }

  renderFavorites(coins);
};
