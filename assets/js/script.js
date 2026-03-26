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
                    navbar.classList.add('bg-white/95', 'backdrop-blur-xl', 'shadow-md');
                    navbar.classList.remove('bg-white/80', 'border-slate-900/5');
                } else {
                    navbar.classList.remove('bg-white/95', 'backdrop-blur-xl', 'shadow-md');
                    navbar.classList.add('bg-white/80', 'border-slate-900/5');
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

    // Enhanced AOS Animations Setup
    // Automatically supercharge all existing .reveal tags
    document.querySelectorAll('.reveal-up').forEach(el => {
        el.setAttribute('data-aos', 'fade-up');
        if (el.style.animationDelay) {
            el.setAttribute('data-aos-delay', parseInt(el.style.animationDelay));
            el.style.animationDelay = '';
        }
        el.classList.remove('reveal-up'); // Let AOS handle opacity
    });

    document.querySelectorAll('.reveal-left').forEach(el => {
        el.setAttribute('data-aos', 'fade-right');
        el.classList.remove('reveal-left');
    });

    document.querySelectorAll('.reveal-right').forEach(el => {
        el.setAttribute('data-aos', 'fade-left');
        el.classList.remove('reveal-right');
    });

    // Initialize Premium AOS Animation Engine
    AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true,
        offset: 50,
        mirror: false // Don't animate out when scrolling past
    });

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

        // Expose open modal function globally
        window.openWelcomeModal = () => {
            welcomeModal.classList.remove('opacity-0', 'pointer-events-none');
            welcomeModalContent.classList.remove('scale-95');
            welcomeModalContent.classList.add('scale-100');
        };

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
        motivationalToast.classList.remove('translate-x-[150%]', 'opacity-0');

        // Hide after 5 seconds
        setTimeout(() => {
            motivationalToast.classList.add('translate-x-[150%]', 'opacity-0');
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

    // Festival Wishes Pop-up Logic
    const showFestivalWishes = () => {
        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const dateStr = `${month}-${day}`;
        const fullDateStr = `${today.getFullYear()}-${month}-${day}`;

        // Fixed date festivals
        const fixedFestivals = {
            '01-01': 'Happy New Year!',
            '01-14': 'Happy Makar Sankranti!',
            '01-26': 'Happy Republic Day!',
            '02-14': "Happy Valentine's Day!",
            '03-08': "Happy International Women's Day!",
            '04-20': 'Happy Birthday Dipak!',
            '08-15': "Happy Independence Day!",
            '10-02': "Happy Gandhi Jayanti!",
            '10-31': "Happy Halloween!",
            '12-25': "Merry Christmas!",
            '12-31': "Happy New Year's Eve!"
        };

        // Dynamic festivals (2026 Major Indian Festivals)
        const dynamicFestivals = {
            '2026-02-15': 'Happy Maha Shivaratri!',
            '2026-03-04': 'Happy Holi!',
            '2026-03-20': 'Eid Mubarak!',
            '2026-03-26': 'Happy Rama Navami!',
            '2026-08-28': 'Happy Raksha Bandhan!',
            '2026-09-04': 'Happy Krishna Janmashtami!',
            '2026-09-14': 'Happy Ganesh Chaturthi!',
            '2026-10-11': 'Happy Navratri!',
            '2026-10-20': 'Happy Dussehra!',
            '2026-11-08': 'Happy Diwali!',
            '2026-11-11': 'Happy Bhai Dooj!'
        };

        const message = fixedFestivals[dateStr] || dynamicFestivals[fullDateStr];

        if (!message) return; // Do nothing if not a festival day

        // Create backdrop overlay
        const backdrop = document.createElement('div');
        backdrop.className = 'fixed inset-0 z-[190] bg-slate-900/60 backdrop-blur-md opacity-0 transition-opacity duration-700 pointer-events-none';

        // Create the premium popup element container
        const popup = document.createElement('div');
        popup.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[200] w-full max-w-[95%] sm:max-w-lg rounded-3xl p-1 pointer-events-none opacity-0 scale-90 transition-all duration-700 ease-out flex flex-col items-center text-center';
        
        // Inner content with animated gradient border and glassmorphism
        popup.innerHTML = `
            <div class="absolute inset-0 bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-500 animate-pulse-slow rounded-3xl opacity-80 backdrop-blur-xl"></div>
            <div class="relative w-full h-full bg-white/95 backdrop-blur-2xl rounded-[23px] p-8 sm:p-10 flex flex-col items-center justify-center shadow-2xl overflow-hidden glass-card">
                <!-- Decorative animated glowing orbs -->
                <div class="absolute top-0 right-0 w-32 h-32 bg-orange-300/40 rounded-full blur-3xl -mr-10 -mt-10 animate-float"></div>
                <div class="absolute bottom-0 left-0 w-32 h-32 bg-yellow-300/40 rounded-full blur-3xl -ml-10 -mb-10 animate-float" style="animation-delay: 2s;"></div>

                <!-- Premium Icon Container -->
                <div class="relative mb-6">
                    <div class="absolute inset-0 bg-orange-400 rounded-full blur-xl opacity-60 animate-glow-pulse"></div>
                    <div class="relative w-20 h-20 rounded-full bg-gradient-to-tr from-orange-500 to-yellow-400 flex items-center justify-center shadow-xl shadow-orange-500/40 text-white animate-bounce-glow border-4 border-white/80 backdrop-blur-sm">
                        <i data-feather="gift" class="w-10 h-10 drop-shadow-md"></i>
                    </div>
                </div>

                <h2 class="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-yellow-500 mb-4 tracking-tight shimmer-text drop-shadow-sm z-10">
                    Festive Greetings!
                </h2>
                
                <div class="w-16 h-1 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full mb-6 z-10"></div>

                <p class="text-slate-800 text-xl sm:text-2xl font-semibold leading-relaxed tracking-wide z-10">
                    ${message}
                </p>
                
                <p class="text-slate-500 text-sm mt-6 font-medium italic opacity-90 z-10">
                    Wishing you joy and prosperity.
                </p>
            </div>
        `;

        document.body.appendChild(backdrop);
        document.body.appendChild(popup);
        
        if (typeof feather !== 'undefined') {
            feather.replace();
        }

        // Animate in after a short delay for cinematic entrance
        setTimeout(() => {
            backdrop.classList.remove('opacity-0');
            backdrop.classList.add('opacity-100');
            
            popup.classList.remove('opacity-0', 'scale-90');
            popup.classList.add('opacity-100', 'scale-100');
            
            // Auto dismiss after 8 seconds (extended from 5s)
            setTimeout(() => {
                backdrop.classList.remove('opacity-100');
                backdrop.classList.add('opacity-0');
                
                popup.classList.remove('opacity-100', 'scale-100');
                popup.classList.add('opacity-0', 'scale-90', 'translate-y-4');
                
                setTimeout(() => {
                    popup.remove();
                    backdrop.remove();
                }, 700); // Wait for transition to finish
            }, 8000);
        }, 1500);
    };

    // Run festival wishes
    showFestivalWishes();

    // WhatsApp Form Modal Logic
    const waModal = document.getElementById('whatsapp-form-modal');
    const waModalContent = document.getElementById('whatsapp-form-modal-content');
    const closeWaBtn = document.getElementById('close-whatsapp-form-btn');
    const waForm = document.getElementById('whatsapp-lead-form');

    if (waModal && closeWaBtn && waForm) {
        window.openWhatsAppForm = () => {
            waModal.classList.remove('opacity-0', 'pointer-events-none');
            waModalContent.classList.remove('scale-95');
            waModalContent.classList.add('scale-100');
            if(typeof feather !== 'undefined') feather.replace();
        };

        const closeWhatsAppForm = () => {
            waModal.classList.add('opacity-0', 'pointer-events-none');
            waModalContent.classList.remove('scale-100');
            waModalContent.classList.add('scale-95');
        };

        closeWaBtn.addEventListener('click', closeWhatsAppForm);

        waModal.addEventListener('click', (e) => {
            if (e.target === waModal) closeWhatsAppForm();
        });

        waForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('wa-name').value.trim();
            const mobile = document.getElementById('wa-mobile').value.trim();
            const designation = document.getElementById('wa-designation').value.trim() || 'N/A';
            const company = document.getElementById('wa-company').value.trim() || 'N/A';
            const email = document.getElementById('wa-email').value.trim() || 'N/A';
            const req = document.getElementById('wa-requirement').value.trim();

            const message = `*New Inquiry via Website*\n\n` +
                            `*Name:* ${name}\n` +
                            `*Mobile:* ${mobile}\n` +
                            `*Email:* ${email}\n` +
                            `*Designation:* ${designation}\n` +
                            `*Company:* ${company}\n\n` +
                            `*Requirement:*\n${req}`;

            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/917796852335?text=${encodedMessage}`;
            
            closeWhatsAppForm();
            waForm.reset();
            
            window.open(whatsappUrl, '_blank');
        });
    }

});
