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

    // AI Chatbot Logic
    const toggleAiBtn = document.getElementById('toggle-ai-chat');
    const closeAiBtn = document.getElementById('close-ai-chat');
    const aiChatWindow = document.getElementById('ai-chat-window');
    const aiChatInput = document.getElementById('ai-chat-input');
    const sendAiMsgBtn = document.getElementById('send-ai-msg');
    const aiChatMessages = document.getElementById('ai-chat-messages');

    let isAiChatOpen = false;
    let chatHistory = [];

    // Anthropic API Token (Direct client-side usage is not advised, per user override)
    const ANTHROPIC_API_KEY = "jPJm90wwLvJa_uxrCsmQ-q9KlwNe7SS_1KRQdaZu";

    const toggleAiChat = () => {
        isAiChatOpen = !isAiChatOpen;
        if (isAiChatOpen) {
            aiChatWindow.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
            toggleAiBtn.classList.add('scale-0');
            setTimeout(() => aiChatInput.focus(), 300);
        } else {
            aiChatWindow.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
            toggleAiBtn.classList.remove('scale-0');
        }
    };

    if (toggleAiBtn) toggleAiBtn.addEventListener('click', toggleAiChat);
    if (closeAiBtn) closeAiBtn.addEventListener('click', toggleAiChat);

    const appendMessage = (text, isUser = false) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `p-3 max-w-[85%] text-sm rounded-2xl ${isUser
            ? 'self-end bg-gradient-to-r from-accent-blue to-accent-cyan text-white rounded-tr-sm shadow-md'
            : 'self-start bg-white/10 border border-white/5 text-slate-200 rounded-tl-sm'
            }`;
        msgDiv.textContent = text;
        aiChatMessages.appendChild(msgDiv);
        aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
    };

    const handleSend = async () => {
        const text = aiChatInput.value.trim();
        if (!text) return;

        // Display user message
        appendMessage(text, true);
        aiChatInput.value = '';
        sendAiMsgBtn.disabled = true;

        // Append thinking indicator
        const thinkingId = 'thinking-' + Date.now();
        const thinkingDiv = document.createElement('div');
        thinkingDiv.id = thinkingId;
        thinkingDiv.className = 'self-start bg-white/5 border border-white/5 text-slate-400 p-3 rounded-2xl rounded-tl-sm text-xs italic flex items-center gap-2';
        thinkingDiv.innerHTML = '<span class="flex gap-1"><span class="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-bounce" style="animation-delay: 0s"></span><span class="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-bounce" style="animation-delay: 0.1s"></span><span class="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-bounce" style="animation-delay: 0.2s"></span></span> Thinking...';
        aiChatMessages.appendChild(thinkingDiv);
        aiChatMessages.scrollTop = aiChatMessages.scrollHeight;

        chatHistory.push({ role: "user", content: text });

        try {
            const response = await fetch("https://gateway.ai.cloudflare.com/v1/d434c7204b5d7b524330263418dbc74a/default/compat/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${ANTHROPIC_API_KEY}`
                },
                body: JSON.stringify({
                    model: "anthropic/claude-sonnet-4-5",
                    messages: [
                        { role: "system", content: "You are an AI assistant on Dipak Kadamb's portfolio website. Dipak is an AI Web Developer and Zoho Integration Specialist. Keep your answers brief, friendly, and helpful." },
                        ...chatHistory
                    ]
                })
            });

            const data = await response.json();

            // Remove thinking indicator
            document.getElementById(thinkingId)?.remove();

            if (response.ok && data.choices && data.choices.length > 0) {
                const aiReply = data.choices[0].message.content;
                chatHistory.push({ role: "assistant", content: aiReply });
                appendMessage(aiReply, false);
            } else {
                console.error("API Error:", data);
                appendMessage("Sorry, I encountered an error connecting to the AI Gateway.", false);
            }

        } catch (error) {
            console.error("Fetch Error:", error);
            document.getElementById(thinkingId)?.remove();
            appendMessage("Sorry, I could not reach the server right now. (CORS or Network Error)", false);
        }

        sendAiMsgBtn.disabled = false;
        aiChatInput.focus();
    };

    if (sendAiMsgBtn) sendAiMsgBtn.addEventListener('click', handleSend);
    if (aiChatInput) {
        aiChatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSend();
        });
    }

});
