---
data: src/data/forecast.json.js
---

# Weather Forecast 🌦️

**Location:** 42.30°N, -71.31°W  
**Forecast for the next few hours:**

<script>
  document.addEventListener("DOMContentLoaded", () => {
    console.log("Page Loaded!");

    const forecast = {{ data | json }};
    console.log("Forecast Data:", forecast); // Debugging line

    if (forecast.properties && forecast.properties.periods) {
      const period = forecast.properties.periods[0];
      document.getElementById("forecast").innerText = 
        `${period.name}: ${period.temperature}°F - ${period.shortForecast}`;
    } else {
      console.error("Forecast data is missing expected properties.");
      document.getElementById("forecast").innerText = "Error loading forecast.";
    }
  });
</script>

<div id="forecast">Loading forecast...</div>
