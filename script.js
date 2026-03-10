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

    // Blog Fetching Logic
    const loadBlogs = async () => {
        const blogGrid = document.getElementById('blog-grid');
        if (!blogGrid) return; // Only run on index page with blog section

        try {
            const response = await fetch('blogs.json');
            if (!response.ok) throw new Error('Failed to fetch blogs');
            
            const blogs = await response.json();
            blogGrid.innerHTML = ''; // Clear loading state
            
            if (blogs.length === 0) {
                blogGrid.innerHTML = `
                    <div class="col-span-full text-center py-10 text-slate-500">
                        <i data-feather="book" class="w-8 h-8 mx-auto mb-4 text-slate-400"></i>
                        <p>No articles published yet. Check back soon!</p>
                    </div>`;
                feather.replace();
                return;
            }

            blogs.forEach((blog, index) => {
                const delay = index * 100;
                
                // Format tags safely
                const tagsHtml = (blog.tags || []).slice(0, 2).map(tag => 
                    `<span class="px-2 py-1 bg-white/5 border border-white/5 rounded text-[10px] uppercase tracking-wider font-mono text-slate-400">${tag}</span>`
                ).join('');

                const cardHtml = `
                    <a href="${blog.url}" class="glass-card rounded-2xl overflow-hidden group hover:-translate-y-2 transition-transform duration-300 reveal-up flex flex-col h-full" style="animation-delay: ${delay}ms;">
                        <div class="p-6 md:p-8 flex flex-col h-full">
                            <div class="flex items-center justify-between mb-4">
                                <div class="flex gap-2">
                                    ${tagsHtml}
                                </div>
                                <span class="text-xs font-mono text-accent-cyan">${blog.readTime || '3 min read'}</span>
                            </div>
                            
                            <h3 class="text-xl font-bold text-white mb-3 group-hover:text-accent-blue transition-colors leading-snug">${blog.title}</h3>
                            
                            <p class="text-slate-400 text-sm leading-relaxed mb-6 flex-grow">${blog.snippet}</p>
                            
                            <div class="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                <span class="text-xs font-mono text-slate-500 flex items-center gap-1.5"><i data-feather="calendar" class="w-3.5 h-3.5"></i> ${blog.date}</span>
                                <span class="text-sm font-bold text-white flex items-center gap-1 group-hover:text-accent-cyan transition-colors">Read <i data-feather="arrow-right" class="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform"></i></span>
                            </div>
                        </div>
                    </a>
                `;
                blogGrid.insertAdjacentHTML('beforeend', cardHtml);
            });
            
            // Re-initialize feather icons for the new HTML
            feather.replace();
            
            // Re-observe new elements for scroll animations
            const observerOptions = { root: null, rootMargin: '0px 0px -50px 0px', threshold: 0.1 };
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                        obs.unobserve(entry.target);
                    }
                });
            }, observerOptions);
            
            document.querySelectorAll('#blog-grid .reveal-up').forEach(el => observer.observe(el));

        } catch (error) {
            console.error("Error loading blogs:", error);
            blogGrid.innerHTML = `
                <div class="col-span-full text-center py-10 text-slate-500">
                    <i data-feather="alert-circle" class="w-8 h-8 mx-auto mb-4 text-red-400"></i>
                    <p>Unable to load articles at this time.</p>
                </div>`;
            feather.replace();
        }
    };

    // Initialize blog loading
    loadBlogs();
});
