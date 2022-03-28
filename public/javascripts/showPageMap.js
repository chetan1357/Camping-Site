// we cant access our envirnoment variable directly here as envirnoment variable are available only in the backend-js and this js we are using for 
// front-end bcz we are requiring it in our html file
const parsedCampground = JSON.parse(campground);
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v10', // style URL
    center: parsedCampground.geometry.coordinates, // starting position [lng, lat]
    zoom: 10 // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());

new mapboxgl.Marker()
    .setLngLat(parsedCampground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h3>${parsedCampground.title}</h3><p>${parsedCampground.location}</p>`
            )
    )
    .addTo(map);