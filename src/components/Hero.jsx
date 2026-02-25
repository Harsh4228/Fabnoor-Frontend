import { assets } from '../assets/assets';
import { useEffect, useState, useRef } from 'react';

const Hero = ({ interval = 4000 }) => {
  const slides = [assets.Hero, assets.Hero, assets.Hero];
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(null);

  useEffect(() => {
    // clear any existing timer
    if (timerRef.current) clearInterval(timerRef.current);

    if (!paused) {
      timerRef.current = setInterval(() => {
        setIndex((i) => (i + 1) % slides.length);
      }, interval);
    }

    return () => clearInterval(timerRef.current);
  }, [interval, slides.length, paused]);

  const next = () => setIndex((i) => (i + 1) % slides.length);
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);

  return (
    <div
      className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-rose-50 to-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      tabIndex={0}
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div
        className="w-full h-[60vw] sm:h-[400px] md:h-[520px] relative"
        onTouchStart={(e) => (touchStartX.current = e.touches?.[0]?.clientX)}
        onTouchEnd={(e) => {
          const endX = e.changedTouches?.[0]?.clientX;
          if (touchStartX.current == null || endX == null) return;
          const diff = touchStartX.current - endX;
          if (Math.abs(diff) > 40) {
            if (diff > 0) next(); else prev();
          }
          touchStartX.current = null;
        }}
      >
        {slides.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`hero-${i}`}
            className={`absolute inset-0 w-full h-full object-contain md:object-cover transition-opacity duration-800 ${i === index ? 'opacity-100' : 'opacity-0'
              }`}
          />
        ))}

        {/* left/right arrows */}
        <button
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white"
          aria-label="Previous slide"
        >
          ‹
        </button>
        <button
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white"
          aria-label="Next slide"
        >
          ›
        </button>

        {/* simple indicators */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-6 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-2 h-2 rounded-full transition-colors ${i === index ? 'bg-white' : 'bg-white/40'
                }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default Hero;