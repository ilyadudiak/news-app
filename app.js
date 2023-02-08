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
  const apiKey = 'ef6ff2ad5537403c849a541cfa54966b';
  const apiUrl = 'http://newsapi.org/v2';
  return {
    topHeadlines(country = 'ua', category, cb) {
      http.get(`${apiUrl}/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`, cb);
    },
    everything(query, cb) {
      http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
    }
  }
})();


//Elements 
const form = document.forms['newsControls'];
const countrySelect = form.elements['country'];
const categorySelect = form.elements['category'];
const searchInput = form.elements['search'];

form.addEventListener('submit', (e) => {
  e.preventDefault();
  loadNews();
})

//  init selects
document.addEventListener('DOMContentLoaded', function () {
  M.AutoInit();
  loadNews();
});

//loadnews function 
function loadNews() {
  showLoader();
  const country = countrySelect.value;
  const category = categorySelect.value;
  const searchText = searchInput.value;
  if (!searchText) {
    newsService.topHeadlines(country, category, onGetResponse);
  } else {
    newsService.everything(searchText, onGetResponse);
  }

}

//function on get response from server 
function onGetResponse(err, res) {
  removePreloader();
  if (err) {
    showAlert(err, 'error-msg');
    return;
  }
  if (!res.articles.length) {
    showAlert(`
      <p>There is no content by your selection</p>
    `, 'bold');
    return;
  };
  renderNews(res.articles);
}
function showAlert(msg, type) {
  M.toast({ html: msg, classes: type });
}

//function render news
function renderNews(news) {
  const newsContainer = document.querySelector('.news-container .row');
  if (newsContainer.children.length) {
    clearContainer(newsContainer);
  }
  let fragment = '';
  news.forEach(newsItem => {
    const el = newsTemplate(newsItem);
    fragment += el;
  });
  console.log(fragment);
  newsContainer.insertAdjacentHTML('afterbegin', fragment);
}
function clearContainer(container) {
  let child = container.lastElementChild;
  while (child) {
    container.removeChild(child);
    child = container.lastElementChild;
  }
}
// News item template function 

function newsTemplate({ urlToImage, title, url, description }) {
  if (!urlToImage) {
    return `
    <div class="col s12">
      <div class="card">
        <div class="card-image">
        <img src="https://media.istockphoto.com/id/1366578198/vector/page-404-link-to-non-existent-page-space-astronomy.jpg?s=612x612&w=0&k=20&c=WP1h5gYWqAjwDkj48mzmGJ-JSfYQswavq4Q__-N8cTc=">
        <span class="card-title">${title || ''}</span>
        </div>
        <div class="card-content">
        <p>${description || ''}</p>
        </div>
        <div class="cart-action">
            <a href="${url}">Read more</a>
        </div>
      </div>
    </div>
  `;
  }
  return `
    <div class="col s12">
      <div class="card">
        <div class="card-image">
        <img src="${urlToImage}">
        <span class="card-title">${title || ''}</span>
        </div>
        <div class="card-content">
        <p>${description || ''}</p>
        </div>
        <div class="cart-action">
            <a href="${url}">Read more</a>
        </div>
      </div>
    </div>
  `;
}

//SHow loader function 
function showLoader() {

  let loader = `
    <div class="progress">
    <div class="indeterminate"> </div>
    </div>
  `;
  document.body.insertAdjacentHTML('afterbegin', loader);
}

//Remove loader function 
function removePreloader() {
  let loader = document.querySelector('.progress');
  if (loader) {
    loader.remove();
  }
}