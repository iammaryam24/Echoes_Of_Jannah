import React, { useEffect, useRef } from 'react';

export default function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let stars = [];
    let animationId;
    let mouseX = null;
    let mouseY = null;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      particles = [];
      stars = [];
      const particleCount = Math.min(60, Math.floor(window.innerWidth / 25));
      const starCount = Math.min(150, Math.floor(window.innerWidth / 10));
      
      // Create particles with emerald/teal color scheme
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 3 + 1.5,
          alpha: Math.random() * 0.4 + 0.2,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          color: `hsl(${Math.random() * 40 + 150}, 70%, 55%)`, // Green/teal range
          pulse: Math.random() * Math.PI * 2,
        });
      }
      
      // Create stars with softer appearance
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5 + 0.5,
          alpha: Math.random() * 0.3 + 0.1,
          twinkle: Math.random() * Math.PI * 2,
        });
      }
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw stars (background) - softer glow
      stars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        const twinkleAlpha = star.alpha + Math.sin(Date.now() * 0.0008 + star.twinkle) * 0.15;
        ctx.fillStyle = `rgba(100, 200, 150, ${Math.max(0.05, twinkleAlpha * 0.6)})`;
        ctx.fill();
      });
      
      // Draw particles with gradient glow
      particles.forEach((particle) => {
        // Outer glow
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius + 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${particle.alpha * 0.3})`;
        ctx.fill();
        
        // Main particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        const pulseAlpha = particle.alpha + Math.sin(Date.now() * 0.003 + particle.pulse) * 0.1;
        ctx.fillStyle = `rgba(16, 185, 129, ${Math.max(0.15, pulseAlpha)})`;
        ctx.fill();
        
        // Inner bright spot
        ctx.beginPath();
        ctx.arc(particle.x - 0.5, particle.y - 0.5, particle.radius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.alpha * 0.5})`;
        ctx.fill();
        
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        if (particle.x < -20) particle.x = canvas.width + 20;
        if (particle.x > canvas.width + 20) particle.x = -20;
        if (particle.y < -20) particle.y = canvas.height + 20;
        if (particle.y > canvas.height + 20) particle.y = -20;
      });
      
      // Draw connections between nearby particles with gradient
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const opacity = 0.06 * (1 - distance / 120);
            ctx.strokeStyle = `rgba(16, 185, 129, ${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      
      // Mouse interaction - gentle attraction
      if (mouseX && mouseY) {
        particles.forEach((particle) => {
          const dx = mouseX - particle.x;
          const dy = mouseY - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 180) {
            const angle = Math.atan2(dy, dx);
            const force = (180 - distance) / 3000;
            particle.speedX += Math.cos(angle) * force;
            particle.speedY += Math.sin(angle) * force;
            
            // Cap speed
            const maxSpeed = 1.5;
            if (Math.abs(particle.speedX) > maxSpeed) particle.speedX = Math.sign(particle.speedX) * maxSpeed;
            if (Math.abs(particle.speedY) > maxSpeed) particle.speedY = Math.sign(particle.speedY) * maxSpeed;
          }
        });
      }
      
      // Draw occasional shooting stars
      if (Math.random() < 0.005) {
        const shootingStar = {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height * 0.3,
          length: 0,
          active: true
        };
        
        let shootingStarLength = 0;
        const animateShootingStar = () => {
          if (shootingStarLength < 100) {
            ctx.beginPath();
            ctx.moveTo(shootingStar.x, shootingStar.y);
            ctx.lineTo(shootingStar.x - shootingStarLength, shootingStar.y - shootingStarLength * 0.5);
            ctx.strokeStyle = `rgba(16, 185, 129, ${0.8 - shootingStarLength / 150})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            shootingStarLength += 5;
            requestAnimationFrame(animateShootingStar);
          }
        };
        animateShootingStar();
      }
      
      animationId = requestAnimationFrame(drawParticles);
    };

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseX = null;
      mouseY = null;
    };

    resize();
    createParticles();
    drawParticles();

    window.addEventListener('resize', () => {
      resize();
      createParticles();
    });
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none opacity-30 z-0" />;
}