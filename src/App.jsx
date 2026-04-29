import { createContext, useContext, useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
  useLocation,
} from "react-router";
import { translations } from "./utils/translations";
import {
  BookOpen,
  Languages,
  Clock,
  CircleUserRound,
  ArrowLeft,
} from "lucide-react";

const LangContext = createContext(undefined);

function LangProvider({ children }) {
  const [language, setLanguage] = useState("en");
  const t = (key) => translations[language][key] || key;

  return (
    <LangContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LangContext.Provider>
  );
}

const useLang = () => {
  const context = useContext(LangContext);
  if (!context) throw new Error("useLang must be used within a LangProvider");
  return context;
};

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function Header() {
  const { t } = useLang();
  return (
    <header className="header">
      <div className="container header__content">
        <Link to="/" className="logo">
          <BookOpen className="logo__icon" size={32} />
          <div className="logo__text">
            <h1 className="logo__title">{t("siteTitle")}</h1>
            <span className="logo__subtitle">{t("subTitle")}</span>
          </div>
        </Link>
        <LangToggle />
      </div>
    </header>
  );
}

function LangToggle() {
  const { language, setLanguage } = useLang();
  const langs = ["en", "es"];

  return (
    <div className="lang-switcher">
      <Languages size={18} className="lang-switcher__icon" />
      {langs.map((l) => (
        <button
          key={l}
          onClick={() => setLanguage(l)}
          className={`lang-btn ${language === l ? "lang-btn--active" : ""}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function StoryCard({ story }) {
  return (
    <Link to={`/story/${story.slug}`} className="story-card">
      <div className="story-card__image-container">
        {story.image_url ? (
          <img
            src={story.image_url}
            alt={story.title}
            className="story-card__image"
          />
        ) : (
          <div className="story-card__image-placeholder" /> // Fallback if no image
        )}
        <span className="story-card__badge">
          {story.language === "en" ? "English" : "Spanish"}
        </span>
      </div>

      <div className="story-card__content">
        <h3 className="story-card__title">{story.title}</h3>
        <p className="story-card__excerpt">
          {story.content.substring(0, 100)}...
        </p>

        <div className="story-card__footer">
          <div className="story-card__author">
            <div className="story-card__author-avatar">
              {story.author?.charAt(0) || "A"}
            </div>
            <span className="story-card__author-name">
              {story.author || "Anonymous"}
            </span>
          </div>
          <div className="story-card__date">
            <Clock size={14} />
            <span>{new Date(story.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function StoryList() {
  const { language, t } = useLang();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      try {
        const res = await fetch("/posts.json");
        const data = await res.json();
        const filtered = data.filter((story) => story.language === language);
        const ordered = filtered.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        );
        setStories(ordered);
      } catch (err) {
        console.error("JSON fetch error:", err);
      }
      setLoading(false);
    };
    fetchStories();
  }, [language]);

  if (loading) return <div className="loader"> {t("loadingStories")} </div>;

  return (
    <section className="feed">
      <header className="feed__header">
        <h2 className="feed__title">{t("storyList")}</h2>
        <p className="feed__subtitle">{t("storyListSubtitle")}</p>
      </header>
      <div className="feed__grid">
        {stories.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    </section>
  );
}

function StoryDetail() {
  const { slug } = useParams();
  const { language, t } = useLang();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStory = async () => {
      setLoading(true);
      try {
        const res = await fetch("/posts.json");
        const data = await res.json();
        const found = data.find(
          (s) => s.slug === slug && s.language === language,
        );
        setStory(found || null);
      } catch (err) {
        console.error("JSON fetch error:", err);
      }
      setLoading(false);
    };
    fetchStory();
  }, [slug, language]);

  if (loading) return <div className="loader"> {t("readingStories")} </div>;
  if (!story) return <NotFound />;

  return (
    <article className="story-page">
      <header className="story-page__header">
        <Link to="/" className="back-button">
          <ArrowLeft size={16} /> {t("backToStories")}
        </Link>
        <h1 className="story-page__title">{story.title}</h1>

        <div className="story-page__meta">
          <div className="story-page__author">
            <div className="story-page__avatar">{story.author?.charAt(0)}</div>
            <span>{story.author}</span>
          </div>
          <div className="story-page__divider"></div>
          <div className="story-page__date">
            <Clock size={16} />
            <span>{new Date(story.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </header>
      {story.image_url && (
        <div className="story-page__hero">
          <img src={story.image_url} alt={story.title} />
        </div>
      )}
      <div className="story-page__content">{story.content}</div>
    </article>
  );
}

function Footer() {
  const { t } = useLang();
  const currentYear = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container">
        <p>
          &copy; {currentYear} {t("siteTitle")}. {t("footerText")}
        </p>
      </div>
    </footer>
  );
}

function NotFound() {
  const { t } = useLang();

  return (
    <div className="not-found-container">
      <img src="/404.png" width={300} alt="Error 404" />
      <h1>Error 404</h1>
      <p> {t("notFoundMessage")}</p>
      <br />
      <Link to="/" className="back-button">
        <div className="story-card__author">
          <ArrowLeft size={16} /> {t("returnHome")}
        </div>
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <LangProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="app-wrapper">
          <Header />
          <main className="container content-area">
            <Routes>
              <Route path="/" element={<StoryList />} />
              <Route path="/story/:slug" element={<StoryDetail />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </LangProvider>
  );
}
