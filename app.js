// Custom Http Module
function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    },
  };
}
// Init http module
const http = customHttp();

const newsService = (function () {
  const apiKey = '0f1fb7f45e5c411c94a07dff166da61f';
  const apiUrl = 'https://news-api-v2.herokuapp.com';

  return {
    topHeadlines(country = 'ru', category = 'general', cb) {
      http.get(
        `${apiUrl}/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`,
        cb
      );
    },
    everything(query, cb) {
      http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
    },
  };
})();

// Elements
const form = document.forms['newsControls'];
const countrySelect = form.elements['country'];
const searchInput = form.elements['search'];
const categorySelect = form.elements['category'];

form.addEventListener('submit', (e) => {
  e.preventDefault();
  loadNews();
});

//  init selects
document.addEventListener('DOMContentLoaded', function () {
  M.AutoInit();
  loadNews();
});

// Load news function
function loadNews() {
  showLoader();
  const country = countrySelect.value;
  const searchText = searchInput.value;
  const category = categorySelect.value;

  if (!searchText) {
    newsService.topHeadlines(country, category, onGetResponse);
  } else {
    newsService.everything(searchText, onGetResponse);
  }
}

// Function on get response from server
function onGetResponse(err, res) {
  removePreLoader();

  if (err) {
    showAlert(err, 'error-msg');
    return;
  }

  if (!res.articles.length) {
    showAlert('There are no results');
    return;
  }
  renderNews(res.articles);
}

// Function render news
function renderNews(news) {
  const newsContainer = document.querySelector('.news-container .row');

  if (newsContainer.children.length) {
    clearContainer(newsContainer);
  }

  let fragment = '';

  news.forEach((newsItem) => {
    const el = newsTemplate(newsItem);
    fragment += el;
  });

  newsContainer.insertAdjacentHTML('afterbegin', fragment);
}

// Function clear container
function clearContainer(container) {
  let child = container.lastElementChild;
  while (child) {
    container.removeChild(child);
    child = container.lastElementChild;
  }
}

// News item template function
function newsTemplate({ urlToImage, title, url, description }) {
  return `
      <div class="col s12">
        <div class="card">
          <div class="card-image">
            <img src="${urlToImage || '/no_image.png'}" >
            <span class="card-title">${title || 'No Title'}</span>
          </div>
          <div class="card-content">
            <p>${description || 'No description'}</p>
          </div>
          <div class="card-action">
            <a href="${url}" target="_blank">Read more</a>
          </div>
        </div>
      </div>
    `;
}

function showAlert(msg, type = 'success') {
  M.toast({ html: msg, classes: type });
}

function showLoader() {
  document.body.insertAdjacentHTML(
    'afterbegin',
    `
    <div class="progress">
      <div class="indeterminate"></div>
    </div>
  `
  );
}

// Remove loader function
function removePreLoader() {
  const loader = document.querySelector('.progress');
  if (loader) {
    loader.remove();
  }
}
