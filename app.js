document.addEventListener("DOMContentLoaded", () => {

  // ===== Contact Form Submission =====
  const contactForm = document.getElementById('contactForm');
  const contactResponse = document.getElementById('response');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = {
        name: contactForm.name.value,
        email: contactForm.email.value,
        message: contactForm.message.value
      };
      try {
        const res = await fetch("http://127.0.0.1:8000/contact", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        contactResponse.innerText = data.message;
        contactForm.reset();
      } catch (err) {
        contactResponse.innerText = "Error sending message.";
        console.error(err);
      }
    });
  }

  // ===== Quotation Form Submission =====
  const quoteForm = document.getElementById('quoteForm');
  const quoteResponse = document.getElementById('quoteResponse');

  if (quoteForm) {
    quoteForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = {
        name: quoteForm.name.value,
        email: quoteForm.email.value,
        service: quoteForm.service.value,
        details: quoteForm.details.value
      };
      try {
        const res = await fetch("http://127.0.0.1:8000/quote", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        quoteResponse.innerText = data.message;
        quoteForm.reset();
      } catch (err) {
        quoteResponse.innerText = "Error sending request.";
        console.error(err);
      }
    });
  }

  // ===== Scroll Animations =====
  const animateElements = document.querySelectorAll('.service-card, .portfolio-card, .about-card, .blog-card');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  animateElements.forEach(el => observer.observe(el));

  // ===== Smooth Scroll / Navbar Links =====
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      } else if (href.includes('.html')) {
        window.location.href = href;
      }
    });
  });

  // ===== Mobile Menu Toggle =====
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      hamburger.classList.toggle('active');
    });
  }

  // ===== Portfolio Carousel =====
  const track = document.querySelector('.carousel-track');
  if (track) {
    const slides = document.querySelectorAll('.carousel-track .portfolio-card');
    const nextBtn = document.querySelector('.carousel-btn.next');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    let index = 0;
    const slideWidth = slides[0].getBoundingClientRect().width + 20;

    nextBtn.addEventListener('click', () => {
      index = (index + 1) % slides.length;
      track.style.transform = `translateX(-${slideWidth * index}px)`;
    });
    prevBtn.addEventListener('click', () => {
      index = (index - 1 + slides.length) % slides.length;
      track.style.transform = `translateX(-${slideWidth * index}px)`;
    });
  }

  // ===== Parallax Scroll Effect =====
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const hero = document.querySelector('.hero');
    if (hero) hero.style.transform = `translateY(${scrollY * 0.2}px)`;

    document.querySelectorAll('.services, .portfolio, .about, .cta').forEach(section => {
      section.style.transform = `translateY(${scrollY * 0.05}px)`;
    });

    document.querySelectorAll('.hero-float span').forEach((icon, i) => {
      icon.style.transform = `translateY(${Math.sin(scrollY * 0.01 + i) * 10}px) rotate(${scrollY * 0.05}deg)`;
    });
  });

  // ===== Portfolio Card Tilt =====
  document.querySelectorAll('.portfolio-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 20;
      const rotateY = (x - centerX) / 20;
      card.style.transform = `rotateX(${-rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(-10px) rotateZ(1deg) scale(1.03)';
    });
  });

  // ===== Newsletter Subscription =====
  const newsletterForm = document.getElementById('newsletterForm');
  const newsletterResponse = document.getElementById('newsletterResponse');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', e => {
      e.preventDefault();
      newsletterResponse.innerText = "Thanks for subscribing!";
      newsletterForm.reset();
    });
  }

  // ===== Navbar Shrink on Scroll =====
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('shrink');
    } else {
      navbar.classList.remove('shrink');
    }
  });

  // ===== Blog "Load More" Button =====
  const loadMoreBtn = document.getElementById('loadMore');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      loadMoreBtn.classList.add('loading');
      setTimeout(() => {
        // TODO: fetch/load more posts dynamically
        loadMoreBtn.classList.remove('loading');
      }, 2000);
    });
  }

});
