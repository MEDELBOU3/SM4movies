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
    y: 100,
    duration: 1.5,
    delay: 0.5,
    ease: 'power4.out'
  });

  gsap.from('.hero-subtitle', {
    opacity: 0,
    y: 50,
    duration: 1.5,
    delay: 0.8,
    ease: 'power4.out'
  });

  gsap.from('.cta-button', {
    opacity: 0,
    scale: 0.8,
    duration: 1.5,
    delay: 1.1,
    ease: 'elastic.out(1, 0.5)'
  });

  // Parallax Effect on Hero
  gsap.to('.hero-video', {
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1
    },
    yPercent: 20,
    scale: 1.1,
    ease: 'none'
  });

  // Navbar Scroll Effect
  window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Section Animations
  gsap.utils.toArray('.animate-section').forEach(section => {
    gsap.from(section, {
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      opacity: 0,
      y: 50,
      duration: 1,
      ease: 'power4.out'
    });
  });

  // Card Animations
  gsap.utils.toArray('.category-card, .feature-card, .testimonial-card, .trending-item').forEach(card => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      opacity: 0,
      scale: 0.9,
      rotationY: 15,
      duration: 1,
      ease: 'power4.out'
    });
  });

  // Owl Carousel Initialization for Trending
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

  // 3D Gallery Carousel
  const galleryItems = document.querySelectorAll('.gallery-item-wrapper');
  const totalItems = galleryItems.length;
  let currentIndex = 0;

  function updateCarousel() {
    galleryItems.forEach((item, index) => {
      const angle = ((index - currentIndex) * 360) / totalItems;
      const z = Math.cos((angle * Math.PI) / 180) * 200;
      const x = Math.sin((angle * Math.PI) / 180) * 200;
      const opacity = z > 0 ? 1 : 0.5;
      const scale = z > 0 ? 1 : 0.7;

      item.style.transform = `translateX(${x}px) translateZ(${z}px) rotateY(${angle}deg) scale(${scale})`;
      item.style.opacity = opacity;
      item.style.zIndex = z > 0 ? 1 : 0;
    });
  }

  document.querySelector('.gallery-prev').addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + totalItems) % totalItems;
    updateCarousel();
  });

  document.querySelector('.gallery-next').addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % totalItems;
    updateCarousel();
  });

  updateCarousel();

  // Starfield Animation
  const canvas = document.getElementById('stars');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const stars = [];
  for (let i = 0; i < 200; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5,
      opacity: Math.random()
    });
  }

  function animateStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(star => {
      star.opacity += (Math.random() - 0.5) * 0.05;
      if (star.opacity < 0) star.opacity = 0;
      if (star.opacity > 1) star.opacity = 1;

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 215, 0, ${star.opacity})`;
      ctx.fill();
    });
    requestAnimationFrame(animateStars);
  }

  animateStars();

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
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
