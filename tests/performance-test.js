// Performance Testing Suite for Portfolio Website
// Tests loading performance, animation smoothness, and resource optimization

class PerformanceTester {
    constructor() {
        this.metrics = {};
    }

    // Test 1: Page Load Performance
    async testPageLoadPerformance() {
        console.log('📊 Testing Page Load Performance...');
        
        const navigation = performance.getEntriesByType('navigation')[0];
        const paintEntries = performance.getEntriesByType('paint');
        
        const metrics = {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            firstPaint: paintEntries.find(p => p.name === 'first-paint')?.startTime || 0,
            firstContentfulPaint: paintEntries.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
            totalLoadTime: navigation.loadEventEnd - navigation.startTime
        };
        
        console.log('Page Load Metrics:', metrics);
        
        // Evaluate performance
        const scores = {
            excellent: { loadTime: 1500, fcp: 1000 },
            good: { loadTime: 3000, fcp: 2000 },
            needsImprovement: { loadTime: 5000, fcp: 3000 }
        };
        
        let rating = 'excellent';
        if (metrics.totalLoadTime > scores.needsImprovement.loadTime) rating = 'needs improvement';
        else if (metrics.totalLoadTime > scores.good.loadTime) rating = 'good';
        
        console.log(`🎯 Load Performance Rating: ${rating.toUpperCase()}`);
        return metrics;
    }

    // Test 2: Animation Performance
    async testAnimationPerformance() {
        console.log('🎬 Testing Animation Performance...');
        
        const animatedElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
        const scrollContainer = document.documentElement;
        
        // Measure scroll performance
        const scrollMetrics = {
            frameDrops: 0,
            averageFrameTime: 0,
            maxFrameTime: 0
        };
        
        let frameCount = 0;
        let lastFrameTime = performance.now();
        const frameTimes = [];
        
        const measureFrame = () => {
            const currentTime = performance.now();
            const frameTime = currentTime - lastFrameTime;
            frameTimes.push(frameTime);
            
            if (frameTime > 16.67) { // 60fps threshold
                scrollMetrics.frameDrops++;
            }
            
            scrollMetrics.maxFrameTime = Math.max(scrollMetrics.maxFrameTime, frameTime);
            lastFrameTime = currentTime;
            frameCount++;
        };
        
        // Simulate scrolling
        const scrollDuration = 2000; // 2 seconds
        const scrollSteps = 60;
        const scrollStep = document.body.scrollHeight / scrollSteps;
        
        for (let i = 0; i < scrollSteps; i++) {
            window.scrollTo(0, i * scrollStep);
            measureFrame();
            await new Promise(resolve => setTimeout(resolve, scrollDuration / scrollSteps));
        }
        
        // Reset scroll position
        window.scrollTo(0, 0);
        
        if (frameTimes.length > 0) {
            scrollMetrics.averageFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
        }
        
        console.log('Animation Performance:', scrollMetrics);
        
        const fps = 1000 / scrollMetrics.averageFrameTime;
        const rating = fps >= 55 ? 'excellent' : fps >= 30 ? 'good' : 'needs improvement';
        console.log(`🎯 Animation Performance Rating: ${rating.toUpperCase()} (${fps.toFixed(1)} FPS)`);
        
        return scrollMetrics;
    }

    // Test 3: Memory Usage
    testMemoryUsage() {
        console.log('💾 Testing Memory Usage...');
        
        if ('memory' in performance) {
            const memory = performance.memory;
            const memoryMetrics = {
                usedJSHeapSize: memory.usedJSHeapSize,
                totalJSHeapSize: memory.totalJSHeapSize,
                jsHeapSizeLimit: memory.jsHeapSizeLimit,
                usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
            };
            
            console.log('Memory Usage:', memoryMetrics);
            
            const rating = memoryMetrics.usagePercentage < 50 ? 'excellent' : 
                          memoryMetrics.usagePercentage < 75 ? 'good' : 'needs improvement';
            console.log(`🎯 Memory Usage Rating: ${rating.toUpperCase()}`);
            
            return memoryMetrics;
        } else {
            console.log('⚠️ Memory API not available in this browser');
            return null;
        }
    }

    // Test 4: Resource Loading
    async testResourceLoading() {
        console.log('📦 Testing Resource Loading...');
        
        const resources = performance.getEntriesByType('resource');
        const resourcesByType = {};
        
        resources.forEach(resource => {
            const type = resource.initiatorType || 'other';
            if (!resourcesByType[type]) {
                resourcesByType[type] = [];
            }
            resourcesByType[type].push({
                name: resource.name.split('/').pop(),
                duration: resource.duration,
                size: resource.transferSize || 0
            });
        });
        
        // Calculate total resource size and loading time
        const totalSize = resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
        const totalLoadTime = Math.max(...resources.map(r => r.responseEnd || 0));
        
        const resourceMetrics = {
            totalResources: resources.length,
            totalSize: totalSize,
            totalLoadTime: totalLoadTime,
            resourcesByType: resourcesByType
        };
        
        console.log('Resource Loading:', resourceMetrics);
        
        // Format size for display
        const formatSize = (bytes) => {
            if (bytes < 1024) return bytes + ' B';
            if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
            return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        };
        
        console.log(`📊 Total Resource Size: ${formatSize(totalSize)}`);
        console.log(`⏱️ Total Resource Load Time: ${totalLoadTime.toFixed(2)}ms`);
        
        return resourceMetrics;
    }

    // Test 5: Accessibility Check
    testAccessibility() {
        console.log('♿ Testing Accessibility...');
        
        const accessibilityTests = {
            hasAltText: 0,
            hasAriaLabels: 0,
            hasSemanticHTML: 0,
            hasKeyboardNavigation: 0,
            totalTests: 0
        };
        
        // Test images have alt text
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            accessibilityTests.totalTests++;
            if (img.alt || img.getAttribute('aria-label')) {
                accessibilityTests.hasAltText++;
            }
        });
        
        // Test ARIA labels
        const elementsWithAria = document.querySelectorAll('[aria-label], [aria-labelledby], [role]');
        accessibilityTests.hasAriaLabels = elementsWithAria.length;
        accessibilityTests.totalTests += elementsWithAria.length;
        
        // Test semantic HTML
        const semanticElements = document.querySelectorAll('header, nav, main, section, article, aside, footer');
        accessibilityTests.hasSemanticHTML = semanticElements.length;
        accessibilityTests.totalTests += semanticElements.length;
        
        // Test keyboard navigation (focusable elements)
        const focusableElements = document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        accessibilityTests.hasKeyboardNavigation = focusableElements.length;
        accessibilityTests.totalTests += focusableElements.length;
        
        const score = (accessibilityTests.hasAltText + accessibilityTests.hasAriaLabels + 
                      accessibilityTests.hasSemanticHTML + accessibilityTests.hasKeyboardNavigation) / 
                      accessibilityTests.totalTests * 100;
        
        console.log('Accessibility Tests:', accessibilityTests);
        console.log(`♿ Accessibility Score: ${score.toFixed(1)}%`);
        
        return { ...accessibilityTests, score };
    }

    // Run all performance tests
    async runAllTests() {
        console.log('🚀 Starting Performance Test Suite...\n');
        
        const results = {};
        
        try {
            results.pageLoad = await this.testPageLoadPerformance();
            console.log('');
            
            results.animation = await this.testAnimationPerformance();
            console.log('');
            
            results.memory = this.testMemoryUsage();
            console.log('');
            
            results.resources = await this.testResourceLoading();
            console.log('');
            
            results.accessibility = this.testAccessibility();
            console.log('');
            
            console.log('✅ Performance testing completed!');
            return results;
            
        } catch (error) {
            console.error('❌ Performance testing failed:', error);
            return results;
        }
    }
}

// Create global instance
window.performanceTester = new PerformanceTester();

// Auto-run after page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => performanceTester.runAllTests(), 1000);
    });
} else {
    setTimeout(() => performanceTester.runAllTests(), 1000);
}

console.log('Performance Test Suite loaded. Run performanceTester.runAllTests() to start testing.');
