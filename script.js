ymaps.ready(init);

function createReview(name, place, review, creationDate) {
  console.log(name, place, review, creationDate)
  const div = document.createElement('DIV');
  div.classList.add("review-baloon__review");
  const p1 = document.createElement('P');
  p1.classList.add("review-baloon__review--p");
  const span1 = document.createElement('SPAN');
  span1.classList.add("rb-default-text", "rb-black-text");
  span1.textContent = name;
  const span2 = document.createElement('SPAN');
  span2.classList.add("rb-default-text", "rb-gray-text", "rb-place-date");
  span2.textContent = `${place} ${creationDate}`;
  p1.append(span1, span2);
  const p2 = document.createElement('P');
  p2.classList.add("review-baloon__review--p", "rb-default-text", "rb-gray-text");
  p2.textContent = review;
  div.append(p1, p2);
  return div;
}

function fun(e) {
  const oldData = localStorage.getItem(`ymap_places`)
    ? JSON.parse(localStorage.getItem(`ymap_places`))
    : undefined;

  const formData = new FormData(e);
  const coords = formData.get('coords');
  const name = formData.get('name');
  const place = formData.get('place');
  const review = formData.get('review');
  
  if (!review || !name || !place) {
    alert('Заполните все поля');
    return false;
  }
  
  const reviewsContainer = document.querySelector('#reviews');
  
  const creationDate = `${(new Date()).getDate()}.${(new Date()).getMonth() + 1}.${(new Date()).getFullYear()}`;
  const div = createReview(name, place, review, creationDate)
  reviewsContainer.appendChild(div);
  
  const addToLocalStorage = oldData 
    ? [...oldData, { name, place, review, creationDate, coords }]
    : [{ name, place, review, creationDate, coords }];
  localStorage.setItem(`ymap_places`, JSON.stringify(addToLocalStorage));

  return false;
}

function init(){
  var myMap = new ymaps.Map("map", {
    center: [54.187211, 45.183642],
    zoom: 13,
    controls: ["zoomControl"]
  });

  var clusterer = new ymaps.Clusterer({});
  myMap.geoObjects.add(clusterer);

  const form = (coords) => {
    return [
      '<div class="review-baloon__wrapper" id="review-baloon">',
        // reviewsContainer,
        '<div id="reviews" class="review-baloon__reviews"></div>',
        '<form onsubmit="return fun(this)" class="review-baloon__form">',
          '<p class="review-baloon__form--title rb-default-text rb-black-text">Отзыв</p>',
          '<input type="text" name="name" class="review-baloon__form--input" placeholder="Укажите ваше имя" />',
          '<input type="text" name="place" class="review-baloon__form--input" placeholder="Укажите место" />',
          '<textarea name="review" class="review-baloon__form--textarea" placeholder="Оставить отзыв"></textarea>',
          `<input type="hidden" name="coords" id="coords" value="${coords}">`,
          '<input type="submit" class="review-baloon__form--submit" value="Добавить" id="add" />',
        '</form>',
      '</div>'
    ].join('');
  }

  const oldData = localStorage.getItem(`ymap_places`)
    ? JSON.parse(localStorage.getItem(`ymap_places`))
    : undefined;

  if (oldData) {
    oldData.forEach(placemark => {
      const coords = [+placemark.coords.split(',')[0], +placemark.coords.split(',')[1]]
      let newPlacemark = new ymaps.Placemark(coords, {
        hintContent: coords,
        balloonContent: form(coords),
      });
  
      myMap.geoObjects.add(newPlacemark);
      
      clusterer.add(newPlacemark);
    })
  }

  myMap.events.add('click', function (e) {
    var coords = e.get('coords');

    var newPlacemark = new ymaps.Placemark(coords, {
      hintContent: coords,
      balloonContent: form(coords),
    });

    myMap.geoObjects.add(newPlacemark);
    
    newPlacemark.events.fire('click');

    clusterer.add(newPlacemark);
  })

}

document.addEventListener('click', () => {
  const coords = document.getElementById('coords');
  const reviews = document.getElementById('reviews');
  if (reviews && coords) {
    if (reviews.childNodes.length === 0) {
      
      const oldData = localStorage.getItem(`ymap_places`)
        ? JSON.parse(localStorage.getItem(`ymap_places`))
        : undefined;

      const reviewsInBalloon = oldData.filter(item => item.coords === coords.value)
      
      if (reviewsInBalloon.length > 0) {
        reviewsInBalloon.forEach(item => {
          const div = createReview(item.name, item.place, item.review, item.creationDate);
          reviews.append(div);
        })
      }

    }
  }
})