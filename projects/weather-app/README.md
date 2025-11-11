# Weather App (Demo)

This is a small weather demo that fetches current weather using OpenWeatherMap.

How to run locally:
1. Add your OpenWeatherMap API key in `projects/weather-app/script.js` by setting `API_KEY = 'your_key_here'`.
2. Serve the project with a static server (e.g., `python3 -m http.server 8000`) and open:

```
http://localhost:8000/projects/weather-app/
```

Notes:
- The demo uses the OpenWeatherMap `weather` endpoint and shows temperature (°C), humidity, and description.
- No backend required; the API key will be visible in the browser if added directly — consider using a server-side proxy or environment when deploying.
