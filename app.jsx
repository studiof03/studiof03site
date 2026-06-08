/* STUDIO F03 website — app shell + language provider */
const { useState: useState2, useEffect: useEffect2 } = React;

function App() {
  const [lang, setLangRaw] = useState2(() => {
    try { return localStorage.getItem('f03_lang') || 'pt'; } catch (e) { return 'pt'; }
  });
  const setLang = (l) => { setLangRaw(l); try { localStorage.setItem('f03_lang', l); } catch (e) {} };
  const t = DICT[lang];

  const [solid, setSolid] = useState2(false);

  useReveal(lang); // re-arm reveals when language (and thus DOM) changes

  useEffect2(() => {
    document.documentElement.lang = lang === 'en' ? 'en' : 'pt-BR';
  }, [lang]);

  useEffect2(() => {
    const onScroll = () => setSolid(window.scrollY > window.innerHeight * 0.72);
    window.addEventListener('scroll', onScroll); onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const nav = (id) => {
    if (id === 'top') return window.scrollTo({ top: 0, behavior: 'smooth' });
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 70, behavior: 'smooth' });
  };

  return (
    <LangCtx.Provider value={{ lang, t, setLang }}>
      <Nav solid={solid} onNav={nav} />
      <Hero onNav={nav} />
      <ClientStrip />
      <Work />
      <Services />
      <Process />
      <About />
      <Tour />
      <CTA onNav={nav} />
      <Contact />
      <Footer onNav={nav} />
    </LangCtx.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
