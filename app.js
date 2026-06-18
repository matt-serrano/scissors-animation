// Minimal Showcase Controller
const state = {
    currentStep: 1,
    maxSteps: 4
};

// DOM Elements
const DOM = {
    prevArrow: document.getElementById('prev-arrow'),
    nextArrow: document.getElementById('next-arrow')
};

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    setupControls();
    updateArrowStates();
}

function setupControls() {
    // Arrow Left Button
    DOM.prevArrow.addEventListener('click', (e) => {
        e.preventDefault();
        navigateStep(-1);
    });

    // Arrow Right Button
    DOM.nextArrow.addEventListener('click', (e) => {
        e.preventDefault();
        navigateStep(1);
    });

    // Keyboard controls
    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            navigateStep(-1);
        } else if (e.key === 'ArrowRight' || e.key === ' ') {
            e.preventDefault(); // prevent space scrolling
            navigateStep(1);
        }
    });
}

function navigateStep(direction) {
    let nextStep = state.currentStep + direction;
    
    // Loop around step selections
    if (nextStep < 1) {
        nextStep = state.maxSteps;
    } else if (nextStep > state.maxSteps) {
        nextStep = 1;
    }
    
    state.currentStep = nextStep;
    
    // Set particle engine state
    if (window.particles) {
        window.particles.setMode(state.currentStep);
    }
    
    updateArrowStates();
}

function updateArrowStates() {
    // Optional: add active glow indicators or logs if needed
    // Keep it minimal and clean
}
