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

    // Welcome Modal Logic — Scroll-Aware
    const welcomeModal = document.getElementById('welcome-modal');
    const welcomeModalContent = document.getElementById('welcome-modal-content');
    const closeModalBtn = document.getElementById('close-modal-btn');

    if (welcomeModal && closeModalBtn) {
        let modalAutoHideTimer = null;
        let modalManualClosed = false; // Track if user manually closed via X

        // Open modal function
        const openModal = () => {
            welcomeModal.classList.remove('opacity-0', 'pointer-events-none');
            welcomeModalContent.classList.remove('scale-95');
            welcomeModalContent.classList.add('scale-100');
        };

        // Close modal function
        const closeModal = () => {
            welcomeModal.classList.add('opacity-0', 'pointer-events-none');
            welcomeModalContent.classList.remove('scale-100');
            welcomeModalContent.classList.add('scale-95');
            if (modalAutoHideTimer) {
                clearTimeout(modalAutoHideTimer);
                modalAutoHideTimer = null;
            }
        };

        // Show modal on initial page load (1s delay)
        setTimeout(() => {
            openModal();
        }, 1000);

        // Expose open modal function globally (for Contact Me button)
        window.openWelcomeModal = () => {
            modalManualClosed = false;
            openModal();
        };

        // Close button click
        closeModalBtn.addEventListener('click', () => {
            modalManualClosed = true;
            closeModal();
        });

        // Close on outside click
        welcomeModal.addEventListener('click', (e) => {
            if (e.target === welcomeModal) {
                modalManualClosed = true;
                closeModal();
            }
        });

        // Scroll-aware: hide automatically on scroll down so it doesn't disturb the visitor.
        // Once hidden by scroll, it will NOT re-appear automatically.
        let hasHiddenDueToScroll = false;

        window.addEventListener('scroll', () => {
            // If already hidden by scroll or manual close, do nothing
            if (hasHiddenDueToScroll || modalManualClosed) return;

            const scrollY = window.scrollY;

            // User scrolled down past 100px — hide modal permanently
            if (scrollY > 100) {
                hasHiddenDueToScroll = true;
                closeModal();
            }
        }, { passive: true });
    }

    // Motivational Quotes Logic — Fetches from Quotable API with fallback
    const fallbackQuotes = [
        "The only way to do great work is to love what you do.",
        "Talk is cheap. Show me the code.",
        "First, solve the problem. Then, write the code.",
        "Make it work, make it right, make it fast.",
        "Simplicity is the soul of efficiency."
    ];

    const motivationalToast = document.getElementById('motivational-toast');
    const motivationalQuoteEl = document.getElementById('motivational-quote');

    const showMotivationalQuote = async () => {
        if (!motivationalToast || !motivationalQuoteEl) return;

        let quoteText;
        try {
            const res = await fetch('https://api.quotable.io/quotes/random');
            if (res.ok) {
                const data = await res.json();
                quoteText = data[0]?.content || null;
            }
        } catch (e) {
            // API failed, use fallback
        }

        if (!quoteText) {
            quoteText = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
        }

        motivationalQuoteEl.textContent = `"${quoteText}"`;

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

    // ============================
    // Satellite Map Flythrough (Leaflet + ESRI Imagery)
    // ============================
    const mapContainer = document.getElementById('map-flyto');
    if (mapContainer && typeof L !== 'undefined') {
        // Initialize Leaflet map — start at world view (zoom 2)
        const map = L.map('map-flyto', {
            center: [20, 40],
            zoom: 2,
            zoomControl: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            dragging: false,
            keyboard: false,
            touchZoom: false,
            boxZoom: false
        });

        // ESRI World Imagery — real satellite photos, free, no API key
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 18,
            attribution: '&copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics'
        }).addTo(map);

        let flyAnimationStarted = false;

        // Intersection Observer — trigger flyTo when section scrolls into view
        const mapObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !flyAnimationStarted) {
                flyAnimationStarted = true;
                startFlyToAnimation();
                mapObserver.disconnect();
            }
        }, { threshold: 0.25 });

        mapObserver.observe(mapContainer);

        function startFlyToAnimation() {
            const zoomStatus = document.getElementById('map-zoom-status');
            const zoomText = document.getElementById('map-zoom-text');
            const infoCard = document.getElementById('map-info-card');
            const mapTags = document.getElementById('map-tags');

            // Show zoom HUD
            if (zoomStatus) zoomStatus.style.opacity = '1';
            if (zoomText) zoomText.textContent = 'ZOOMING FROM SPACE...';

            // Begin flyTo after a brief pause
            setTimeout(() => {
                // Fly from world view to Pune — smooth continuous zoom
                map.flyTo([18.5204, 73.8567], 13, {
                    duration: 5,
                    easeLinearity: 0.2
                });

                // Update HUD text during the flight
                setTimeout(() => {
                    if (zoomText) zoomText.textContent = 'ENTERING ATMOSPHERE...';
                }, 1200);

                setTimeout(() => {
                    if (zoomText) zoomText.textContent = 'APPROACHING INDIA...';
                }, 2400);

                setTimeout(() => {
                    if (zoomText) zoomText.textContent = 'LOCATING PUNE...';
                }, 3600);

                // When flyTo animation completes
                map.once('moveend', () => {
                    if (zoomText) zoomText.textContent = 'LOCATION LOCKED';

                    // Add custom SVG pin marker with bounce animation
                    const pinIcon = L.divIcon({
                        className: 'map-custom-pin',
                        html: '<div class="pin-drop"><svg width="40" height="52" viewBox="0 0 40 52" fill="none"><path d="M20 0C8.95 0 0 8.95 0 20c0 14.25 20 32 20 32s20-17.75 20-32C40 8.95 31.05 0 20 0z" fill="#2563eb"/><circle cx="20" cy="20" r="10" fill="white"/><circle cx="20" cy="20" r="6" fill="#2563eb"/></svg><div class="pin-shadow"></div></div>',
                        iconSize: [40, 52],
                        iconAnchor: [20, 52]
                    });
                    L.marker([18.5204, 73.8567], { icon: pinIcon }).addTo(map);

                    // Show info card with slide-up
                    setTimeout(() => {
                        if (infoCard) {
                            infoCard.style.opacity = '1';
                            infoCard.style.transform = 'translateY(0)';
                            infoCard.style.pointerEvents = 'auto';
                        }
                    }, 400);

                    // Hide zoom HUD
                    setTimeout(() => {
                        if (zoomStatus) zoomStatus.style.opacity = '0';
                    }, 1000);

                    // Show location tags
                    setTimeout(() => {
                        if (mapTags) {
                            mapTags.style.opacity = '1';
                            mapTags.style.transform = 'translateY(0)';
                        }
                    }, 700);

                    // Enable map interactions after landing
                    setTimeout(() => {
                        map.scrollWheelZoom.enable();
                        map.dragging.enable();
                        map.doubleClickZoom.enable();
                        map.touchZoom.enable();
                    }, 1200);

                    // Re-init feather icons for the info card
                    if (typeof feather !== 'undefined') feather.replace();
                });
            }, 600);
        }
    }

});
