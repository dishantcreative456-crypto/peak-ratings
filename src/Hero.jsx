import "./Hero.css";

const HERO_NAV_ITEMS = [
  { label: "Anime", value: "Anime" },
  { label: "T.V shows", value: "TV" },
  { label: "Manga", value: "Manga" },
  { label: "Movies", value: "Film" },
];

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="hero-search-icon">
    <path
      d="M10.5 4a6.5 6.5 0 1 0 4.03 11.6l4.44 4.44 1.41-1.41-4.44-4.44A6.5 6.5 0 0 0 10.5 4Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z"
      fill="currentColor"
    />
  </svg>
);

export default function Hero({ query, onQueryChange, activeType, onTypeChange }) {
  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <section className="hero">
      <video
        className="hero-video"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster="/hero.jpg"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      <div className="hero-overlay" />

      <div className="hero-shell">
        <nav className="hero-nav">
          <button type="button" className="hero-logo">
            PEAK
          </button>

          <div className="hero-nav-center">
            {HERO_NAV_ITEMS.map((item) => (
              <button
                key={item.value}
                type="button"
                className={`hero-nav-link ${activeType === item.value ? "is-active" : ""}`}
                onClick={() => onTypeChange(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="hero-nav-right">
            <button type="button" className="hero-auth-link">
              Sign Up
            </button>
            <button type="button" className="hero-auth-link">
              Login
            </button>
          </div>
        </nav>

        <div className="hero-content">
          <div className="hero-copy">
            <h1 className="hero-title">Find your next Peak show</h1>
            <p className="hero-subtitle">Rated by storytelling. Not popularity.</p>
          </div>

          <form className="hero-search" onSubmit={handleSubmit}>
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              className="hero-search-input"
              placeholder="Search any show. See how well it’s really written."
              aria-label="Search any show"
            />
            <button type="submit" className="hero-search-button" aria-label="Search">
              <SearchIcon />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
