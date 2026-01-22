import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

const TravelAgency3D = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      alpha: true, 
      antialias: true 
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.position.z = 5;

    // Create Earth-like sphere
    const globeGeometry = new THREE.SphereGeometry(1.5, 64, 64);
    const globeMaterial = new THREE.MeshPhongMaterial({
      color: 0x2563eb,
      emissive: 0x1e40af,
      emissiveIntensity: 0.2,
      shininess: 100,
      wireframe: false
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    globe.position.set(2, 0, 0);
    scene.add(globe);

    // Add wireframe overlay
    const wireframeGeo = new THREE.SphereGeometry(1.52, 32, 32);
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const wireframe = new THREE.Mesh(wireframeGeo, wireframeMat);
    wireframe.position.set(2, 0, 0);
    scene.add(wireframe);

    // Floating plane icons
    const planes = [];
    const planeColors = [0xfbbf24, 0xf59e0b, 0xef4444, 0x10b981, 0x8b5cf6];
    
    for (let i = 0; i < 25; i++) {
      const geometry = new THREE.ConeGeometry(0.08, 0.25, 4);
      const material = new THREE.MeshPhongMaterial({
        color: planeColors[i % planeColors.length],
        emissive: planeColors[i % planeColors.length],
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0.8
      });
      const plane = new THREE.Mesh(geometry, material);
      
      const angle = (i / 25) * Math.PI * 2;
      const radius = 2 + Math.random() * 3;
      plane.position.x = Math.cos(angle) * radius;
      plane.position.y = (Math.random() - 0.5) * 6;
      plane.position.z = Math.sin(angle) * radius - 2;
      
      plane.rotation.z = -Math.PI / 2;
      
      plane.userData = {
        angle: angle,
        radius: radius,
        speed: 0.0005 + Math.random() * 0.001,
        yOffset: plane.position.y,
        ySpeed: 0.002 + Math.random() * 0.003
      };
      
      planes.push(plane);
      scene.add(plane);
    }

    // Particles (stars)
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const positions = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 20;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.02,
      transparent: true,
      opacity: 0.6
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const pointLight1 = new THREE.PointLight(0x3b82f6, 2, 100);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0x8b5cf6, 1.5, 100);
    pointLight2.position.set(-5, -3, 3);
    scene.add(pointLight2);

    // Mouse movement
    const handleMouseMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      // Rotate globe
      globe.rotation.y += 0.002;
      wireframe.rotation.y += 0.002;
      wireframe.rotation.x = Math.sin(time * 0.5) * 0.1;

      // Animate planes in orbital paths
      planes.forEach((plane, i) => {
        plane.userData.angle += plane.userData.speed;
        plane.position.x = Math.cos(plane.userData.angle) * plane.userData.radius;
        plane.position.z = Math.sin(plane.userData.angle) * plane.userData.radius - 2;
        plane.position.y = plane.userData.yOffset + Math.sin(time + i) * 0.3;
        
        // Rotate plane to face movement direction
        plane.rotation.y = -plane.userData.angle;
        plane.rotation.x = Math.sin(time + i) * 0.1;
      });

      // Rotate particles
      particles.rotation.y += 0.0002;
      particles.rotation.x += 0.0001;

      // Camera follows mouse slightly
      camera.position.x += (mouseRef.current.x * 0.5 - camera.position.x) * 0.05;
      camera.position.y += (mouseRef.current.y * 0.3 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      renderer.dispose();
    };
  }, []);

  const destinations = [
    { name: 'Paris', country: 'France', price: '$1,299', image: '🗼', color: 'from-pink-500 to-rose-600' },
    { name: 'Tokyo', country: 'Japan', price: '$1,899', image: '🗾', color: 'from-red-500 to-orange-600' },
    { name: 'Bali', country: 'Indonesia', price: '$999', image: '🏝️', color: 'from-green-500 to-teal-600' },
    { name: 'Dubai', country: 'UAE', price: '$1,499', image: '🕌', color: 'from-yellow-500 to-amber-600' },
    { name: 'New York', country: 'USA', price: '$1,199', image: '🗽', color: 'from-blue-500 to-indigo-600' },
    { name: 'Santorini', country: 'Greece', price: '$1,399', image: '🏛️', color: 'from-cyan-500 to-blue-600' }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
      {/* 3D Canvas Background */}
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full" style={{ zIndex: 0 }} />

      {/* Content Overlay */}
      <div className="relative" style={{ zIndex: 1 }}>
        {/* Navigation */}
        <nav className="fixed top-0 w-full bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-2xl z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
                  <span className="text-2xl">✈️</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Wanderlust</h1>
                  <p className="text-xs text-blue-200">Travel Agency</p>
                </div>
              </div>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center gap-8">
                <a href="#destinations" className="text-sm font-semibold hover:text-blue-300 transition-colors">Destinations</a>
                <a href="#packages" className="text-sm font-semibold hover:text-blue-300 transition-colors">Packages</a>
                <a href="#about" className="text-sm font-semibold hover:text-blue-300 transition-colors">About</a>
                <a href="#contact" className="text-sm font-semibold hover:text-blue-300 transition-colors">Contact</a>
                <button className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full font-semibold text-sm shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105 transition-all">
                  Book Now
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-white/10 backdrop-blur-md"
              >
                <div className="w-6 h-5 flex flex-col justify-between">
                  <span className={`w-full h-0.5 bg-white transition-all ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                  <span className={`w-full h-0.5 bg-white transition-all ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                  <span className={`w-full h-0.5 bg-white transition-all ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                </div>
              </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
              <div className="md:hidden pb-6 space-y-4">
                <a href="#destinations" className="block py-2 hover:text-blue-300 transition-colors">Destinations</a>
                <a href="#packages" className="block py-2 hover:text-blue-300 transition-colors">Packages</a>
                <a href="#about" className="block py-2 hover:text-blue-300 transition-colors">About</a>
                <a href="#contact" className="block py-2 hover:text-blue-300 transition-colors">Contact</a>
              </div>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 pt-20">
          <div className="max-w-7xl mx-auto text-center">
            <div 
              className="transform transition-all duration-1000"
              style={{ 
                opacity: Math.max(0, 1 - scrollY / 300),
                transform: `translateY(${scrollY * 0.3}px)`
              }}
            >
              <h1 className="text-6xl sm:text-7xl md:text-8xl font-black mb-6 leading-tight tracking-tight">
                Explore the
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                  World
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed font-light">
                Discover breathtaking destinations and create unforgettable memories with our curated travel experiences
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full font-bold text-lg shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/70 hover:scale-105 transition-all">
                  Start Your Journey
                </button>
                <button className="px-10 py-4 bg-white/10 backdrop-blur-md rounded-full font-bold text-lg border-2 border-white/30 hover:bg-white/20 transition-all">
                  View Destinations
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto">
                {[
                  { number: '150+', label: 'Destinations' },
                  { number: '50K+', label: 'Happy Travelers' },
                  { number: '4.9★', label: 'Rating' }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
                    <div className="text-4xl font-black bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                      {stat.number}
                    </div>
                    <div className="text-sm text-blue-200 mt-2 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Destinations */}
        <section id="destinations" className="py-32 px-4 bg-gradient-to-b from-transparent to-slate-900/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-black mb-4 tracking-tight">Popular Destinations</h2>
              <p className="text-xl text-blue-200 font-light">Handpicked places that will take your breath away</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {destinations.map((dest, idx) => (
                <div
                  key={idx}
                  className="group relative bg-white/10 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/20 shadow-2xl hover:shadow-blue-500/30 transition-all duration-500 hover:-translate-y-3"
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${idx * 0.1}s backwards`
                  }}
                >
                  <div className={`h-64 bg-gradient-to-br ${dest.color} flex items-center justify-center text-8xl group-hover:scale-110 transition-transform duration-500`}>
                    {dest.image}
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-1">{dest.name}</h3>
                    <p className="text-blue-200 mb-4">{dest.country}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-3xl font-black bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                        {dest.price}
                      </span>
                      <button className="px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                        Book Now
                      </button>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-32 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-black mb-4 tracking-tight">Why Choose Wanderlust?</h2>
              <p className="text-xl text-blue-200 font-light">We make travel planning effortless and exciting</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: '🎯', title: 'Tailored Experiences', desc: 'Custom itineraries designed around your preferences and interests' },
                { icon: '💎', title: 'Best Value', desc: 'Competitive prices with exclusive deals and packages' },
                { icon: '🛡️', title: '24/7 Support', desc: 'Round-the-clock assistance wherever you are in the world' }
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="relative group bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 shadow-xl hover:bg-white/10 transition-all duration-500"
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${idx * 0.15}s backwards`
                  }}
                >
                  <div className="text-6xl mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-blue-200 leading-relaxed">{feature.desc}</p>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 rounded-3xl transition-all duration-500"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl font-black mb-6 tracking-tight">Ready for Your Next Adventure?</h2>
            <p className="text-xl text-blue-100 mb-10 font-light">
              Join thousands of travelers who've discovered the world with Wanderlust
            </p>
            <button className="px-12 py-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full font-bold text-xl shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/70 hover:scale-105 transition-all">
              Get Started Today
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 px-4 bg-slate-900/80 backdrop-blur-xl border-t border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-12">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                    <span className="text-xl">✈️</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Wanderlust</h3>
                    <p className="text-xs text-blue-200">Travel Agency</p>
                  </div>
                </div>
                <p className="text-sm text-blue-200 leading-relaxed">
                  Making dream vacations a reality since 2020
                </p>
              </div>

              {[
                { title: 'Company', links: ['About Us', 'Careers', 'Press', 'Blog'] },
                { title: 'Support', links: ['Help Center', 'Safety', 'Cancellation', 'COVID-19'] },
                { title: 'Legal', links: ['Terms', 'Privacy', 'Cookies', 'Sitemap'] }
              ].map((column, idx) => (
                <div key={idx}>
                  <h4 className="font-bold mb-4">{column.title}</h4>
                  <ul className="space-y-2">
                    {column.links.map((link, i) => (
                      <li key={i}>
                        <a href="#" className="text-sm text-blue-200 hover:text-white transition-colors">{link}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-blue-300">
              © 2025 Wanderlust Travel Agency. All rights reserved.
            </div>
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        * {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
        }
      `}</style>
    </div>
  );
};

export default TravelAgency3D;