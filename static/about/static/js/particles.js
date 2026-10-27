// 轻量粒子效果
class ParticleEffect {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 80; // 增加粒子数量
        this.init();
    }

    init() {
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '-1';
        document.body.appendChild(this.canvas);

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.createParticles();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                radius: Math.random() * 2.5 + 1.5, // 增大粒子
                opacity: Math.random() * 0.4 + 0.4 // 提高透明度
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 获取当前主题
        const isDark = document.documentElement.getAttribute('data-theme') === 'Dark';
        
        this.particles.forEach((particle, i) => {
            // 更新位置
            particle.x += particle.vx;
            particle.y += particle.vy;

            // 边界检测
            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;

            // 绘制粒子光晕
            const gradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.radius * 3
            );
            
            if (isDark) {
                gradient.addColorStop(0, `rgba(133, 62, 255, ${particle.opacity})`);
                gradient.addColorStop(0.5, `rgba(247, 108, 198, ${particle.opacity * 0.5})`);
                gradient.addColorStop(1, 'rgba(133, 62, 255, 0)');
            } else {
                gradient.addColorStop(0, `rgba(74, 46, 255, ${particle.opacity})`);
                gradient.addColorStop(0.5, `rgba(162, 208, 255, ${particle.opacity * 0.5})`);
                gradient.addColorStop(1, 'rgba(74, 46, 255, 0)');
            }
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius * 3, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();

            // 绘制粒子核心
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            
            if (isDark) {
                this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity * 0.9})`;
            } else {
                this.ctx.fillStyle = `rgba(74, 46, 255, ${particle.opacity * 0.9})`;
            }
            
            this.ctx.fill();

            // 连线效果
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[j].x - particle.x;
                const dy = this.particles[j].y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 150) { // 增加连线距离
                    this.ctx.beginPath();
                    const lineOpacity = 0.4 * (1 - distance / 150); // 提高连线透明度
                    this.ctx.strokeStyle = isDark 
                        ? `rgba(247, 108, 198, ${lineOpacity})`
                        : `rgba(74, 46, 255, ${lineOpacity})`;
                    this.ctx.lineWidth = 1; // 增加线宽
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        });

        requestAnimationFrame(() => this.animate());
    }
}

// 页面加载完成后初始化
window.addEventListener('load', () => {
    new ParticleEffect();
});
