import React, { useEffect, useRef, useState } from 'react';
import { CMSData, PortfolioItem } from '../types';
import * as Icons from 'lucide-react';
import { getImageUrl } from '../lib/imageUtils';

interface PublicPortfolioProps {
  data: CMSData;
  onEnterAdmin?: () => void;
  isPreviewMode?: boolean;
}

export default function PublicPortfolio({ data, onEnterAdmin, isPreviewMode = false }: PublicPortfolioProps) {
  const { hero, profile, skills, portfolio, prosesKerja, kontak, sosialMedia, background, appearance, motion } = data;

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'contact' | 'project' | 'cv'>('contact');
  const [activeProject, setActiveProject] = useState<PortfolioItem | null>(null);
  
  const navRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const portraitWrapRef = useRef<HTMLDivElement>(null);
  const portraitBoxRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const fanRef = useRef<HTMLDivElement>(null);
  const workHeadRef = useRef<HTMLDivElement>(null);
  const colBRef = useRef<HTMLDivElement>(null);
  const rowsElRef = useRef<HTMLOListElement>(null);
  const workSectionRef = useRef<HTMLElement>(null);

  // Dynamic style tokens injection
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--bg', appearance.backgroundColor);
    root.style.setProperty('--bg-2', appearance.secondaryBackground);
    root.style.setProperty('--ink', appearance.textColor);
    root.style.setProperty('--muted', appearance.mutedText);
    root.style.setProperty('--mint', appearance.accentColor);
    root.style.setProperty('--line', appearance.borderColor);
    
    // Cleanup if unmounted
    return () => {
      root.style.removeProperty('--bg');
      root.style.removeProperty('--bg-2');
      root.style.removeProperty('--ink');
      root.style.removeProperty('--muted');
      root.style.removeProperty('--mint');
      root.style.removeProperty('--line');
    };
  }, [appearance]);

  // Main scroll & interaction logic
  useEffect(() => {
    const reduce = !motion.enabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

    const scrubElements = document.querySelectorAll<HTMLElement>('[data-scrub]');
    const scrubs = Array.from(scrubElements).map((el) => {
      const words = Array.from(el.querySelectorAll<HTMLElement>('.w'));
      if (!reduce) {
        words.forEach((w) => {
          w.style.opacity = '.16';
          w.style.filter = `blur(${5 * motion.blurIntensity}px)`;
        });
      }
      return { el, words, last: [] as string[] };
    });

    let vh = window.innerHeight;
    let vw = window.innerWidth;
    let target = window.scrollY;
    let cur = window.scrollY;
    let vel = 0;
    let pmx = 0;
    let pmy = 0;
    let cmx = 0;
    let cmy = 0;
    let running = false;
    let hoverRow = -1;
    let activeRow = -1;

    const pills = Array.from(document.querySelectorAll<HTMLElement>('.pill')).map((el) => ({
      el,
      d: +(el.dataset.depth || 0) * motion.parallaxIntensity,
    }));

    const fan = fanRef.current;
    const fcs = fan ? Array.from(fan.querySelectorAll<HTMLElement>('.fc')) : [];
    const rots = [-9, -1.5, 7.5];

    const echoes = Array.from(document.querySelectorAll<HTMLElement>('.echo'));
    const wt = document.querySelector<HTMLElement>('.wt');

    const cardElements = Array.from(document.querySelectorAll<HTMLElement>('.card'));
    const cards = cardElements.map((card) => ({
      card,
      par: card.querySelector<HTMLElement>('.par'),
    }));

    const rowElements = Array.from(document.querySelectorAll<HTMLElement>('.row'));

    const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    function updateHero() {
      const p = clamp(cur / (vh * 0.85));
      const stage = stageRef.current;
      const portraitWrap = portraitWrapRef.current;
      const stats = statsRef.current;

      if (p <= 0.001) {
        if (stage) stage.style.cssText = '';
        if (portraitWrap) {
          portraitWrap.style.transform = '';
          portraitWrap.style.opacity = '';
          portraitWrap.style.filter = '';
        }
        if (stats) stats.style.cssText = '';
      } else {
        if (stage) {
          stage.style.transform = `translate3d(0,${(-p * vh * 0.16).toFixed(1)}px,0)`;
          stage.style.opacity = clamp(1 - p * 1.15).toFixed(3);
          stage.style.filter = `blur(${(p * 14 * motion.blurIntensity).toFixed(2)}px)`;
        }
        if (portraitWrap) {
          portraitWrap.style.transform = `translate3d(0,${(-p * vh * 0.09).toFixed(1)}px,0) scale(${(1 + p * 0.06).toFixed(3)})`;
          portraitWrap.style.opacity = clamp(1 - p * 1.3).toFixed(3);
          portraitWrap.style.filter = `blur(${(p * 10 * motion.blurIntensity).toFixed(2)}px)`;
        }
        if (stats) {
          stats.style.transform = `translate3d(0,${(-p * vh * 0.14).toFixed(1)}px,0)`;
          stats.style.opacity = clamp(1 - p * 1.6).toFixed(3);
        }
      }

      if (finePointer && !reduce) {
        pills.forEach((o) => {
          o.el.style.transform = `translate3d(${(cmx * o.d * motion.hoverMovement).toFixed(2)}px,${(cmy * o.d * motion.hoverMovement).toFixed(2)}px,0)`;
        });
      }
    }

    function updateScrubs() {
      scrubs.forEach((s) => {
        const r = s.el.getBoundingClientRect();
        if (r.bottom < -80 || r.top > vh + 80) {
          if (r.top > vh + 80 && !reduce) return;
        }
        const p = reduce ? 1 : clamp((vh * 0.92 - r.top) / (vh * 0.37 + r.height));
        const n = s.words.length;
        const span = Math.max(4, n * 0.26);
        s.words.forEach((w, i) => {
          const wp = clamp((p * (n + span) - i) / span);
          const o = (0.16 + 0.84 * wp).toFixed(3);
          if (s.last[i] !== o) {
            s.last[i] = o;
            w.style.opacity = o;
            w.style.filter = wp >= 1 ? 'none' : `blur(${((1 - wp) * 5 * motion.blurIntensity).toFixed(2)}px)`;
          }
        });
      });
    }

    function updateFan() {
      if (!fan) return;
      const r = fan.getBoundingClientRect();
      if (r.top > vh + 120 && !reduce) return;
      const p = reduce ? 1 : clamp((vh * 0.95 - r.top) / (vh * 0.8));
      const out = reduce ? 0 : clamp((vh * 0.3 - r.bottom) / vh);
      fcs.forEach((c, i) => {
        const e = easeOut(clamp(p * 1.25 - i * 0.12));
        const y = (1 - e) * (140 + i * 50) - out * (30 + i * 24);
        const x = (1 - e) * (i - 1) * -22;
        c.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${(rots[i] * e).toFixed(2)}deg) scale(${(0.92 + 0.08 * e).toFixed(3)})`;
        c.style.opacity = clamp(e * 1.8).toFixed(3);
        c.style.filter = e < 0.995 ? `blur(${((1 - e) * 12 * motion.blurIntensity).toFixed(2)}px)` : 'none';
      });
    }

    function updateWork() {
      const v = Math.abs(vel);
      const spread = (10 + Math.min(v * 0.5, 46)) * motion.parallaxIntensity;
      echoes.forEach((e, i) => {
        e.style.transform = `translate3d(0,${((i + 1) * spread).toFixed(1)}px,0)`;
      });
      if (wt) {
        wt.style.filter = v > 6 && motion.blurIntensity > 0 ? `blur(${Math.min(v * 0.03 * motion.blurIntensity, 2.2).toFixed(2)}px)` : 'none';
      }

      if (workSectionRef.current && colBRef.current) {
        const r = workSectionRef.current.getBoundingClientRect();
        const mid = r.top + r.height / 2 - vh / 2;
        colBRef.current.style.transform =
          vw > 860 && !reduce ? `translate3d(0,${clamp(mid * 0.09 * motion.parallaxIntensity, -90, 90).toFixed(1)}px,0)` : '';
      }

      if (reduce) return;
      cards.forEach((o) => {
        if (!o.par) return;
        const cr = o.card.getBoundingClientRect();
        if (cr.bottom < -120 || cr.top > vh + 120) return;
        const c = cr.top + cr.height / 2 - vh / 2;
        o.par.style.transform = `translate3d(0,${clamp(c * -0.04 * motion.parallaxIntensity, -26, 26).toFixed(1)}px,0) scale(1.16)`;
      });
    }

    function updateRows() {
      let idx = hoverRow;
      if (idx < 0 && rowsElRef.current) {
        const rr = rowsElRef.current.getBoundingClientRect();
        if (rr.top < vh && rr.bottom > 0) {
          const center = vh * 0.55;
          let best = 1e9;
          rowElements.forEach((row, i) => {
            const b = row.getBoundingClientRect();
            const d = Math.abs(b.top + b.height / 2 - center);
            if (d < best) {
              best = d;
              idx = i;
            }
          });
          if (best > vh * 0.6) idx = -1;
        } else {
          idx = activeRow;
        }
      }
      if (idx !== activeRow) {
        activeRow = idx;
        rowElements.forEach((row, i) => row.classList.toggle('active', i === idx));
      }
    }

    function updateAll() {
      if (navRef.current) {
        navRef.current.classList.toggle('scrolled', cur > 40);
      }
      updateHero();
      updateScrubs();
      updateFan();
      updateWork();
      updateRows();
    }

    function tick() {
      const stepSpeed = 0.1 * motion.speed;
      cur = reduce ? target : cur + (target - cur) * stepSpeed;
      if (Math.abs(target - cur) < 0.2) cur = target;
      vel = target - cur;
      cmx += (pmx - cmx) * 0.07;
      cmy += (pmy - cmy) * 0.07;
      updateAll();
      const moving = cur !== target || Math.abs(pmx - cmx) > 0.004 || Math.abs(pmy - cmy) > 0.004;
      if (moving) {
        requestAnimationFrame(tick);
      } else {
        running = false;
      }
    }

    function kick() {
      if (!running) {
        running = true;
        requestAnimationFrame(tick);
      }
    }

    const onScroll = () => {
      target = window.scrollY;
      kick();
    };
    const onResize = () => {
      vh = window.innerHeight;
      vw = window.innerWidth;
      kick();
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!finePointer || reduce || cur > vh) return;
      pmx = (e.clientX / vw - 0.5) * 2;
      pmy = (e.clientY / vh - 0.5) * 2;
      kick();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    const rowCleanups: Array<() => void> = [];
    rowElements.forEach((row, i) => {
      const handleMouseEnter = () => {
        if (finePointer) {
          hoverRow = i;
          kick();
        }
      };
      const handleMouseLeave = () => {
        hoverRow = -1;
        kick();
      };
      const handleFocus = () => {
        hoverRow = i;
        kick();
      };
      const handleBlur = () => {
        hoverRow = -1;
        kick();
      };

      row.addEventListener('mouseenter', handleMouseEnter);
      row.addEventListener('mouseleave', handleMouseLeave);
      row.addEventListener('focus', handleFocus);
      row.addEventListener('blur', handleBlur);

      rowCleanups.push(() => {
        row.removeEventListener('mouseenter', handleMouseEnter);
        row.removeEventListener('mouseleave', handleMouseLeave);
        row.removeEventListener('focus', handleFocus);
        row.removeEventListener('blur', handleBlur);
      });
    });

    // IntersectionObserver Reveal Effect
    const revealTargets = [
      ...Array.from(document.querySelectorAll<HTMLElement>('.card')).map((el, i) => ({ el, delay: (i % 2) * 120 })),
      ...Array.from(document.querySelectorAll<HTMLElement>('.row')).map((el, i) => ({ el, delay: i * 90 })),
      ...Array.from(document.querySelectorAll<HTMLElement>('[data-seq]')).map((el) => ({ el, delay: 0 })),
    ];

    let io: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window && !reduce) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (!en.isIntersecting) return;
            const targetEl = en.target as HTMLElement;
            const t = revealTargets.find((x) => x.el === targetEl);
            targetEl.style.transitionDelay = (t ? t.delay : 0) + 'ms';
            targetEl.classList.add('in');
            io?.unobserve(targetEl);
            if (targetEl.classList.contains('card') || targetEl.classList.contains('row')) {
              setTimeout(() => {
                targetEl.style.transitionDelay = '';
              }, 1600 + (t ? t.delay : 0));
            }
          });
        },
        { threshold: 0.14, rootMargin: '0px 0px -6% 0px' }
      );
      revealTargets.forEach((t) => io?.observe(t.el));
    } else {
      revealTargets.forEach((t) => t.el.classList.add('in'));
    }

    // Number Count Up Animation
    function countUp(el: HTMLElement) {
      const to = +(el.dataset.to || 0);
      const suf = el.dataset.suffix || '';
      if (reduce) {
        el.textContent = to + suf;
        return;
      }
      el.textContent = '0' + suf;
      const t0 = performance.now();
      const dur = 1900;
      function step(t: number) {
        const k = clamp((t - t0) / dur);
        el.textContent = Math.round(to * (1 - Math.pow(1 - k, 4))) + suf;
        if (k < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    const countTimeout = setTimeout(() => {
      document.querySelectorAll<HTMLElement>('[data-count]').forEach(countUp);
    }, reduce ? 0 : 1600);

    updateAll();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(kick);
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      rowCleanups.forEach((fn) => fn());
      clearTimeout(countTimeout);
      io?.disconnect();
    };
  }, [data, motion]);

  const openContactModal = () => {
    setModalType('contact');
    setModalOpen(true);
  };

  const openProjectModal = (proj: PortfolioItem) => {
    setActiveProject(proj);
    setModalType('project');
    setModalOpen(true);
  };

  // Filter dynamic elements
  const publishedPortfolios = portfolio
    .filter((p) => p.status === 'PUBLISHED')
    .sort((a, b) => a.urutan - b.urutan);

  const publishedKarya = data.hasilKarya
    .filter((k) => k.status === 'PUBLISHED')
    .sort((a, b) => a.urutan - b.urutan);

  const publishedProses = prosesKerja
    .filter((pk) => pk.status === 'PUBLISHED')
    .sort((a, b) => a.urutan - b.urutan);

  const visibleBadges = hero.badges.filter((b) => b.visibility).sort((a, b) => a.posisi - b.posisi);

  // Divide portfolios into two masonry columns
  const colAPortfolios = publishedPortfolios.filter((_, idx) => idx % 2 === 0);
  const colBPortfolios = publishedPortfolios.filter((_, idx) => idx % 2 !== 0);

  // Dynamic bg style
  const bgStyle: React.CSSProperties = {
    backgroundColor: background.type === 'solid' ? background.solidColor : undefined,
    backgroundImage: background.type === 'gradient' ? `linear-gradient(${background.gradientColors})` : background.type === 'image' && background.image ? `url(${background.image})` : undefined,
    backgroundPosition: background.position,
    backgroundSize: background.size,
    opacity: background.opacity / 100,
    filter: `blur(${background.blur}px) brightness(${background.brightness}%) contrast(${background.contrast}%)`,
  };

  // Helper to render Lucide Icons by name dynamically
  const renderIcon = (iconName: string, className = 'w-5 h-5') => {
    const IconComponent = (Icons as any)[iconName] || Icons.HelpCircle;
    return <IconComponent className={className} />;
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden selection:bg-[#25d0a4] selection:text-black">
      {/* Background layer */}
      <div className="fixed inset-0 -z-20 pointer-events-none transition-all duration-700" style={bgStyle} />
      {background.overlay && (
        <div className="fixed inset-0 -z-10 pointer-events-none" style={{ backgroundColor: background.overlay }} />
      )}

      {/* Floating Control Panel shortcut for logged-in or easy access */}
      {onEnterAdmin && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={onEnterAdmin}
            className="flex items-center gap-2.5 px-4.5 py-3 bg-black/90 hover:bg-[#25d0a4] hover:text-black text-white rounded-full border border-[#3a3b45] shadow-2xl transition-all duration-300 backdrop-blur-md group"
            id="control-panel-toggle"
          >
            <Icons.Settings className="w-4 h-4 animate-spin-slow group-hover:rotate-90 transition-transform duration-500" />
            <span className="text-xs uppercase font-bold tracking-wider">
              {isPreviewMode ? 'Tutup Preview' : 'Control Panel'}
            </span>
          </button>
        </div>
      )}

      {isPreviewMode && (
        <div className="fixed top-0 inset-x-0 z-50 bg-[#25d0a4] text-black py-1.5 px-4 text-center text-xs font-bold uppercase tracking-widest shadow-md">
          CMS Preview Mode — Menampilkan Draft Konten Terkini
        </div>
      )}

      <a className="skip" href="#work">
        Lewati ke karya
      </a>

      {/* ========== NAVIGASI ========== */}
      <header className="nav" id="nav" ref={navRef}>
        <nav className="nav-in" aria-label="Utama">
          <a className="nl" href="#top">
            {hero.nama}
          </a>
          <a className="nl" href="#work">
            Karya
          </a>
          <span className="nav-gap" aria-hidden="true"></span>
          <a className="nl" href="#socials">
            Sosial
          </a>
          <a className="nl" href="#contact">
            Kontak
          </a>
        </nav>
      </header>

      <main>
        {/* ========== HERO ========== */}
        <section className="hero" id="top" aria-labelledby="hero-title">
          {/* Hero Background Visual Overlay */}
          {hero.heroBackground && getImageUrl(hero.heroBackground.image) && (
            <div 
              className="absolute inset-0 pointer-events-none overflow-hidden" 
              style={{ zIndex: 0 }}
              id="hero-bg-visual-layer"
            >
              <img 
                src={getImageUrl(hero.heroBackground.image)}
                alt="Hero Visual Background"
                className="absolute w-full h-full transition-all duration-300 ease-out"
                style={{
                  left: `${hero.heroBackground.positionX ?? 50}%`,
                  top: `${hero.heroBackground.positionY ?? 50}%`,
                  transform: `translate(-50%, -50%) scale(${(hero.heroBackground.scale ?? 100) / 100})`,
                  opacity: (hero.heroBackground.opacity ?? 40) / 100,
                  filter: `
                    blur(${hero.heroBackground.blur ?? 0}px)
                    brightness(${hero.heroBackground.brightness ?? 100}%)
                    contrast(${hero.heroBackground.contrast ?? 100}%)
                  `,
                  objectFit: 'cover',
                }}
                referrerPolicy="no-referrer"
              />
              
              {/* Overlay Layer */}
              {hero.heroBackground.overlayOpacity > 0 && (
                <div 
                  className="absolute inset-0 transition-colors duration-300"
                  style={{
                    backgroundColor: hero.heroBackground.overlayColor || '#1b1c23',
                    opacity: (hero.heroBackground.overlayOpacity ?? 30) / 100,
                  }}
                />
              )}
            </div>
          )}

          <div className="stage" data-fx="stage" ref={stageRef}>
            <p className="hello">
              <svg
                className="mark"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 3 4.5 21M12 3l7.5 18M8 14.5h8" />
              </svg>
              <span>{hero.kalimatPembuka}</span>
            </p>

            <h1 className="mega" id="hero-title" aria-label={`${hero.headlineUtama} ${hero.headlineKedua}`}>
              <span className="l1" aria-hidden="true">
                <span data-split>
                  {hero.headlineUtama.split('').map((c, i) => (
                    <span key={i} className="ch" style={{ '--i': i } as React.CSSProperties}>
                      {c === ' ' ? '\u00A0' : c}
                    </span>
                  ))}
                </span>
                {visibleBadges.length > 0 && (
                  <span className={`pill p-${visibleBadges[0].warnaBackground}`} data-depth="22">
                    <span className="pin">{visibleBadges[0].nama}</span>
                  </span>
                )}
              </span>
              <span className="l2" aria-hidden="true">
                <em className="cond">{hero.visualText}</em>
                <span data-split data-offset="4">
                  {hero.headlineKedua.split('').map((c, i) => (
                    <span key={i} className="ch" style={{ '--i': i + 4 } as React.CSSProperties}>
                      {c === ' ' ? '\u00A0' : c}
                    </span>
                  ))}
                </span>
                {visibleBadges.length > 1 && (
                  <span className={`pill p-${visibleBadges[1].warnaBackground}`} data-depth="-16">
                    <span className="pin">{visibleBadges[1].nama}</span>
                  </span>
                )}
                {visibleBadges.length > 2 && (
                  <span className={`pill p-${visibleBadges[2].warnaBackground}`} data-depth="28">
                    <span className="pin">{visibleBadges[2].nama}</span>
                  </span>
                )}
              </span>
            </h1>
          </div>

          <div className="portrait-wrap" data-fx="portrait" ref={portraitWrapRef}>
            <div className="portrait animate-scaleUp" id="portrait" ref={portraitBoxRef} role="img" aria-label="Foto profil">
              {getImageUrl(hero.fotoProfile) ? (
                <img src={getImageUrl(hero.fotoProfile)} alt={`Foto Profil ${hero.nama}`} className="w-full h-full object-cover rounded-3xl" referrerPolicy="no-referrer" />
              ) : (
                <svg viewBox="0 0 400 480" aria-hidden="true" preserveAspectRatio="xMidYMax slice">
                  <defs>
                    <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#e6e6ec" />
                      <stop offset="1" stopColor="#3f4048" />
                    </linearGradient>
                    <linearGradient id="ph" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#4a4b54" />
                      <stop offset="1" stopColor="#22232a" />
                    </linearGradient>
                    <filter id="soft" x="-5%" y="-5%" width="110%" height="110%">
                      <feGaussianBlur stdDeviation="1.6" />
                    </filter>
                  </defs>
                  <g filter="url(#soft)">
                    <path
                      d="M34 480C46 386 108 344 168 330V296C138 284 126 254 124 218C120 152 156 102 200 102C244 102 280 152 276 218C274 254 262 284 232 296V330C292 344 354 386 366 480Z"
                      fill="url(#pg)"
                    />
                    <path
                      d="M123 222C112 146 150 96 202 98C254 100 290 146 277 222C268 176 246 146 204 146C160 146 132 176 123 222Z"
                      fill="url(#ph)"
                    />
                  </g>
                </svg>
              )}
            </div>
          </div>

          <div className="stats animate-fadeIn" data-fx="stats" ref={statsRef}>
            <div className="stat">
              <b data-count data-to={hero.statistikPengalaman} data-suffix="">
                {hero.statistikPengalaman}
              </b>
              <span>tahun pengalaman</span>
            </div>
            <div className="stat">
              <b data-count data-to={hero.statistikJumlahProject} data-suffix="+">
                {hero.statistikJumlahProject}+
              </b>
              <span>proyek selesai</span>
            </div>
          </div>

          <a className="down" href="#intro" aria-label="Gulir ke bawah">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 4v15M6 13.5l6 6 6-6" />
            </svg>
          </a>
        </section>

        {/* ========== INTRO ========== */}
        <section className="intro" id="intro">
          <div className="intro-grid">
            <p className="intro-text" data-scrub>
              {profile.deskripsi.split(' ').map((word, i) => (
                <span key={i} className="w">
                  {word}{' '}
                </span>
              ))}
            </p>

            <div className="fan" data-fan ref={fanRef} aria-hidden="true">
              {/* If we have uploaded hasil karya, render them instead of static SVGs to make it incredibly dynamic! */}
              {publishedKarya.length >= 3 ? (
                publishedKarya.slice(0, 3).map((karya, idx) => (
                  <div key={karya.id} className={`fc fc${idx + 1} overflow-hidden rounded-2xl border border-white/10 group`}>
                    <img src={getImageUrl(karya.gambar)} alt={karya.judul} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 p-3 backdrop-blur-xs text-xs font-bold">
                      {karya.judul}
                    </div>
                  </div>
                ))
              ) : (
                <>
                  {/* kartu 1: gradien + ponsel */}
                  <div className="fc fc1">
                    <svg viewBox="0 0 260 373" preserveAspectRatio="xMidYMid slice">
                      <defs>
                        <linearGradient id="fa" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0" stopColor="#ff5f7a" />
                          <stop offset=".5" stopColor="#b98bff" />
                          <stop offset="1" stopColor="#43d6c4" />
                        </linearGradient>
                      </defs>
                      <rect width="260" height="373" fill="url(#fa)" />
                      <g transform="rotate(-12 130 220)">
                        <rect x="58" y="70" width="150" height="300" rx="26" fill="#f5f3ff" opacity=".94" />
                        <text
                          x="133"
                          y="150"
                          textAnchor="middle"
                          fontSize="34"
                          fontWeight="800"
                          fill="#2b2c35"
                          fontFamily="Anybody,sans-serif"
                        >
                          23:15
                        </text>
                        <circle cx="98" cy="215" r="17" fill="#ff5f4a" />
                        <circle cx="148" cy="215" r="17" fill="#5a3cff" />
                        <circle cx="98" cy="262" r="17" fill="#25d0a4" />
                        <circle cx="148" cy="262" r="17" fill="#f2b53d" />
                      </g>
                    </svg>
                  </div>
                  {/* kartu 2: biru + kontur */}
                  <div className="fc fc2">
                    <svg viewBox="0 0 260 373" preserveAspectRatio="xMidYMid slice">
                      <defs>
                        <linearGradient id="fb" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0" stopColor="#3a63ff" />
                          <stop offset="1" stopColor="#1a2f9e" />
                        </linearGradient>
                      </defs>
                      <rect width="260" height="373" fill="url(#fb)" />
                      <g fill="none" stroke="rgba(255,255,255,.32)" strokeWidth="1.4">
                        <ellipse cx="180" cy="70" rx="110" ry="46" />
                        <ellipse cx="180" cy="70" rx="86" ry="34" />
                        <ellipse cx="180" cy="70" rx="62" ry="23" />
                        <ellipse cx="180" cy="70" rx="38" ry="13" />
                      </g>
                      <rect x="34" y="176" width="150" height="10" rx="5" fill="#fff" opacity=".9" />
                      <rect x="34" y="198" width="104" height="8" rx="4" fill="#fff" opacity=".45" />
                      <rect x="34" y="236" width="192" height="92" rx="14" fill="#fff" opacity=".14" />
                      <circle cx="60" cy="282" r="14" fill="#ff5f4a" />
                    </svg>
                  </div>
                  {/* kartu 3: senja pegunungan */}
                  <div className="fc fc3">
                    <svg viewBox="0 0 260 325" preserveAspectRatio="xMidYMid slice">
                      <defs>
                        <linearGradient id="fc" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0" stopColor="#3b2c52" />
                          <stop offset=".55" stopColor="#c8694b" />
                          <stop offset="1" stopColor="#f3b57e" />
                        </linearGradient>
                      </defs>
                      <rect width="260" height="325" fill="url(#fc)" />
                      <circle cx="170" cy="150" r="34" fill="#ffd9a8" opacity=".9" />
                      <path d="M0 230 60 170 110 210 165 150 260 235V325H0Z" fill="#5b3a4d" opacity=".85" />
                      <path d="M0 270 70 215 130 258 200 205 260 250V325H0Z" fill="#2a1d33" />
                    </svg>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ========== KARYA ========== */}
        <section className="work" id="work" ref={workSectionRef} aria-labelledby="work-title">
          <div className="work-head" data-work-head ref={workHeadRef}>
            <div className="wt-wrap">
              <h2 className="wt" id="work-title">
                Karya
              </h2>
              <span className="echo e1" aria-hidden="true">
                Karya
              </span>
              <span className="echo e2" aria-hidden="true">
                Karya
              </span>
              <span className="echo e3" aria-hidden="true">
                Karya
              </span>
            </div>
          </div>

          <div className="work-grid">
            {/* Column A */}
            <div className="col col-a">
              {colAPortfolios.length > 0 ? (
                colAPortfolios.map((item) => (
                  <a
                    key={item.id}
                    className="card"
                    href="#work"
                    onClick={(e) => {
                      e.preventDefault();
                      openProjectModal(item);
                    }}
                    aria-label={`${item.judul} — lihat studi kasus`}
                  >
                    <div className="media" style={{ aspectRatio: getImageUrl(item.thumbnail) === 'green-phone' ? '4/5' : '1/1' }}>
                      <div className="par w-full h-full">
                        {getImageUrl(item.cover).startsWith('http') || getImageUrl(item.cover).startsWith('data:') ? (
                          <img src={getImageUrl(item.cover)} alt={item.judul} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          // Render beautiful custom vector card matching the tags
                          renderPortfolioGraphics(getImageUrl(item.thumbnail))
                        )}
                      </div>
                    </div>
                    <div className="lab">
                      <span className="tag">{item.judul}</span>
                      <span className="go">
                        <Icons.ArrowRight className="w-4 h-4 rotate-315 group-hover:translate-x-1" />
                      </span>
                    </div>
                  </a>
                ))
              ) : (
                <div className="p-8 border border-dashed border-[#3a3b45] text-center rounded-2xl text-xs text-[#8e8f9b]">
                  Belum ada karya di kolom ini.
                </div>
              )}
            </div>

            {/* Column B */}
            <div className="col col-b" ref={colBRef}>
              {colBPortfolios.length > 0 ? (
                colBPortfolios.map((item) => (
                  <a
                    key={item.id}
                    className="card"
                    href="#work"
                    onClick={(e) => {
                      e.preventDefault();
                      openProjectModal(item);
                    }}
                    aria-label={`${item.judul} — lihat studi kasus`}
                  >
                    <div className="media" style={{ aspectRatio: getImageUrl(item.thumbnail) === 'blue-layers' ? '1/1' : getImageUrl(item.thumbnail) === 'gold-charts' ? '1/1.05' : '4/5' }}>
                      <div className="par w-full h-full">
                        {getImageUrl(item.cover).startsWith('http') || getImageUrl(item.cover).startsWith('data:') ? (
                          <img src={getImageUrl(item.cover)} alt={item.judul} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          renderPortfolioGraphics(getImageUrl(item.thumbnail))
                        )}
                      </div>
                    </div>
                    <div className="lab">
                      <span className="tag">{item.judul}</span>
                      <span className="go">
                        <Icons.ArrowRight className="w-4 h-4 rotate-315 group-hover:translate-x-1" />
                      </span>
                    </div>
                  </a>
                ))
              ) : (
                <div className="p-8 border border-dashed border-[#3a3b45] text-center rounded-2xl text-xs text-[#8e8f9b]">
                  Belum ada karya di kolom ini.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ========== SKILLS INTEGRATED ON DEMAND ========== */}
        {skills.length > 0 && (
          <section className="py-24 px-6 md:px-12 border-t border-[#3a3b45]" id="skills-section">
            <div className="max-w-5xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-widest text-[#25d0a4]">Kompetensi</span>
              <h2 className="text-4xl font-black mt-2 mb-12">Keahlian &amp; Tools</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {skills
                  .filter((s) => s.status === 'PUBLISHED')
                  .sort((a, b) => a.urutan - b.urutan)
                  .map((skill) => (
                    <div key={skill.id} className="p-6 bg-[#23242c] border border-[#3a3b45] rounded-2xl flex gap-4 hover:border-[#25d0a4] transition-all duration-300">
                      <div className="w-12 h-12 bg-[#1b1c23] rounded-xl flex items-center justify-center text-[#25d0a4]">
                        {renderIcon(skill.icon, 'w-6 h-6')}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-baseline mb-2">
                          <h4 className="font-bold text-lg">{skill.nama}</h4>
                          <span className="text-xs font-bold text-[#8e8f9b]">{skill.level}%</span>
                        </div>
                        <div className="w-full bg-[#1b1c23] h-1.5 rounded-full overflow-hidden mb-3">
                          <div className="h-full bg-gradient-to-r from-[#25d0a4] to-[#5a3cff] rounded-full transition-all duration-1000" style={{ width: `${skill.level}%` }} />
                        </div>
                        <p className="text-xs text-[#8e8f9b] leading-relaxed">{skill.deskripsi}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </section>
        )}

        {/* ========== TENTANG ========== */}
        <section className="about" id="about" aria-labelledby="about-title">
          <h2 className="sr" id="about-title">
            Tentang saya
          </h2>
          <div className="about-grid">
            <div className="about-side">
              <button
                className="cv cursor-pointer"
                type="button"
                onClick={() => {
                  setModalType('cv');
                  setModalOpen(true);
                }}
              >
                Unduh CV
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="5" y="3" width="14" height="18" rx="3" />
                  <path d="M9 9h6M9 13h6" />
                </svg>
              </button>
            </div>
            <p className="about-text" data-scrub>
              {profile.bio.split(' ').map((word, i) => (
                <span key={i} className="w">
                  {word}{' '}
                </span>
              ))}
            </p>
          </div>
        </section>

        {/* ========== PROSES ========== */}
        {publishedProses.length > 0 && (
          <section className="process" id="process" aria-labelledby="proc-title">
            <div className="proc-grid">
              <h2 className="proc-label" id="proc-title">
                Proses kerja
              </h2>
              <ol className="rows" data-rows ref={rowsElRef}>
                {publishedProses.map((step) => (
                  <li key={step.id} className="row group" tabIndex={0}>
                    <span className="num" aria-hidden="true">
                      {step.nomor}
                    </span>
                    <span className="rt flex items-center gap-3">
                      {step.icon && <span className="text-[#25d0a4] opacity-80 group-hover:opacity-100 transition-opacity">{renderIcon(step.icon, 'w-5 h-5')}</span>}
                      {step.judul}
                    </span>
                    <span className="rd" dangerouslySetInnerHTML={{ __html: step.deskripsi.replace('\n', '<br />') }} />
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {/* ========== KONTAK ========== */}
        <section className="contact" id="contact" aria-labelledby="contact-title">
          <div className="cseq" data-seq>
            <p className="c-eyebrow">Butuh desainer?</p>
            <h2 className="c-title" id="contact-title">
              {kontak.teksKontak}
            </h2>
            <div className="c-actions">
              <button className="pill-btn cursor-pointer" type="button" onClick={openContactModal}>
                {kontak.ctaUtama}
              </button>
              {kontak.whatsapp && (
                <a
                  className="pill-btn"
                  href={`https://wa.me/${kontak.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {kontak.ctaKedua}
                </a>
              )}
            </div>
            <div className="c-info">
              {kontak.email && (
                <a href={`mailto:${kontak.email}`} onClick={(e) => { e.preventDefault(); openContactModal(); }}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="5.5" width="18" height="13" rx="2" />
                    <path d="m3.5 7 8.5 6.5L20.5 7" />
                  </svg>
                  <span>{kontak.email}</span>
                </a>
              )}
              {kontak.telepon && (
                <a href={`tel:${kontak.telepon.replace(/\s+/g, '')}`}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
                  </svg>
                  <span>{kontak.telepon}</span>
                </a>
              )}
            </div>
          </div>

          <ul className="socials" id="socials" data-seq>
            {sosialMedia
              .filter((sm) => sm.visibility)
              .sort((a, b) => a.urutan - b.urutan)
              .map((sm) => (
                <li key={sm.id}>
                  <a href={sm.URL} target="_blank" rel="noopener noreferrer">
                    <span>
                      <span className="sn">{sm.nama}</span>
                      <span className="sh">{sm.username}</span>
                    </span>
                    <span className="ico">
                      {renderSocialIcon(sm.nama)}
                    </span>
                  </a>
                </li>
              ))}
          </ul>

          <p className="credit">
            Dirancang &amp; dikembangkan dengan ♥ oleh {hero.nama}
            <br />© 2026 Hak cipta dilindungi.
          </p>
        </section>
      </main>

      {/* ========== INTERACTIVE MODAL FOR CONTACT / CASE STUDY / PHOTO UPLOAD ========== */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-opacity duration-300"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-[#23242c] border border-[#3a3b45] rounded-3xl p-6 md:p-8 max-w-lg w-full text-left text-[#f6f6f8] relative shadow-2xl animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#2b2c35] text-[#c9cad2] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              ✕
            </button>

            {modalType === 'contact' && (
              <div>
                <h3 className="text-2xl font-black mb-2 text-[#25d0a4]">Kirim Pesan</h3>
                <p className="text-sm text-[#c9cad2] mb-6">
                  Silakan isi pesan Anda untuk diskusi proyek atau kolaborasi dengan {hero.nama}.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert('Terima kasih! Pesan Anda telah terkirim.');
                    setModalOpen(false);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs uppercase font-medium text-[#8e8f9b] mb-1">Nama Anda</label>
                    <input
                      type="text"
                      required
                      placeholder="Masukkan nama..."
                      className="w-full bg-[#1b1c23] border border-[#3a3b45] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#25d0a4] text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-medium text-[#8e8f9b] mb-1">Email Anda</label>
                    <input
                      type="email"
                      required
                      placeholder="email@contoh.com"
                      className="w-full bg-[#1b1c23] border border-[#3a3b45] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#25d0a4] text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-medium text-[#8e8f9b] mb-1">Pesan / Proyek</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Ceritakan detail proyek atau kebutuhan Anda..."
                      className="w-full bg-[#1b1c23] border border-[#3a3b45] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#25d0a4] text-white"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#5a3cff] hover:bg-[#6f55ff] text-white font-semibold rounded-full transition-colors cursor-pointer"
                  >
                    Kirim Sekarang
                  </button>
                </form>
              </div>
            )}

            {modalType === 'project' && activeProject && (
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-[#25d0a4]">{activeProject.kategori}</span>
                <h3 className="text-3xl font-black mt-1 mb-3">{activeProject.judul}</h3>
                <p className="text-sm text-[#c9cad2] leading-relaxed mb-5">
                  {activeProject.deskripsi}
                </p>
                <div className="bg-[#1b1c23] p-4 rounded-2xl border border-[#3a3b45] mb-5 space-y-2 text-xs text-[#8e8f9b]">
                  <p>✨ <strong>Client:</strong> {activeProject.client || '-'}</p>
                  <p>📅 <strong>Tahun:</strong> {activeProject.tahun || '-'}</p>
                  <p>🎨 <strong>Role:</strong> {activeProject.role || '-'}</p>
                  <p>🛠️ <strong>Tools:</strong> {activeProject.tools.join(', ') || '-'}</p>
                </div>
                
                <div className="flex gap-3 mt-6">
                  {activeProject.projectURL && (
                    <a
                      href={activeProject.projectURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3 text-center bg-[#5a3cff] hover:bg-[#6f55ff] text-white font-semibold rounded-full transition-colors text-sm"
                    >
                      Kunjungi Website
                    </a>
                  )}
                  {activeProject.prototypeURL && (
                    <a
                      href={activeProject.prototypeURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3 text-center bg-[#2b2c35] hover:bg-[#3a3b45] text-white font-semibold rounded-full transition-colors text-sm border border-[#3a3b45]"
                    >
                      Buka Prototipe
                    </a>
                  )}
                </div>

                <button
                  onClick={() => setModalOpen(false)}
                  className="w-full mt-4 py-2.5 bg-transparent text-[#8e8f9b] hover:text-white text-xs tracking-wider uppercase font-bold transition-colors cursor-pointer"
                >
                  Tutup Studi Kasus
                </button>
              </div>
            )}

            {modalType === 'cv' && (
              <div>
                <h3 className="text-2xl font-black mb-2 text-[#5ed81a]">Ringkasan CV — {hero.nama}</h3>
                <p className="text-sm text-[#c9cad2] mb-4">
                  {profile.cvSummary}
                </p>
                
                {profile.highlights && profile.highlights.length > 0 && (
                  <ul className="text-xs text-[#c9cad2] space-y-2 mb-6 bg-[#1b1c23] p-4 rounded-2xl border border-[#3a3b45]">
                    {profile.highlights.map((hl, idx) => (
                      <li key={idx}>• {hl}</li>
                    ))}
                  </ul>
                )}
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      alert(`Mengunduh CV ${hero.nama} (PDF)...`);
                      setModalOpen(false);
                    }}
                    className="flex-1 py-3 bg-[#5a3cff] hover:bg-[#6f55ff] text-white font-semibold rounded-full transition-colors text-center text-sm cursor-pointer"
                  >
                    Unduh PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-5 py-3 bg-[#2b2c35] hover:bg-[#3a3b45] text-white font-medium rounded-full transition-colors text-sm cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Renders the precise vectors for static template designs
function renderPortfolioGraphics(tag: string) {
  switch (tag) {
    case 'green-phone':
      return (
        <svg viewBox="0 0 400 500" className="w-full h-full object-cover" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <rect width="400" height="500" fill="#5ed81a" />
          <g transform="rotate(-10 200 260)">
            <rect x="95" y="60" width="210" height="440" rx="34" fill="#15161b" />
            <rect x="103" y="68" width="194" height="424" rx="28" fill="#f5f5f2" />
            <rect x="165" y="76" width="70" height="18" rx="9" fill="#15161b" />
            <rect x="120" y="120" width="120" height="10" rx="5" fill="#15161b" opacity=".85" />
            <rect x="120" y="140" width="80" height="8" rx="4" fill="#15161b" opacity=".35" />
            <rect x="120" y="170" width="160" height="34" rx="17" fill="#5ed81a" />
            <rect x="120" y="222" width="76" height="98" rx="14" fill="#dcd6ff" />
            <rect x="204" y="222" width="76" height="98" rx="14" fill="#ffd9d2" />
            <rect x="120" y="334" width="160" height="54" rx="14" fill="#e9e9e4" />
          </g>
        </svg>
      );
    case 'blue-layers':
      return (
        <svg viewBox="0 0 400 400" className="w-full h-full object-cover" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <rect width="400" height="400" fill="#a9d6ec" />
          <rect x="60" y="300" width="280" height="40" rx="6" fill="#1f3a6b" />
          <rect x="66" y="266" width="268" height="36" rx="6" fill="#4d78bd" />
          <rect x="58" y="232" width="284" height="36" rx="6" fill="#86a9d9" />
          <rect x="64" y="198" width="272" height="36" rx="6" fill="#2c4f8c" />
          <rect x="64" y="212" width="272" height="8" fill="#f3e9c6" />
          <rect x="60" y="164" width="280" height="36" rx="6" fill="#6f95cf" />
          <rect x="68" y="130" width="264" height="36" rx="6" fill="#9dbbe2" />
          <rect x="62" y="96" width="276" height="36" rx="6" fill="#3f68ad" />
          <rect x="330" y="0" width="70" height="400" fill="#fff" opacity=".06" />
        </svg>
      );
    case 'gold-charts':
      return (
        <svg viewBox="0 0 400 420" className="w-full h-full object-cover" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#8a781f" />
              <stop offset="1" stopColor="#26240f" />
            </linearGradient>
          </defs>
          <rect width="400" height="420" fill="url(#g2)" />
          <g fill="#f4ecd0" opacity=".16">
            <rect x="30" y="300" width="60" height="70" />
            <rect x="100" y="280" width="50" height="90" />
            <rect x="160" y="310" width="70" height="60" />
            <rect x="240" y="270" width="54" height="100" />
            <rect x="304" y="300" width="66" height="70" />
          </g>
          <circle cx="88" cy="196" r="20" fill="none" stroke="#f4ecd0" strokeWidth="3" />
          <circle cx="88" cy="196" r="7" fill="#f4ecd0" />
          <text
            x="126"
            y="190"
            fontSize="20"
            fontWeight="300"
            fill="#f4ecd0"
            fontFamily="Anybody,sans-serif"
          >
            Sistem Informasi
          </text>
          <text
            x="126"
            y="216"
            fontSize="20"
            fontWeight="800"
            fill="#f4ecd0"
            fontFamily="Anybody,sans-serif"
          >
            Pemantauan Iklim
          </text>
        </svg>
      );
    case 'blue-laptop':
      return (
        <svg viewBox="0 0 400 500" className="w-full h-full object-cover" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#a9c6e0" />
              <stop offset="1" stopColor="#6f95b8" />
            </linearGradient>
          </defs>
          <rect width="400" height="500" fill="url(#g3)" />
          <rect x="60" y="120" width="280" height="180" rx="12" fill="#1b1c23" />
          <rect x="68" y="128" width="264" height="164" rx="6" fill="#f4f7fb" />
          <rect x="82" y="144" width="120" height="10" rx="5" fill="#1b1c23" />
          <rect x="82" y="162" width="84" height="7" rx="3.5" fill="#1b1c23" opacity=".4" />
          <rect x="82" y="188" width="72" height="88" rx="8" fill="#ffd0c8" />
          <rect x="162" y="188" width="72" height="88" rx="8" fill="#cbd5ff" />
          <rect x="242" y="188" width="76" height="88" rx="8" fill="#bff0e1" />
          <path d="M30 300H370L392 326H8Z" fill="#2a2b33" />
        </svg>
      );
    default:
      // A stylish placeholder for user created custom portfolios
      return (
        <div className="w-full h-full bg-gradient-to-tr from-[#23242c] to-[#3a3b45] flex items-center justify-center p-6 text-center">
          <div className="space-y-2">
            <Icons.Image className="w-8 h-8 mx-auto text-[#25d0a4] opacity-70 animate-pulse" />
            <p className="text-[10px] uppercase tracking-wider text-[#8e8f9b]">Custom Showcase Card</p>
          </div>
        </div>
      );
  }
}

// Render dynamic social svg icons
function renderSocialIcon(name: string) {
  const norm = name.toLowerCase();
  if (norm.includes('instagram')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="5" />
        <circle cx="12" cy="12" r="3.5" />
        <circle cx="17" cy="7" r=".7" fill="currentColor" />
      </svg>
    );
  } else if (norm.includes('linkedin')) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M6 10v8M6 6.5v.01M10 18v-8m0 3c0-2 1.5-3 3-3s3 1 3 3v5" />
      </svg>
    );
  } else if (norm.includes('behance')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <text
          x="12"
          y="16"
          textAnchor="middle"
          fontSize="11"
          fontWeight="800"
          fill="currentColor"
          fontFamily="Anybody,sans-serif"
        >
          Bē
        </text>
      </svg>
    );
  } else if (norm.includes('dribbble')) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="8" />
        <path d="M5 9c5 1 9 0 12-3M9 4.5c3 3 5 7 5.5 15M4.5 13c4-1 9-.5 15 3" />
      </svg>
    );
  } else if (norm.includes('github')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
      </svg>
    );
  } else if (norm.includes('youtube')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25a29 29 0 0 0-.46-5.33z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
      </svg>
    );
  } else {
    // default custom globe or link icon
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    );
  }
}
