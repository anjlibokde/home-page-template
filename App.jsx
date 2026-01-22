import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

const Travel3DWebsite = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPackagesOpen, setIsPackagesOpen] = useState(false);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    camera.position.z = 5;

    // Create floating spheres (destinations)
    const spheres = [];
    const colors = [0x3b82f6, 0x10b981, 0x8b5cf6, 0xf59e0b, 0xef4444];
    
    for (let i = 0; i < 15; i++) {
      const geometry = new THREE.SphereGeometry(0.15, 32, 32);
      const material = new THREE.MeshPhongMaterial({
        color: colors[i % colors.length],
        shininess: 100,
        transparent: true,
        opacity: 0.7
      });
      const sphere = new THREE.Mesh(geometry, material);
      
      sphere.position.x = (Math.random() - 0.5) * 10;
      sphere.position.y = (Math.random() - 0.5) * 10;
      sphere.position.z = (Math.random() - 0.5) * 5;
      
      sphere.userData = {
        speedX: (Math.random() - 0.5) * 0.01,
        speedY: (Math.random() - 0.5) * 0.01,
        speedZ: (Math.random() - 0.5) * 0.005
      };
      
      spheres.push(sphere);
      scene.add(sphere);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x3b82f6, 0.8, 100);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      spheres.forEach(sphere => {
        sphere.position.x += sphere.userData.speedX;
        sphere.position.y += sphere.userData.speedY;
        sphere.position.z += sphere.userData.speedZ;
        
        sphere.rotation.x += 0.01;
        sphere.rotation.y += 0.01;

        // Boundary check
        if (Math.abs(sphere.position.x) > 5) sphere.userData.speedX *= -1;
        if (Math.abs(sphere.position.y) > 5) sphere.userData.speedY *= -1;
        if (Math.abs(sphere.position.z) > 3) sphere.userData.speedZ *= -1;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const togglePackages = () => setIsPackagesOpen(!isPackagesOpen);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* 3D Canvas Background */}
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10" />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-lg transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg transform hover:scale-110 transition-transform">
                H
              </div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Holiday Basket
              </h1>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex gap-8 items-center">
              <a href="#home" className="text-gray-800 font-semibold hover:text-blue-600 transition-colors transform hover:scale-105">
                Home
              </a>
              <div className="relative">
                <button 
                  onClick={togglePackages}
                  className="text-gray-800 font-semibold hover:text-blue-600 transition-colors flex items-center gap-1"
                >
                  Packages <span className="text-xs">▼</span>
                </button>
                {isPackagesOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-white/95 backdrop-blur-md rounded-lg shadow-2xl overflow-hidden min-w-[160px] animate-fadeIn">
                    {['India', 'Asia', 'Europe', 'World'].map((pkg, idx) => (
                      <a
                        key={idx}
                        href={`#${pkg.toLowerCase()}`}
                        className="block px-6 py-3 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white transition-all"
                      >
                        {pkg}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <a href="#about" className="text-gray-800 font-semibold hover:text-blue-600 transition-colors transform hover:scale-105">
                About
              </a>
              <a href="#contact" className="text-gray-800 font-semibold hover:text-blue-600 transition-colors transform hover:scale-105">
                Contact
              </a>
            </div>

            {/* Mobile Menu Toggle */}
            <button onClick={toggleMenu} className="md:hidden flex flex-col gap-1.5">
              <span className="w-6 h-0.5 bg-gray-800 transition-all"></span>
              <span className="w-6 h-0.5 bg-gray-800 transition-all"></span>
              <span className="w-6 h-0.5 bg-gray-800 transition-all"></span>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-3 animate-slideDown">
              <a href="#home" className="block py-2 hover:text-blue-600 transition-colors">Home</a>
              <a href="#packages" className="block py-2 hover:text-blue-600 transition-colors">Packages</a>
              <a href="#about" className="block py-2 hover:text-blue-600 transition-colors">About</a>
              <a href="#contact" className="block py-2 hover:text-blue-600 transition-colors">Contact</a>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 animate-fadeInUp">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Holiday Basket
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto animate-fadeInUp" style={{animationDelay: '0.2s'}}>
            Discover extraordinary destinations and create unforgettable memories
          </p>
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-full font-semibold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all animate-fadeInUp" style={{animationDelay: '0.4s'}}>
            Explore Destinations
          </button>
        </div>
      </section>

      {/* Features Section - 3D Cards */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
            Why Choose Us?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '🎉', title: 'Fun Unlimited', desc: 'Explore unlimited views with thrilling experiences', color: 'from-blue-500 to-blue-600' },
              { icon: '🏔️', title: 'Trip Advice', desc: 'Expert tips to make your holiday memorable', color: 'from-green-500 to-green-600' },
              { icon: '🛣️', title: 'Roadside Support', desc: '24/7 support for a hassle-free holiday', color: 'from-purple-500 to-purple-600' }
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 card-3d"
                style={{animationDelay: `${idx * 0.1}s`}}
              >
                <div className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg transform hover:rotate-12 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Steps */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
            Book Your Trip in 3 Easy Steps
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-12">
              {[
                { num: '01', title: 'Reserve Your Ride', desc: 'Choose from our wide selection of premium travel packages' },
                { num: '02', title: 'Plan Your Trip', desc: 'Customize your itinerary with our expert travel planners' },
                { num: '03', title: 'Hit the Road', desc: 'Embark on your adventure with confidence and excitement' }
              ].map((step, idx) => (
                <div key={idx} className="flex gap-6 items-start transform hover:translate-x-2 transition-transform">
                  <div className="text-5xl font-bold text-transparent bg-gradient-to-br from-green-500 to-green-700 bg-clip-text">
                    {step.num}
                  </div>
                  <div>
                    <h3 className="text-3xl font-semibold mb-2 text-gray-900">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed max-w-md">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="relative h-96 md:h-[500px]">
              <div className="absolute top-0 right-0 w-80 h-72 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl shadow-2xl transform rotate-6 hover:rotate-3 transition-transform"></div>
              <div className="absolute bottom-0 left-0 w-64 h-60 bg-gradient-to-br from-pink-400 to-orange-500 rounded-2xl shadow-2xl transform -rotate-6 hover:-rotate-3 transition-transform"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
            Ready for your next adventure?
          </h2>
          <div className="text-center mb-12">
            <button className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
              Explore Destinations
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              'https://images.pexels.com/photos/288100/pexels-photo-288100.jpeg?auto=compress&cs=tinysrgb&w=1600',
              'https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg?auto=compress&cs=tinysrgb&w=1600',
              'https://images.pexels.com/photos/7014337/pexels-photo-7014337.jpeg?auto=compress&cs=tinysrgb&w=1600',
              'https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg?auto=compress&cs=tinysrgb&w=1600',
              'https://images.pexels.com/photos/246755/pexels-photo-246755.jpeg?auto=compress&cs=tinysrgb&w=1600'
            ].map((img, idx) => (
              <div key={idx} className="overflow-hidden rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
                <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-48 object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Enjoy Your Holiday?
          </h2>
          <p className="text-xl mb-8 text-gray-300">
            Browse our plans and find the perfect destination for you
          </p>
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-full font-semibold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all">
            Explore Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                  H
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Holiday Basket</h4>
                  <p className="text-sm text-gray-600">Travel & Tours</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                500 Terry Francine Street<br />
                San Francisco, CA 94158<br />
                info@holidaybasket.com<br />
                123-456-7890
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Destinations</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Road Trips</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">FAQ</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">About</a>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Contact Us</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Name"
                  className="w-full px-4 py-2 border-b border-gray-300 focus:border-blue-600 outline-none bg-gray-50 transition-colors"
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-2 border-b border-gray-300 focus:border-blue-600 outline-none bg-gray-50 transition-colors"
                />
                <textarea
                  placeholder="Message"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 focus:border-blue-600 outline-none bg-gray-50 rounded transition-colors"
                ></textarea>
                <button 
                  onClick={() => alert('Message sent!')}
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
          <div className="text-center text-gray-600 text-sm mt-8 pt-8 border-t">
            © 2025 Holiday Basket. All rights reserved.
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        .card-3d {
          animation: fadeInUp 0.8s ease-out forwards;
          perspective: 1000px;
        }

        .card-3d:hover {
          transform: translateY(-8px) rotateX(2deg);
        }
      `}</style>
    </div>
  );
};

export default Travel3DWebsite;