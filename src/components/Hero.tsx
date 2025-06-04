import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-950 via-purple-950 to-black">
      {/* Dynamic particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(60)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-amber-400 rounded-full opacity-60"
            initial={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              scale: 0.5 + Math.random(),
              opacity: 0,
            }}
            animate={{
              opacity: [0, 0.6, 0],
              y: [-5, 5, -5],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 4,
            }}
          />
        ))}
      </div>

      {/* Celestial elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Crescent Moon */}
        <motion.svg
          viewBox="0 0 100 100"
          className="absolute w-20 h-20 text-yellow-300 top-[20%] left-[10%] opacity-80"
        >
          <motion.path
            d="M60,10 A40,40 0 1,0 60,90 A30,30 0 1,1 60,10"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0, pathOffset: 1 }}
            animate={{ pathLength: 1, pathOffset: 0 }}
            transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          />
        </motion.svg>

        {/* Saturn */}
        <motion.svg
          viewBox="0 0 100 100"
          className="absolute w-24 h-24 text-amber-400 bottom-[15%] right-[10%] opacity-70"
        >
          <motion.circle
            cx="50"
            cy="50"
            r="20"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut', delay: 0.5 }}
          />
          <motion.ellipse
            cx="50"
            cy="50"
            rx="30"
            ry="10"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut', delay: 1 }}
          />
        </motion.svg>
      </div>

      {/* Parallax gradient */}
      <div
        className="absolute inset-0 opacity-25 blur-2xl pointer-events-none"
        style={{
          transform: `translate(${mousePos.x * 0.02}px, ${mousePos.y * 0.02}px)`,
          transition: 'transform 0.1s ease-out',
        }}
      >
        <div className="w-full h-full bg-gradient-to-r from-transparent via-amber-500/10 to-transparent" />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mb-8"
        >
          <motion.h1
            className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-600 bg-clip-text text-transparent mb-2"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2 }}
          >
            Beaten Into
          </motion.h1>
          <motion.h1
            className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-600 bg-clip-text text-transparent"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.4 }}
          >
            Kindness
          </motion.h1>
        </motion.div>

        <motion.p
          className="text-xl md:text-2xl text-gray-300 mb-10 max-w-4xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          Sebuah perjalanan jiwa yang terlahir dari trauma, belajar mencintai dalam sepi, hingga menjelma menjadi cahaya bagi rumah yang dulu gelap.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
        >
          <Button
            onClick={() => navigate('/chapter/1')}
            className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-semibold px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-amber-500/25"
          >
            Mulai Membaca
          </Button>
          <Button
            onClick={() => navigate('/gallery')}
            variant="outline"
            className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Jelajahi Galeri
          </Button>
        </motion.div>

        <motion.div
          className="mt-16"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ArrowDown className="w-8 h-8 text-amber-400 mx-auto" />
        </motion.div>
      </div>

      {/* Brush Stroke Texture Overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none mix-blend-overlay opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <filter id="paintTexture">
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            <rect width="100%" height="100%" filter="url(#paintTexture)" fill="#fbbf24" />
          </svg>
        </div>


      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-950 to-transparent" />
    </section>
  );
};

export default Hero;
