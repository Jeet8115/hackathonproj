// Initialize the map
var map = L.map('map').setView([28.6139, 77.2090], 12); // Default view set to Delhi

// Add tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Define routes as coordinates
const routes = {
    'GL90': [[28.6331, 77.2198], [28.7465, 77.1139]], // Example route
    // Add other routes here...
};

// Variable to store the current route layer
let routeLayer = L.layerGroup().addTo(map);

// Function to focus on a route
function focusOnRoute(routeId) {
    // Clear existing route
    routeLayer.clearLayers();

    // Get route coordinates
    const coordinates = routes[routeId];

    // Check if coordinates exist
    if (coordinates) {
        // Create a polyline with dotted lines
        L.polyline(coordinates, {
            color: '#FF5733', // Bright color
            weight: 4, // Thicker line
            opacity: 0.7, // Slightly transparent
            dashArray: '10, 10' // Dotted line pattern
        }).addTo(routeLayer);

        // Fit the map to the new polyline
        map.fitBounds(L.polyline(coordinates).getBounds());

        // Add markers at start and end points
        L.marker(coordinates[0]).addTo(routeLayer).bindPopup("Start");
        L.marker(coordinates[coordinates.length - 1]).addTo(routeLayer).bindPopup("End");
    } else {
        alert('Route not found.');
    }
}

// Function to filter routes
function filterRoutes() {
    const searchTerm = document.getElementById('searchBar').value.toLowerCase();
    const routeItems = document.querySelectorAll('#routeList li');
    
    routeItems.forEach(item => {
        const routeText = item.textContent.toLowerCase();
        if (routeText.includes(searchTerm)) {
            item.style.display = ''; // Show item
        } else {
            item.style.display = 'none'; // Hide item
        }
    });
}

// Function to fetch route data from OpenRouteService
async function fetchRoute(coordinates) {
    const apiKey = 'your-api-key-here';
    const orsUrl = `https://api.openrouteservice.org/v2/directions/driving-car/geojson?api_key=${apiKey}`;

    const response = await fetch(orsUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ coordinates: coordinates }),
    });

    if (response.ok) {
        return await response.json();
    } else {
        console.error('Error fetching route:', response.statusText);
        return null;
    }
}

// Function to add fetched route to the map
function addRouteToMap(routeData, color) {
    if (routeData) {
        L.geoJSON(routeData, {
            style: {
                color: color,
                weight: 4,
                opacity: 0.7,
                dashArray: '10, 5' // For dotted lines
            }
        }).addTo(routeLayer);
    }
}

// Function to display all routes
async function displayAllRoutes() {
    const routeCoordinates = Object.values(routes); // Extract all route coordinates
    for (let i = 0; i < routeCoordinates.length; i++) {
        const routeData = await fetchRoute(routeCoordinates[i]);
        const colors = ['blue', 'red', 'green', 'orange', 'purple'];
        const color = colors[i % colors.length];
        addRouteToMap(routeData, color);
    }

    // Optionally fit map to bounds of all routes
    const boundsArray = routeCoordinates.map(route => L.polyline(route).getBounds());
    const combinedBounds = boundsArray.reduce((bounds, nextBounds) => bounds.extend(nextBounds), L.latLngBounds());
    map.fitBounds(combinedBounds);
}

// Uncomment to display all routes on load
// displayAllRoutes();

