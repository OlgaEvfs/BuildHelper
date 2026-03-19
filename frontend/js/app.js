console.log("Frontend is running!");

// Пример запроса к нашему API
fetch('/api/test')
    .then(response => response.json())
    .then(data => {
        console.log('Response from API:', data.message);
    })
    .catch(err => console.error("Error fetching from API:", err));