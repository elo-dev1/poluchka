/**
 * SnowOverlay: High-performance canvas-based particle snowfall effect.
 * Positioned fixed over the whole screen with pointer-events: none,
 * smoothly animated with requestAnimationFrame.
 */
class SnowOverlay {
  constructor(canvasId = 'snow-canvas', particleCount = 45) {
    this.canvasId = canvasId;
    this.particleCount = particleCount;
    this.canvas = document.getElementById(canvasId);
    this.ctx = null;
    this.particles = [];
    this.animationFrameId = null;
    this.isRunning = false;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.handleResize = this.handleResize.bind(this);
    this.animate = this.animate.bind(this);

    this.init();
  }

  init() {
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = this.canvasId;
      this.canvas.className = 'snow-overlay-canvas';
      document.body.prepend(this.canvas);
    }

    this.ctx = this.canvas.getContext('2d');
    this.updateDimensions();

    window.addEventListener('resize', this.handleResize);
    this.createParticles();
  }

  updateDimensions() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    if (this.canvas) {
      this.canvas.width = this.width;
      this.canvas.height = this.height;
    }
  }

  handleResize() {
    this.updateDimensions();
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push(this.createParticle(true));
    }
  }

  createParticle(isInitial = false) {
    return {
      x: Math.random() * this.width,
      y: isInitial ? Math.random() * this.height : -10 - Math.random() * 20,
      radius: 1.2 + Math.random() * 2.6, // Size 1.2px - 3.8px
      fallSpeed: 0.6 + Math.random() * 1.5, // Fall speed
      swaySpeed: 0.012 + Math.random() * 0.02,
      swayOffset: Math.random() * Math.PI * 2,
      swayAmplitude: 0.6 + Math.random() * 1.4,
      opacity: 0.35 + Math.random() * 0.5,
      blur: Math.random() > 0.6 // Subtle soft glow on some snowflakes
    };
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    if (this.canvas) {
      this.canvas.style.display = 'block';
    }
    this.updateDimensions();
    this.animate();
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.canvas.style.display = 'none';
    }
  }

  toggle(enabled) {
    if (enabled) {
      this.start();
    } else {
      this.stop();
    }
  }

  isEnabled() {
    return this.isRunning;
  }

  animate() {
    if (!this.isRunning) return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Update position
      p.y += p.fallSpeed;
      p.x += Math.sin(p.swayOffset) * p.swayAmplitude;
      p.swayOffset += p.swaySpeed;

      // Draw snowflake
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
      if (p.blur) {
        this.ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
        this.ctx.shadowBlur = 4;
      } else {
        this.ctx.shadowBlur = 0;
      }
      this.ctx.fill();

      // Wrap around bottom/sides
      if (p.y > this.height + 15 || p.x < -20 || p.x > this.width + 20) {
        this.particles[i] = this.createParticle(false);
      }
    }

    this.animationFrameId = requestAnimationFrame(this.animate);
  }
}

// Global instance
window.SnowOverlay = SnowOverlay;
