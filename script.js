'use strict';

///////////////////////////////////////
//Selectors and Elements

const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const btnCloseModal = document.querySelector('.btn--close-modal');
const btnsOpenModal = document.querySelectorAll('.btn--show-modal');

const header = document.querySelector('.header');
const btnScrollTo = document.querySelector('.btn--scroll-to');
const section1 = document.querySelector('#section--1');

const tabsContainer = document.querySelector('.operations__tab-container');
const tabs = document.querySelectorAll('.operations__tab');
const tabsContent = document.querySelectorAll('.operations__content');
const nav = document.querySelector('nav');

//// Modal window

const openModal = function (e) {
  e.preventDefault();
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
};

const closeModal = function () {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
};

btnsOpenModal.forEach(ele => {
  ele.addEventListener('click', openModal);
});

btnCloseModal.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});

/////////
btnScrollTo.addEventListener('click', e => {
  section1.scrollIntoView({ behavior: 'smooth' });
  //let s1coords = section1.getBoundingClientRect(); //coords top is always relative to window's top
  //console.log(s1coords);
  // window.scrollTo({
  //   top: s1coords.top + window.pageYOffset, //top here would go to relative to doc start, hence we need alredy scrolled Y offset to add to the relative coordinate top
  //   left: s1coords.left,
  //   behavior: 'smooth',
  // });
});

//PAGE NAVIGATION, through event delegation rather than attatching multiple copies to diff eles; just attatch it to the parent element and then let the bubbling up event take care of it in the parent's event handler

//1. Add event listener to common parent element
//2 Determine what element originated from

document.querySelector('.nav__links').addEventListener('click', function (e) {
  e.preventDefault();
  //matching strategy
  if (e.target.classList.contains('nav__link')) {
    console.log('link');
    const id = e.target.getAttribute('href');
    if (id == '#') return;
    document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
  }
});
//event delegation
tabsContainer.addEventListener('click', function (e) {
  const clicked = e.target.closest('.operations__tab'); //span's parent of tab element itself
  //also span elements clicked are propogated
  if (!clicked) return; //if clicked on just container
  //Remove active tabs
  tabs.forEach(t => t.classList.remove('operations__tab--active'));
  tabsContent.forEach(c => c.classList.remove('operations__content--active'));

  //Activate tab
  clicked.classList.add('operations__tab--active');
  console.log(clicked.dataset.tab);
  //Activate content area
  document
    .querySelector(`.operations__content--${clicked.dataset.tab}`)
    .classList.add('operations__content--active');
});

//Navigator effect, on hover aka mouseover

//also, event handler functions only have e(event) as an argument, hence you can bind in calling place and bind other arguments with "this"

function hoverEffect(e) {
  if (e.target.classList.contains('nav__link')) {
    let link = e.target;
    let siblings = link.closest('nav').querySelectorAll('.nav__link');

    siblings.forEach(s => {
      if (s !== link) {
        s.style.opacity = this;
      }
    });
  }
}

nav.addEventListener('mouseover', hoverEffect.bind(0.5));

nav.addEventListener('mouseout', hoverEffect.bind(1));

////
//STICKY HEADER
//IntersectionObserver
function headObservCallback(entry, observer) {
  //console.log(entry);
  if (entry[0].isIntersecting === false) {
    nav.classList.add('sticky');
    return;
  } else {
    nav.classList.remove('sticky');
  }
}
const headObsOptions = {
  root: null,
  threshold: [0, 0.2],
  rootMargin: -1 * +nav.getBoundingClientRect().height + 'px',
};
const headerObserver = new IntersectionObserver(
  headObservCallback,
  headObsOptions
);
headerObserver.observe(header);

///
/// REVEAL SECTION
///

const revealEntries = function (entries, observer) {
  let [entry] = entries;
  //console.log(entry);
  if (!entry.isIntersecting) return;
  entry.target.classList.remove('section--hidden');
  observer.unobserve(entry.target);
};
const sectionObserver = new IntersectionObserver(revealEntries, {
  root: null,
  threshold: 0.15,
});
const allSections = document.querySelectorAll('section');
allSections.forEach(sec => {
  sectionObserver.observe(sec);
  //sec.classList.add('section--hidden'); only commented cause working with the slider thing rn
});

//// LAZY LOADING IMAGES IM SO DONE WITH THIS RN
//again we use the fantastic IntersectioObserver API, with callback and options passed in its constructor

const imgTargets = document.querySelectorAll('img[data-src]');
const revealImages = function (entries, observer) {
  const [entry] = entries;
  if (!entry.isIntersecting) return;
  //console.log(entry);
  entry.target.src = entry.target.dataset.src;
  entry.target.addEventListener('load', e => {
    entry.target.classList.remove('lazy-img');
  });
  observer.unobserve(entry.target);
};
const imgObserver = new IntersectionObserver(revealImages, {
  root: null,
  threshold: 0,
  rootMargin: '200px',
});
imgTargets.forEach(img => {
  imgObserver.observe(img);
});

//SLIDER, good reference

const slides = document.querySelectorAll('.slide');
const btnRight = document.querySelector('.slider__btn--right');
const btnLeft = document.querySelector('.slider__btn--left');
let currentSlide = 0;
let slidesLength = slides.length;
const goToSlide = function (slide) {
  currentSlide = slide;
  slides.forEach((s, i) => {
    s.style.transform = `translateX(${(i - slide) * 100}%)`;
  });
};
goToSlide(0);
const dotContainer = document.querySelector('.dots');
const createDots = function () {
  slides.forEach((_, i) => {
    dotContainer.insertAdjacentHTML(
      'beforeend',
      `<button class="dots__dot ${
        (i == 0 && 'dots__dot--active') || ''
      } " data-slide="${i}"></button>`
    );
  });
};
createDots();
const dots = document.querySelectorAll('.dots__dot');
const activateDots = function (slide) {
  dots.forEach(dot => {
    dot.classList.remove('dots__dot--active');
  });
  dots[slide].classList.add('dots__dot--active');
};
activateDots(0);

const nextSlide = function () {
  currentSlide = (currentSlide + 1) % slidesLength;
  goToSlide(currentSlide);
  activateDots(currentSlide);
};
const prevSlide = function () {
  if (currentSlide === 0) {
    currentSlide = slidesLength - 1;
  } else {
    currentSlide--;
  }
  goToSlide(currentSlide);
  activateDots(currentSlide);
};
btnRight.addEventListener('click', nextSlide);
btnLeft.addEventListener('click', prevSlide);
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') nextSlide();
  e.key == 'ArrowLeft' && prevSlide(); //short circuiting cuz why not
});

dotContainer.addEventListener('click', e => {
  if (e.target.classList.contains('dots__dot')) {
    console.log(e.target);
    let { slide } = e.target.dataset;
    goToSlide(slide);
    activateDots(slide);
  }
});

///////////////////////////////////////////////
//experimenting

//cookie message insertion in header

// const message = document.createElement('div');
// message.classList.add('cookie-message');
// message.innerHTML =
//   'We use cookies for improved functionality and analytics. <button class="btn btn--close-cookie">Got it !</button> ';
// //ways of adding, insertadjaecentHTML(or text or element), append(last),prepend(first)),after/before(sibling of main ele)
// //way of removing : element.remove() or remove child element
// header.append(message);

// //close cookie message
// document.querySelector('.btn--close-cookie').addEventListener('click', () => {
//   message.remove();
//   //or message.parentElement.removeChild(message); // old way, through DOM traversing
// });
