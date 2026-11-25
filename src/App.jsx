import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  CakeSlice,
  Check,
  ChevronLeft,
  ChevronRight,
  Facebook,
  Instagram,
  Minus,
  Menu,
  MessageCircle,
  Music2,
  Plus,
  ShoppingBag,
  X,
} from 'lucide-react';
import { copy } from './data/copy.js';
import { products } from './data/products.js';
import { getProductPrice, productPrices } from './data/prices.js';
import { modalConfigs } from './data/modalConfigs.js';
import ActiveEventBar from './components/layout/ActiveEventBar.jsx';
import EventPlanner from './components/event/EventPlanner.jsx';
import ProductModal from './components/product/ProductModal.jsx';

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

function Header({ cartCount }) {
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
          <a className="cart-button" href="#featured" aria-label={`View cart, ${cartCount} items`}>
            <ShoppingBag size={21} strokeWidth={1.8} />
            <span className="cart-count">{cartCount}</span>
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
            <img
              src={category.image}
              alt=""
              loading="lazy"
              onError={(event) => {
                event.currentTarget.hidden = true;
              }}
            />
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

function ProductCard({ product, onAdd, onCustomize, showCategoryAnchor }) {
  const minimumQuantity = modalConfigs[product.id]?.minimumQuantity ?? 1;
  const [quantity, setQuantity] = useState(String(minimumQuantity));
  const [imageAvailable, setImageAvailable] = useState(Boolean(product.image));
  const parsedQuantity = Number.parseInt(quantity, 10);
  const safeQuantity = Number.isFinite(parsedQuantity) && parsedQuantity >= minimumQuantity
    ? parsedQuantity
    : minimumQuantity;
  const price = getProductPrice(product);

  const changeQuantity = (amount) => {
    setQuantity(String(Math.max(minimumQuantity, safeQuantity + amount)));
  };

  return (
    <article
      className="product-card"
      id={showCategoryAnchor ? (product.category === 'smallChops' ? 'small-chops' : product.category) : undefined}
    >
      <div className={`product-image${imageAvailable ? '' : ' product-image-empty'}`}>
        {imageAvailable ? (
          <img
            src={product.image}
            alt={product.alt}
            loading="lazy"
            onError={() => setImageAvailable(false)}
          />
        ) : (
          <span className="product-fallback" aria-label="Decorative cake illustration">
            <CakeSlice size={42} strokeWidth={1.25} />
          </span>
        )}
        {product.category === 'wedding' && product.id === 'two-tier-wedding-cake' && (
          <span className="product-image-label">Wedding cake design</span>
        )}
      </div>
      <div className="product-content">
        <span className="product-category">{product.category === 'smallChops' ? 'Small Chops' : product.category}</span>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <strong className="product-price">{price.label}</strong>
        <div className="product-quantity-row">
          <span>Quantity{minimumQuantity > 1 ? ` · min. ${minimumQuantity}` : ''}</span>
          <div className="quantity-control">
            <button
              type="button"
              aria-label={`Decrease ${product.name} quantity`}
              disabled={safeQuantity <= minimumQuantity}
              onClick={() => changeQuantity(-1)}
            >
              <Minus size={15} />
            </button>
            <input
              aria-label={`${product.name} quantity`}
              type="number"
              min={minimumQuantity}
              step="1"
              inputMode="numeric"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              onBlur={() => setQuantity(String(safeQuantity))}
            />
            <button type="button" aria-label={`Increase ${product.name} quantity`} onClick={() => changeQuantity(1)}>
              <Plus size={15} />
            </button>
          </div>
        </div>
        <div className="product-actions">
          <button className="button button-pink product-add" type="button" onClick={() => onAdd(product, safeQuantity)}>
            <ShoppingBag size={16} />
            Add to Cart
          </button>
          <button className="button button-outline product-customize" type="button" onClick={() => onCustomize(product, safeQuantity)}>
            Customize
          </button>
        </div>
      </div>
    </article>
  );
}

function Featured({ onAdd, onCustomize }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const filteredProducts =
    activeFilter === 'all' ? products : products.filter((product) => product.category === activeFilter);

  return (
    <section className="featured-section section-wrap" id="featured" aria-labelledby="featured-title">
      <div className="section-heading">
        <div>
          <span className="section-kicker">{copy.featured.kicker}</span>
          <h2 id="featured-title">{copy.featured.title}</h2>
        </div>
        <span className="featured-intro">A little something lovely for every celebration.</span>
      </div>
      <div className="product-filters" aria-label="Filter products by category">
        {copy.featured.filters.map((filter) => (
          <button
            className={`filter-chip${activeFilter === filter.id ? ' filter-chip-active' : ''}`}
            type="button"
            key={filter.id}
            aria-pressed={activeFilter === filter.id}
            onClick={() => setActiveFilter(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>
      <div className="product-grid">
        {filteredProducts.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            onAdd={onAdd}
            onCustomize={onCustomize}
            showCategoryAnchor={activeFilter === 'all' && products.findIndex((item) => item.category === product.category) === index}
          />
        ))}
      </div>
    </section>
  );
}

function Training() {
  return (
    <section className="training-section section-wrap" id="training" aria-labelledby="training-title">
      <div className="training-photo">
        <img src="/images/team.jpg" alt="Three members of the Pcemcakes kitchen team wearing blue hair nets" loading="lazy" />
        <span className="training-duration">6 months<br /><strong>hands-on learning</strong></span>
      </div>
      <div className="training-copy">
        <span className="section-kicker">Learn, practise, create</span>
        <h2 id="training-title">{copy.training.title}</h2>
        <p>{copy.training.description}</p>
        <ul className="training-list">
          {copy.training.courses.map((course) => (
            <li key={course}><Check size={17} />{course}</li>
          ))}
        </ul>
        <div className="training-details">
          <span>{copy.training.certificate}</span>
          <span>{copy.training.location}</span>
        </div>
        <div className="training-cta">
          <div>
            <span>Course fee</span>
            <strong>{productPrices.trainingCourse.label}</strong>
          </div>
          <a
            className="button button-pink"
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
          >
            {copy.training.action}
            <ArrowRight size={17} />
          </a>
        </div>
      </div>
    </section>
  );
}

function Reviews() {
  const viewportRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToReview = (index) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollTo({ left: index * viewport.clientWidth, behavior: 'smooth' });
    setActiveIndex(index);
  };

  const updateActiveIndex = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    setActiveIndex(Math.round(viewport.scrollLeft / viewport.clientWidth));
  };

  const moveReview = (direction) => {
    const nextIndex =
      (activeIndex + direction + copy.reviews.messages.length) % copy.reviews.messages.length;
    scrollToReview(nextIndex);
  };

  return (
    <section className="reviews-section" id="reviews" aria-labelledby="reviews-title">
      <div className="section-wrap">
        <div className="reviews-heading">
          <div>
            <span className="section-kicker">A little love from our customers</span>
            <h2 id="reviews-title">{copy.reviews.title}</h2>
          </div>
          <div className="review-controls">
            <button className="review-arrow" type="button" aria-label="Previous review" onClick={() => moveReview(-1)}>
              <ChevronLeft size={20} />
            </button>
            <button className="review-arrow" type="button" aria-label="Next review" onClick={() => moveReview(1)}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        <div className="review-viewport" ref={viewportRef} onScroll={updateActiveIndex}>
          {copy.reviews.messages.map((message, index) => (
            <div className="review-slide" key={message}>
              <div className="chat-bubble">
                <span className="chat-label">WhatsApp message</span>
                <p>“{message}”</p>
                <span className="chat-meta">10:42 <span aria-label="Message read">✓✓</span></span>
              </div>
              <span className="review-counter">{String(index + 1).padStart(2, '0')} / {String(copy.reviews.messages.length).padStart(2, '0')}</span>
            </div>
          ))}
        </div>
        <div className="review-dots" aria-label="Choose a review">
          {copy.reviews.messages.map((message, index) => (
            <button
              key={message}
              className={`review-dot${activeIndex === index ? ' review-dot-active' : ''}`}
              type="button"
              aria-label={`Show review ${index + 1}`}
              aria-current={activeIndex === index ? 'true' : undefined}
              onClick={() => scrollToReview(index)}
            />
          ))}
        </div>
        <p className="review-note">{copy.reviews.note}</p>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="about-section section-wrap" id="about" aria-labelledby="about-title">
      <div className="about-main">
        <div className="about-photo">
          <img src="/images/owner-portrait.jpg" alt="The Pcemcakes owner smiling in a black lace dress" loading="lazy" />
          <span className="about-photo-caption">Made with care in Ede</span>
        </div>
        <div className="about-copy">
          <span className="section-kicker">A promise in every bake</span>
          <h2 id="about-title">{copy.about.title}</h2>
          <p>{copy.about.story}</p>
          <span className="about-signoff">We only deliver the best. <span>♡</span></span>
        </div>
      </div>
      <div className="kitchen-family">
        <img src="/images/team.jpg" alt="The Pcemcakes kitchen team preparing orders together" loading="lazy" />
        <div>
          <span className="section-kicker">Behind every celebration</span>
          <h3>{copy.about.kitchenTitle}</h3>
          <p>{copy.about.kitchenCaption}</p>
        </div>
        <CakeSlice className="kitchen-icon" size={40} strokeWidth={1.2} />
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
  const [cartLines, setCartLines] = useState([]);
  const [notice, setNotice] = useState('');
  const [customizingProduct, setCustomizingProduct] = useState(null);
  const cartCount = cartLines.reduce((count, line) => count + line.quantity, 0);

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(''), 3200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const addToCart = (product, quantity, options = {}, orderContext = {}) => {
    setCartLines((lines) => [
      ...lines,
      {
        productId: product.id,
        quantity,
        options,
        groupId: orderContext.groupId ?? 'personal',
      },
    ]);
    setNotice(
      orderContext?.event
        ? `${quantity} × ${product.name} added to ${orderContext.event.name}.`
        : `${quantity} × ${product.name} added to your cart.`,
    );
  };

  const startCustomization = (product, quantity) => {
    setCustomizingProduct({ product, quantity });
  };

  return (
    <>
      <AnnouncementBar />
      <Header cartCount={cartCount} />
      <ActiveEventBar />
      <main>
        <Hero />
        <StatStrip />
        <CategoryCards />
        <Featured onAdd={addToCart} onCustomize={startCustomization} />
        <EventPlanner onAdd={addToCart} />
        <Training />
        <Reviews />
        <About />
      </main>
      <Footer />
      <FloatingWhatsApp />
      {notice && (
        <div className="site-notice" role="status" aria-live="polite">
          <Check size={17} />
          {notice}
        </div>
      )}
      {customizingProduct && (
        <ProductModal
          key={customizingProduct.product.id}
          product={customizingProduct.product}
          initialQuantity={customizingProduct.quantity}
          onClose={() => setCustomizingProduct(null)}
          onAdd={(...args) => {
            addToCart(...args);
            setCustomizingProduct(null);
          }}
        />
      )}
    </>
  );
}
