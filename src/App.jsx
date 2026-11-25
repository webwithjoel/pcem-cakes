import { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  Facebook,
  Instagram,
  Menu,
  MessageCircle,
  Music2,
  ShoppingBag,
  X,
} from 'lucide-react';
import { copy } from './data/copy.js';

const whatsappUrl =
  'https://wa.me/2348163681801?text=Hello%20Pcemcakes%2C%20I%E2%80%99d%20like%20to%20ask%20about%E2%80%A6';

const menuLinks = [
  ['Home', '#home'],
  ['Cakes', '#cakes'],
  ['Wedding and Engagement', '#wedding'],
  ['Cupcakes and Treats', '#cupcakes'],
  ['Small Chops and Pastries', '#small-chops'],
  ['Training', '#training'],
  ['Plan My Event', '#event-planner'],
  ['About', '#about'],
  ['Reviews', '#reviews'],
  ['Contact', '#contact'],
];

function AnnouncementBar() {
  return <div className="announcement">{copy.announcement}</div>;
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  return (
    <>
      <header className="site-header">
        <a className="brand" href="#home" aria-label="Pcemcakes home">
          <img src="/images/logo.png" alt="" />
          <span>Pcemcakes</span>
        </a>
        <div className="header-actions">
          <a className="cart-button" href="#featured" aria-label="View cart, 0 items">
            <ShoppingBag size={21} strokeWidth={1.8} />
            <span className="cart-count">0</span>
          </a>
          <button
            className="icon-button menu-button"
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>
      {menuOpen && (
        <div className="drawer-backdrop" onMouseDown={() => setMenuOpen(false)}>
          <nav
            className="menu-drawer"
            aria-label="Main navigation"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="drawer-heading">
              <span>Explore Pcemcakes</span>
              <button
                className="icon-button drawer-close"
                type="button"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
              >
                <X size={22} />
              </button>
            </div>
            <div className="drawer-links">
              {menuLinks.map(([label, href]) => (
                <a key={href} href={href} onClick={() => setMenuOpen(false)}>
                  {label}
                  <ArrowRight size={17} />
                </a>
              ))}
            </div>
            <a className="button button-pink drawer-order" href={whatsappUrl} target="_blank" rel="noreferrer">
              <MessageCircle size={18} />
              Order on WhatsApp
            </a>
            <SocialLinks />
          </nav>
        </div>
      )}
    </>
  );
}

function SocialLinks() {
  return (
    <div className="social-links" aria-label="Social media">
      <a href="https://instagram.com/pcem_cakes" aria-label="Instagram">
        <Instagram size={19} />
      </a>
      <a href="https://www.tiktok.com/@pcemcakes" aria-label="TikTok">
        <Music2 size={19} />
      </a>
      <a href="https://www.facebook.com/" aria-label="Facebook">
        <Facebook size={19} />
      </a>
    </div>
  );
}

function Hero() {
  return (
    <section className="hero section-wrap" id="home">
      <div className="hero-copy">
        <span className="eyebrow"><span />{copy.hero.eyebrow}</span>
        <h1>{copy.hero.headline}</h1>
        <p>{copy.hero.subhead}</p>
        <div className="hero-actions">
          <a className="button button-pink" href="#featured">
            {copy.hero.primaryAction}
            <ArrowRight size={18} />
          </a>
          <a className="button button-outline" href="#event-planner">
            {copy.hero.secondaryAction}
          </a>
        </div>
        <div className="hero-note">
          <span className="note-icon"><MessageCircle size={16} /></span>
          Freshly made for your special moments
        </div>
      </div>
      <div className="hero-visual">
        <div className="hero-image-frame">
          <img
            className="hero-image"
            src="/images/cake-handbag-drip.jpg"
            alt="Handbag-themed birthday cake with a red rosette border"
          />
        </div>
        <div className="hero-logo-badge">
          <img src="/images/logo.png" alt="PCEM Paramount Cakes and Events Management" />
        </div>
        <div className="hero-sticker">
          <span>Handmade</span>
          <strong>with love</strong>
          <span className="sticker-heart">♡</span>
        </div>
        <div className="hero-sparkle sparkle-one">✦</div>
        <div className="hero-sparkle sparkle-two">✦</div>
      </div>
    </section>
  );
}

function StatStrip() {
  return (
    <section className="stat-strip" aria-label="Pcemcakes at a glance">
      <div className="stat-grid section-wrap">
        {copy.stats.map((stat) => (
          <div className="stat-item" key={stat.value}>
            <span className="stat-star">✦</span>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function CategoryCards() {
  return (
    <section className="section-wrap category-section" aria-labelledby="category-title">
      <div className="section-heading">
        <div>
          <span className="section-kicker">Made for every moment</span>
          <h2 id="category-title">Find your something sweet</h2>
        </div>
        <a className="text-link" href="#featured">
          Explore our treats <ArrowRight size={17} />
        </a>
      </div>
      <div className="category-grid">
        {copy.categories.map((category, index) => (
          <a
            className={`category-card${index === 4 ? ' category-card-training' : ''}`}
            href={`#${category.id}`}
            key={category.id}
          >
            <img src={category.image} alt="" loading="lazy" />
            <span className="category-shade" />
            <span className="category-copy">
              <span className="category-eyebrow">{index === 4 ? 'Grow your skills' : 'Baked with care'}</span>
              <strong>{category.title}</strong>
              <span>{category.description}</span>
            </span>
            <span className="category-arrow" aria-hidden="true"><ArrowRight size={19} /></span>
          </a>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer" id="contact">
      <div className="footer-main section-wrap">
        <div className="footer-brand">
          <a className="brand" href="#home">
            <img src="/images/logo.png" alt="" />
            <span>Pcemcakes</span>
          </a>
          <p>{copy.footerLine}</p>
          <p className="footer-subline">Promoting your satisfaction.</p>
          <SocialLinks />
        </div>
        <div className="footer-contact">
          <span className="footer-label">Let’s make your day sweeter</span>
          <a href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp · 0816 368 1801</a>
          <span>Owode, Ede, Osun State, Nigeria</span>
          <span>Open 24 hours on WhatsApp</span>
        </div>
      </div>
      <div className="footer-bottom section-wrap">
        <span>© Pcemcakes</span>
        <span>All orders are final (no refund).</span>
        <span>Made with care in Ede</span>
      </div>
    </footer>
  );
}

function FloatingWhatsApp() {
  return (
    <a className="floating-whatsapp" href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="Chat with Pcemcakes on WhatsApp">
      <MessageCircle size={22} />
      <span>Chat with us</span>
    </a>
  );
}

export default function App() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main>
        <Hero />
        <StatStrip />
        <CategoryCards />
        <section className="stage-placeholder" id="featured" aria-label="Featured products coming in the next build stage">
          <div className="section-wrap placeholder-inner">
            <span className="section-kicker">A little sweetness is on the way</span>
            <h2>Our Sweetest Picks</h2>
            <p>Explore the menu and discover something made just for your celebration.</p>
            <a className="text-link" href="#home">Back to the top <ArrowDown size={16} /></a>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
