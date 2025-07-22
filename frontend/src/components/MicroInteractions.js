import React, { useEffect } from 'react';

const MicroInteractions = () => {
  useEffect(() => {
    // Enhanced cursor trail with cosmic particles
    const cursor = { x: 0, y: 0 };
    const particles = [];
    const particleCount = 15;
    
    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: 0,
        y: 0,
        alpha: 0,
        delay: i * 3,
        size: Math.random() * 3 + 1
      });
    }

    // Create canvas for cursor effects
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    canvas.style.mixBlendMode = 'screen';
    
    document.body.appendChild(canvas);

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse move handler
    const handleMouseMove = (e) => {
      cursor.x = e.clientX;
      cursor.y = e.clientY;
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      particles.forEach((particle, index) => {
        if (particle.delay > 0) {
          particle.delay--;
          return;
        }
        
        // Smooth follow
        const dx = cursor.x - particle.x;
        const dy = cursor.y - particle.y;
        
        particle.x += dx * 0.1;
        particle.y += dy * 0.1;
        
        // Calculate alpha based on distance
        const distance = Math.sqrt(dx * dx + dy * dy);
        particle.alpha = Math.max(0, 1 - distance / 100);
        
        if (particle.alpha > 0) {
          ctx.save();
          ctx.globalAlpha = particle.alpha * 0.6;
          
          // Create gradient
          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size * 4
          );
          gradient.addColorStop(0, '#8b5cf6');
          gradient.addColorStop(0.5, '#3b82f6');
          gradient.addColorStop(1, 'transparent');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });
      
      requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', handleMouseMove);
    animate();

    // Button hover animations
    const addButtonAnimations = () => {
      const buttons = document.querySelectorAll('.btn, button, [role="button"]');
      
      buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
          button.style.transform = 'translateY(-2px)';
          button.style.transition = 'all 0.3s ease';
        });
        
        button.addEventListener('mouseleave', () => {
          button.style.transform = 'translateY(0)';
        });
        
        button.addEventListener('mousedown', () => {
          button.style.transform = 'translateY(1px) scale(0.98)';
        });
        
        button.addEventListener('mouseup', () => {
          button.style.transform = 'translateY(-2px) scale(1)';
        });
      });
    };

    // Card hover animations
    const addCardAnimations = () => {
      const cards = document.querySelectorAll('.glass-surface, .card');
      
      cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
          card.style.transform = 'translateY(-4px) scale(1.02)';
          card.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
          card.style.boxShadow = '0 20px 40px rgba(139, 92, 246, 0.3)';
        });
        
        card.addEventListener('mouseleave', () => {
          card.style.transform = 'translateY(0) scale(1)';
          card.style.boxShadow = '';
        });
      });
    };

    // Text glow animations
    const addTextAnimations = () => {
      const glowTexts = document.querySelectorAll('h1, h2, .text-glow');
      
      glowTexts.forEach(text => {
        text.addEventListener('mouseenter', () => {
          text.style.textShadow = '0 0 20px rgba(139, 92, 246, 0.8), 0 0 40px rgba(59, 130, 246, 0.6)';
          text.style.transition = 'text-shadow 0.3s ease';
        });
        
        text.addEventListener('mouseleave', () => {
          text.style.textShadow = '';
        });
      });
    };

    // Loading animations
    const addLoadingAnimations = () => {
      const loadingElements = document.querySelectorAll('[data-loading]');
      
      loadingElements.forEach(element => {
        const shimmer = document.createElement('div');
        shimmer.className = 'shimmer-effect';
        shimmer.style.cssText = `
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          animation: shimmer 2s infinite;
        `;
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(shimmer);
      });
    };

    // Ripple effect
    const addRippleEffect = () => {
      document.addEventListener('click', (e) => {
        const target = e.target.closest('.btn, button, [role="button"]');
        if (!target) return;
        
        const ripple = document.createElement('div');
        const rect = target.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          left: ${x}px;
          top: ${y}px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%);
          pointer-events: none;
          animation: ripple 0.6s linear;
          z-index: 1;
        `;
        
        target.style.position = 'relative';
        target.style.overflow = 'hidden';
        target.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
      });
    };

    // Floating animation for icons
    const addFloatingAnimation = () => {
      const icons = document.querySelectorAll('svg, .icon');
      
      icons.forEach((icon, index) => {
        icon.style.animation = `float ${3 + (index % 3)}s ease-in-out infinite`;
        icon.style.animationDelay = `${index * 0.1}s`;
      });
    };

    // Initialize all animations
    setTimeout(() => {
      addButtonAnimations();
      addCardAnimations();
      addTextAnimations();
      addLoadingAnimations();
      addRippleEffect();
      addFloatingAnimation();
    }, 100);

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resizeCanvas);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, []);

  // Add CSS animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes shimmer {
        0% { left: -100%; }
        100% { left: 100%; }
      }
      
      @keyframes ripple {
        0% {
          transform: scale(0);
          opacity: 1;
        }
        100% {
          transform: scale(2);
          opacity: 0;
        }
      }
      
      @keyframes float {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-6px);
        }
      }
      
      @keyframes pulse-glow {
        0%, 100% {
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
        }
        50% {
          box-shadow: 0 0 30px rgba(139, 92, 246, 0.6);
        }
      }
      
      @keyframes cosmic-rotate {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
      
      .cosmic-glow {
        animation: pulse-glow 3s ease-in-out infinite;
      }
      
      .cosmic-rotate {
        animation: cosmic-rotate 20s linear infinite;
      }
      
      .hover-lift:hover {
        transform: translateY(-4px);
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      
      .hover-glow:hover {
        box-shadow: 0 0 30px rgba(139, 92, 246, 0.5);
        transition: box-shadow 0.3s ease;
      }
      
      .text-shimmer {
        background: linear-gradient(45deg, #8b5cf6, #3b82f6, #8b5cf6);
        background-size: 200% 200%;
        animation: shimmer-text 3s ease-in-out infinite;
      }
      
      @keyframes shimmer-text {
        0%, 100% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
      }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  return null;
};

export default MicroInteractions;