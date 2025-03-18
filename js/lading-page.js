document.addEventListener('DOMContentLoaded', () => {
  // Preloader
  window.addEventListener('load', () => {
    document.getElementById('preloader').style.display = 'none';
  });

  // Lazy load video
  const video = document.querySelector('.hero-video');
  video.addEventListener('loadeddata', () => {
    video.setAttribute('loaded', '');
  });

  // GSAP Animations
  gsap.registerPlugin(ScrollTrigger);

  // Hero Animations
  gsap.from('.hero-title', {
    opacity: 0,
    y: 50,
    duration: 1.5,
    delay: 0.5,
    ease: 'power4.out'
  });

  gsap.from('.hero-subtitle', {
    opacity: 0,
    y: 30,
    duration: 1.5,
    delay: 0.8,
    ease: 'power4.out'
  });

  gsap.from('.cta-button', {
    opacity: 0,
    y: 20,
    duration: 1.5,
    delay: 1.1,
    ease: 'power4.out'
  });

  // Parallax Effect on Hero
  gsap.to('.hero-video', {
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1
    },
    yPercent: 15,
    ease: 'none'
  });

  // Section Animations
  gsap.utils.toArray('.section-title').forEach(title => {
    gsap.from(title, {
      scrollTrigger: {
        trigger: title,
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      opacity: 0,
      y: 30,
      duration: 1,
      ease: 'power4.out'
    });
  });

  // Categories, Features, Testimonials Animations
  gsap.utils.toArray('.category-card, .feature-card, .testimonial-card').forEach(card => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      opacity: 0,
      y: 50,
      duration: 1,
      ease: 'power4.out'
    });
  });

  gsap.from('.trending-item', {
    scrollTrigger: {
      trigger: '.trending-carousel',
      start: 'top 80%',
      toggleActions: 'play none none none'
    },
    opacity: 0,
    x: 100,
    stagger: 0.2,
    duration: 1,
    ease: 'power4.out'
  });

  gsap.from('.gallery-item', {
    scrollTrigger: {
      trigger: '.gallery-carousel',
      start: 'top 80%',
      toggleActions: 'play none none none'
    },
    opacity: 0,
    y: 50,
    stagger: 0.2,
    duration: 1,
    ease: 'power4.out'
  });

  // Owl Carousel Initialization
  $('.trending-carousel').owlCarousel({
    items: 3,
    loop: true,
    margin: 20,
    nav: true,
    dots: false,
    responsive: {
      0: { items: 1 },
      600: { items: 2 },
      1000: { items: 3 }
    }
  });

  $('.gallery-carousel').owlCarousel({
    items: 3,
    loop: true,
    margin: 20,
    nav: true,
    dots: false,
    responsive: {
      0: { items: 1 },
      600: { items: 2 },
      1000: { items: 3 }
    }
  });

  // Initialize Tilt.js
  VanillaTilt.init(document.querySelectorAll('.tilt'), {
    max: 15,
    speed: 400,
    glare: true,
    'max-glare': 0.3
  });

  // Back to Top Button
  const backToTop = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});
