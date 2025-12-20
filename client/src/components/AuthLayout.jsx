import React, { useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const MovingEye = ({ className, pupilRef }) => {
  return (
    <div className={`absolute bg-white rounded-full overflow-hidden flex items-center justify-center shadow-sm ${className}`}>
      <div ref={pupilRef} className="w-[60%] h-[60%] bg-black rounded-full will-change-transform"></div>
    </div>
  );
};

const AuthLayout = ({ children, title, subtitle, isRightAligned = false }) => {
  const containerRef = useRef(null);
  const illustrationPanelRef = useRef(null);
  const contentRef = useRef(null);
  const pupilRefs = useRef([]);

  const addToPupilRefs = (el) => {
    if (el && !pupilRefs.current.includes(el)) {
      pupilRefs.current.push(el);
    }
  };

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    gsap.set(containerRef.current, { visibility: 'visible' });
    
    // Only animate panel width on large screens
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (isDesktop) {
        tl.fromTo(illustrationPanelRef.current, 
            { width: "0%", opacity: 0 },
            { width: "100%", opacity: 1, duration: 1.2, ease: "expo.out" }
        );
    }

    tl.fromTo(contentRef.current.children, 
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.8 },
      isDesktop ? "-=0.8" : "0"
    );
  }, { scope: containerRef });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      pupilRefs.current.forEach((pupil) => {
        if (!pupil) return;
        const rect = pupil.parentElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const angle = Math.atan2(clientY - centerY, clientX - centerX);
        const maxMove = rect.width * 0.25; 
        const dist = Math.min(Math.sqrt(Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2)), maxMove);
        gsap.to(pupil, { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, duration: 0.2 });
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen w-full bg-white invisible font-sans overflow-x-hidden">
      <div className={`w-full min-h-screen flex flex-col lg:flex-row ${isRightAligned ? 'lg:flex-row-reverse' : ''}`}>
        
        {/* --- Illustration Panel (HIDDEN ON MOBILE) --- */}
        <div className="hidden lg:block lg:w-1/2 h-screen sticky top-0">
          <div ref={illustrationPanelRef} className="w-full h-full relative bg-[#f8f5f0] overflow-hidden">
            <div className="absolute inset-x-0 bottom-0 h-full w-full pointer-events-none select-none">
              {/* Characters */}
              <div className="absolute bottom-0 left-[10%] w-[35%] h-[64%] bg-[#8b5cf6] rounded-t-[5rem]">
                <MovingEye pupilRef={addToPupilRefs} className="top-[20%] left-[25%] w-10 h-10" />
                <MovingEye pupilRef={addToPupilRefs} className="top-[20%] right-[25%] w-10 h-10" />
                <div className="absolute top-[35%] left-1/2 -translate-x-1/2 w-12 h-6 border-b-4 border-black rounded-[50%]"></div>
              </div>
              <div className="absolute bottom-0 right-[15%] w-[28%] h-[50%] bg-[#ec4899] rounded-t-[3rem] z-10">
                 <MovingEye pupilRef={addToPupilRefs} className="top-[25%] left-[20%] w-9 h-9" />
                 <MovingEye pupilRef={addToPupilRefs} className="top-[25%] right-[20%] w-9 h-9" />
                 <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-10 h-5 rounded-[50%]"></div>
              </div>
              <div className="absolute bottom-0 right-0 w-[35%] h-[40%] bg-[#fbbf24] rounded-tl-[6rem] rounded-tr-[3rem] z-20">
                 <MovingEye pupilRef={addToPupilRefs} className="top-[30%] right-[15%] w-8 h-8" />
                 <div className="absolute top-[45%] right-[-5%] w-16 h-3 bg-black rounded-l-full"></div>
              </div>
               <div className="absolute bottom-0 left-0 w-[55%] h-[35%] bg-[#f97316] rounded-t-[10rem] z-30">
                <MovingEye pupilRef={addToPupilRefs} className="top-[30%] left-[30%] w-9 h-9" />
                <MovingEye pupilRef={addToPupilRefs} className="top-[25%] right-[30%] w-9 h-9" />
                 <div className="absolute top-[45%] left-1/2 -translate-x-1/2 w-14 h-7 border-b-4 border-black rounded-[50%]"></div>
              </div>
            </div>
            {/* Title (Only visible on Desktop) */}
            <div className="absolute top-16 left-16 max-w-lg z-40">
              <h2 className="text-5xl font-bold mb-4 leading-tight text-gray-900">{title}</h2>
              <p className="text-gray-700 text-xl font-medium leading-relaxed">{subtitle}</p>
            </div>
          </div>
        </div>

        {/* --- Form Panel --- */}
        <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center bg-white relative z-50 p-6">
          <div ref={contentRef} className="w-full max-w-md">
            {children}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthLayout;