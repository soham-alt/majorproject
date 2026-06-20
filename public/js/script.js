// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()

const mapContainer = document.getElementById("map");

if(mapContainer && typeof maplibregl !== "undefined"){
  const lng = Number(mapContainer.dataset.lng);
  const lat = Number(mapContainer.dataset.lat);
  const hasCoordinates = Number.isFinite(lng) && Number.isFinite(lat);
  const center = hasCoordinates ? [lng, lat] : [13.388, 52.517];

  const map = new maplibregl.Map({
    style: "https://tiles.openfreemap.org/styles/liberty",
    center,
    zoom: hasCoordinates ? 12 : 9.5,
    container: "map",
  });

  map.addControl(new maplibregl.NavigationControl());

  if(hasCoordinates){
    new maplibregl.Marker()
      .setLngLat(center)
      .setPopup(new maplibregl.Popup().setText(mapContainer.dataset.location))
      .addTo(map);
  }
}
