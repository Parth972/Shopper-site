mapboxgl.accessToken = 'pk.eyJ1IjoicGFydGg5NzIiLCJhIjoiY2tjZW0wMWRzMDFzZTJ3bHBnNm84cXFhOCJ9.E4JZ_SCWUlXOkZjGQ3z8MQ';

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v10',
  center: post.coordinates,
  zoom: 3
});

  // create a HTML element for each feature
  var el = document.createElement('div');
  el.className = 'marker';

  // make a marker for each feature and add to the map
  new mapboxgl.Marker(el)
    .setLngLat(post.coordinates)
    .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
    .setHTML('<h3>' + post.title + '</h3><p>' + post.location + '</p>'))
    .addTo(map);