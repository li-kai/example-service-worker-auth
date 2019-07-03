if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/service-worker.js').then(
      function(registration) {
        // Registration was successful
        console.log(
          'ServiceWorker registration successful with scope: ',
          registration.scope
        );
      },
      function(err) {
        // registration failed :(
        console.log('ServiceWorker registration failed: ', err);
      }
    );
  });
}

const form = document.getElementById('form');
const fetchButton = document.getElementById('fetch-button');
const app = document.getElementById('app');

form.addEventListener('submit', event => {
  event.preventDefault();

  // Turn form data into json
  const data = {};
  const formData = new FormData(event.target);
  formData.forEach((value, key) => {
    data[key] = value;
  });

  app.textContent = ''; // Reset content

  fetch('/login', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(response => response.json())
    .then(data => {
      app.textContent = 'Server payload: ' + JSON.stringify(data, null, 4);
    })
    .catch(data => {
      app.textContent = 'Server payload: ' + JSON.stringify(data, null, 4);
    });
});

fetchButton.addEventListener('click', () => {
  app.textContent = ''; // Reset content

  fetch('/protected')
    .then(response => response.json())
    .then(data => {
      app.textContent = 'Server payload: ' + JSON.stringify(data, null, 4);
    })
    .catch(data => {
      app.textContent = 'Server payload: ' + JSON.stringify(data, null, 4);
    });
});
