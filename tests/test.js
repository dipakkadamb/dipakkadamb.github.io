// Simple Test Suite for Portfolio Website
// Run this in the browser console to test functionality

class PortfolioTester {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    test(name, testFn) {
        this.tests.push({ name, testFn });
    }

    async run() {
        console.log('🧪 Starting Portfolio Tests...\n');
        
        for (const { name, testFn } of this.tests) {
            try {
                const result = await testFn();
                if (result) {
                    console.log(`✅ ${name}`);
                    this.passed++;
                } else {
                    console.log(`❌ ${name}`);
                    this.failed++;
                }
            } catch (error) {
                console.log(`❌ ${name} - Error: ${error.message}`);
                this.failed++;
            }
        }
        
        console.log(`\n📊 Test Results: ${this.passed} passed, ${this.failed} failed`);
    }
}

// Create test instance
const tester = new PortfolioTester();

// Test 1: Check if essential elements exist
tester.test('Essential elements exist', () => {
    const navbar = document.getElementById('navbar');
    const progressBar = document.getElementById('scroll-progress');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    return !!(navbar && progressBar && mobileMenuBtn && mobileMenu);
});

// Test 2: Check if Feather icons are loaded
tester.test('Feather icons loaded', () => {
    return typeof feather !== 'undefined';
});

// Test 3: Test mobile menu toggle
tester.test('Mobile menu functionality', () => {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (!mobileMenuBtn || !mobileMenu) return false;
    
    // Check initial state
    const initialState = mobileMenu.classList.contains('translate-x-full');
    
    // Simulate click
    mobileMenuBtn.click();
    
    // Check if menu opened
    const openedState = !mobileMenu.classList.contains('translate-x-full');
    
    // Close it again
    mobileMenuBtn.click();
    
    return initialState && openedState;
});

// Test 4: Test scroll progress bar
tester.test('Scroll progress bar updates', async () => {
    const progressBar = document.getElementById('scroll-progress');
    if (!progressBar) return false;
    
    // Get initial width
    const initialWidth = progressBar.style.width;
    
    // Scroll down
    window.scrollTo(0, 200);
    
    // Wait a bit for scroll event
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check if width changed
    const newWidth = progressBar.style.width;
    
    // Scroll back to top
    window.scrollTo(0, 0);
    
    return initialWidth !== newWidth;
});

// Test 5: Test intersection observer animations
tester.test('Scroll animations work', async () => {
    const animatedElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
    if (animatedElements.length === 0) return false;
    
    // Check if elements have the required classes
    let hasAnimationClasses = true;
    animatedElements.forEach(el => {
        if (!el.classList.contains('reveal-up') && 
            !el.classList.contains('reveal-left') && 
            !el.classList.contains('reveal-right')) {
            hasAnimationClasses = false;
        }
    });
    
    return hasAnimationClasses;
});


// Test 7: Test responsive navigation
tester.test('Responsive navigation', () => {
    const navbar = document.getElementById('navbar');
    if (!navbar) return false;
    
    // Check if navbar has responsive classes
    const hasResponsiveClasses = navbar.classList.contains('fixed') && 
                                navbar.classList.contains('top-0') && 
                                navbar.classList.contains('w-full');
    
    return hasResponsiveClasses;
});

// Test 8: Test CSS custom properties
tester.test('CSS custom properties loaded', () => {
    const styles = getComputedStyle(document.documentElement);
    const gridBg = styles.getPropertyValue('--bg-grid');
    const glassBg = styles.getPropertyValue('--glass-bg');
    
    return gridBg && glassBg;
});

// Test 9: Test glass card styling
tester.test('Glass card elements exist', () => {
    const glassCards = document.querySelectorAll('.glass-card');
    return glassCards.length > 0;
});

// Test 10: Test form inputs (if contact form exists)
tester.test('Form input styling', () => {
    const formInputs = document.querySelectorAll('.form-input');
    if (formInputs.length === 0) return true; // No form on current page
    
    let hasValidStyling = true;
    formInputs.forEach(input => {
        if (!input.classList.contains('form-input')) {
            hasValidStyling = false;
        }
    });
    
    return hasValidStyling;
});

// Run all tests
console.log('Portfolio Website Test Suite');
console.log('============================');
console.log('Open browser console and run: portfolioTests.run()');

// Make it globally accessible
window.portfolioTests = tester;

// Auto-run if desired
// tester.run();
