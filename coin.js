document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const coinId = urlParams.get("id");
  const addToFavBtn = document.getElementById("add-to-fav-btn");

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-cg-demo-api-key": "CG-mDVVqLm5xBDjvcVq523LnAmB",
    },
  };

  async function getCoinData() {
    try {
      showShimmer();
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}`,
        options
      );
      const data = await response.json();
      displayCoinData(data);
    } catch (error) {
      console.log(error);
    } finally {
      hideShimmer();
    }
  }

  // displaydata

  async function displayCoinData(data) {
    const coinNameEl = document.getElementById("coinName");
    const coinImageEl = document.getElementById("coinImage");
    const coinSummaryEl = document.getElementById("coinSummary");
    const coinRankEl = document.getElementById("coinRank");
    const coinCurrentPriceEl = document.getElementById("coinCurrentPrice");
    const coinMarketCapEl = document.getElementById("coinMarketCap");

    coinNameEl.textContent = data.name;
    coinImageEl.src = data.image.large;
    coinImageEl.alt = data.name;
    coinSummaryEl.textContent = data.description.en.split(".")[0] + ".";
    coinRankEl.textContent = data.market_cap_rank;
    coinCurrentPriceEl.textContent = `$${data.market_data.current_price.usd.toLocaleString()}`;
    coinMarketCapEl.textContent = `$${data.market_data.market_cap.usd.toLocaleString()}`;

    // Check if the coin is in favorites and update button text
    const favorites = getFavorites();
    if (favorites.includes(coinId)) {
      addToFavBtn.textContent = "Remove from Favorites";
    } else {
      addToFavBtn.textContent = "Add to Favorites";
    }
  }

  // Retrieve favorites from localStorage
  const getFavorites = () =>
    JSON.parse(localStorage.getItem("favoriteCoins")) || [];

  // Save favorites to localStorage
  const saveFavorites = (favorites) =>
    localStorage.setItem("favoriteCoins", JSON.stringify(favorites));

  // Handle favorite button click
  const handleFavoriteClick = () => {
    const favorites = toggleFavorite(coinId);
    saveFavorites(favorites);
    // Update button text after toggling favorite status
    addToFavBtn.textContent = favorites.includes(coinId)
      ? "Remove from Favorites"
      : "Add to Favorites";
  };

  // Toggle favorite status
  const toggleFavorite = (coinId) => {
    let favorites = getFavorites();
    if (favorites.includes(coinId)) {
      favorites = favorites.filter((id) => id !== coinId);
    } else {
      favorites.push(coinId);
    }
    return favorites;
  };

  // fetch chartdata

  async function getChartData(days) {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`,
        options
      );
      const data = await response.json();

      updateChart(data.prices);
    } catch (error) {
      console.log(error);
    }
  }

  //update chart

  function updateChart(prices) {
    const labels = prices.map((price) => {
      let date = new Date(price[0]);
      return date.toLocaleDateString();
    });

    const data = prices.map((price) => price[1]);

    coinChart.data.labels = labels;
    coinChart.data.datasets[0].data = data;
    coinChart.update();
  }

  // create chart

  const ctx = document.getElementById("coinChart").getContext("2d");

  let coinChart = new Chart(ctx, {
    type: "line",

    data: {
      labels: [],

      datasets: [
        {
          label: "Price (USD)",

          data: [],

          borderColor: "#229ef1",

          fill: false,
        },
      ],
    },

    options: {
      responsive: true,

      scales: {
        x: {
          display: true,
        },

        y: {
          display: true,

          beginAtZero: false,

          ticks: {
            callback: function (value) {
              return `$${value}`;
            },
          },
        },
      },

      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              return `$${context.parsed.y}`;
            },
          },
        },
      },
    },
  });

  // add eventlistners
  const buttons = document.querySelectorAll(".chart-filter button");
  buttons.forEach((button) => {
    button.addEventListener("click", (event) => {
      buttons.forEach((button) => button.classList.remove("active"));
      button.classList.add("active");
      const days =
        event.target.id == "24h" ? 1 : event.target.id == "30d" ? 30 : 90;
      getChartData(days);
    });
  });

  getCoinData();
  document.getElementById("24h").click();

  addToFavBtn.addEventListener("click", handleFavoriteClick);
});
