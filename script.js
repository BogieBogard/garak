// Enhanced font loading with better error handling and validation
async function waitForFonts() {
    console.log('🔤 Starting font loading process...');

    if ('fonts' in document) {
        try {
            // Wait for all fonts to be ready
            await document.fonts.ready;
            console.log('✅ Document fonts ready');

            // Specifically check for Quicksand font
            const quicksandLoaded = await checkQuicksandFont();
            if (quicksandLoaded) {
                console.log('✅ Quicksand font verified and loaded');
            } else {
                console.warn('⚠️ Quicksand font not found, using fallback');
            }

        } catch (error) {
            console.warn('❌ Font loading check failed:', error);
        }
    } else {
        console.warn('⚠️ Font API not supported in this browser');
    }

    // Add a longer delay to ensure fonts are fully applied and rendered
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('🎯 Font loading process complete');
}

// Check if Quicksand font is properly loaded
async function checkQuicksandFont() {
    try {
        // Check if Quicksand font is available
        const fontFace = new FontFace('Quicksand', 'url(https://fonts.gstatic.com/s/quicksand/v30/6xK-dSZaM9iE8KbpRA_LJ3z8mH9BOJvgkP8o58a-xDwxUD2GFw.woff2)');
        await fontFace.load();
        document.fonts.add(fontFace);

        // Test if the font renders correctly
        const testElement = document.createElement('div');
        testElement.style.fontFamily = 'Quicksand, sans-serif';
        testElement.style.fontSize = '16px';
        testElement.style.position = 'absolute';
        testElement.style.visibility = 'hidden';
        testElement.textContent = 'Test';
        document.body.appendChild(testElement);

        const computedStyle = window.getComputedStyle(testElement);
        const fontFamily = computedStyle.fontFamily;

        document.body.removeChild(testElement);

        return fontFamily.includes('Quicksand');
    } catch (error) {
        console.warn('Font check failed:', error);
        return false;
    }
}

// Enhanced Lottie Animation initialization with better font handling
async function initLottieAnimation() {
    console.log('🎬 Initializing Lottie animation...');
    const lottieElement = document.querySelector('.lottie_home-hero-2');

    if (!lottieElement) {
        console.error('❌ Lottie container element not found');
        return;
    }

    if (typeof lottie === 'undefined') {
        console.error('❌ Lottie library not loaded');
        return;
    }

    try {
        // Wait for fonts to load first - this is critical for text quality
        console.log('⏳ Waiting for fonts to load...');
        await waitForFonts();

        let animationData;

        // Check if we're running on file:// protocol (static files)
        if (window.location.protocol === 'file:') {
            // For static files, we'll embed the JSON data directly
            if (typeof LOTTIE_ANIMATION_DATA !== 'undefined') {
                animationData = LOTTIE_ANIMATION_DATA;
                console.log('📁 Using embedded animation data for static files');
            } else {
                console.error('❌ Lottie animation data not found. For static files, animation data must be embedded.');
                return;
            }
        } else {
            // For HTTP/HTTPS, fetch the JSON file
            console.log('🌐 Fetching animation data from server...');
            const response = await fetch('2.json');
            if (!response.ok) {
                throw new Error(`Failed to fetch animation data: ${response.status}`);
            }
            animationData = await response.json();
            console.log('✅ Animation data loaded successfully');
        }

        // Configure Lottie with optimized settings for text rendering
        const animation = lottie.loadAnimation({
            container: lottieElement,
            renderer: 'svg', // SVG renderer for better text quality
            loop: true,
            autoplay: true,
            animationData: animationData,
            rendererSettings: {
                // Optimize SVG rendering for text
                preserveAspectRatio: 'xMidYMid meet',
                progressiveLoad: false, // Load all at once for better text rendering
                hideOnTransparent: true,
                // Enable text optimization
                className: 'lottie-svg-optimized'
            }
        });

        // Add event listeners for better debugging
        animation.addEventListener('complete', () => {
            console.log('🎯 Animation loop completed');
        });

        animation.addEventListener('loopComplete', () => {
            console.log('🔄 Animation loop cycle completed');
        });

        animation.addEventListener('enterFrame', () => {
            // Only log occasionally to avoid spam
            if (Math.random() < 0.001) {
                console.log('🎞️ Animation frame rendered');
            }
        });

        // Show the animation once it's loaded and add optimization classes
        lottieElement.classList.add('fonts-loaded', 'text-optimized');
        console.log('✅ Lottie animation initialized successfully');

        // Apply additional SVG text optimizations after a short delay
        setTimeout(() => {
            optimizeSVGTextRendering(lottieElement);
        }, 500);

    } catch (error) {
        console.error('❌ Error loading Lottie animation:', error);
        // Show a fallback or error state
        lottieElement.innerHTML = '<div class="animation-error">Animation failed to load</div>';
    }
}

// Optimize SVG text rendering after animation loads
function optimizeSVGTextRendering(container) {
    try {
        const svgElement = container.querySelector('svg');
        if (svgElement) {
            // Add text rendering optimizations
            svgElement.style.textRendering = 'optimizeLegibility';
            svgElement.style.shapeRendering = 'geometricPrecision';

            // Find all text elements and optimize them
            const textElements = svgElement.querySelectorAll('text');
            textElements.forEach(textEl => {
                textEl.style.fontFamily = 'Quicksand, -apple-system, BlinkMacSystemFont, sans-serif';
                textEl.style.fontWeight = '400';
                textEl.style.textRendering = 'optimizeLegibility';
                textEl.setAttribute('font-family', 'Quicksand');
                textEl.setAttribute('font-weight', '400');
            });

            console.log(`🎨 Optimized ${textElements.length} text elements for better rendering`);
        }
    } catch (error) {
        console.warn('⚠️ Could not optimize SVG text rendering:', error);
    }
}

// Copy code functionality
function copyCode(button, codeId) {
    const codeBlock = button.parentElement.querySelector('code');
    const text = codeBlock.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        button.classList.add('copied');
        button.innerHTML = '<i class="fas fa-check"></i>';
        
        setTimeout(() => {
            button.classList.remove('copied');
            button.innerHTML = '<i class="fas fa-copy"></i>';
        }, 2000);
    });
}

// Intersection Observer for animations - Linear-style smooth
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            // Add the Linear-style blur effect
            entry.target.style.opacity = '1';
            entry.target.style.filter = 'blur(0px)';
            entry.target.style.transform = 'translateY(0)';
            entry.target.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        }
    });
}, observerOptions);

// Observe all elements that should animate
document.querySelectorAll('.card, .step, .cta').forEach(el => {
    observer.observe(el);
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Linear-style subtle typewriter effect that works with blur
function subtleTypewriter(element, delay = 0) {
    const originalText = element.textContent;
    
    setTimeout(() => {
        // Don't override the blur animation - let it complete
        element.textContent = '';
        
        let charIndex = 0;
        
        function typeChar() {
            if (charIndex < originalText.length) {
                element.textContent += originalText.charAt(charIndex);
                charIndex++;
                // Slower typing - 20-30ms per character for more noticeable effect
                setTimeout(typeChar, Math.random() * 10 + 20);
            }
        }
        
        typeChar();
    }, delay);
}

// Add some Linear-style micro-interactions
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lottie animation
    initLottieAnimation().catch(console.error);
    
    // Add hover effects to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Apply subtle typewriter effect only to the title for a premium touch
    const headerTitle = document.querySelector('.header h1');

    if (headerTitle) {
        // Start typing at the same time as the blur fade-in begins (0.1s)
        subtleTypewriter(headerTitle, 100);
    }

    // API Testing Tab Functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked button and corresponding pane
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
});

// Smooth scroll function for the header badge
function scrollToSection(sectionId) {
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// OS Toggle functionality
function switchOS(os) {
    // Update active button state
    document.querySelectorAll('.os-toggle-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.os-toggle-btn[data-os="${os}"]`).classList.add('active');

    // Update command text elements
    document.querySelectorAll('.command-text.os-specific').forEach(text => {
        const mac = text.getAttribute('data-mac');
        const linux = text.getAttribute('data-linux');
        const pc = text.getAttribute('data-pc');

        if (os === 'mac' && mac) {
            text.textContent = mac;
        } else if (os === 'linux' && linux) {
            text.textContent = linux;
        } else if (os === 'pc' && pc) {
            text.textContent = pc;
        }
    });

    // Update command subtitle elements
    document.querySelectorAll('.command-subtitle.os-specific').forEach(subtitle => {
        const mac = subtitle.getAttribute('data-mac');
        const linux = subtitle.getAttribute('data-linux');
        const pc = subtitle.getAttribute('data-pc');

        if (os === 'mac' && mac) {
            subtitle.textContent = mac;
        } else if (os === 'linux' && linux) {
            subtitle.textContent = linux;
        } else if (os === 'pc' && pc) {
            subtitle.textContent = pc;
        }
    });

    // Hide/show command blocks based on OS
    const commandBlocks = document.querySelectorAll('.command-block');
    commandBlocks.forEach(block => {
        const label = block.querySelector('.command-label');
        if (label) {
            const labelText = label.textContent;
            if (labelText.includes('(Mac):')) {
                if (os === 'linux' || os === 'pc') {
                    block.style.display = 'none';
                } else {
                    block.style.display = 'block';
                }
            } else if (labelText.includes('(Linux):')) {
                if (os === 'mac' || os === 'pc') {
                    block.style.display = 'none';
                } else {
                    block.style.display = 'block';
                }
            } else if (labelText.includes('(Windows):')) {
                if (os === 'mac' || os === 'linux') {
                    block.style.display = 'none';
                } else {
                    block.style.display = 'block';
                }
            }
        }
    });
}

// Auto-trigger OS toggle on page load to fix step 3 rendering
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure all elements are fully rendered
    setTimeout(function() {
        // Simulate clicking the Mac button to trigger the layout fix
        const macButton = document.querySelector('.os-toggle-btn[data-os="mac"]');
        if (macButton) {
            macButton.click();
        }
    }, 100);
});
