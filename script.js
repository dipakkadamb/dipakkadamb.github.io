// Optimization: Use passive listeners and requestAnimationFrame for scroll events to avoid layout thrashing
document.addEventListener('DOMContentLoaded', () => {
    // Scroll Progress Bar & Navbar
    const progressBar = document.getElementById('scroll-progress');
    const navbar = document.getElementById('navbar');
    let ticking = false;

    const onScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollTop = window.scrollY;
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;

                // Progress Bar
                if (docHeight > 0) {
                    const scrollPercent = (scrollTop / docHeight) * 100;
                    progressBar.style.width = scrollPercent + '%';
                }

                // Navbar Blur
                if (scrollTop > 50) {
                    navbar.classList.add('bg-navy-900/80', 'backdrop-blur-xl', 'shadow-lg');
                    navbar.classList.remove('bg-navy-900/60');
                } else {
                    navbar.classList.remove('bg-navy-900/80', 'backdrop-blur-xl', 'shadow-lg');
                    navbar.classList.add('bg-navy-900/60');
                }
                ticking = false;
            });
            ticking = true;
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Init on load

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    let isMenuOpen = false;

    const toggleMenu = () => {
        isMenuOpen = !isMenuOpen;
        if (isMenuOpen) {
            mobileMenu.classList.remove('translate-x-full');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
            mobileMenuBtn.innerHTML = '<i data-feather="x"></i>';
        } else {
            mobileMenu.classList.add('translate-x-full');
            document.body.style.overflow = '';
            mobileMenuBtn.innerHTML = '<i data-feather="menu"></i>';
        }
        feather.replace();
    };

    mobileMenuBtn.addEventListener('click', toggleMenu);

    // Close mobile menu on link click
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (isMenuOpen) toggleMenu();
        });
    });

    // Intersection Observer for Scroll Animations
    // Optimization: Unobserve after first reveal to save memory and CPU
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px', // slightly trigger before it comes into view
        threshold: 0.1
    };

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add a small delay for staggered effect inside the same viewport
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const animatedElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
        animatedElements.forEach(el => observer.observe(el));
    } else {
        // Fallback for older browsers
        document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => el.classList.add('active'));
    }
});
