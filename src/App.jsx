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
  ivory: "#FAFAF5", sand: "#EDE9E1", sandDark: "#DDD7CC",
  forest: "#2D6B4F", forestLight: "#E8F0EB", forestMid: "#3D8B67",
  clay: "#C4957A", clayLight: "#F5EDE7",
  charcoal: "#2C2925", charcoalSoft: "#4A4640",
  textPri: "#2C2925", textSec: "#7A756C", textTer: "#A8A49C",
  border: "rgba(44,41,37,0.08)", borderHover: "rgba(44,41,37,0.15)",
};

function Spin({ s = 18 }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={{ animation: "sp .9s linear infinite" }}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="31.4 31.4" strokeDashoffset="10" />
  </svg>;
}

function Leaf({ s = 20, c = C.forest, style }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" style={style} fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round">
    <path d="M12 2C6.5 6 4 10 4 15c0 3 2 5 5 5 1.5 0 2.5-.5 3-1.5.5 1 1.5 1.5 3 1.5 3 0 5-2 5-5 0-5-2.5-9-8-13z" fill={c} opacity=".08" />
    <path d="M12 2C6.5 6 4 10 4 15c0 3 2 5 5 5 1.5 0 2.5-.5 3-1.5.5 1 1.5 1.5 3 1.5 3 0 5-2 5-5 0-5-2.5-9-8-13z" />
    <path d="M12 2v18" opacity=".5" />
  </svg>;
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
  const [drag, setDrag] = useState(false);
  const [mode, setMode] = useState("text");
  const fRef = useRef(null);

  const msgs = ["Teller masker…", "Beregner proporsjoner…", "Tilpasser oppskriften…", "Siste finpuss…"];
  const pMsgs = ["Leser PDF-en…", "Trekker ut oppskriften…", "Tolker instruksjoner…"];

  useEffect(() => {
    if (!load && !pdfLoad) return;
    const m = pdfLoad ? pMsgs : msgs;
    const i = setInterval(() => setMsg(p => (p + 1) % m.length), 2200);
    return () => clearInterval(i);
  }, [load, pdfLoad]);

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  async function extractPdf(b64) {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514", max_tokens: 4000,
        system: `Du er ekspert på å trekke ut strikkeoppskrifter fra PDF-er. Trekk ut den komplette oppskriften som ren tekst. Behold all info nøyaktig. Ikke endre noe. Svar KUN med oppskriften.`,
        messages: [{ role: "user", content: [
          { type: "document", source: { type: "base64", media_type: "application/pdf", data: b64 } },
          { type: "text", text: "Trekk ut strikkeoppskriften fra denne PDF-en som ren tekst." }
        ]}],
      }),
    });
    const d = await r.json();
    if (d.error) throw new Error(d.error.message);
    return d.content.filter(b => b.type === "text").map(b => b.text).join("\n");
  }

  async function onFile(f) {
    if (!f) return;
    if (f.type !== "application/pdf") { setErr("Last opp en PDF-fil."); return; }
    if (f.size > 30 * 1024 * 1024) { setErr("Maks 30 MB."); return; }
    setErr(""); setPdfLoad(true); setPdfName(f.name); setMsg(0);
    try {
      const b64 = await new Promise((ok, no) => {
        const r = new FileReader();
        r.onload = () => ok(r.result.split(",")[1]);
        r.onerror = () => no(new Error("Lesefeil"));
        r.readAsDataURL(f);
      });
      setPat(await extractPdf(b64));
      setMode("text");
    } catch (e) { setErr(e.message || "Kunne ikke lese PDF."); }
    finally { setPdfLoad(false); }
  }

  const onDrop = useCallback(e => { e.preventDefault(); setDrag(false); onFile(e.dataTransfer?.files?.[0]); }, []);

  async function adapt() {
    if (!pat.trim()) { setErr("Legg inn en oppskrift først."); return; }
    setErr(""); setLoad(true); setRes(""); setMsg(0);
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 4000,
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
          messages: [{ role: "user", content: `Tilpass til størrelse ${sz}:\n\n${pat}${gauge ? `\n\nMin strikkefasthet: ${gauge}` : ""}` }],
        }),
      });
      const d = await r.json();
      if (d.error) setErr(d.error.message);
      else { setRes(d.content.filter(b => b.type === "text").map(b => b.text).join("\n")); setTab("result"); }
    } catch { setErr("Tilkoblingsfeil. Prøv igjen."); }
    finally { setLoad(false); }
  }

  function fmt(t) {
    return t.split("\n").map((l, i) => {
      if (l.startsWith("# ")) return <h2 key={i} style={s.rH2}>{l.slice(2)}</h2>;
      if (l.startsWith("## ")) return <h3 key={i} style={s.rH3}>{l.slice(3)}</h3>;
      if (l.startsWith("### ")) return <h4 key={i} style={s.rH4}>{l.slice(4)}</h4>;
      if (l.startsWith("- ")) return <li key={i} style={s.rLi}>{l.slice(2)}</li>;
      if (l.trim() === "") return <br key={i} />;
      const ps = l.split(/(\*\*.*?\*\*)/g);
      return <p key={i} style={s.rP}>{ps.map((p, j) =>
        p.startsWith("**") && p.endsWith("**") ? <strong key={j} style={{ fontWeight: 500, color: C.textPri }}>{p.slice(2, -2)}</strong> : p
      )}</p>;
    });
  }

  return (
    <div style={s.wrap}>
      <style>{FONTS}{`
        @keyframes sp{to{transform:rotate(360deg)}}
        @keyframes fi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pu{0%,100%{opacity:.4}50%{opacity:1}}
        textarea:focus,input:focus{outline:none;border-color:${C.forest} !important;box-shadow:0 0 0 3px rgba(45,107,79,0.08) !important}
        ::selection{background:rgba(45,107,79,0.12)}
        textarea::placeholder,input::placeholder{color:${C.textTer}}
        *{box-sizing:border-box}body{margin:0}
        input[type=range]{accent-color:${C.forest}}
      `}</style>

      {/* Header */}
      <header style={s.header}>
        <div style={s.headerIn}>
          <div style={s.logoWrap}>
            <Leaf s={22} />
            <div>
              <h1 style={s.logo}>maskeberegner</h1>
              <p style={s.logSub}>tilpass oppskrifter til din størrelse</p>
            </div>
          </div>
          <div style={s.headerBadge}>
            <Leaf s={14} c={C.textTer} />
            <span style={{ fontSize: 11, color: C.textTer, fontFamily: "'Outfit',sans-serif", letterSpacing: ".04em" }}>AI-drevet</span>
          </div>
        </div>
      </header>

      <main style={s.main}>
        {/* Tabs */}
        <div style={s.tabs}>
          <button onClick={() => setTab("input")} style={{ ...s.tabBtn, ...(tab === "input" ? s.tabAct : {}) }}>Oppskrift</button>
          <button onClick={() => setTab("result")} style={{ ...s.tabBtn, ...(tab === "result" ? s.tabAct : {}), opacity: res ? 1 : .35, pointerEvents: res ? "auto" : "none" }}>Resultat</button>
        </div>

        {tab === "input" && (
          <div style={{ animation: "fi .3s ease" }}>
            {/* Card: input */}
            <div style={s.card}>
              <div style={s.cardTop}>
                <h2 style={s.cardTi}>Din oppskrift</h2>
                <button onClick={() => { setPat(EX); setSz("L"); setMode("text"); setPdfName(""); }} style={s.exBtn}>Se eksempel</button>
              </div>

              {/* Mode switch */}
              <div style={s.modeRow}>
                {[["text", "Lim inn tekst"], ["pdf", "Last opp PDF"]].map(([k, v]) => (
                  <button key={k} onClick={() => setMode(k)} style={{ ...s.modeBtn, ...(mode === k ? s.modeBtnOn : {}) }}>{v}</button>
                ))}
              </div>

              {mode === "text" && (
                <textarea value={pat} onChange={e => setPat(e.target.value)}
                  placeholder="Lim inn strikkeoppskriften din her…" style={s.ta} rows={10} />
              )}

              {mode === "pdf" && (
                <>
                  <input ref={fRef} type="file" accept="application/pdf" style={{ display: "none" }} onChange={e => onFile(e.target.files?.[0])} />
                  {pdfLoad ? (
                    <div style={s.pdfLoading}>
                      <Spin s={24} />
                      <p style={s.pdfLoadTi}>{pMsgs[msg]}</p>
                      <p style={s.pdfLoadFile}>{pdfName}</p>
                    </div>
                  ) : pat ? (
                    <div style={s.pdfDone}>
                      <div style={s.pdfDoneTop}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={s.pdfCheck}>✓</div>
                          <div>
                            <p style={s.pdfDoneTi}>Oppskrift hentet</p>
                            <p style={s.pdfDoneFile}>{pdfName}</p>
                          </div>
                        </div>
                        <button onClick={() => { setPat(""); setPdfName(""); }} style={s.pdfRm}>Fjern</button>
                      </div>
                      <div style={s.pdfPrev}><pre style={s.pdfPrevTxt}>{pat.slice(0, 400)}{pat.length > 400 ? "…" : ""}</pre></div>
                      <button onClick={() => setMode("text")} style={s.pdfEdit}>Rediger tekst →</button>
                    </div>
                  ) : (
                    <div style={{ ...s.drop, ...(drag ? s.dropOn : {}) }}
                      onDrop={onDrop} onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={e => { e.preventDefault(); setDrag(false); }}
                      onClick={() => fRef.current?.click()}>
                      <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
                        <path d="M8 7a3 3 0 013-3h18l11 11v29a3 3 0 01-3 3H11a3 3 0 01-3-3V7z" fill={C.forestLight} stroke={C.forest} strokeWidth="1.2" />
                        <path d="M29 4v7a3 3 0 003 3h8" fill="none" stroke={C.forest} strokeWidth="1.2" />
                        <text x="24" y="32" textAnchor="middle" fontSize="9" fontWeight="600" fill={C.forest} fontFamily="Outfit,sans-serif">PDF</text>
                      </svg>
                      <p style={s.dropTi}>Dra og slipp PDF-en hit</p>
                      <p style={s.dropSub}>eller klikk for å velge fil</p>
                      <span style={s.dropBadge}>PDF · maks 30 MB</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Settings */}
            <div style={s.setRow}>
              <div style={{ ...s.card, flex: 1, minWidth: 200 }}>
                <h3 style={s.setLabel}>Størrelse</h3>
                <div style={s.szGrid}>
                  {sizes.map(v => (
                    <button key={v} onClick={() => setSz(v)} style={{ ...s.szBtn, ...(sz === v ? s.szOn : {}) }}>{v}</button>
                  ))}
                </div>
              </div>
              <div style={{ ...s.card, flex: 1, minWidth: 200 }}>
                <h3 style={s.setLabel}>Strikkefasthet <span style={s.opt}>valgfritt</span></h3>
                <input type="text" value={gauge} onChange={e => setGauge(e.target.value)}
                  placeholder="F.eks: 19 m × 26 omg = 10×10 cm" style={s.inp} />
                <p style={s.hint}>Oppgi din fasthet om den avviker fra oppskriften.</p>
              </div>
            </div>

            {err && <div style={s.errBox}>{err}</div>}

            <button onClick={adapt} disabled={load || pdfLoad} style={{ ...s.submit, ...(load || pdfLoad ? { opacity: .8, cursor: "wait" } : {}) }}>
              {load ? <span style={s.loadIn}><Spin /><span style={{ animation: "pu 2s ease-in-out infinite" }}>{msgs[msg]}</span></span>
                : "Tilpass oppskrift"}
            </button>
          </div>
        )}

        {tab === "result" && res && (
          <div style={{ animation: "fi .4s ease" }}>
            <div style={s.resCard}>
              <div style={s.resHead}>
                <div>
                  <h2 style={s.resTi}>Tilpasset oppskrift</h2>
                  <p style={s.resSub}>Størrelse {sz}{pdfName && <span style={{ opacity: .5 }}> · {pdfName}</span>}</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => navigator.clipboard.writeText(res)} style={s.cpyBtn}>Kopier</button>
                  <button onClick={() => setTab("input")} style={s.backBtn}>← Tilbake</button>
                </div>
              </div>
              <div style={s.resBody}>{fmt(res)}</div>
            </div>
            <div style={s.tip}>
              <Leaf s={18} c={C.forest} style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={s.tipTxt}><strong>Tips:</strong> Strikk alltid en prøvelapp før du starter. Juster pinnestørrelse for å oppnå riktig strikkefasthet.</p>
            </div>
          </div>
        )}
      </main>

      <footer style={s.footer}>
        <Leaf s={14} c={C.textTer} />
        <span>maskeberegner</span>
        <span style={{ opacity: .4 }}>·</span>
        <span>AI-drevet strikkeassistent</span>
      </footer>
    </div>
  );
}

const s = {
  wrap: {
    minHeight: "100vh", fontFamily: "'Outfit',sans-serif", color: C.textPri,
    background: C.ivory, position: "relative",
  },

  // Header
  header: { borderBottom: `1px solid ${C.border}`, background: "rgba(250,250,245,0.9)", backdropFilter: "blur(16px)", position: "sticky", top: 0, zIndex: 10 },
  headerIn: { maxWidth: 720, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logoWrap: { display: "flex", alignItems: "center", gap: 12 },
  logo: { fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 500, margin: 0, color: C.textPri, letterSpacing: "-0.02em" },
  logSub: { fontSize: 12, color: C.textSec, margin: 0, letterSpacing: ".02em", fontWeight: 300 },
  headerBadge: { display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 20, background: C.forestLight },

  // Main
  main: { maxWidth: 720, margin: "0 auto", padding: "28px 24px 48px" },

  // Tabs
  tabs: { display: "flex", gap: 0, marginBottom: 28, borderBottom: `1px solid ${C.border}` },
  tabBtn: {
    padding: "10px 20px", border: "none", borderBottom: "2px solid transparent", background: "none",
    fontFamily: "'Outfit',sans-serif", fontSize: 14, fontWeight: 400, color: C.textSec,
    cursor: "pointer", transition: "all .2s",
  },
  tabAct: { color: C.forest, borderBottomColor: C.forest, fontWeight: 500 },

  // Card
  card: {
    background: "#fff", borderRadius: 14, padding: "22px 24px",
    border: `1px solid ${C.border}`, marginBottom: 16,
  },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  cardTi: { fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 500, margin: 0, color: C.textPri },
  exBtn: {
    background: C.forestLight, border: `1px solid rgba(45,107,79,0.15)`, borderRadius: 8,
    padding: "6px 14px", fontSize: 12, fontWeight: 500, color: C.forest, cursor: "pointer", fontFamily: "'Outfit',sans-serif",
  },

  // Mode
  modeRow: { display: "flex", gap: 4, marginBottom: 16, background: C.sand, borderRadius: 10, padding: 3 },
  modeBtn: {
    flex: 1, padding: "8px 14px", border: "none", background: "transparent", borderRadius: 8,
    fontFamily: "'Outfit',sans-serif", fontSize: 13, fontWeight: 400, color: C.textSec,
    cursor: "pointer", transition: "all .2s",
  },
  modeBtnOn: { background: "#fff", color: C.textPri, fontWeight: 500, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },

  // Textarea
  ta: {
    width: "100%", border: `1px solid ${C.border}`, borderRadius: 10,
    padding: "14px 16px", fontSize: 14, lineHeight: 1.75,
    fontFamily: "'Cormorant Garamond',serif", fontWeight: 400, color: C.textPri,
    background: C.ivory, resize: "vertical", transition: "border-color .2s,box-shadow .2s",
  },
  inp: {
    width: "100%", border: `1px solid ${C.border}`, borderRadius: 10,
    padding: "11px 14px", fontSize: 13, fontFamily: "'Outfit',sans-serif",
    color: C.textPri, background: C.ivory, transition: "border-color .2s,box-shadow .2s",
  },

  // Drop zone
  drop: {
    border: `2px dashed rgba(45,107,79,0.2)`, borderRadius: 14, padding: "44px 24px",
    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
    cursor: "pointer", transition: "all .25s", background: "rgba(45,107,79,0.02)",
  },
  dropOn: { borderColor: C.forest, background: "rgba(45,107,79,0.05)" },
  dropTi: { fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 500, color: C.textPri, margin: "10px 0 0" },
  dropSub: { fontSize: 13, color: C.textSec, margin: 0, fontWeight: 300 },
  dropBadge: { marginTop: 8, fontSize: 11, color: C.textTer, background: C.sand, borderRadius: 6, padding: "3px 10px" },

  // PDF states
  pdfLoading: { padding: "44px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: C.forest },
  pdfLoadTi: { fontSize: 14, fontWeight: 400, margin: 0, animation: "pu 2s ease-in-out infinite" },
  pdfLoadFile: { fontSize: 12, color: C.textTer, margin: 0, fontStyle: "italic" },
  pdfDone: { border: `1px solid rgba(45,107,79,0.15)`, borderRadius: 12, overflow: "hidden", background: C.forestLight },
  pdfDoneTop: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: `1px solid rgba(45,107,79,0.1)` },
  pdfCheck: { width: 26, height: 26, borderRadius: "50%", background: "rgba(45,107,79,0.12)", color: C.forest, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600 },
  pdfDoneTi: { fontSize: 13, fontWeight: 500, margin: 0, color: C.forest },
  pdfDoneFile: { fontSize: 11, color: C.forestMid, margin: "1px 0 0" },
  pdfRm: { background: "rgba(180,60,40,0.06)", border: "1px solid rgba(180,60,40,0.12)", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "#8b3020", cursor: "pointer", fontFamily: "'Outfit',sans-serif" },
  pdfPrev: { padding: "10px 16px", maxHeight: 160, overflowY: "auto" },
  pdfPrevTxt: { fontFamily: "'Cormorant Garamond',serif", fontSize: 13, lineHeight: 1.6, color: C.textPri, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" },
  pdfEdit: { width: "100%", padding: "9px", border: "none", borderTop: `1px solid rgba(45,107,79,0.1)`, background: "transparent", color: C.forest, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "'Outfit',sans-serif" },

  // Settings
  setRow: { display: "flex", gap: 16, flexWrap: "wrap" },
  setLabel: { fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontWeight: 500, margin: "0 0 12px", color: C.textPri },
  opt: { fontFamily: "'Outfit',sans-serif", fontSize: 11, fontWeight: 300, color: C.textTer, marginLeft: 6 },
  hint: { fontSize: 12, color: C.textTer, marginTop: 8, lineHeight: 1.5, fontWeight: 300 },
  szGrid: { display: "flex", flexWrap: "wrap", gap: 8 },
  szBtn: {
    padding: "9px 18px", border: `1px solid ${C.border}`, borderRadius: 8,
    background: C.ivory, fontSize: 13, fontWeight: 400, color: C.charcoalSoft,
    cursor: "pointer", fontFamily: "'Outfit',sans-serif", transition: "all .15s", minWidth: 50, textAlign: "center",
  },
  szOn: { background: C.forest, color: "#fff", borderColor: C.forest },

  // Error
  errBox: { background: "rgba(180,60,40,0.04)", border: "1px solid rgba(180,60,40,0.12)", borderRadius: 10, padding: "11px 16px", color: "#7a2e1d", fontSize: 13, marginBottom: 14 },

  // Submit
  submit: {
    width: "100%", padding: "15px", border: "none", borderRadius: 12,
    background: C.forest, color: "#fff", fontSize: 15, fontWeight: 500,
    fontFamily: "'Outfit',sans-serif", cursor: "pointer", transition: "all .2s",
    marginTop: 8, letterSpacing: ".01em",
  },
  loadIn: { display: "flex", alignItems: "center", justifyContent: "center", gap: 10 },

  // Result
  resCard: { background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden" },
  resHead: {
    padding: "20px 24px", borderBottom: `1px solid ${C.border}`,
    display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12,
  },
  resTi: { fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 500, margin: 0 },
  resSub: { fontSize: 13, color: C.forest, margin: "2px 0 0", fontWeight: 500 },
  cpyBtn: { padding: "7px 16px", border: `1px solid rgba(45,107,79,0.2)`, borderRadius: 8, background: C.forestLight, color: C.forest, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "'Outfit',sans-serif" },
  backBtn: { padding: "7px 16px", border: `1px solid ${C.border}`, borderRadius: 8, background: "transparent", color: C.textSec, fontSize: 12, fontWeight: 400, cursor: "pointer", fontFamily: "'Outfit',sans-serif" },
  resBody: { padding: "24px", fontFamily: "'Cormorant Garamond',serif", fontSize: 16, lineHeight: 1.85, color: C.textPri },
  rH2: { fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 600, color: C.textPri, margin: "28px 0 10px", borderBottom: `1px solid ${C.border}`, paddingBottom: 8 },
  rH3: { fontFamily: "'Cormorant Garamond',serif", fontSize: 19, fontWeight: 500, color: C.textPri, margin: "22px 0 8px" },
  rH4: { fontFamily: "'Outfit',sans-serif", fontSize: 14, fontWeight: 500, color: C.charcoalSoft, margin: "16px 0 6px" },
  rLi: { marginLeft: 16, marginBottom: 4, listStyleType: '"– "', paddingLeft: 4, fontSize: 15 },
  rP: { margin: "5px 0", fontSize: 15 },

  // Tip
  tip: { display: "flex", gap: 12, alignItems: "flex-start", padding: "14px 18px", background: C.forestLight, borderRadius: 12, border: `1px solid rgba(45,107,79,0.1)`, marginTop: 16 },
  tipTxt: { fontSize: 13, lineHeight: 1.6, color: C.charcoalSoft, margin: 0, fontWeight: 300 },

  // Footer
  footer: {
    borderTop: `1px solid ${C.border}`, padding: "18px 24px", textAlign: "center",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    fontSize: 12, color: C.textTer, fontWeight: 300, letterSpacing: ".02em",
  },
};
