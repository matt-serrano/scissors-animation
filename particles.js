class ShapeGenerator {
    // Generate normalized (-1 to 1) relative coordinate for a particle based on active mode
    static getPoint(mode, index, total, time) {
        switch (mode) {
            case 1: // Scissors (Select Service)
                return this.getScissorsPoint(index, total, time);
            case 2: // Calendar (Pick Date)
                return this.getCalendarPoint(index, total, time);
            case 3: // Clock (Pick Time)
                return this.getClockPoint(index, total, time);
            case 4: // Checkmark Badge (Confirm)
                return this.getCheckmarkPoint(index, total, time);
            default:
                return { rx: 0, ry: 0 };
        }
    }

    // STATE 1: Scissors Shape (Handles at bottom, crossing blades at top)
    static getScissorsPoint(index, total, time) {
        const segment = Math.floor(total / 4);
        const group = Math.floor(index / segment);
        const relativeIndex = index % segment;
        const t = relativeIndex / segment;

        let rx = 0;
        let ry = 0;
        let arm = 'A';

        if (group === 0) {
            // Left Loop handle
            const angle = t * Math.PI * 2;
            rx = -0.16 + 0.12 * Math.cos(angle);
            ry = -0.3 + 0.12 * Math.sin(angle);
            arm = 'A';
        } else if (group === 1) {
            // Right Loop handle
            const angle = t * Math.PI * 2;
            rx = 0.16 + 0.12 * Math.cos(angle);
            ry = -0.3 + 0.12 * Math.sin(angle);
            arm = 'B';
        } else if (group === 2) {
            // Left-going blade (bottom-right to top-left)
            rx = 0.05 + t * (-0.14 - 0.05);
            ry = -0.15 + t * (0.55 - (-0.15));
            arm = 'B';
        } else {
            // Right-going blade (bottom-left to top-right)
            rx = -0.05 + t * (0.14 - (-0.05));
            ry = -0.15 + t * (0.55 - (-0.15));
            arm = 'A';
        }

        const px = 0;
        const py = -0.12;

        // Snip-snip cutting rotation animation
        const scissorAngle = 0.02 + (Math.sin(time * 0.055) + 1) * 0.038;
        const theta = arm === 'A' ? scissorAngle : -scissorAngle;

        // Rotate around pivot
        const dx = rx - px;
        const dy = ry - py;
        const rotX = px + dx * Math.cos(theta) - dy * Math.sin(theta);
        const rotY = py + dx * Math.sin(theta) + dy * Math.cos(theta);

        return { rx: rotX, ry: rotY };
    }

    // STATE 2: Calendar Grid Shape
    static getCalendarPoint(index, total, time) {
        const rectLimit = Math.floor(total * 0.55);
        const clipLimit = rectLimit + Math.floor(total * 0.10);

        if (index < rectLimit) {
            // Outer rectangle frame
            const t = index / rectLimit;
            const width = 0.76;
            const height = 0.56;
            const halfW = width / 2;
            const halfH = height / 2;
            
            const perimeter = 2 * (width + height);
            const p = t * perimeter;

            let rx, ry;
            if (p < width) {
                rx = -halfW + p;
                ry = halfH;
            } else if (p < width + height) {
                rx = halfW;
                ry = halfH - (p - width);
            } else if (p < 2 * width + height) {
                rx = halfW - (p - (width + height));
                ry = -halfH;
            } else {
                rx = -halfW;
                ry = -halfH + (p - (2 * width + height));
            }
            return { rx, ry };
        } 
        else if (index < clipLimit) {
            // Binder clips/rings
            const subIndex = index - rectLimit;
            const clipCount = clipLimit - rectLimit;
            const t = subIndex / clipCount;

            let rx, ry;
            const radius = 0.05;
            if (t < 0.5) {
                const angle = (t / 0.5) * Math.PI;
                rx = -0.16 + radius * Math.cos(angle);
                ry = 0.28 + radius * Math.sin(angle);
            } else {
                const angle = ((t - 0.5) / 0.5) * Math.PI;
                rx = 0.16 + radius * Math.cos(angle);
                ry = 0.28 + radius * Math.sin(angle);
            }
            return { rx, ry };
        } 
        else {
            // Grid Date dots
            const subIndex = index - clipLimit;
            const gridCount = total - clipLimit;
            
            const cols = 5;
            const rows = 4;
            const numPoints = cols * rows;
            const pointId = subIndex % numPoints;
            const col = pointId % cols;
            const row = Math.floor(pointId / cols);

            let rx = -0.24 + col * 0.12;
            let ry = 0.12 - row * 0.08;

            const ringId = Math.floor(subIndex / numPoints);
            const totalRings = Math.ceil(gridCount / numPoints);
            const angle = (ringId / totalRings) * Math.PI * 2 + (time * 0.02);
            
            const rPulse = 0.015 + Math.sin(time * 0.035 + pointId) * 0.003;
            rx += rPulse * Math.cos(angle);
            ry += rPulse * Math.sin(angle);

            return { rx, ry };
        }
    }

    // STATE 3: Clock Shape with sweeping ticking hands
    static getClockPoint(index, total, time) {
        const circleLimit = Math.floor(total * 0.60);
        const ticksLimit = circleLimit + Math.floor(total * 0.05);
        const pinLimit = ticksLimit + Math.floor(total * 0.02);
        const minHandLimit = pinLimit + Math.floor(total * 0.20);

        if (index < circleLimit) {
            // Outer dial ring
            const angle = (index / circleLimit) * Math.PI * 2;
            const rx = 0.44 * Math.cos(angle);
            const ry = 0.44 * Math.sin(angle);
            return { rx, ry };
        } 
        else if (index < ticksLimit) {
            // Major dial ticks (12, 3, 6, 9 o'clock marks)
            const subIndex = index - circleLimit;
            const ticksCount = ticksLimit - circleLimit;
            const tickId = Math.floor(subIndex / (ticksCount / 4));
            const localT = (subIndex % Math.floor(ticksCount / 4)) / (ticksCount / 4);
            
            const tickAngles = [-Math.PI/2, 0, Math.PI/2, Math.PI];
            const angle = tickAngles[tickId % 4];
            
            const r = 0.38 + localT * 0.06;
            const rx = r * Math.cos(angle);
            const ry = r * Math.sin(angle);
            return { rx, ry };
        } 
        else if (index < pinLimit) {
            return { rx: 0, ry: 0 };
        } 
        else if (index < minHandLimit) {
            // Minute Hand
            const subIndex = index - pinLimit;
            const handCount = minHandLimit - pinLimit;
            const t = subIndex / handCount;

            const minAngle = (time * 0.01) - Math.PI/2;
            const r = t * 0.36;
            const rx = r * Math.cos(minAngle);
            const ry = r * Math.sin(minAngle);
            return { rx, ry };
        } 
        else {
            // Hour Hand
            const subIndex = index - minHandLimit;
            const handCount = total - minHandLimit;
            const t = subIndex / handCount;

            const hourAngle = (time * 0.00083) - Math.PI/2; // ~12x slower
            const r = t * 0.22;
            const rx = r * Math.cos(hourAngle);
            const ry = r * Math.sin(hourAngle);
            return { rx, ry };
        }
    }

    // STATE 4: Checkmark Badge Shape
    static getCheckmarkPoint(index, total, time) {
        const crestLimit = Math.floor(total * 0.55);

        if (index < crestLimit) {
            // Outer circular frame crest
            const angle = (index / crestLimit) * Math.PI * 2;
            const rx = 0.45 * Math.cos(angle);
            const ry = 0.45 * Math.sin(angle);
            return { rx, ry };
        } 
        else {
            // Checkmark glyph lines
            const subIndex = index - crestLimit;
            const checkCount = total - crestLimit;
            const t = subIndex / checkCount;

            let rx, ry;
            if (t < 0.3) {
                const u = t / 0.3;
                rx = -0.2 + u * (-0.06 - (-0.2));
                ry = 0.0 + u * (-0.16 - 0.0);
            } else {
                const u = (t - 0.3) / 0.7;
                rx = -0.06 + u * (0.24 - (-0.06));
                ry = -0.16 + u * (0.22 - (-0.16));
            }

            const travelWave = Math.sin(time * 0.045 - t * 8) * 0.012;
            rx += travelWave * 0.5;
            ry += travelWave;

            return { rx, ry };
        }
    }
}

class Particle {
    constructor(canvas, index, totalParticles, x = null, y = null, isSpark = false) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.index = index;
        this.total = totalParticles;
        this.isSpark = isSpark;
        
        // Spawn positions
        this.x = x !== null ? x : Math.random() * this.canvas.width;
        this.y = y !== null ? y : Math.random() * this.canvas.height;
        
        this.vx = 0;
        this.vy = 0;

        // Dispersion Jitters (to make shapes look slightly dispersed and cloud-like)
        this.jitterX = (Math.random() - 0.5) * 32;
        this.jitterY = (Math.random() - 0.5) * 32;

        // Visual attributes
        this.hue = 38 + Math.floor(Math.random() * 14); // Gold spectrum
        this.saturation = 95 + Math.random() * 5;
        this.lightness = this.isSpark ? (70 + Math.random() * 20) : (50 + Math.random() * 15);
        this.radius = this.isSpark ? (0.8 + Math.random() * 2) : (1.0 + Math.random() * 2.8);
        
        this.alpha = this.isSpark ? 1.0 : (0.35 + Math.random() * 0.45);
        this.baseAlpha = this.alpha;
        
        this.pulseSpeed = 0.012 + Math.random() * 0.02;
        this.pulseAngle = Math.random() * Math.PI * 2;

        // Spark particles physics
        this.life = this.isSpark ? (30 + Math.random() * 30) : null;
        this.maxLife = this.life;
        if (this.isSpark) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2.0 + Math.random() * 5.0;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
        }
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        const grad = this.ctx.createRadialGradient(
            this.x, this.y, 0, 
            this.x, this.y, this.radius * 2
        );
        grad.addColorStop(0, `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, ${this.alpha})`);
        grad.addColorStop(0.5, `hsla(${this.hue}, ${this.saturation}%, ${this.lightness - 10}%, ${this.alpha * 0.5})`);
        grad.addColorStop(1, `hsla(${this.hue}, ${this.saturation}%, ${this.lightness - 20}%, 0)`);
        
        this.ctx.fillStyle = grad;
        this.ctx.fill();
    }

    update(mode, mouse, time, scale, transitionFactor) {
        if (this.isSpark) {
            this.vy += 0.055; // Gravity
            this.x += this.vx;
            this.y += this.vy;
            this.life--;
            this.alpha = Math.max(0, this.life / this.maxLife);
            return;
        }

        // 1. Calculate Target screen coordinates
        const target = ShapeGenerator.getPoint(mode, this.index, this.total, time);
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Dynamic sways (to make the shapes feel more "live")
        const swayX = Math.sin(time * 0.018 + this.index * 0.004) * 14;
        const swayY = Math.cos(time * 0.014 + this.index * 0.004) * 14;

        const tx = centerX + target.rx * scale + this.jitterX + swayX;
        const ty = centerY - target.ry * scale + this.jitterY + swayY;

        // 2. Spring calculations (softened to increase fluid elasticity/liveness)
        const dx = tx - this.x;
        const dy = ty - this.y;
        
        const springStrength = 0.0022 * transitionFactor;
        const damping = 0.895;

        let ax = dx * springStrength;
        let ay = dy * springStrength;

        // 3. Increased random noise (to amplify organic "tumble/drift" liveness)
        const noise = 0.16;
        ax += (Math.random() - 0.5) * noise;
        ay += (Math.random() - 0.5) * noise;

        // 4. Mouse repulsion
        if (mouse.x !== null && mouse.y !== null) {
            const mdx = this.x - mouse.x;
            const mdy = this.y - mouse.y;
            const dist = Math.sqrt(mdx * mdx + mdy * mdy);
            
            const pushRadius = 80;
            if (dist < pushRadius) {
                const force = (pushRadius - dist) / pushRadius;
                const angle = Math.atan2(mdy, mdx);
                
                this.vx += Math.cos(angle) * force * 0.45;
                this.vy += Math.sin(angle) * force * 0.45;
            }
        }

        this.vx = (this.vx + ax) * damping;
        this.vy = (this.vy + ay) * damping;
        this.x += this.vx;
        this.y += this.vy;

        // Pulsing alpha
        this.pulseAngle += this.pulseSpeed;
        this.alpha = this.baseAlpha + Math.sin(this.pulseAngle) * 0.12;
        this.alpha = Math.max(0.1, Math.min(0.95, this.alpha));
    }
}

class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particle-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.sparks = [];
        
        this.totalParticles = 460;
        this.mode = 1;
        this.time = 0;
        
        this.transitionFactor = 0.1;
        this.targetTransition = 1.0;
        this.mouse = { x: null, y: null };
        
        this.init();
    }

    init() {
        this.resize();
        this.createParticles();

        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        window.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });

        // Click bursts in Checkmark mode
        window.addEventListener('click', (e) => {
            if (this.mode === 4) {
                this.triggerSparks(e.clientX, e.clientY);
            }
        });

        this.tick();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.scale = Math.min(this.canvas.width, this.canvas.height) * 0.68;
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.totalParticles; i++) {
            this.particles.push(new Particle(this.canvas, i, this.totalParticles));
        }
    }

    triggerSparks(x, y) {
        const sparkCount = 35;
        for (let i = 0; i < sparkCount; i++) {
            this.sparks.push(new Particle(this.canvas, i, sparkCount, x, y, true));
        }
    }

    setMode(newMode) {
        if (this.mode === newMode) return;
        this.mode = newMode;
        this.transitionFactor = 0.05;
    }

    drawConstellations() {
        const maxDist = 80;
        this.ctx.lineWidth = 0.5;

        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p1 = this.particles[i];
                const p2 = this.particles[j];
                
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if (dist < maxDist) {
                    const opacity = (1 - (dist / maxDist)) * 0.14;
                    this.ctx.strokeStyle = `rgba(224, 169, 109, ${opacity})`;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            }
        }
    }

    tick() {
        this.time++;

        // Clear canvas
        this.ctx.fillStyle = 'rgba(5, 5, 7, 0.28)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Ease transition factor
        if (this.transitionFactor < this.targetTransition) {
            this.transitionFactor += 0.038;
            if (this.transitionFactor > this.targetTransition) {
                this.transitionFactor = this.targetTransition;
            }
        }

        // Connect nodes in Checkmark mode
        if (this.mode === 4) {
            this.drawConstellations();
        }

        // Draw and update main particles
        this.particles.forEach(p => {
            p.update(this.mode, this.mouse, this.time, this.scale, this.transitionFactor);
            p.draw();
        });

        // Draw and update sparks
        for (let i = this.sparks.length - 1; i >= 0; i--) {
            const s = this.sparks[i];
            s.update(this.mode, this.mouse, this.time, this.scale, this.transitionFactor);
            s.draw();
            
            if (s.life <= 0) {
                this.sparks.splice(i, 1);
            }
        }

        requestAnimationFrame(() => this.tick());
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.particles = new ParticleSystem();
});
