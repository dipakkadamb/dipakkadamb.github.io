// Optimization: Use passive listeners and requestAnimationFrame for scroll events to avoid layout thrashing
document.addEventListener('DOMContentLoaded', () => {
    // Scroll Progress Bar & Navbar
    const progressBar = document.getElementById('scroll-progress');
    const navbar = document.getElementById('navbar');
    let ticking = false;
    let scrollTimeout;

    const onScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollTop = window.scrollY;
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;

                // Add scrolling class to body for logo backward rotation
                document.body.classList.add('scrolling');
                
                // Clear existing timeout
                clearTimeout(scrollTimeout);
                
                // Remove scrolling class after 5 seconds
                scrollTimeout = setTimeout(() => {
                    document.body.classList.remove('scrolling');
                }, 5000);

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

    // Welcome Modal Logic
    const welcomeModal = document.getElementById('welcome-modal');
    const welcomeModalContent = document.getElementById('welcome-modal-content');
    const closeModalBtn = document.getElementById('close-modal-btn');

    if (welcomeModal && closeModalBtn) {
        // Show modal after a short delay on load
        setTimeout(() => {
            welcomeModal.classList.remove('opacity-0', 'pointer-events-none');
            welcomeModalContent.classList.remove('scale-95');
            welcomeModalContent.classList.add('scale-100');
        }, 1000); // 1s delay

        // Close modal function
        const closeModal = () => {
            welcomeModal.classList.add('opacity-0', 'pointer-events-none');
            welcomeModalContent.classList.remove('scale-100');
            welcomeModalContent.classList.add('scale-95');
        };

        closeModalBtn.addEventListener('click', closeModal);

        // Close on outside click
        welcomeModal.addEventListener('click', (e) => {
            if (e.target === welcomeModal) {
                closeModal();
            }
        });
    }

    // Motivational Quotes Logic
    const motivationalQuotes = [
        "The only way to do great work is to love what you do.",
        "Talk is cheap. Show me the code.",
        "First, solve the problem. Then, write the code.",
        "Make it work, make it right, make it fast.",
        "Simplicity is the soul of efficiency.",
        "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        "Optimism is an occupational hazard of programming.",
        "Don't comment bad code - rewrite it.",
        "It's not a bug. It's an undocumented feature!",
        "Any fool can write code that a computer can understand. Good programmers write code that humans can understand."
    ];

    const motivationalToast = document.getElementById('motivational-toast');
    const motivationalQuoteEl = document.getElementById('motivational-quote');

    const showMotivationalQuote = () => {
        if (!motivationalToast || !motivationalQuoteEl) return;

        const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
        motivationalQuoteEl.textContent = `"${randomQuote}"`;

        // Slide in
        motivationalToast.classList.remove('-translate-x-[150%]', 'opacity-0');

        // Hide after 5 seconds
        setTimeout(() => {
            motivationalToast.classList.add('-translate-x-[150%]', 'opacity-0');
        }, 5000);
    };

    // Show quote shortly after modal opens on initial load
    if (welcomeModal) {
        setTimeout(() => {
            setTimeout(showMotivationalQuote, 800);
        }, 1000);
    }

    // Also repeatedly show a new quote every 10 minutes (600,000 ms)
    setInterval(showMotivationalQuote, 600000);


    // Confetti Effect Generator (Google Style)
    const initConfetti = () => {
        const container = document.getElementById('star-dust');
        if (!container) return;

        const googleColors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853'];
        const shapes = ['rect', 'circle', 'triangle'];
        const particleCount = window.innerWidth < 640 ? 50 : 100;
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < particleCount; i++) {
            const confetti = document.createElement('div');
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            const color = googleColors[Math.floor(Math.random() * googleColors.length)];
            
            confetti.className = `confetti ${shape}`;
            if (shape === 'triangle') {
               confetti.style.borderBottomColor = color;
            } else {
               confetti.style.backgroundColor = color;
            }
            
            // Random properties
            const size = Math.random() * 8 + 6;
            const posX = Math.random() * 105; // allow slightly off-screen
            const duration = Math.random() * 8 + 5;
            const delay = Math.random() * -20;
            const rotation = Math.random() * 360;

            confetti.style.width = shape === 'triangle' ? '0' : `${size}px`;
            confetti.style.height = shape === 'triangle' ? '0' : `${size}px`;
            confetti.style.left = `${posX}%`;
            confetti.style.transform = `rotate(${rotation}deg)`;
            confetti.style.animationDuration = `${duration}s`;
            confetti.style.animationDelay = `${delay}s`;
            
            fragment.appendChild(confetti);
        }
        container.appendChild(fragment);
    };

    initConfetti();
});
