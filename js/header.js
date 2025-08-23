// Header functionality
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    const hamburger = document.querySelector('.hamburger');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            mobileMenuBtn.setAttribute('aria-expanded', 
                mobileMenuBtn.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'
            );
            
            // Animate hamburger to X
            hamburger.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking on a nav link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 1024) {
                navMenu.classList.remove('active');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                hamburger.classList.remove('active');
            }
        });
    });
    
    // Sticky header on scroll
    const header = document.getElementById('header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        // Add/remove sticky class based on scroll position
        if (currentScroll > 100) {
            header.classList.add('sticky');
            
            // Hide header on scroll down, show on scroll up
            if (currentScroll > lastScroll && currentScroll > 200) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
        } else {
            header.classList.remove('sticky');
            header.style.transform = 'translateY(0)';
        }
        
        lastScroll = currentScroll;
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add active class to current section in navigation
    const sections = document.querySelectorAll('section[id]');
    
    function highlightNavigation() {
        let scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelector(`.nav-link[data-link="${sectionId}"]`)?.classList.add('active');
            } else {
                document.querySelector(`.nav-link[data-link="${sectionId}"]`)?.classList.remove('active');
            }
        });
    }
    
    // Run once on page load
    highlightNavigation();
    
    // Run on scroll
    window.addEventListener('scroll', highlightNavigation);
});
