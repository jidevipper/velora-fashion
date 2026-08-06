import Image from "next/image";
import SearchBar from "@/app/components/SearchBar";
import ProductGrid from "@/app/components/ProductGrid";
import CategoryGrid from "@/app/components/CategoryGrid";
import Reveal from "@/app/components/Reveal";
import hero from "@/public/images/hero.jpg";
import aboutImg from "@/public/images/about.jpg";

const reviews = [
  {
    stars: "★★★★★",
    text: "\u201CAbsolutely premium quality. Better than I expected.\u201D",
    author: "— Sarah M.",
  },
  {
    stars: "★★★★★",
    text: "\u201CLuxury feel, fast delivery and excellent customer service.\u201D",
    author: "— Daniel A.",
  },
  {
    stars: "★★★★★",
    text: "\u201CThe outfits look even better in person.\u201D",
    author: "— Jessica K.",
  },
];

export default function Home() {
  return (
    <>
      {/* ================= HERO ================= */}
      <section id="home" className="hero">
        <Image
          src={hero}
          alt="Luxury Fashion Model"
          fill
          priority
          sizes="100vw"
          className="hero-image"
        />
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1>
            Luxury.
            <br />
            Redefined.
          </h1>
          <p>Where timeless elegance meets modern confidence.</p>
          <div className="hero-buttons">
            <a href="#collection" className="btn">
              Shop Collection
            </a>
            <a href="#about" className="btn-outline">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* ================= SEARCH ================= */}
      <SearchBar />

      {/* ================= CATEGORIES ================= */}
      <section className="categories" id="categories">
        <h2 className="section-title">Featured Categories</h2>
        <CategoryGrid />
      </section>

      {/* ================= PRODUCTS ================= */}
      <section id="collection" className="products">
        <h2 className="section-title">New Arrivals</h2>
        <ProductGrid />
      </section>

      {/* ================= ABOUT ================= */}
      <section id="about" className="about">
        <Reveal>
          <div className="about-image">
            <Image
              src={aboutImg}
              alt="About Velora"
              sizes="(min-width: 900px) 45vw, 100vw"
            />
          </div>
        </Reveal>
        <Reveal>
          <div className="about-content">
            <h2>About Velora</h2>
            <p>
              Velora is a premium fashion destination built for people who
              appreciate timeless elegance, luxury craftsmanship and modern
              confidence.
            </p>
            <p>
              Every collection is carefully selected to deliver style, comfort
              and exclusivity for every occasion.
            </p>
            <a href="#collection" className="btn">
              Explore Collection
            </a>
          </div>
        </Reveal>
      </section>

      {/* ================= REVIEWS ================= */}
      <section id="reviews" className="reviews">
        <h2 className="section-title">Customer Reviews</h2>
        <div className="review-grid">
          {reviews.map((review) => (
            <Reveal key={review.author}>
              <div className="review-card">
                <h3>{review.stars}</h3>
                <p>{review.text}</p>
                <span>{review.author}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= CONTACT ================= */}
      <section id="contact" className="contact">
        <h2 className="section-title">Contact Us</h2>
        <div className="contact-container">
          <Reveal>
            <div className="contact-card">
              <i className="fas fa-envelope" />
              <h3>Email</h3>
              <p>hello@velorafashion.com</p>
            </div>
          </Reveal>
          <Reveal>
            <div className="contact-card">
              <i className="fab fa-instagram" />
              <h3>Instagram</h3>
              <p>@velorafashion</p>
            </div>
          </Reveal>
          <Reveal>
            <div className="contact-card">
              <i className="fas fa-location-dot" />
              <h3>Location</h3>
              <p>London • Paris • Milan</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer>
        <h2>VELORA</h2>
        <p>Crafted for people who wear confidence.</p>
        <p className="copyright">© 2026 Velora Fashion. All Rights Reserved.</p>
      </footer>
    </>
  );
}
