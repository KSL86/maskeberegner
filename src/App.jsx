import { useState, useEffect, useRef, useCallback } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Outfit:wght@300;400;500;600&display=swap');`;

const EX = `Damegenser str. S

Garn: Drops Alpaca, 150g
Pinner: 4mm
Strikkefasthet: 21 masker x 28 omganger = 10x10 cm

Bakstykke:
Legg opp 94 masker på pinne 4mm.
Strikk 2 rett, 2 vrang i 6 cm.
Fortsett i glattstrikk til arbeidet måler 38 cm.
Ermeforming: Fell av 3 masker i hver side. Fell deretter 1 maske i hver side annenhver omgang 5 ganger. (76 masker)
Fortsett rett opp til arbeidet måler 58 cm.
Fell av for skulder: 10 masker i hver side, 3 ganger. Sett av de midterste 16 maskene på en hjelpepinne for hals.

Forstykke:
Strikk som bakstykke til arbeidet måler 52 cm.
Halsforming: Strikk til det er 30 masker igjen på venstre side. Sett de midterste 16 maskene på hjelpepinne. Fell 1 maske mot halsen annenhver omgang 4 ganger.

Ermer (strikk 2):
Legg opp 42 masker. Strikk 2 rett, 2 vrang i 6 cm.
Fortsett i glattstrikk og øk 1 maske i hver side hver 6. omgang til du har 72 masker.
Strikk rett opp til ermet måler 44 cm.
Ermtopp: Fell av 3 masker i hver side. Fell deretter 1 maske i hver side annenhver omgang til det er 20 masker igjen. Fell av.`;

const C = {
  ivory: "#FAFAF5",
  paper: "#F4F0EA",
  sand: "#E7E1D8",
  sandDark: "#D8D0C5",
  forest: "#2D6B4F",
  forestDeep: "#244F3B",
  forestLight: "#E8F0EB",
  clay: "#C4957A",
  clayLight: "#F4ECE6",
  charcoal: "#2C2925",
  charcoalSoft: "#4A4640",
  textPri: "#2C2925",
  textSec: "#6F6A62",
  textTer: "#A29C93",
  border: "rgba(44,41,37,0.08)",
  borderStrong: "rgba(44,41,37,0.14)",
};

const RESPONSIVE_CSS = `
${FONTS}

@keyframes sp{to{transform:rotate(360deg)}}
@keyframes fi{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes pu{0%,100%{opacity:.45}50%{opacity:1}}

*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html{scroll-behavior:smooth}
body{margin:0;background:${C.ivory}}
textarea:focus,input:focus{outline:none;border-color:${C.forest} !important;box-shadow:0 0 0 3px rgba(45,107,79,0.08) !important}
::selection{background:rgba(45,107,79,0.12)}
textarea::placeholder,input::placeholder{color:${C.textTer}}

.ly-header-inner{max-width:980px;margin:0 auto;padding:18px 28px;display:flex;align-items:center;justify-content:space-between;gap:20px}
.ly-main{max-width:980px;margin:0 auto;padding:28px 28px 54px}
.ly-hero{display:grid;grid-template-columns:1.05fr .95fr;gap:18px;margin-bottom:18px}
.ly-card{background:rgba(255,255,255,.82);backdrop-filter:blur(10px);border-radius:18px;padding:24px;border:1px solid ${C.border};box-shadow:0 8px 24px rgba(0,0,0,.03)}
.ly-card-soft{background:${C.paper};border-radius:18px;padding:24px;border:1px solid ${C.border}}
.ly-settings{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.ly-sz-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.ly-result-head{padding:22px 24px;display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:14px}
.ly-result-body{padding:24px}
.ly-result-actions{display:flex;gap:8px;flex-wrap:wrap}
.ly-footer{border-top:1px solid ${C.border};padding:20px 24px;display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap}
.ly-card-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;gap:12px}
.ly-drop{padding:44px 24px}
.ly-pdf-loading{padding:44px 24px}
.ly-tab-btn{padding:12px 18px;min-height:44px}
.ly-submit{padding:16px;min-height:54px;font-size:15px}
.ly-mode-btn{padding:10px 14px;min-height:44px}
.ly-badge{display:flex}
.ly-tip{display:flex;gap:12px;padding:14px 18px}
.ly-brandline{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${C.textTer};font-weight:500}
.ly-display{font-family:'Cormorant Garamond',serif;font-size:56px;line-height:.95;letter-spacing:-.04em;color:${C.textPri};margin:10px 0 12px}
.ly-lead{font-size:15px;line-height:1.75;color:${C.textSec};max-width:56ch;margin:0}
.ly-hero-meta{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}
.ly-hero-chip{padding:7px 12px;border:1px solid ${C.border};border-radius:999px;font-size:12px;color:${C.textSec};background:rgba(255,255,255,.65)}
.ly-logo-lockup{display:flex;align-items:center;gap:14px}
.ly-wordmark{font-family:'Cormorant Garamond',serif;font-size:36px;line-height:1;color:${C.textPri};letter-spacing:-.03em}
.ly-wordmark-sub{font-size:12px;color:${C.textSec};letter-spacing:.04em;margin-top:2px}
.ly-logo-badge{display:flex;align-items:center;gap:8px;padding:6px 12px;border-radius:999px;background:${C.forestLight};border:1px solid rgba(45,107,79,0.1);font-size:11px;color:${C.forest};letter-spacing:.06em;text-transform:uppercase}

@media(max-width:900px){
  .ly-header-inner{padding:16px 22px}
  .ly-main{padding:24px 22px 44px}
  .ly-hero{grid-template-columns:1fr;gap:16px}
  .ly-display{font-size:48px}
}

@media(max-width:640px){
  .ly-header-inner{padding:14px 16px}
  .ly-main{padding:18px 16px 34px}
  .ly-card,.ly-card-soft{padding:18px;border-radius:15px}
  .ly-settings{grid-template-columns:1fr;gap:12px}
  .ly-result-head{padding:18px 18px;flex-direction:column}
  .ly-result-body{padding:18px}
  .ly-result-actions{width:100%}
  .ly-result-actions button{flex:1}
  .ly-drop,.ly-pdf-loading{padding:34px 16px}
  .ly-display{font-size:40px}
  .ly-wordmark{font-size:28px}
  .ly-wordmark-sub{font-size:11px}
  .ly-badge{display:none}
}

@media(max-width:420px){
  .ly-display{font-size:34px}
}
`;

function Spin({ s = 18 }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={{ animation: "sp .9s linear infinite" }}>
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="31.4 31.4"
        strokeDashoffset="10"
      />
    </svg>
  );
}

function LykkjaLogo({ size = 46, withWordmark = false, stacked = false }) {
  const icon = (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <path
        d="M26 18C39 17 77 17 93 18C100 22 103 25 106 28C106 41 106 61 104 73C101 91 89 103 60 113C31 103 19 91 16 73C14 61 14 41 14 28C18 24 20 22 26 18Z"
        stroke={C.forest}
        strokeWidth="3.4"
        fill="rgba(45,107,79,0.03)"
      />
      <circle cx="61" cy="63" r="27" stroke={C.forest} strokeWidth="3.2" />
      <path d="M49 37L36 13" stroke={C.forest} strokeWidth="3.2" strokeLinecap="round" />
      <path d="M73 37L86 13" stroke={C.forest} strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="35" cy="12" r="3.8" fill={C.forest} />
      <circle cx="87" cy="12" r="3.8" fill={C.forest} />
      <path d="M38 55C48 44 58 42 83 54" stroke={C.forest} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M34 66C46 52 58 51 87 67" stroke={C.forest} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M38 77C48 67 62 66 87 79" stroke={C.forest} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M47 86C56 79 67 79 82 87" stroke={C.forest} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M80 46C89 52 94 57 95 68" stroke={C.forest} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M83 38C89 34 94 28 97 20" stroke={C.forest} strokeWidth="2.7" strokeLinecap="round" />
      <path d="M90 46C98 45 103 41 106 35" stroke={C.forest} strokeWidth="2.7" strokeLinecap="round" />
      <path d="M90 58C99 60 104 59 109 54" stroke={C.forest} strokeWidth="2.7" strokeLinecap="round" />
      <path d="M87 71C95 75 99 78 101 84" stroke={C.forest} strokeWidth="2.7" strokeLinecap="round" />
      <path d="M32 82H88" stroke={C.forest} strokeWidth="2.8" strokeLinecap="round" opacity=".8" />
      <path d="M42 89C50 87 59 87 68 89" stroke={C.forest} strokeWidth="2.3" strokeLinecap="round" opacity=".55" />
    </svg>
  );

  if (!withWordmark) return icon;

  if (stacked) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        {icon}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: size * 0.9, lineHeight: 1, letterSpacing: "-0.04em", color: C.forestDeep }}>
            Lykkja
          </div>
          <div style={{ fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", color: C.textSec, marginTop: 3 }}>
            tilpass strikkeoppskrifter
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ly-logo-lockup">
      {icon}
      <div>
        <div className="ly-wordmark">Lykkja</div>
        <div className="ly-wordmark-sub">tilpass strikkeoppskrifter til din størrelse</div>
      </div>
    </div>
  );
}

async function readJsonResponse(response) {
  const raw = await response.text();

  if (!raw || !raw.trim()) {
    throw new Error("Serveren returnerte tomt svar.");
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(`Ugyldig svar fra server (${response.status}).`);
  }

  if (!response.ok) {
    throw new Error(data?.error?.message || `Serverfeil (${response.status})`);
  }

  if (data?.error) {
    throw new Error(data.error.message || "Ukjent serverfeil.");
  }

  return data;
}

export default function App() {
  const [pat, setPat] = useState("");
  const [sz, setSz] = useState("M");
  const [gauge, setGauge] = useState("");
  const [res, setRes] = useState("");
  const [load, setLoad] = useState(false);
  const [err, setErr] = useState("");
  const [tab, setTab] = useState("input");
  const [msg, setMsg] = useState(0);
  const [pdfLoad, setPdfLoad] = useState(false);
  const [pdfName, setPdfName] = useState("");
  const [pdfFileId, setPdfFileId] = useState("");
  const [drag, setDrag] = useState(false);
  const [mode, setMode] = useState("text");
  const fRef = useRef(null);

  const msgs = ["Teller masker…", "Beregner proporsjoner…", "Tilpasser oppskriften…", "Siste finpuss…"];
  const pMsgs = ["Laster opp PDF…", "Lagrer fil sikkert…", "Trekker ut oppskriften…"];
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  useEffect(() => {
    if (!load && !pdfLoad) return;
    const m = pdfLoad ? pMsgs : msgs;
    const i = setInterval(() => setMsg((p) => (p + 1) % m.length), 2200);
    return () => clearInterval(i);
  }, [load, pdfLoad]);

  async function uploadPdfAndExtract(file) {
    const b64 = await new Promise((ok, no) => {
      const r = new FileReader();
      r.onload = () => ok(r.result.split(",")[1]);
      r.onerror = () => no(new Error("Lesefeil"));
      r.readAsDataURL(file);
    });

    const uploadResponse = await fetch("/api/upload-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        mimeType: file.type || "application/pdf",
        data: b64,
      }),
    });

    const uploadData = await readJsonResponse(uploadResponse);
    const fileId = uploadData.file_id;

    if (!fileId) {
      throw new Error("Mangler file_id fra server.");
    }

    const extractResponse = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: {
                  type: "file",
                  file_id: fileId,
                },
              },
              {
                type: "text",
                text: "Trekk ut den komplette strikkeoppskriften fra denne PDF-en som ren tekst. Behold all informasjon nøyaktig. Ikke endre noe. Svar kun med oppskriften.",
              },
            ],
          },
        ],
      }),
    });

    const extractData = await readJsonResponse(extractResponse);

    const extractedText = (extractData.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    return { extractedText, fileId };
  }

  async function onFile(f) {
    if (!f) return;

    if (f.type !== "application/pdf") {
      setErr("Last opp en PDF-fil.");
      return;
    }

    if (f.size > 20 * 1024 * 1024) {
      setErr("Maks 20 MB.");
      return;
    }

    setErr("");
    setPdfLoad(true);
    setPdfName(f.name);
    setPdfFileId("");
    setMsg(0);

    try {
      const { extractedText, fileId } = await uploadPdfAndExtract(f);
      setPat(extractedText);
      setPdfFileId(fileId);
      setMode("text");
    } catch (e) {
      setErr(e.message || "Kunne ikke lese PDF.");
    } finally {
      setPdfLoad(false);
    }
  }

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDrag(false);
    onFile(e.dataTransfer?.files?.[0]);
  }, []);

  async function adapt() {
    if (!pat.trim()) {
      setErr("Legg inn en oppskrift først.");
      return;
    }

    setErr("");
    setLoad(true);
    setRes("");
    setMsg(0);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          messages: [
            {
              role: "user",
              content: `Tilpass til størrelse ${sz}:\n\n${pat}${gauge ? `\n\nMin strikkefasthet: ${gauge}` : ""}`,
            },
          ],
          system: `Du er en ekspert strikkedesigner. Tilpass oppskrifter til nye størrelser.
Regler:
1. Analyser strikkefasthet, masker, mål og konstruksjon
2. Beregn nye maskantall proporsjonalt
3. Juster alle mål til ny størrelse
4. Behold mønsterrapporter
5. Rund av til hele tall
6. Beregn nytt garnforbruk
Størrelser: XS ~82cm, S ~88cm, M ~94cm, L ~100cm, XL ~108cm, XXL ~116cm brystmål.
Svar på norsk. Ryddig format. Forklar endringene kort.`,
        }),
      });

      const data = await readJsonResponse(response);

      const text = (data.content || [])
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n");

      setRes(text);
      setTab("result");
    } catch (e) {
      setErr(e.message || "Tilkoblingsfeil. Prøv igjen.");
    } finally {
      setLoad(false);
    }
  }

  function fmt(t) {
    return t.split("\n").map((l, i) => {
      if (l.startsWith("# ")) return <h2 key={i} style={st.rH2}>{l.slice(2)}</h2>;
      if (l.startsWith("## ")) return <h3 key={i} style={st.rH3}>{l.slice(3)}</h3>;
      if (l.startsWith("### ")) return <h4 key={i} style={st.rH4}>{l.slice(4)}</h4>;
      if (l.startsWith("- ")) return <li key={i} style={st.rLi}>{l.slice(2)}</li>;
      if (l.trim() === "") return <br key={i} />;

      const ps = l.split(/(\*\*.*?\*\*)/g);

      return (
        <p key={i} style={st.rP}>
          {ps.map((p, j) =>
            p.startsWith("**") && p.endsWith("**") ? (
              <strong key={j} style={{ fontWeight: 600, color: C.textPri }}>
                {p.slice(2, -2)}
              </strong>
            ) : (
              p
            )
          )}
        </p>
      );
    });
  }

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Outfit',sans-serif", color: C.textPri, background: `linear-gradient(180deg, ${C.paper} 0%, ${C.ivory} 28%, ${C.ivory} 100%)` }}>
      <style>{RESPONSIVE_CSS}</style>

      <header
        style={{
          borderBottom: `1px solid ${C.border}`,
          background: "rgba(250,250,245,0.88)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <div className="ly-header-inner">
          <LykkjaLogo size={48} withWordmark />
          <div className="ly-badge" style={{ alignItems: "center", gap: 8 }}>
            <div className="ly-logo-badge">Nordisk editorial</div>
          </div>
        </div>
      </header>

      <main className="ly-main">
        <section className="ly-hero">
          <div className="ly-card" style={{ animation: "fi .35s ease" }}>
            <div className="ly-brandline">digital oppskriftstilpassing</div>
            <h1 className="ly-display">Tilpass strikkeoppskrifter med ro, presisjon og bedre flyt.</h1>
            <p className="ly-lead">
              Lykkja hjelper deg å trekke ut oppskrifter fra PDF, justere størrelse og arbeide videre i et rolig, skandinavisk grensesnitt som føles mer som en redaksjonell arbeidsflate enn en teknisk app.
            </p>
            <div className="ly-hero-meta">
              <div className="ly-hero-chip">PDF-uttrekk</div>
              <div className="ly-hero-chip">Størrelsestilpassing</div>
              <div className="ly-hero-chip">Norsk språk</div>
            </div>
          </div>

          <div className="ly-card-soft" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 280 }}>
            <LykkjaLogo size={120} withWordmark stacked />
          </div>
        </section>

        <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: `1px solid ${C.border}` }}>
          <button className="ly-tab-btn" onClick={() => setTab("input")} style={{ ...st.tabBase, ...(tab === "input" ? st.tabAct : {}) }}>
            Oppskrift
          </button>
          <button
            className="ly-tab-btn"
            onClick={() => setTab("result")}
            style={{
              ...st.tabBase,
              ...(tab === "result" ? st.tabAct : {}),
              opacity: res ? 1 : 0.35,
              pointerEvents: res ? "auto" : "none",
            }}
          >
            Resultat
          </button>
        </div>

        {tab === "input" && (
          <div style={{ animation: "fi .35s ease" }}>
            <div className="ly-card">
              <div className="ly-card-top">
                <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 500, margin: 0, color: C.textPri }}>
                  Din oppskrift
                </h2>

                <button
                  onClick={() => {
                    setPat(EX);
                    setSz("L");
                    setMode("text");
                    setPdfName("");
                    setPdfFileId("");
                  }}
                  style={st.exBtn}
                >
                  Se eksempel
                </button>
              </div>

              <div style={{ display: "flex", gap: 4, marginBottom: 16, background: C.paper, borderRadius: 12, padding: 4 }}>
                {[["text", "Lim inn tekst"], ["pdf", "Last opp PDF"]].map(([k, v]) => (
                  <button key={k} className="ly-mode-btn" onClick={() => setMode(k)} style={{ ...st.modeBase, ...(mode === k ? st.modeOn : {}) }}>
                    {v}
                  </button>
                ))}
              </div>

              {mode === "text" && (
                <textarea
                  value={pat}
                  onChange={(e) => setPat(e.target.value)}
                  placeholder="Lim inn strikkeoppskriften din her…"
                  style={st.ta}
                  rows={11}
                />
              )}

              {mode === "pdf" && (
                <>
                  <input ref={fRef} type="file" accept="application/pdf" style={{ display: "none" }} onChange={(e) => onFile(e.target.files?.[0])} />

                  {pdfLoad ? (
                    <div className="ly-pdf-loading" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: C.forest }}>
                      <Spin s={24} />
                      <p style={{ fontSize: 14, fontWeight: 500, margin: 0, animation: "pu 2s ease-in-out infinite" }}>{pMsgs[msg]}</p>
                      <p style={{ fontSize: 12, color: C.textTer, margin: 0, fontStyle: "italic" }}>{pdfName}</p>
                    </div>
                  ) : pat ? (
                    <div style={{ border: `1px solid rgba(45,107,79,0.14)`, borderRadius: 14, overflow: "hidden", background: C.forestLight }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: `1px solid rgba(45,107,79,0.1)`, gap: 12, flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={st.pdfCheck}>✓</div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: C.forest }}>Oppskrift hentet</p>
                            <p style={{ fontSize: 11, color: C.forestDeep, margin: "2px 0 0", wordBreak: "break-all", opacity: 0.8 }}>
                              {pdfName}{pdfFileId ? ` · ${pdfFileId}` : ""}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setPat("");
                            setPdfName("");
                            setPdfFileId("");
                          }}
                          style={st.pdfRm}
                        >
                          Fjern
                        </button>
                      </div>

                      <div style={{ padding: "12px 16px", maxHeight: 170, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
                        <pre
                          style={{
                            fontFamily: "'Cormorant Garamond',serif",
                            fontSize: 15,
                            lineHeight: 1.65,
                            color: C.textPri,
                            margin: 0,
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          {pat.slice(0, 450)}{pat.length > 450 ? "…" : ""}
                        </pre>
                      </div>

                      <button onClick={() => setMode("text")} style={st.pdfEdit}>
                        Rediger tekst →
                      </button>
                    </div>
                  ) : (
                    <div
                      className="ly-drop"
                      style={{ ...st.drop, ...(drag ? st.dropOn : {}) }}
                      onDrop={onDrop}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDrag(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setDrag(false);
                      }}
                      onClick={() => fRef.current?.click()}
                    >
                      <LykkjaLogo size={64} />
                      <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 500, color: C.textPri, margin: "8px 0 0" }}>
                        Legg inn PDF-oppskrift
                      </p>
                      <p style={{ fontSize: 14, color: C.textSec, margin: 0, fontWeight: 400 }}>
                        dra og slipp filen hit eller klikk for å velge
                      </p>
                      <span style={{ marginTop: 8, fontSize: 11, color: C.textTer, background: "#fff", borderRadius: 999, padding: "5px 10px", border: `1px solid ${C.border}` }}>
                        PDF · maks 20 MB
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="ly-settings">
              <div className="ly-card">
                <h3 style={st.setLabel}>Størrelse</h3>
                <div className="ly-sz-grid">
                  {sizes.map((v) => (
                    <button key={v} onClick={() => setSz(v)} style={{ ...st.szBtn, ...(sz === v ? st.szOn : {}) }}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="ly-card">
                <h3 style={st.setLabel}>
                  Strikkefasthet <span style={st.opt}>valgfritt</span>
                </h3>
                <input type="text" value={gauge} onChange={(e) => setGauge(e.target.value)} placeholder="F.eks: 19 m × 26 omg = 10×10 cm" style={st.inp} />
                <p style={st.hint}>Oppgi din fasthet hvis den avviker fra oppskriften. Da blir tilpasningen mer presis.</p>
              </div>
            </div>

            {err && <div style={st.errBox}>{err}</div>}

            <button className="ly-submit" onClick={adapt} disabled={load || pdfLoad} style={{ ...st.submit, ...(load || pdfLoad ? { opacity: 0.82, cursor: "wait" } : {}) }}>
              {load ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <Spin />
                  <span style={{ animation: "pu 2s ease-in-out infinite" }}>{msgs[msg]}</span>
                </span>
              ) : (
                "Tilpass oppskrift"
              )}
            </button>
          </div>
        )}

        {tab === "result" && res && (
          <div style={{ animation: "fi .35s ease" }}>
            <div style={{ background: "#fff", borderRadius: 18, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,.03)" }}>
              <div className="ly-result-head" style={{ borderBottom: `1px solid ${C.border}` }}>
                <div>
                  <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 30, fontWeight: 500, margin: 0, color: C.textPri }}>
                    Tilpasset oppskrift
                  </h2>
                  <p style={{ fontSize: 13, color: C.forest, margin: "4px 0 0", fontWeight: 600, letterSpacing: ".02em" }}>
                    Lykkja · størrelse {sz}{pdfName && <span style={{ opacity: 0.6 }}> · {pdfName}</span>}
                  </p>
                </div>

                <div className="ly-result-actions">
                  <button onClick={() => navigator.clipboard.writeText(res)} style={st.cpyBtn}>
                    Kopier
                  </button>
                  <button onClick={() => setTab("input")} style={st.backBtn}>
                    ← Tilbake
                  </button>
                </div>
              </div>

              <div className="ly-result-body" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, lineHeight: 1.85, color: C.textPri }}>
                {fmt(res)}
              </div>
            </div>

            <div className="ly-tip" style={{ background: C.forestLight, borderRadius: 14, border: `1px solid rgba(45,107,79,0.1)`, marginTop: 16, alignItems: "flex-start" }}>
              <LykkjaLogo size={26} />
              <p style={{ fontSize: 13, lineHeight: 1.65, color: C.charcoalSoft, margin: 0, fontWeight: 400 }}>
                <strong>Tips:</strong> Strikk alltid en prøvelapp før du starter. Juster pinnestørrelse for å oppnå riktig strikkefasthet før du begynner på det endelige plagget.
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="ly-footer" style={{ fontSize: 12, color: C.textTer, fontWeight: 400, letterSpacing: ".03em" }}>
        <LykkjaLogo size={20} />
        <span>Lykkja</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span>digital oppskriftstilpassing</span>
      </footer>
    </div>
  );
}

const st = {
  tabBase: {
    border: "none",
    borderBottom: "2px solid transparent",
    background: "none",
    fontFamily: "'Outfit',sans-serif",
    fontSize: 14,
    fontWeight: 500,
    color: C.textSec,
    cursor: "pointer",
    transition: "all .2s",
  },
  tabAct: {
    color: C.forest,
    borderBottomColor: C.forest,
  },

  exBtn: {
    background: "#fff",
    border: `1px solid ${C.borderStrong}`,
    borderRadius: 999,
    padding: "8px 14px",
    fontSize: 12,
    fontWeight: 500,
    color: C.textPri,
    cursor: "pointer",
    fontFamily: "'Outfit',sans-serif",
    minHeight: 36,
    whiteSpace: "nowrap",
  },

  modeBase: {
    flex: 1,
    border: "none",
    background: "transparent",
    borderRadius: 10,
    fontFamily: "'Outfit',sans-serif",
    fontWeight: 500,
    color: C.textSec,
    cursor: "pointer",
    transition: "all .2s",
  },
  modeOn: {
    background: "#fff",
    color: C.textPri,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },

  ta: {
    width: "100%",
    border: `1px solid ${C.border}`,
    borderRadius: 14,
    padding: "16px 18px",
    fontSize: 17,
    lineHeight: 1.78,
    fontFamily: "'Cormorant Garamond',serif",
    fontWeight: 400,
    color: C.textPri,
    background: "#fff",
    resize: "vertical",
    transition: "border-color .2s,box-shadow .2s",
    WebkitAppearance: "none",
  },

  inp: {
    width: "100%",
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    padding: "13px 14px",
    fontSize: 14,
    fontFamily: "'Outfit',sans-serif",
    color: C.textPri,
    background: "#fff",
    transition: "border-color .2s,box-shadow .2s",
    minHeight: 46,
    WebkitAppearance: "none",
  },

  drop: {
    border: `1.5px dashed rgba(45,107,79,0.22)`,
    borderRadius: 18,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
    transition: "all .25s",
    background: "linear-gradient(180deg, rgba(255,255,255,.9) 0%, rgba(232,240,235,.72) 100%)",
  },
  dropOn: {
    borderColor: C.forest,
    background: "linear-gradient(180deg, rgba(255,255,255,.96) 0%, rgba(232,240,235,.95) 100%)",
  },

  pdfCheck: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "rgba(45,107,79,0.12)",
    color: C.forest,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 700,
    flexShrink: 0,
  },

  pdfRm: {
    background: "rgba(180,60,40,0.05)",
    border: "1px solid rgba(180,60,40,0.12)",
    borderRadius: 999,
    padding: "7px 12px",
    fontSize: 12,
    color: "#8b3020",
    cursor: "pointer",
    fontFamily: "'Outfit',sans-serif",
    minHeight: 34,
    whiteSpace: "nowrap",
  },

  pdfEdit: {
    width: "100%",
    padding: "12px",
    border: "none",
    borderTop: `1px solid rgba(45,107,79,0.1)`,
    background: "transparent",
    color: C.forest,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'Outfit',sans-serif",
    minHeight: 44,
  },

  setLabel: {
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: 24,
    fontWeight: 500,
    margin: "0 0 12px",
    color: C.textPri,
  },

  opt: {
    fontFamily: "'Outfit',sans-serif",
    fontSize: 11,
    fontWeight: 500,
    color: C.textTer,
    marginLeft: 6,
    letterSpacing: ".04em",
    textTransform: "uppercase",
  },

  hint: {
    fontSize: 12,
    color: C.textSec,
    marginTop: 8,
    lineHeight: 1.6,
    fontWeight: 400,
  },

  szBtn: {
    padding: "11px 0",
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    background: "#fff",
    fontSize: 14,
    fontWeight: 500,
    color: C.charcoalSoft,
    cursor: "pointer",
    fontFamily: "'Outfit',sans-serif",
    transition: "all .15s",
    textAlign: "center",
    minHeight: 46,
  },
  szOn: {
    background: C.forest,
    color: "#fff",
    borderColor: C.forest,
  },

  errBox: {
    background: "rgba(180,60,40,0.04)",
    border: "1px solid rgba(180,60,40,0.12)",
    borderRadius: 12,
    padding: "13px 16px",
    color: "#7a2e1d",
    fontSize: 13,
    marginBottom: 14,
  },

  submit: {
    width: "100%",
    border: "none",
    borderRadius: 14,
    background: C.forest,
    color: "#fff",
    fontWeight: 600,
    fontFamily: "'Outfit',sans-serif",
    cursor: "pointer",
    transition: "all .2s",
    marginTop: 10,
    letterSpacing: ".01em",
    boxShadow: "0 10px 20px rgba(45,107,79,.14)",
  },

  cpyBtn: {
    padding: "10px 16px",
    border: `1px solid rgba(45,107,79,0.18)`,
    borderRadius: 999,
    background: C.forestLight,
    color: C.forest,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'Outfit',sans-serif",
    minHeight: 40,
  },

  backBtn: {
    padding: "10px 16px",
    border: `1px solid ${C.border}`,
    borderRadius: 999,
    background: "transparent",
    color: C.textSec,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'Outfit',sans-serif",
    minHeight: 40,
  },

  rH2: {
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: 28,
    fontWeight: 600,
    color: C.textPri,
    margin: "30px 0 10px",
    borderBottom: `1px solid ${C.border}`,
    paddingBottom: 8,
  },

  rH3: {
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: 23,
    fontWeight: 500,
    color: C.textPri,
    margin: "22px 0 8px",
  },

  rH4: {
    fontFamily: "'Outfit',sans-serif",
    fontSize: 14,
    fontWeight: 600,
    color: C.charcoalSoft,
    margin: "16px 0 6px",
  },

  rLi: {
    marginLeft: 16,
    marginBottom: 4,
    listStyleType: '"– "',
    paddingLeft: 4,
    fontSize: 17,
  },

  rP: {
    margin: "6px 0",
    fontSize: 17,
  },
};
