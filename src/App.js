import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://kgiqpwfsraydqkvihisk.supabase.co",
  "sb_publishable_wH_ZY1su2l1ZBi_9BDeLnA_idudRa6W"
);

const ANTHROPIC_KEY = process.env.REACT_APP_ANTHROPIC_KEY;
const link = document.createElement("link");
link.rel = "stylesheet";
link.href = "https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,400;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@300;400;500&family=Instrument+Sans:wght@400;500;600&display=swap";
document.head.appendChild(link);

const COUNTRIES = {
  DK:{ flag:"🇩🇰", currency:"DKK", locale:"da-DK", label:"Danmark", travelKost:625, travelLogi:268, travelCap:34400, km1:3.94, kmTh:20000, km2:2.28 },
  EE:{ flag:"🇪🇪", currency:"EUR", locale:"et-EE", label:"Estland", perDiem:50, km1:0.30 },
  CL:{ flag:"🇨🇱", currency:"CLP", locale:"es-CL", label:"Chile" },
  PT:{ flag:"🇵🇹", currency:"EUR", locale:"pt-PT", label:"Portugal", km1:0.40 },
  ES:{ flag:"🇪🇸", currency:"EUR", locale:"es-ES", label:"Spanien", km1:0.26 },
  US:{ flag:"🇺🇸", currency:"USD", locale:"en-US", label:"USA" },
};

const CATS = [
  { id:"transport",       label:"Transport",       icon:"↗" },
  { id:"overnatning",     label:"Overnatning",     icon:"◻" },
  { id:"fortaering",      label:"Fortæring",       icon:"○" },
  { id:"repraesentation", label:"Repræsentation",  icon:"◇" },
  { id:"markedsfoering",  label:"Markedsføring",   icon:"◈" },
  { id:"kontorIT",        label:"Kontor & IT",     icon:"⊞" },
  { id:"telefon",         label:"Telefon",         icon:"⌇" },
  { id:"konsulent",       label:"Konsulent",       icon:"⊡" },
  { id:"software",        label:"Software / SaaS", icon:"⟳" },
  { id:"andet",           label:"Andet",           icon:"·" },
  { id:"musik_udstyr",    label:"Instrumenter & Udstyr", icon:"🎸" },
  { id:"musik_studie",    label:"Studie & Optagelse",    icon:"🎙" },
  { id:"musik_software",  label:"Musik Software",        icon:"🎛" },
  { id:"musik_promo",     label:"Promo & Marketing",     icon:"📢" },
  { id:"musik_koncert",   label:"Koncertudgifter",       icon:"🎤" },
  { id:"musik_undervis",  label:"Undervisning & Kurser", icon:"🎓" },
  { id:"musik_distribution", label:"Distribution & Streaming", icon:"🎵" },
];

const DOC_CATS = [
  { id:"bilag",        label:"Bilag & Kvitteringer", icon:"🧾" },
  { id:"fakturaer",    label:"Fakturaer",             icon:"📄" },
  { id:"kontrakter",   label:"Kontrakter",            icon:"📋" },
  { id:"loen",         label:"Løn & HR",              icon:"👥" },
  { id:"bank",         label:"Bankkontoudtog",        icon:"🏦" },
  { id:"moms",         label:"Momsafregning",         icon:"📊" },
  { id:"aarsregnskab", label:"Årsregnskab",           icon:"📁" },
  { id:"andet",        label:"Andet",                 icon:"📎" },
];

const DEFAULT_FX = { EUR:7.46, CLP:0.0077, USD:6.89, GBP:8.72 };

const today = () => new Date().toISOString().slice(0,10);

function fmt(n, currency, locale) {
  if(!currency) currency = "EUR";
  if(!locale) locale = "da-DK";
  try {
    if(currency==="CLP") return new Intl.NumberFormat(locale,{style:"currency",currency:"CLP",maximumFractionDigits:0}).format(n);
    return new Intl.NumberFormat(locale,{style:"currency",currency,minimumFractionDigits:0,maximumFractionDigits:2}).format(n);
  } catch(e) { return n + " " + currency; }
}

function toDKK(a, cur, fx) {
  if(cur === "DKK") return a;
  return a * (fx[cur] || 1);
}

function calcDed(a, cat, country) {
  if((cat === "repraesentation" || cat === "fortaering") && country === "DK") return a * 0.25;
  return a;
}

async function callClaude(prompt, maxTokens) {
  if(!maxTokens) maxTokens = 2000;
  var res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-opus-4-5",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }]
    })
  });
  var data = await res.json();
  if(data.error) throw new Error(data.error.message);
  return data.content[0].text;
}

const bg = "#f4f1ec";
const surface = "#faf8f5";
const ink = "#1c1a17";
const ink2 = "#4a4740";
const ink3 = "#9a9590";
const border = "#e0dbd3";
const gold = "#9a7c4f";
const sideInk = "#141210";
const ff = {
  display: "'Cormorant', Georgia, serif",
  ui: "'Instrument Sans', system-ui, sans-serif",
  mono: "'IBM Plex Mono', monospace",
};

const G = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html,body,#root{height:100%}
  body{background:${bg};color:${ink};font-family:${ff.ui};font-size:15px;-webkit-font-smoothing:antialiased}
  ::-webkit-scrollbar{width:3px;height:3px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:${border};border-radius:99px}
  input,select,textarea{font-family:${ff.ui};color:${ink};background:${surface};border:1px solid ${border};border-radius:9px;padding:10px 13px;font-size:14px;outline:none;transition:border-color .15s;width:100%}
  input:focus,select:focus,textarea:focus{border-color:${gold}}
  select option{background:${surface};color:${ink}}
  input[type=date]::-webkit-calendar-picker-indicator{opacity:.4;cursor:pointer}
  @keyframes fadeUp{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
  @keyframes sheetUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
  @keyframes toastUp{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  .fe{animation:fadeUp .2s ease both}
  .hrow:hover{background:rgba(28,26,23,.025)}
  .sheet-overlay{position:fixed;inset:0;background:rgba(28,26,23,.5);z-index:9000;display:flex;align-items:flex-start;justify-content:center;padding:40px 20px;overflow-y:auto;}
  .sheet-box{background:${surface};border-radius:20px;width:min(460px,95vw);flex-shrink:0;display:flex;flex-direction:column;margin:auto;}
  .sheet-head{padding:22px 24px 16px;flex-shrink:0;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center;}
  .sheet-body{padding:20px 24px 28px;}
  @media(max-width:767px){.desktop-only{display:none!important}}
  @media(min-width:768px){.mobile-only{display:none!important}}
  @media(max-width:600px){
    .sheet-overlay{align-items:flex-end;padding:0;overflow-y:hidden;}
    .sheet-box{border-radius:20px 20px 0 0;width:100%;max-height:90dvh;overflow-y:auto;}
  }
`;

function Mono(props) {
  return <span style={{ fontFamily: ff.mono, fontSize: props.size || 13, color: props.color || ink, fontWeight: 300 }}>{props.children}</span>;
}

function Lbl(props) {
  return <span style={{ fontFamily: ff.ui, fontSize: 11, fontWeight: 600, color: ink3, textTransform: "uppercase", letterSpacing: "0.09em", display: "block", marginBottom: 5 }}>{props.children}</span>;
}

function Field(props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", ...props.style }}>
      <Lbl>{props.label}</Lbl>
      {props.children}
    </div>
  );
}

function Btn(props) {
  var variant = props.variant || "primary";
  var size = props.size || "md";
  var base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
    fontFamily: ff.ui, fontWeight: 600, cursor: props.disabled ? "not-allowed" : "pointer",
    border: "none", borderRadius: 9, transition: "all .13s", opacity: props.disabled ? .5 : 1,
    width: props.full ? "100%" : undefined,
    fontSize: size === "sm" ? 12 : 14,
    padding: size === "sm" ? "7px 14px" : "10px 20px",
    ...props.style
  };
  var variants = {
    primary: { background: ink, color: "#fff" },
    outline: { background: "transparent", color: ink, border: "1px solid " + border },
    danger: { background: "#dc2626", color: "#fff" },
  };
  return <button onClick={props.onClick} disabled={props.disabled} style={{ ...base, ...variants[variant] }}>{props.children}</button>;
}

function Avatar(props) {
  var co = props.co;
  var size = props.size || 36;
  return (
    <div style={{ width: size, height: size, borderRadius: Math.round(size * 0.28), background: "hsl(" + co.hue + ",28%,88%)", color: "hsl(" + co.hue + ",42%,32%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ff.ui, fontWeight: 700, fontSize: Math.round(size * .33), flexShrink: 0, border: "1px solid hsl(" + co.hue + ",22%,80%)" }}>
      {co.initials}
    </div>
  );
}

function StatCard(props) {
  return (
    <div className="fe" style={{ animationDelay: (props.i || 0) * 55 + "ms", background: surface, border: "1px solid " + border, borderRadius: 16, padding: "17px 19px" }}>
      <Lbl>{props.label}</Lbl>
      <div style={{ fontFamily: ff.mono, fontSize: 20, color: props.accent || ink, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1, marginTop: 2 }}>{props.value}</div>
      {props.sub && <div style={{ fontFamily: ff.mono, fontSize: 11, color: ink3, marginTop: 5 }}>{props.sub}</div>}
    </div>
  );
}

function SH(props) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
      <h1 style={{ fontFamily: ff.display, fontWeight: 700, fontSize: "clamp(20px,4vw,26px)", color: ink, letterSpacing: "-0.01em", lineHeight: 1 }}>{props.children}</h1>
      {props.action}
    </div>
  );
}

function Spinner() {
  return <div style={{ width: 18, height: 18, border: "2px solid " + border, borderTopColor: ink, borderRadius: 99, animation: "spin .7s linear infinite", display: "inline-block" }} />;
}

function Sheet(props) {
  return ReactDOM.createPortal(
    <div className="sheet-overlay" onClick={function(e) { if(e.target === e.currentTarget) props.onClose(); }}>
      <div className="sheet-box">
        <div className="sheet-head">
          <span style={{ fontFamily: ff.display, fontWeight: 700, fontSize: 20, color: ink }}>{props.title}</span>
          <button onClick={props.onClose} style={{ background: "none", border: "1px solid " + border, color: ink3, width: 30, height: 30, borderRadius: 8, cursor: "pointer", fontSize: 13 }}>✕</button>
        </div>
        <div className="sheet-body">{props.children}</div>
      </div>
    </div>,
    document.body
  );
}

function Toast(props) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(function() {
    var t = setTimeout(props.onDone, 2800);
    return function() { clearTimeout(t); };
  }, []);
  return (
    <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", background: ink, color: "#fff", padding: "10px 22px", borderRadius: 99, fontFamily: ff.ui, fontWeight: 600, fontSize: 13, boxShadow: "0 8px 28px rgba(0,0,0,.18)", zIndex: 9999, whiteSpace: "nowrap", animation: "toastUp .22s ease" }}>
      {props.msg}
    </div>
  );
}

function Confirm(props) {
  return (
    <div onClick={props.onNo} style={{ position: "fixed", inset: 0, background: "rgba(28,26,23,.5)", zIndex: 700, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
      <div style={{ background: surface, borderRadius: 16, padding: 28, width: "min(360px,95vw)" }}>
        <div style={{ fontFamily: ff.display, fontSize: 18, fontWeight: 700, color: ink, marginBottom: 10 }}>Er du sikker?</div>
        <div style={{ fontFamily: ff.ui, fontSize: 14, color: ink2, marginBottom: 22 }}>{props.msg}</div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn full variant="danger" onClick={props.onYes}>Ja, slet</Btn>
          <Btn full variant="outline" onClick={props.onNo}>Annuller</Btn>
        </div>
      </div>
    </div>
  );
}

function ReceiptUpload(props) {
  var [uploading, setUploading] = useState(false);
  var [url, setUrl] = useState(props.existingUrl || null);
  var upload = async function(e) {
    var file = e.target.files[0];
    if(!file) return;
    setUploading(true);
    var path = props.expenseId + "/" + Date.now() + "_" + file.name;
    var result = await supabase.storage.from("receipts").upload(path, file, { upsert: true });
    if(result.error) { alert("Upload fejlede: " + result.error.message); setUploading(false); return; }
    var urlData = supabase.storage.from("receipts").getPublicUrl(path);
    setUrl(urlData.data.publicUrl);
    props.onUploaded(urlData.data.publicUrl);
    setUploading(false);
  };
  return (
    <div>
      <Lbl>Kvittering</Lbl>
      {url ? (
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <a href={url} target="_blank" rel="noreferrer" style={{ fontFamily: ff.ui, fontSize: 13, color: gold, textDecoration: "underline" }}>Se kvittering ↗</a>
          <button onClick={function() { setUrl(null); props.onUploaded(null); }} style={{ background: "none", border: "1px solid " + border, color: ink3, borderRadius: 6, padding: "3px 9px", cursor: "pointer", fontSize: 11 }}>Fjern</button>
        </div>
      ) : (
        <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", border: "1px dashed " + border, borderRadius: 9, cursor: "pointer", fontFamily: ff.ui, fontSize: 13, color: uploading ? ink : ink3 }}>
          {uploading ? <><Spinner /> Uploader…</> : <>📎 Klik for at uploade kvittering</>}
          <input type="file" accept="image/*,application/pdf" onChange={upload} style={{ display: "none" }} />
        </label>
      )}
    </div>
  );
}

function Dashboard(props) {
  var companies = props.companies;
  var expenses = props.expenses;
  var travels = props.travels;
  // eslint-disable-next-line no-unused-vars
  var kmEntries = props.kmEntries;
  var fx = props.fx;

  var gExp = companies.reduce(function(s, co) {
    var cur = (COUNTRIES[co.country] || {}).currency || "EUR";
    return s + expenses.filter(function(e) { return e.company_id === co.id; }).reduce(function(ss, e) { return ss + toDKK(Number(e.amount || 0), e.currency || cur, fx); }, 0);
  }, 0);
  var gDed = companies.reduce(function(s, co) {
    var cur = (COUNTRIES[co.country] || {}).currency || "EUR";
    return s + expenses.filter(function(e) { return e.company_id === co.id; }).reduce(function(ss, e) { return ss + toDKK(calcDed(Number(e.amount || 0), e.category, co.country), e.currency || cur, fx); }, 0);
  }, 0);
  var gTrv = travels.reduce(function(s, t) { return s + Number(t.total || 0); }, 0);

  var recent = expenses.slice().sort(function(a, b) { return (b.date || "").localeCompare(a.date || ""); }).slice(0, 7).map(function(e) {
    var co = companies.find(function(c) { return c.id === e.company_id; }) || {};
    return Object.assign({}, e, { coName: co.name || "", coHue: co.hue || 194, coCur: (COUNTRIES[co.country] || {}).currency || "EUR" });
  });

  return (
    <div className="fe">
      <SH>Portfolio</SH>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(165px,1fr))", gap: 10, marginBottom: 22 }}>
        <StatCard i={0} label="Samlede udgifter" value={fmt(gExp, "DKK")} />
        <StatCard i={1} label="Fradragsberettiget" value={fmt(gDed, "DKK")} accent={gold} />
        <StatCard i={2} label="Est. skattebesparelse" value={fmt(gDed * .22, "DKK")} />
        <StatCard i={3} label="Rejsefradrag" value={fmt(gTrv, "DKK")} />
      </div>
      <Lbl>Selskaber</Lbl>
      <div style={{ background: surface, border: "1px solid " + border, borderRadius: 16, overflow: "hidden", marginBottom: 22, marginTop: 6 }}>
        {companies.map(function(co, i) {
          var cur = (COUNTRIES[co.country] || {}).currency || "EUR";
          var coExp = expenses.filter(function(e) { return e.company_id === co.id; });
          var exp = coExp.reduce(function(s, e) { return s + toDKK(Number(e.amount || 0), e.currency || cur, fx); }, 0);
          var ded = coExp.reduce(function(s, e) { return s + toDKK(calcDed(Number(e.amount || 0), e.category, co.country), e.currency || cur, fx); }, 0);
          return (
            <div key={co.id} className="hrow" style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 18px", borderTop: i > 0 ? "1px solid " + border : "none" }}>
              <Avatar co={co} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: ff.ui, fontWeight: 600, fontSize: 14, color: ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{co.name}</div>
                <div style={{ fontFamily: ff.ui, fontSize: 11, color: ink3, marginTop: 1 }}>{(COUNTRIES[co.country] || {}).flag} {co.type} · {coExp.length} poster</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <Mono size={14}>{fmt(exp, "DKK")}</Mono>
                <div style={{ fontFamily: ff.mono, fontSize: 11, color: gold, marginTop: 2 }}>frad. {fmt(ded, "DKK")}</div>
              </div>
            </div>
          );
        })}
      </div>
      <Lbl>Seneste aktivitet</Lbl>
      <div style={{ background: surface, border: "1px solid " + border, borderRadius: 16, overflow: "hidden", marginTop: 6 }}>
        {recent.length === 0
          ? <div style={{ padding: 32, textAlign: "center", fontFamily: ff.mono, fontSize: 13, color: ink3 }}>Ingen udgifter endnu</div>
          : recent.map(function(e, i) {
            return (
              <div key={e.id} className="hrow" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderTop: i > 0 ? "1px solid " + border : "none" }}>
                <div style={{ width: 6, height: 6, borderRadius: 99, background: "hsl(" + e.coHue + ",48%,58%)", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: ff.ui, fontSize: 13, color: ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.description}</div>
                  <div style={{ fontFamily: ff.ui, fontSize: 11, color: ink3, marginTop: 1 }}>{e.coName} · {e.date}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  {e.receipt_url && <a href={e.receipt_url} target="_blank" rel="noreferrer" style={{ fontSize: 14, textDecoration: "none" }}>📎</a>}
                  <Mono size={13}>{fmt(Number(e.amount || 0), e.coCur)}</Mono>
                </div>
              </div>
            );
          })
        }
      </div>
    </div>
  );
}

function Expenses(props) {
  var co = props.co;
  var expenses = props.expenses;
  var fx = props.fx;
  var onAdd = props.onAdd;
  var onDelete = props.onDelete;
  var toast = props.toast;

  var [modal, setModal] = useState(false);
  var [search, setSearch] = useState("");
  var [fcat, setFcat] = useState("");
  var [saving, setSaving] = useState(false);
  var [confirm, setConfirm] = useState(null);
  var [pendingReceipt, setPendingReceipt] = useState(null);

  var cur = (COUNTRIES[co.country] || {}).currency || "EUR";
  var locale = (COUNTRIES[co.country] || {}).locale || "da-DK";
  var ef = { date: today(), description: "", amount: "", category: "andet", currency: cur };
  var [form, setForm] = useState(ef);

  var rows = expenses.filter(function(e) {
    return (!search || (e.description || "").toLowerCase().includes(search.toLowerCase())) && (!fcat || e.category === fcat);
  }).sort(function(a, b) { return (b.date || "").localeCompare(a.date || ""); });

  var totDKK = rows.reduce(function(s, e) { return s + toDKK(Number(e.amount || 0), e.currency || cur, fx); }, 0);
  var dedDKK = rows.reduce(function(s, e) { return s + toDKK(calcDed(Number(e.amount || 0), e.category, co.country), e.currency || cur, fx); }, 0);

  var save = async function() {
    if(!form.description || !form.amount) { toast("Udfyld beskrivelse og beløb"); return; }
    setSaving(true);
    var ded = calcDed(Number(form.amount), form.category, co.country);
    var result = await supabase.from("expenses").insert({ company_id: co.id, date: form.date, description: form.description, amount: Number(form.amount), currency: form.currency, category: form.category, deductible: ded, receipt_url: pendingReceipt || null }).select().single();
    setSaving(false);
    if(result.error) { toast("Fejl: " + result.error.message); return; }
    onAdd(result.data);
    setModal(false); setForm(ef); setPendingReceipt(null); toast("Udgift gemt");
  };

  var del = async function(id) {
    var result = await supabase.from("expenses").delete().eq("id", id);
    if(result.error) { toast("Fejl: " + result.error.message); return; }
    onDelete(id); toast("Slettet"); setConfirm(null);
  };

  return (
    <div className="fe">
      <SH action={<Btn onClick={function() { setModal(true); }}>+ Tilføj</Btn>}>Udgifter</SH>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
        <StatCard label="Total (DKK)" value={fmt(totDKK, "DKK")} />
        <StatCard label="Fradragsber." value={fmt(dedDKK, "DKK")} accent={gold} />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <input value={search} onChange={function(e) { setSearch(e.target.value); }} placeholder="Søg…" style={{ flex: "1 1 140px", minWidth: 0 }} />
        <select value={fcat} onChange={function(e) { setFcat(e.target.value); }} style={{ flex: "1 1 160px" }}>
          <option value="">Alle kategorier</option>
          {CATS.map(function(c) { return <option key={c.id} value={c.id}>{c.icon} {c.label}</option>; })}
        </select>
      </div>
      <div className="desktop-only" style={{ background: surface, border: "1px solid " + border, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 110px 120px 100px 36px 60px", padding: "10px 18px", borderBottom: "1px solid " + border, background: bg }}>
          {["Dato", "Beskrivelse", "Beløb", "Kategori", "Fradrag", "", ""].map(function(h, i) {
            return <span key={i} style={{ fontFamily: ff.ui, fontSize: 11, fontWeight: 600, color: ink3, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</span>;
          })}
        </div>
        {rows.length === 0
          ? <div style={{ padding: 40, textAlign: "center", fontFamily: ff.mono, fontSize: 13, color: ink3 }}>Ingen udgifter</div>
          : rows.map(function(e, i) {
            var cat = CATS.find(function(c) { return c.id === e.category; });
            return (
              <div key={e.id} className="hrow" style={{ display: "grid", gridTemplateColumns: "100px 1fr 110px 120px 100px 36px 60px", padding: "12px 18px", borderTop: i > 0 ? "1px solid " + border : "none", alignItems: "center" }}>
                <Mono size={12} color={ink3}>{e.date}</Mono>
                <span style={{ fontFamily: ff.ui, fontSize: 13, color: ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 10 }}>{e.description}</span>
                <Mono size={13}>{fmt(Number(e.amount || 0), e.currency || cur, locale)}</Mono>
                <span style={{ fontFamily: ff.ui, fontSize: 12, color: ink2 }}>{cat ? cat.icon : ""} {cat ? cat.label : ""}</span>
                <Mono size={12} color={gold}>{fmt(Number(e.deductible || 0), e.currency || cur, locale)}</Mono>
                <span>{e.receipt_url && <a href={e.receipt_url} target="_blank" rel="noreferrer" style={{ textDecoration: "none", fontSize: 15 }}>📎</a>}</span>
                <button onClick={function() { setConfirm(e.id); }} style={{ background: "none", border: "1px solid " + border, color: ink3, borderRadius: 6, padding: "4px 9px", cursor: "pointer", fontSize: 11, fontFamily: ff.ui }}>Slet</button>
              </div>
            );
          })
        }
      </div>
      <div className="mobile-only" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {rows.length === 0
          ? <div style={{ padding: 32, textAlign: "center", fontFamily: ff.mono, fontSize: 13, color: ink3, background: surface, border: "1px solid " + border, borderRadius: 16 }}>Ingen udgifter</div>
          : rows.map(function(e) {
            var cat = CATS.find(function(c) { return c.id === e.category; });
            return (
              <div key={e.id} style={{ background: surface, border: "1px solid " + border, borderRadius: 14, padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, border: "1px solid " + border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{cat ? cat.icon : "·"}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: ff.ui, fontWeight: 600, fontSize: 14, color: ink }}>{e.description}</div>
                  <div style={{ fontFamily: ff.ui, fontSize: 12, color: ink3, marginTop: 2 }}>{cat ? cat.label : ""} · {e.date}</div>
                  <div style={{ fontFamily: ff.mono, fontSize: 11, color: gold, marginTop: 3 }}>Frad. {fmt(Number(e.deductible || 0), e.currency || cur, locale)}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {e.receipt_url && <a href={e.receipt_url} target="_blank" rel="noreferrer" style={{ textDecoration: "none", fontSize: 15 }}>📎</a>}
                    <Mono size={14}>{fmt(Number(e.amount || 0), e.currency || cur, locale)}</Mono>
                  </div>
                  <button onClick={function() { setConfirm(e.id); }} style={{ display: "block", background: "none", border: "1px solid " + border, color: ink3, borderRadius: 6, padding: "3px 9px", cursor: "pointer", fontSize: 10, marginTop: 6, fontFamily: ff.ui }}>Slet</button>
                </div>
              </div>
            );
          })
        }
      </div>
      {modal && (
        <Sheet title="Ny udgift" onClose={function() { setModal(false); setPendingReceipt(null); }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Dato"><input type="date" value={form.date} onChange={function(e) { setForm(Object.assign({}, form, { date: e.target.value })); }} /></Field>
            <Field label="Beskrivelse"><input value={form.description} onChange={function(e) { setForm(Object.assign({}, form, { description: e.target.value })); }} placeholder="F.eks. Shopify abonnement" /></Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Beløb"><input type="number" value={form.amount} onChange={function(e) { setForm(Object.assign({}, form, { amount: e.target.value })); }} placeholder="0.00" /></Field>
              <Field label="Valuta">
                <select value={form.currency} onChange={function(e) { setForm(Object.assign({}, form, { currency: e.target.value })); }}>
                  {["DKK", "EUR", "CLP", "USD", "GBP"].map(function(c) { return <option key={c}>{c}</option>; })}
                </select>
              </Field>
            </div>
            <Field label="Kategori">
              <select value={form.category} onChange={function(e) { setForm(Object.assign({}, form, { category: e.target.value })); }}>
                {CATS.map(function(c) { return <option key={c.id} value={c.id}>{c.icon} {c.label}</option>; })}
              </select>
            </Field>
            {form.amount && (
              <div style={{ background: bg, borderRadius: 9, padding: "11px 13px", fontFamily: ff.mono, fontSize: 12, color: ink3 }}>
                Fradrag: <span style={{ color: gold }}>{fmt(calcDed(Number(form.amount) || 0, form.category, co.country), form.currency)}</span>
                {(form.category === "repraesentation" || form.category === "fortaering") && co.country === "DK" && " (25% — DK-regel)"}
              </div>
            )}
            <ReceiptUpload expenseId={"temp_" + Date.now()} existingUrl={pendingReceipt} onUploaded={function(url) { setPendingReceipt(url); }} />
            <Btn full onClick={save} disabled={saving}>{saving ? <><Spinner /> Gemmer…</> : "Gem udgift"}</Btn>
          </div>
        </Sheet>
      )}
      {confirm && <Confirm msg="Vil du slette denne udgift?" onYes={function() { del(confirm); }} onNo={function() { setConfirm(null); }} />}
    </div>
  );
}

function Travel(props) {
  var co = props.co;
  var travels = props.travels;
  var onAdd = props.onAdd;
  var onDelete = props.onDelete;
  var toast = props.toast;

  var [modal, setModal] = useState(false);
  var [saving, setSaving] = useState(false);
  var [confirm, setConfirm] = useState(null);
  var cur = (COUNTRIES[co.country] || {}).currency || "EUR";
  var locale = (COUNTRIES[co.country] || {}).locale || "da-DK";
  var ctry = COUNTRIES[co.country] || COUNTRIES.DK;
  var ef = { dest: "", from: today(), to: today(), transport: "", other: "" };
  var [form, setForm] = useState(ef);

  var calcDays = function(f, t) { return Math.max(1, Math.round((new Date(t) - new Date(f)) / 86400000) + 1); };
  var sum = travels.reduce(function(s, t) { return s + Number(t.total || 0); }, 0);

  var save = async function() {
    if(!form.dest) { toast("Angiv destination"); return; }
    setSaving(true);
    var d = calcDays(form.from, form.to);
    var kost = ((ctry.travelKost || ctry.perDiem || 0)) * d;
    var logi = (ctry.travelLogi || 0) * d;
    var trns = Number(form.transport) || 0;
    var othr = Number(form.other) || 0;
    var total = kost + logi + trns + othr;
    var result = await supabase.from("travels").insert({ company_id: co.id, dest: form.dest, from_date: form.from, to_date: form.to, days: d, kost: kost, logi: logi, transport: trns, other: othr, total: total }).select().single();
    setSaving(false);
    if(result.error) { toast("Fejl: " + result.error.message); return; }
    onAdd(result.data); setModal(false); setForm(ef); toast("Rejse gemt");
  };

  var del = async function(id) {
    var result = await supabase.from("travels").delete().eq("id", id);
    if(result.error) { toast("Fejl: " + result.error.message); return; }
    onDelete(id); toast("Slettet"); setConfirm(null);
  };

  return (
    <div className="fe">
      <SH action={<Btn onClick={function() { setModal(true); }}>+ Tilføj</Btn>}>Rejse & Diæter</SH>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10, marginBottom: 20 }}>
        <StatCard label="Samlet fradrag" value={fmt(sum, cur, locale)} accent={gold} />
        {ctry.travelCap && <StatCard label="Loft" value={fmt(ctry.travelCap, cur, locale)} sub={Math.min(100, Math.round((sum / ctry.travelCap) * 100)) + "% udnyttet"} />}
        <StatCard label="Antal rejser" value={travels.length} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {travels.length === 0
          ? <div style={{ padding: 32, textAlign: "center", fontFamily: ff.mono, fontSize: 13, color: ink3, background: surface, border: "1px solid " + border, borderRadius: 16 }}>Ingen rejser endnu</div>
          : travels.slice().sort(function(a, b) { return (b.from_date || "").localeCompare(a.from_date || ""); }).map(function(t) {
            return (
              <div key={t.id} style={{ background: surface, border: "1px solid " + border, borderRadius: 14, padding: "15px 18px", display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, border: "1px solid " + border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>✈</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: ff.ui, fontWeight: 600, fontSize: 14, color: ink }}>{t.dest}</div>
                  <Mono size={11} color={ink3}>{t.from_date} → {t.to_date} · {t.days} dage</Mono>
                  <div style={{ fontFamily: ff.mono, fontSize: 11, color: ink3, marginTop: 3 }}>Kost {fmt(t.kost, cur, locale)} · Logi {fmt(t.logi, cur, locale)}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <Mono size={15} color={gold}>{fmt(t.total, cur, locale)}</Mono>
                  <button onClick={function() { setConfirm(t.id); }} style={{ display: "block", background: "none", border: "1px solid " + border, color: ink3, borderRadius: 6, padding: "3px 9px", cursor: "pointer", fontSize: 10, marginTop: 6, fontFamily: ff.ui }}>Slet</button>
                </div>
              </div>
            );
          })
        }
      </div>
      {modal && (
        <Sheet title="Ny rejse" onClose={function() { setModal(false); }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Destination"><input value={form.dest} onChange={function(e) { setForm(Object.assign({}, form, { dest: e.target.value })); }} placeholder="F.eks. Tallinn, Estland" /></Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Rejsedato"><input type="date" value={form.from} onChange={function(e) { setForm(Object.assign({}, form, { from: e.target.value })); }} /></Field>
              <Field label="Returdato"><input type="date" value={form.to} onChange={function(e) { setForm(Object.assign({}, form, { to: e.target.value })); }} /></Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label={"Transport (" + cur + ")"}><input type="number" value={form.transport} onChange={function(e) { setForm(Object.assign({}, form, { transport: e.target.value })); }} /></Field>
              <Field label={"Andre udg. (" + cur + ")"}><input type="number" value={form.other} onChange={function(e) { setForm(Object.assign({}, form, { other: e.target.value })); }} /></Field>
            </div>
            {form.from && form.to && (function() {
              var d = calcDays(form.from, form.to);
              var kost = (ctry.travelKost || ctry.perDiem || 0) * d;
              var logi = (ctry.travelLogi || 0) * d;
              var tot = kost + logi + (Number(form.transport) || 0) + (Number(form.other) || 0);
              return <div style={{ background: bg, borderRadius: 9, padding: "11px 13px", fontFamily: ff.mono, fontSize: 12, color: ink3 }}>{d} dage · Kost {fmt(kost, cur)} · Logi {fmt(logi, cur)} = <span style={{ color: gold }}>{fmt(tot, cur)}</span></div>;
            })()}
            <Btn full onClick={save} disabled={saving}>{saving ? <><Spinner /> Gemmer…</> : "Gem rejse"}</Btn>
          </div>
        </Sheet>
      )}
      {confirm && <Confirm msg="Vil du slette denne rejse?" onYes={function() { del(confirm); }} onNo={function() { setConfirm(null); }} />}
    </div>
  );
}

function Mileage(props) {
  var co = props.co;
  var kmEntries = props.kmEntries;
  var onAdd = props.onAdd;
  var onDelete = props.onDelete;
  var toast = props.toast;

  var [modal, setModal] = useState(false);
  var [saving, setSaving] = useState(false);
  var [confirm, setConfirm] = useState(null);
  var cur = (COUNTRIES[co.country] || {}).currency || "EUR";
  var locale = (COUNTRIES[co.country] || {}).locale || "da-DK";
  var ctry = COUNTRIES[co.country] || {};
  var [form, setForm] = useState({ date: today(), from_location: "", to_location: "", km: "" });

  var totKm = kmEntries.reduce(function(s, k) { return s + Number(k.km || 0); }, 0);
  var totAmt = kmEntries.reduce(function(s, k) { return s + Number(k.amount || 0); }, 0);

  var save = async function() {
    if(!form.km) { toast("Angiv km"); return; }
    setSaving(true);
    var km = Number(form.km);
    var rate = totKm + km > (ctry.kmTh || 20000) ? (ctry.km2 || ctry.km1 || 0) : (ctry.km1 || 0);
    var amount = km * rate;
    var result = await supabase.from("km_entries").insert({ company_id: co.id, date: form.date, from_location: form.from_location, to_location: form.to_location, km: km, rate: rate, amount: amount }).select().single();
    setSaving(false);
    if(result.error) { toast("Fejl: " + result.error.message); return; }
    onAdd(result.data); setModal(false); setForm({ date: today(), from_location: "", to_location: "", km: "" }); toast("Kørsel gemt");
  };

  var del = async function(id) {
    var result = await supabase.from("km_entries").delete().eq("id", id);
    if(result.error) { toast("Fejl: " + result.error.message); return; }
    onDelete(id); toast("Slettet"); setConfirm(null);
  };

  return (
    <div className="fe">
      <SH action={<Btn onClick={function() { setModal(true); }}>+ Tilføj</Btn>}>Kørsel & Bil</SH>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(155px,1fr))", gap: 10, marginBottom: 20 }}>
        <StatCard label="Km i alt" value={totKm + " km"} />
        <StatCard label="Godtgørelse" value={fmt(totAmt, cur, locale)} accent={gold} />
        {ctry.km1 && <StatCard label="Km-sats" value={ctry.km1 + " " + cur} sub={ctry.km2 ? ctry.km2 + " over " + (ctry.kmTh / 1000).toFixed(0) + "k km" : undefined} />}
      </div>
      <div className="desktop-only" style={{ background: surface, border: "1px solid " + border, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr 70px 70px 110px 60px", padding: "10px 18px", borderBottom: "1px solid " + border, background: bg }}>
          {["Dato", "Fra", "Til", "Km", "Sats", "Godtgørelse", ""].map(function(h, i) {
            return <span key={i} style={{ fontFamily: ff.ui, fontSize: 11, fontWeight: 600, color: ink3, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</span>;
          })}
        </div>
        {kmEntries.length === 0
          ? <div style={{ padding: 40, textAlign: "center", fontFamily: ff.mono, fontSize: 13, color: ink3 }}>Ingen kørsler</div>
          : kmEntries.slice().sort(function(a, b) { return (b.date || "").localeCompare(a.date || ""); }).map(function(k, i) {
            return (
              <div key={k.id} className="hrow" style={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr 70px 70px 110px 60px", padding: "11px 18px", borderTop: i > 0 ? "1px solid " + border : "none", alignItems: "center" }}>
                <Mono size={12} color={ink3}>{k.date}</Mono>
                <span style={{ fontFamily: ff.ui, fontSize: 13, color: ink, overflow: "hidden", textOverflow: "ellipsis" }}>{k.from_location}</span>
                <span style={{ fontFamily: ff.ui, fontSize: 13, color: ink, overflow: "hidden", textOverflow: "ellipsis" }}>{k.to_location}</span>
                <Mono size={13}>{k.km}</Mono>
                <Mono size={12} color={ink3}>{k.rate}</Mono>
                <Mono size={13} color={gold}>{fmt(k.amount, cur, locale)}</Mono>
                <button onClick={function() { setConfirm(k.id); }} style={{ background: "none", border: "1px solid " + border, color: ink3, borderRadius: 6, padding: "4px 9px", cursor: "pointer", fontSize: 10 }}>Slet</button>
              </div>
            );
          })
        }
      </div>
      <div className="mobile-only" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {kmEntries.length === 0
          ? <div style={{ padding: 32, textAlign: "center", fontFamily: ff.mono, fontSize: 13, color: ink3, background: surface, border: "1px solid " + border, borderRadius: 16 }}>Ingen kørsler</div>
          : kmEntries.slice().sort(function(a, b) { return (b.date || "").localeCompare(a.date || ""); }).map(function(k) {
            return (
              <div key={k.id} style={{ background: surface, border: "1px solid " + border, borderRadius: 14, padding: "14px 16px", display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, border: "1px solid " + border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>○</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: ff.ui, fontWeight: 600, fontSize: 13, color: ink }}>{k.from_location} → {k.to_location}</div>
                  <Mono size={11} color={ink3}>{k.date} · {k.km} km · sats {k.rate}</Mono>
                </div>
                <Mono size={14} color={gold}>{fmt(k.amount, cur, locale)}</Mono>
              </div>
            );
          })
        }
      </div>
      {modal && (
        <Sheet title="Ny kørsel" onClose={function() { setModal(false); }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Dato"><input type="date" value={form.date} onChange={function(e) { setForm(Object.assign({}, form, { date: e.target.value })); }} /></Field>
            <Field label="Fra"><input value={form.from_location} onChange={function(e) { setForm(Object.assign({}, form, { from_location: e.target.value })); }} placeholder="Startsted" /></Field>
            <Field label="Til"><input value={form.to_location} onChange={function(e) { setForm(Object.assign({}, form, { to_location: e.target.value })); }} placeholder="Slutsted" /></Field>
            <Field label="Kilometer"><input type="number" value={form.km} onChange={function(e) { setForm(Object.assign({}, form, { km: e.target.value })); }} placeholder="0" /></Field>
            {form.km && ctry.km1 && (
              <div style={{ background: bg, borderRadius: 9, padding: "11px 13px", fontFamily: ff.mono, fontSize: 12, color: ink3 }}>
                Godtgørelse: <span style={{ color: gold }}>{fmt(Number(form.km) * ctry.km1, cur)}</span> (sats {ctry.km1})
              </div>
            )}
            <Btn full onClick={save} disabled={saving}>{saving ? <><Spinner /> Gemmer…</> : "Gem kørsel"}</Btn>
          </div>
        </Sheet>
      )}
      {confirm && <Confirm msg="Vil du slette denne kørsel?" onYes={function() { del(confirm); }} onNo={function() { setConfirm(null); }} />}
    </div>
  );
}

function CurrencyPage(props) {
  var fx = props.fx;
  var onSaveFx = props.onSaveFx;
  var toast = props.toast;
  var [local, setLocal] = useState(Object.assign({}, fx));
  var [amount, setAmount] = useState("");
  var [from, setFrom] = useState("EUR");
  var [result, setResult] = useState("");
  return (
    <div className="fe">
      <SH>Valuta & FX</SH>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))", gap: 16 }}>
        <div style={{ background: surface, border: "1px solid " + border, borderRadius: 16, padding: 20 }}>
          <Lbl>Kurser → DKK</Lbl>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
            {Object.entries(local).map(function(entry) {
              var k = entry[0]; var v = entry[1];
              return (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: ff.mono, fontSize: 13, fontWeight: 500, color: ink, width: 40 }}>{k}</span>
                  <span style={{ fontFamily: ff.ui, fontSize: 12, color: ink3, flex: 1 }}>→ DKK</span>
                  <input type="number" step="0.0001" value={v} onChange={function(e) { var n = {}; n[k] = Number(e.target.value); setLocal(Object.assign({}, local, n)); }} style={{ width: 110, textAlign: "right" }} />
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 14 }}>
            <Btn full onClick={function() { onSaveFx(local); toast("Kurser gemt"); }}>Gem kurser</Btn>
          </div>
        </div>
        <div style={{ background: surface, border: "1px solid " + border, borderRadius: 16, padding: 20 }}>
          <Lbl>Konverter til DKK</Lbl>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 10 }}>
            <Field label="Beløb"><input type="number" value={amount} onChange={function(e) { setAmount(e.target.value); }} placeholder="0.00" /></Field>
            <Field label="Fra valuta">
              <select value={from} onChange={function(e) { setFrom(e.target.value); }}>
                {["EUR", "DKK", "CLP", "USD", "GBP"].map(function(c) { return <option key={c}>{c}</option>; })}
              </select>
            </Field>
            <Btn full onClick={function() { var a = Number(amount) || 0; var dk = from === "DKK" ? a : a * (local[from] || 1); setResult(a + " " + from + " = " + fmt(dk, "DKK", "da-DK")); }}>Konverter</Btn>
            {result && <div style={{ textAlign: "center", fontFamily: ff.display, fontSize: 22, color: gold, fontStyle: "italic", padding: "10px 0" }}>{result}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentsPage(props) {
  var companies = props.companies;
  var activeId = props.activeId;
  var toast = props.toast;

  var [year, setYear] = useState(new Date().getFullYear());
  var [docs, setDocs] = useState([]);
  var [loading, setLoading] = useState(false);
  var [uploading, setUploading] = useState(false);
  var [modal, setModal] = useState(false);
  var [confirm, setConfirm] = useState(null);
  var [form, setForm] = useState({ category: "bilag", name: "", notes: "" });
  var [file, setFile] = useState(null);
  var co = companies.find(function(c) { return c.id === activeId; });
  var YEARS = [0, 1, 2, 3, 4, 5].map(function(i) { return new Date().getFullYear() - i; });

  useEffect(function() {
    if(!activeId) return;
    setLoading(true);
    supabase.from("documents").select("*").eq("company_id", activeId).eq("year", year).order("created_at", { ascending: false }).then(function(r) { setDocs(r.data || []); setLoading(false); });
  }, [activeId, year]);

  var handleUpload = async function() {
    if(!file || !form.name) { toast("Vælg fil og angiv navn"); return; }
    setUploading(true);
    var path = activeId + "/" + year + "/" + form.category + "/" + Date.now() + "_" + file.name;
    var upResult = await supabase.storage.from("receipts").upload(path, file, { upsert: true });
    if(upResult.error) { toast("Upload fejl: " + upResult.error.message); setUploading(false); return; }
    var urlData = supabase.storage.from("receipts").getPublicUrl(path);
    var ext = file.name.split(".").pop();
    var insResult = await supabase.from("documents").insert({ company_id: activeId, year: year, category: form.category, name: form.name, file_url: urlData.data.publicUrl, file_type: ext, file_size: file.size, notes: form.notes || null }).select().single();
    setUploading(false);
    if(insResult.error) { toast("Gem fejl: " + insResult.error.message); return; }
    setDocs(function(p) { return [insResult.data].concat(p); });
    setModal(false); setForm({ category: "bilag", name: "", notes: "" }); setFile(null);
    toast("Bilag gemt");
  };

  var del = async function(id) {
    await supabase.from("documents").delete().eq("id", id);
    setDocs(function(p) { return p.filter(function(d) { return d.id !== id; }); });
    toast("Slettet"); setConfirm(null);
  };

  var fmtSize = function(b) {
    if(b > 1000000) return (b / 1000000).toFixed(1) + " MB";
    if(b > 1000) return Math.round(b / 1000) + " KB";
    return b + " B";
  };

  var byCategory = DOC_CATS.map(function(cat) {
    return Object.assign({}, cat, { items: docs.filter(function(d) { return d.category === cat.id; }) });
  }).filter(function(cat) { return cat.items.length > 0; });

  return (
    <div className="fe">
      <SH action={<Btn onClick={function() { setModal(true); }}>+ Upload bilag</Btn>}>Bilagsmappe</SH>
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        {YEARS.map(function(y) {
          return (
            <button key={y} onClick={function() { setYear(y); }} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid " + (year === y ? ink : border), background: year === y ? ink : "transparent", color: year === y ? "#fff" : ink2, fontFamily: ff.ui, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {y}
            </button>
          );
        })}
        {co && <div style={{ marginLeft: "auto", fontFamily: ff.ui, fontSize: 13, color: ink3 }}>{co.name}</div>}
      </div>
      {loading && <div style={{ padding: 40, textAlign: "center" }}><Spinner /></div>}
      {!loading && docs.length === 0 && (
        <div style={{ background: surface, border: "1px dashed " + border, borderRadius: 16, padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📂</div>
          <div style={{ fontFamily: ff.display, fontSize: 18, color: ink, marginBottom: 6 }}>Ingen bilag for {year}</div>
          <div style={{ fontFamily: ff.ui, fontSize: 13, color: ink3, marginBottom: 20 }}>Upload fakturaer, kvitteringer og andre dokumenter</div>
          <Btn onClick={function() { setModal(true); }}>+ Upload første bilag</Btn>
        </div>
      )}
      {byCategory.map(function(cat) {
        return (
          <div key={cat.id} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 16 }}>{cat.icon}</span>
              <span style={{ fontFamily: ff.ui, fontWeight: 600, fontSize: 14, color: ink }}>{cat.label}</span>
              <span style={{ fontFamily: ff.mono, fontSize: 11, color: ink3 }}>{cat.items.length} fil{cat.items.length !== 1 ? "er" : ""}</span>
            </div>
            <div style={{ background: surface, border: "1px solid " + border, borderRadius: 14, overflow: "hidden" }}>
              {cat.items.map(function(doc, i) {
                return (
                  <div key={doc.id} className="hrow" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderTop: i > 0 ? "1px solid " + border : "none" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: bg, border: "1px solid " + border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                      {doc.file_type === "pdf" ? "📄" : (doc.file_type || "").match(/jpg|jpeg|png|gif|webp/) ? "🖼" : "📎"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: ff.ui, fontWeight: 600, fontSize: 13, color: ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</div>
                      <div style={{ fontFamily: ff.mono, fontSize: 11, color: ink3, marginTop: 2 }}>
                        {(doc.file_type || "").toUpperCase()} · {doc.file_size ? fmtSize(doc.file_size) : ""} · {new Date(doc.created_at).toLocaleDateString("da-DK")}
                      </div>
                      {doc.notes && <div style={{ fontFamily: ff.ui, fontSize: 11, color: ink3, marginTop: 1, fontStyle: "italic" }}>{doc.notes}</div>}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <a href={doc.file_url} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", padding: "5px 12px", borderRadius: 7, border: "1px solid " + border, fontFamily: ff.ui, fontSize: 12, color: ink, textDecoration: "none", fontWeight: 600 }}>Åbn ↗</a>
                      <button onClick={function() { setConfirm(doc.id); }} style={{ background: "none", border: "1px solid " + border, color: ink3, borderRadius: 7, padding: "5px 10px", cursor: "pointer", fontSize: 11 }}>Slet</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      {modal && (
        <Sheet title="Upload bilag" onClose={function() { setModal(false); setFile(null); }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Navn / beskrivelse"><input value={form.name} onChange={function(e) { setForm(Object.assign({}, form, { name: e.target.value })); }} placeholder="F.eks. Shopify faktura januar" /></Field>
            <Field label="Kategori">
              <select value={form.category} onChange={function(e) { setForm(Object.assign({}, form, { category: e.target.value })); }}>
                {DOC_CATS.map(function(c) { return <option key={c.id} value={c.id}>{c.icon} {c.label}</option>; })}
              </select>
            </Field>
            <Field label="Regnskabsår">
              <select value={year} onChange={function(e) { setYear(Number(e.target.value)); }}>
                {YEARS.map(function(y) { return <option key={y} value={y}>{y}</option>; })}
              </select>
            </Field>
            <Field label="Noter (valgfrit)"><input value={form.notes} onChange={function(e) { setForm(Object.assign({}, form, { notes: e.target.value })); }} placeholder="F.eks. Q1 udgift" /></Field>
            <div>
              <Lbl>Fil</Lbl>
              <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px", border: "1px dashed " + border, borderRadius: 9, cursor: "pointer", fontFamily: ff.ui, fontSize: 13, color: file ? ink : ink3, background: file ? gold + "08" : "transparent" }}>
                {file ? "✅ " + file.name + " (" + Math.round(file.size / 1000) + " KB)" : "📎 Klik for at vælge fil (PDF, billede, Excel…)"}
                <input type="file" accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.csv,.doc,.docx" onChange={function(e) { setFile(e.target.files[0]); }} style={{ display: "none" }} />
              </label>
            </div>
            <Btn full onClick={handleUpload} disabled={uploading || !file || !form.name}>
              {uploading ? <><Spinner /> Uploader…</> : "Gem bilag"}
            </Btn>
          </div>
        </Sheet>
      )}
      {confirm && <Confirm msg="Vil du slette dette bilag?" onYes={function() { del(confirm); }} onNo={function() { setConfirm(null); }} />}
    </div>
  );
}

function SkatPage(props) {
  var companies = props.companies, expenses = props.expenses, travels = props.travels, kmEntries = props.kmEntries, fx = props.fx;
  var [tab, setTab] = useState("selvangivelse");
  var [bankText, setBankText] = useState("");
  var [bankFile, setBankFile] = useState(null);
  var [analyzing, setAnalyzing] = useState(false);
  var [bankResult, setBankResult] = useState(null);
  var [tips, setTips] = useState(null);
  var [tipsLoading, setTipsLoading] = useState(false);
  var [localToast, setLocalToast] = useState(null);
  var [selskabId, setSelskabId] = useState((companies[0] || {}).id || "");
  var co = companies.find(function(c) { return c.id === selskabId; }) || companies[0] || {};
  var cur = (COUNTRIES[co.country] || {}).currency || "EUR";
  var locale = (COUNTRIES[co.country] || {}).locale || "da-DK";
  var coExp = expenses.filter(function(e) { return e.company_id === selskabId; });
  var coTrv = travels.filter(function(t) { return t.company_id === selskabId; });
  var coKm = kmEntries.filter(function(k) { return k.company_id === selskabId; });
  var kmTotal = coKm.reduce(function(s, k) { return s + Number(k.amount || 0); }, 0);
  var rejseTotal = coTrv.reduce(function(s, t) { return s + Number(t.total || 0); }, 0);
  var expTotal = coExp.reduce(function(s, e) { return s + toDKK(Number(e.amount || 0), e.currency || cur, fx); }, 0);
  var dedTotal = coExp.reduce(function(s, e) { return s + toDKK(calcDed(Number(e.amount || 0), e.category, co.country), e.currency || cur, fx); }, 0);
  var DK_RUBRIKKER = [
    { id:"r29", label:"Rubrik 29", name:"Befordring", hint:"Kørsel til fast arbejdssted", value: kmTotal, note: coKm.reduce(function(s,k){return s+Number(k.km||0);},0) + " km" },
    { id:"r53", label:"Rubrik 53", name:"Rejseudgifter", hint:"Diæter og logi", value: rejseTotal, note: coTrv.length + " rejser" },
    { id:"r44", label:"Rubrik 44", name:"Erhvervsmæssige udgifter", hint:"Selskabsudgifter", value: dedTotal, note: coExp.length + " udgifter" },
    { id:"r58", label:"Rubrik 58", name:"Fagforeningskontingent", hint:"Maks 7.000 kr/år", value: 0, note: "" },
    { id:"r28", label:"Rubrik 28", name:"Øvrige lønmodtagerudgifter", hint:"Maks 7.900 kr bundfradrag", value: 0, note: "" },
    { id:"r30", label:"Rubrik 30", name:"Renteudgifter", hint:"Prioritetsrenter", value: 0, note: "" },
  ];
  var analyzeBank = async function() {
    var input = bankText.trim();
    if(!input && bankFile) input = "Fil: " + bankFile.name;
    if(!input) { setLocalToast("Indsæt kontoudtog eller upload fil"); return; }
    setAnalyzing(true); setBankResult(null);
    try {
      var prompt = "Du er dansk skatterådgiver. Analyser kontoudtoget og kategoriser posteringerne. " + input + " Returner KUN JSON uden markdown: {posteringer:[{dato:YYYY-MM-DD,beskrivelse:tekst,beloeb:0,kategori:transport|fortaering|software|privat|loen|andet,fradrag:true,fradrag_beloeb:0,note:forklaring}],opsummering:{total_udgifter:0,total_fradrag:0,antal_poster:0,vigtigste_fund:tekst}}";
      var result = await callClaude(prompt, 4000);
      setBankResult(JSON.parse(result.replace(/```json|```/g, "").trim()));
    } catch(e) { setLocalToast("Fejl: " + e.message); }
    setAnalyzing(false);
  };
  var getTips = async function() {
    setTipsLoading(true); setTips(null);
    var lines = coExp.map(function(e) { return e.date + ": " + e.description + " " + e.amount + " " + e.currency; }).join(", ");
    try {
      var prompt = "Skatteradgiver for e-residenter. Selskab: " + co.name + " " + (co.type||"") + " i " + ((COUNTRIES[co.country]||{}).label||"") + ". Udgifter: " + (lines||"ingen") + ". Giv top 5 glemte fradrag med beloeb og optimeringstips. Dansk, max 400 ord, punktform.";
      setTips(await callClaude(prompt, 1500));
    } catch(e) { setLocalToast("Fejl: " + e.message); }
    setTipsLoading(false);
  };
  var tabStyle = function(id) { return { padding:"9px 18px", borderRadius:8, border:"none", cursor:"pointer", fontFamily:ff.ui, fontWeight:600, fontSize:13, background: tab===id ? ink : "transparent", color: tab===id ? "#fff" : ink3 }; };
  return (
    <div className="fe">
      <SH>Skat & Selvangivelse</SH>
      <div style={{ display:"flex", gap:4, marginBottom:24, background:bg, borderRadius:10, padding:4, width:"fit-content" }}>
        <button style={tabStyle("selvangivelse")} onClick={function(){setTab("selvangivelse");}}>Selvangivelse</button>
        <button style={tabStyle("bank")} onClick={function(){setTab("bank");}}>Bankimport</button>
        <button style={tabStyle("tips")} onClick={function(){setTab("tips");}}>Fradragstips</button>
      </div>
      {tab==="selvangivelse" && (
        <div>
          <div style={{display:"flex",gap:10,marginBottom:20}}>
            <Field label="Selskab" style={{flex:"1 1 200px"}}>
              <select value={selskabId} onChange={function(e){setSelskabId(e.target.value);}}>
                {companies.map(function(c){return <option key={c.id} value={c.id}>{c.name}</option>;})}
              </select>
            </Field>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(165px,1fr))",gap:10,marginBottom:24}}>
            <StatCard label="Samlede udgifter" value={fmt(expTotal,"DKK")} />
            <StatCard label="Fradragsberettiget" value={fmt(dedTotal,"DKK")} accent={gold} />
            <StatCard label="Est. skattebesparelse" value={fmt(dedTotal*.22,"DKK")} accent="#16a34a" />
            <StatCard label="Km-fradrag" value={fmt(kmTotal,cur,locale)} />
            <StatCard label="Rejsefradrag" value={fmt(rejseTotal,cur,locale)} />
          </div>
          <Lbl>Rubrikoversigt</Lbl>
          <div style={{background:surface,border:"1px solid "+border,borderRadius:16,overflow:"hidden",marginTop:8}}>
            {DK_RUBRIKKER.map(function(r,i){
              return (
                <div key={r.id} className="hrow" style={{display:"grid",gridTemplateColumns:"90px 1fr 130px",padding:"13px 18px",borderTop:i>0?"1px solid "+border:"none",alignItems:"center",opacity:r.value>0?1:.45}}>
                  <span style={{fontFamily:ff.mono,fontSize:12,color:r.value>0?gold:ink3}}>{r.label}</span>
                  <div>
                    <div style={{fontFamily:ff.ui,fontSize:13,fontWeight:600,color:ink}}>{r.name}</div>
                    <div style={{fontFamily:ff.ui,fontSize:11,color:ink3,marginTop:1}}>{r.value>0?r.note:r.hint}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    {r.value>0 ? <Mono size={14} color={gold}>{fmt(r.value,"DKK")}</Mono> : <span style={{fontFamily:ff.mono,fontSize:12,color:ink3}}>ikke registreret</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {tab==="bank" && (
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16,marginBottom:20}}>
            <div style={{background:surface,border:"1px solid "+border,borderRadius:14,padding:20}}>
              <Lbl>Indsæt kontoudtog som tekst</Lbl>
              <textarea value={bankText} onChange={function(e){setBankText(e.target.value);}} placeholder="Dato;Tekst;Beloeb  2026-01-15;Spotify;-99  2026-01-20;Klient;8500" style={{width:"100%",height:160,padding:"10px 13px",border:"1px solid "+border,borderRadius:9,fontFamily:ff.mono,fontSize:12,resize:"vertical",background:bg,color:ink,outline:"none"}} />
            </div>
            <div style={{background:surface,border:"1px solid "+border,borderRadius:14,padding:20}}>
              <Lbl>Eller upload fil</Lbl>
              <label style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,padding:"30px 20px",border:"1px dashed "+border,borderRadius:9,cursor:"pointer"}}>
                <span style={{fontSize:28}}>{bankFile?"✅":"🏦"}</span>
                <span style={{fontFamily:ff.ui,fontSize:13,color:ink3,textAlign:"center"}}>{bankFile?bankFile.name:"Upload CSV, PDF eller Excel"}</span>
                <input type="file" accept=".csv,.pdf,.xlsx,.xls,.txt" onChange={function(e){setBankFile(e.target.files[0]);}} style={{display:"none"}} />
              </label>
            </div>
          </div>
          <Btn onClick={analyzeBank} disabled={analyzing}>{analyzing?<><Spinner /> Analyserer…</>:"Analyser kontoudtog"}</Btn>
          {bankResult && (
            <div style={{marginTop:20}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginBottom:16}}>
                <StatCard label="Poster" value={(bankResult.opsummering||{}).antal_poster||(bankResult.posteringer||[]).length} />
                <StatCard label="Udgifter" value={fmt((bankResult.opsummering||{}).total_udgifter||0,"DKK")} />
                <StatCard label="Fradrag" value={fmt((bankResult.opsummering||{}).total_fradrag||0,"DKK")} accent={gold} />
              </div>
              {(bankResult.opsummering||{}).vigtigste_fund && <div style={{background:gold+"10",border:"1px solid "+gold+"30",borderRadius:10,padding:"12px 16px",fontFamily:ff.ui,fontSize:13,color:ink2,marginBottom:16}}>💡 {bankResult.opsummering.vigtigste_fund}</div>}
              <Lbl>Posteringer</Lbl>
              <div style={{background:surface,border:"1px solid "+border,borderRadius:14,overflow:"hidden",marginTop:8}}>
                {(bankResult.posteringer||[]).map(function(p,i){
                  return (
                    <div key={i} className="hrow" style={{display:"grid",gridTemplateColumns:"90px 1fr 100px 110px 90px",padding:"11px 16px",borderTop:i>0?"1px solid "+border:"none",alignItems:"center"}}>
                      <Mono size={11} color={ink3}>{p.dato}</Mono>
                      <div>
                        <div style={{fontFamily:ff.ui,fontSize:13,color:ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.beskrivelse}</div>
                        {p.note&&<div style={{fontFamily:ff.ui,fontSize:11,color:ink3,fontStyle:"italic"}}>{p.note}</div>}
                      </div>
                      <Mono size={13} color={p.beloeb<0?"#dc2626":"#16a34a"}>{fmt(Math.abs(p.beloeb||0),"DKK")}</Mono>
                      <span style={{fontFamily:ff.ui,fontSize:12,color:ink2}}>{p.kategori}</span>
                      {p.fradrag?<Mono size={12} color={gold}>{fmt(p.fradrag_beloeb||0,"DKK")} ✓</Mono>:<span style={{fontFamily:ff.mono,fontSize:11,color:ink3}}>—</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
      {tab==="tips" && (
        <div>
          <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap",alignItems:"flex-end"}}>
            <Field label="Selskab" style={{flex:"1 1 200px"}}>
              <select value={selskabId} onChange={function(e){setSelskabId(e.target.value);}}>
                {companies.map(function(c){return <option key={c.id} value={c.id}>{c.name}</option>;})}
              </select>
            </Field>
            <Btn onClick={getTips} disabled={tipsLoading}>{tipsLoading?<><Spinner /> Analyserer…</>:"Analyser mine fradrag"}</Btn>
          </div>
          {!tips&&!tipsLoading&&(
            <div style={{background:surface,border:"1px dashed "+border,borderRadius:16,padding:48,textAlign:"center"}}>
              <div style={{fontSize:36,marginBottom:12}}>🤖</div>
              <div style={{fontFamily:ff.display,fontSize:20,color:ink,marginBottom:8}}>AI-fradragsanalyse</div>
              <div style={{fontFamily:ff.ui,fontSize:14,color:ink3}}>Claude analyserer dine udgifter og finder fradrag du har glemt.</div>
            </div>
          )}
          {tipsLoading&&<div style={{padding:60,textAlign:"center"}}><Spinner /><div style={{fontFamily:ff.display,fontSize:16,fontStyle:"italic",color:ink3,marginTop:16}}>Analyserer…</div></div>}
          {tips&&(
            <div style={{background:surface,border:"1px solid "+border,borderRadius:16,padding:24}}>
              <div style={{fontFamily:ff.ui,fontWeight:600,fontSize:14,color:ink,marginBottom:4}}>{co.name}</div>
              <div style={{fontFamily:ff.ui,fontSize:14,color:ink,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{tips}</div>
              <button onClick={function(){setTips(null);}} style={{marginTop:16,background:"none",border:"1px solid "+border,color:ink3,borderRadius:8,padding:"7px 14px",cursor:"pointer",fontFamily:ff.ui,fontSize:12}}>Kør ny analyse</button>
            </div>
          )}
        </div>
      )}
      {localToast&&<Toast msg={localToast} onDone={function(){setLocalToast(null);}} />}
    </div>
  );
}

function ReportPage(props) {
  var companies=props.companies,expenses=props.expenses,travels=props.travels,kmEntries=props.kmEntries,fx=props.fx;
  var [coId,setCoId]=useState((companies[0]||{}).id||"");
  var [from,setFrom]=useState(new Date().toISOString().slice(0,8)+"01");
  var [to,setTo]=useState(today());
  var [data,setData]=useState(null);
  var generate=function(){
    var co=companies.find(function(c){return c.id===coId;}); if(!co) return;
    var cur=(COUNTRIES[co.country]||{}).currency||"EUR";
    var exps=expenses.filter(function(e){return e.company_id===coId&&e.date>=from&&e.date<=to;});
    var trvs=travels.filter(function(t){return t.company_id===coId&&t.from_date>=from;});
    var kms=kmEntries.filter(function(k){return k.company_id===coId&&k.date>=from&&k.date<=to;});
    var byCat={};
    exps.forEach(function(e){if(!byCat[e.category])byCat[e.category]={total:0,d:0};byCat[e.category].total+=toDKK(Number(e.amount||0),e.currency||cur,fx);byCat[e.category].d+=toDKK(calcDed(Number(e.amount||0),e.category,co.country),e.currency||cur,fx);});
    var total=exps.reduce(function(s,e){return s+toDKK(Number(e.amount||0),e.currency||cur,fx);},0);
    var d2=exps.reduce(function(s,e){return s+toDKK(calcDed(Number(e.amount||0),e.category,co.country),e.currency||cur,fx);},0);
    setData({co:co,cur:cur,byCat:byCat,total:total,d:d2,trvTot:trvs.reduce(function(s,t){return s+Number(t.total||0);},0),kmTot:kms.reduce(function(s,k){return s+Number(k.amount||0);},0),expCount:exps.length});
  };
  return (
    <div className="fe">
      <SH>Rapporter</SH>
      <div style={{background:surface,border:"1px solid "+border,borderRadius:16,padding:"18px 20px",marginBottom:20}}>
        <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"flex-end"}}>
          <Field label="Selskab" style={{flex:"2 1 180px"}}><select value={coId} onChange={function(e){setCoId(e.target.value);}}>{companies.map(function(c){return <option key={c.id} value={c.id}>{c.name}</option>;})}</select></Field>
          <Field label="Fra" style={{flex:"1 1 130px"}}><input type="date" value={from} onChange={function(e){setFrom(e.target.value);}} /></Field>
          <Field label="Til" style={{flex:"1 1 130px"}}><input type="date" value={to} onChange={function(e){setTo(e.target.value);}} /></Field>
          <Btn onClick={generate}>Generer</Btn>
        </div>
      </div>
      {data&&(
        <div style={{background:surface,border:"1px solid "+border,borderRadius:16,padding:"22px 24px"}}>
          <div style={{fontFamily:ff.display,fontWeight:700,fontSize:22,color:ink,marginBottom:2}}>{data.co.name}</div>
          <Mono size={12} color={ink3}>{from} - {to} - {data.expCount} udgifter</Mono>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(145px,1fr))",gap:10,margin:"18px 0"}}>
            <StatCard label="Udgifter (DKK)" value={fmt(data.total,"DKK")} />
            <StatCard label="Fradragsber." value={fmt(data.d,"DKK")} accent={gold} />
            <StatCard label="Skat sparet" value={fmt(data.d*.22,"DKK")} />
            <StatCard label="Rejse" value={fmt(data.trvTot,data.cur)} />
            <StatCard label="Km-godt." value={fmt(data.kmTot,data.cur)} />
          </div>
          <Lbl>Kategoriopdeling</Lbl>
          <div style={{display:"flex",flexDirection:"column",gap:12,marginTop:10}}>
            {Object.entries(data.byCat).map(function(entry){
              var cat=entry[0],vals=entry[1];
              var ci=CATS.find(function(c){return c.id===cat;});
              var pct=data.total>0?(vals.total/data.total)*100:0;
              return (
                <div key={cat}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                    <span style={{fontFamily:ff.ui,fontSize:13,color:ink2}}>{ci?ci.icon:""} {ci?ci.label:cat}</span>
                    <div style={{display:"flex",gap:16}}><Mono size={12}>{fmt(vals.total,"DKK")}</Mono><Mono size={12} color={gold}>{fmt(vals.d,"DKK")} frad.</Mono></div>
                  </div>
                  <div style={{height:3,background:border,borderRadius:99}}><div style={{height:"100%",width:pct+"%",background:gold,borderRadius:99}} /></div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsPage(props) {
  var companies=props.companies,onAdd=props.onAdd,onUpdate=props.onUpdate,onDelete=props.onDelete,toast=props.toast;
  var [addModal,setAddModal]=useState(false);
  var [editModal,setEditModal]=useState(null);
  var [confirm,setConfirm]=useState(null);
  var [saving,setSaving]=useState(false);
  var HUES=[194,158,90,278,22,208,350,40,310,60];
  var ef={name:"",country:"EE",type:"OÜ",hue:194,moms_nummer:"",adresse:""};
  var [form,setForm]=useState(ef);
  var openEdit=function(co){setForm({name:co.name,country:co.country,type:co.type,hue:co.hue,moms_nummer:co.moms_nummer||"",adresse:co.adresse||""});setEditModal(co);};
  var saveNew=async function(){
    if(!form.name){toast("Angiv navn");return;}
    setSaving(true);
    var ini=form.name.split(" ").map(function(s){return s[0];}).slice(0,2).join("").toUpperCase();
    var r=await supabase.from("companies").insert({name:form.name,country:form.country,type:form.type,hue:form.hue,initials:ini,currency:(COUNTRIES[form.country]||{}).currency||"EUR",moms_nummer:form.moms_nummer||null,adresse:form.adresse||null}).select().single();
    setSaving(false);
    if(r.error){toast("Fejl: "+r.error.message);return;}
    onAdd(r.data);setAddModal(false);setForm(ef);toast("Selskab oprettet");
  };
  var saveEdit=async function(){
    if(!form.name){toast("Angiv navn");return;}
    setSaving(true);
    var ini=form.name.split(" ").map(function(s){return s[0];}).slice(0,2).join("").toUpperCase();
    var r=await supabase.from("companies").update({name:form.name,country:form.country,type:form.type,hue:form.hue,initials:ini,currency:(COUNTRIES[form.country]||{}).currency||"EUR",moms_nummer:form.moms_nummer||null,adresse:form.adresse||null}).eq("id",editModal.id).select().single();
    setSaving(false);
    if(r.error){toast("Fejl: "+r.error.message);return;}
    onUpdate(r.data);setEditModal(null);toast("Gemt");
  };
  var del=async function(id){
    var r=await supabase.from("companies").delete().eq("id",id);
    if(r.error){toast("Fejl: "+r.error.message);return;}
    onDelete(id);toast("Selskab slettet");setConfirm(null);
  };
  var formFields=(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <Field label="Navn"><input value={form.name} onChange={function(e){setForm(Object.assign({},form,{name:e.target.value}));}} placeholder="F.eks. Artphobia OÜ" /></Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Field label="Land"><select value={form.country} onChange={function(e){setForm(Object.assign({},form,{country:e.target.value}));}}>{Object.entries(COUNTRIES).map(function(e){return <option key={e[0]} value={e[0]}>{e[1].flag} {e[1].label}</option>;})}</select></Field>
        <Field label="Type"><input value={form.type} onChange={function(e){setForm(Object.assign({},form,{type:e.target.value}));}} placeholder="OÜ" /></Field>
      </div>
      <Field label="Momsnummer / CVR"><input value={form.moms_nummer} onChange={function(e){setForm(Object.assign({},form,{moms_nummer:e.target.value}));}} placeholder="F.eks. DK12345678" /></Field>
      <Field label="Adresse"><input value={form.adresse} onChange={function(e){setForm(Object.assign({},form,{adresse:e.target.value}));}} placeholder="F.eks. Tallinn, Estland" /></Field>
      <Field label="Farve">
        <div style={{display:"flex",gap:8,flexWrap:"wrap",paddingTop:4}}>
          {HUES.map(function(h){return <div key={h} onClick={function(){setForm(Object.assign({},form,{hue:h}));}} style={{width:26,height:26,borderRadius:99,background:"hsl("+h+",42%,62%)",cursor:"pointer",border:form.hue===h?"2px solid "+ink:"2px solid transparent"}} />;  })}
        </div>
      </Field>
    </div>
  );
  return (
    <div className="fe">
      <SH action={<Btn onClick={function(){setForm(ef);setAddModal(true);}}>+ Nyt selskab</Btn>}>Selskaber</SH>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {companies.map(function(co,i){
          return (
            <div key={co.id} className="fe" style={{animationDelay:i*40+"ms",background:surface,border:"1px solid "+border,borderRadius:14,padding:"15px 18px",display:"flex",gap:14,alignItems:"center"}}>
              <Avatar co={co} size={42} />
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:ff.ui,fontWeight:600,fontSize:15,color:ink}}>{co.name}</div>
                <div style={{fontFamily:ff.ui,fontSize:12,color:ink3,marginTop:2}}>{(COUNTRIES[co.country]||{}).flag} {co.type} - {(COUNTRIES[co.country]||{}).currency}</div>
                {co.moms_nummer&&<div style={{fontFamily:ff.mono,fontSize:11,color:ink3,marginTop:1}}>CVR: {co.moms_nummer}</div>}
                {co.adresse&&<div style={{fontFamily:ff.ui,fontSize:11,color:ink3,marginTop:1}}>📍 {co.adresse}</div>}
              </div>
              <div style={{display:"flex",gap:8,flexShrink:0}}>
                <Btn size="sm" variant="outline" onClick={function(){openEdit(co);}}>Rediger</Btn>
                <Btn size="sm" variant="outline" onClick={function(){setConfirm(co.id);}} style={{color:"#dc2626",borderColor:"#fecaca"}}>Slet</Btn>
              </div>
            </div>
          );
        })}
      </div>
      {addModal&&<Sheet title="Nyt selskab" onClose={function(){setAddModal(false);}}>{formFields}<div style={{marginTop:14}}><Btn full onClick={saveNew} disabled={saving}>{saving?<><Spinner /> Gemmer...</>:"Opret selskab"}</Btn></div></Sheet>}
      {editModal&&<Sheet title="Rediger selskab" onClose={function(){setEditModal(null);}}>{formFields}<div style={{marginTop:14}}><Btn full onClick={saveEdit} disabled={saving}>{saving?<><Spinner /> Gemmer...</>:"Gem ændringer"}</Btn></div></Sheet>}
      {confirm&&<Confirm msg="Sletning fjerner selskabet og alle data. Dette kan ikke fortrydes." onYes={function(){del(confirm);}} onNo={function(){setConfirm(null);}} />}
    </div>
  );
}

function InvoicesPage(props) {
  var companies = props.companies;
  var activeId = props.activeId;
  var toast = props.toast;

  var [invoices, setInvoices] = useState([]);
  var [loading, setLoading] = useState(false);
  var [modal, setModal] = useState(false);
  var [scanning, setScanning] = useState(false);
  var [confirm, setConfirm] = useState(null);
  var [year, setYear] = useState(new Date().getFullYear());
  var [file, setFile] = useState(null);
  var [previewData, setPreviewData] = useState(null);
  var [tab, setTab] = useState("fakturaer");

  var co = companies.find(function(c) { return c.id === activeId; });
  var cur = (COUNTRIES[(co || {}).country] || {}).currency || "DKK";
  var vatRate = (co || {}).country === "DK" ? 25 : (co || {}).country === "EE" ? 22 : (co || {}).country === "CL" ? 19 : 20;
  var YEARS = [0,1,2,3,4,5].map(function(i) { return new Date().getFullYear() - i; });

  useEffect(function() {
    if(!activeId) return;
    setLoading(true);
    supabase.from("invoices").select("*").eq("company_id", activeId).eq("year", year).order("invoice_date", {ascending: false})
      .then(function(r) { setInvoices(r.data || []); setLoading(false); });
  }, [activeId, year]);

  var scanInvoice = async function() {
    if(!file) { toast("Vælg en faktura-fil"); return; }
    setScanning(true);
    try {
      var reader = new FileReader();
      var base64 = await new Promise(function(resolve, reject) {
        reader.onload = function(e) { resolve(e.target.result.split(",")[1]); };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      var isPdf = file.type === "application/pdf";
      var messages;
      if(isPdf) {
        messages = [{
          role: "user",
          content: [
            { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } },
            { type: "text", text: "Analyser denne faktura og returner KUN JSON uden markdown. Brug dette format: vendor, invoice_number, invoice_date (YYYY-MM-DD), due_date (YYYY-MM-DD), description, amount_excl_vat (tal), vat_rate (tal), vat_amount (tal), amount_incl_vat (tal), currency, category (kontorIT/software/konsulent/transport/markedsfoering/andet), notes." }
          ]
        }];
      } else {
        messages = [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: file.type, data: base64 } },
            { type: "text", text: "Analyser denne faktura og returner KUN JSON uden markdown. Brug dette format: vendor, invoice_number, invoice_date (YYYY-MM-DD), due_date (YYYY-MM-DD), description, amount_excl_vat (tal), vat_rate (tal), vat_amount (tal), amount_incl_vat (tal), currency, category (kontorIT/software/konsulent/transport/markedsfoering/andet), notes." }
          ]
        }];
      }
      var res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: "claude-opus-4-5", max_tokens: 1000, messages: messages })
      });
      var data = await res.json();
      if(data.error) throw new Error(data.error.message);
      var text = data.content[0].text;
      var parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setPreviewData(parsed);
    } catch(e) {
      toast("Scanning fejlede: " + e.message);
    }
    setScanning(false);
  };

  var saveInvoice = async function() {
    if(!previewData) return;
    var path = activeId + "/invoices/" + Date.now() + "_" + file.name;
    var upResult = await supabase.storage.from("receipts").upload(path, file, { upsert: true });
    var fileUrl = null;
    if(!upResult.error) {
      fileUrl = supabase.storage.from("receipts").getPublicUrl(path).data.publicUrl;
    }
    var entry = Object.assign({}, previewData, {
      company_id: activeId,
      year: year,
      file_url: fileUrl,
      ai_processed: true
    });
    var r = await supabase.from("invoices").insert(entry).select().single();
    if(r.error) { toast("Fejl: " + r.error.message); return; }
    setInvoices(function(p) { return [r.data].concat(p); });
    setModal(false); setFile(null); setPreviewData(null);
    toast("Faktura gemt");
  };

  var del = async function(id) {
    await supabase.from("invoices").delete().eq("id", id);
    setInvoices(function(p) { return p.filter(function(x) { return x.id !== id; }); });
    toast("Slettet"); setConfirm(null);
  };

  var totalExcl = invoices.reduce(function(s, x) { return s + Number(x.amount_excl_vat || 0); }, 0);
  var totalVat  = invoices.reduce(function(s, x) { return s + Number(x.vat_amount || 0); }, 0);
  var totalIncl = invoices.reduce(function(s, x) { return s + Number(x.amount_incl_vat || 0); }, 0);

  var fmtAmt = function(n) { return fmt(n, cur, (COUNTRIES[(co||{}).country]||{}).locale || "da-DK"); };

  var tabStyle = function(id) { return { padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: ff.ui, fontWeight: 600, fontSize: 13, background: tab === id ? ink : "transparent", color: tab === id ? "#fff" : ink3 }; };

  var byCategory = {};
  invoices.forEach(function(inv) {
    var cat = inv.category || "andet";
    if(!byCategory[cat]) byCategory[cat] = { excl: 0, vat: 0, count: 0 };
    byCategory[cat].excl += Number(inv.amount_excl_vat || 0);
    byCategory[cat].vat  += Number(inv.vat_amount || 0);
    byCategory[cat].count++;
  });

  return (
    <div className="fe">
      <SH action={<Btn onClick={function() { setModal(true); setPreviewData(null); setFile(null); }}>+ Scan faktura</Btn>}>Fakturaer & Moms</SH>

      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        {YEARS.map(function(y) {
          return <button key={y} onClick={function() { setYear(y); }} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid " + (year === y ? ink : border), background: year === y ? ink : "transparent", color: year === y ? "#fff" : ink2, fontFamily: ff.ui, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{y}</button>;
        })}
        {co && <div style={{ marginLeft: "auto", fontFamily: ff.ui, fontSize: 13, color: ink3 }}>{co.name} · Moms {vatRate}%</div>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(155px,1fr))", gap: 10, marginBottom: 20 }}>
        <StatCard label="Ekskl. moms" value={fmtAmt(totalExcl)} />
        <StatCard label="Momsbeloeb" value={fmtAmt(totalVat)} accent={gold} />
        <StatCard label="Inkl. moms" value={fmtAmt(totalIncl)} />
        <StatCard label="Antal fakturaer" value={invoices.length} />
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 16, background: bg, borderRadius: 10, padding: 4, width: "fit-content" }}>
        <button style={tabStyle("fakturaer")} onClick={function() { setTab("fakturaer"); }}>Fakturaer</button>
        <button style={tabStyle("moms")} onClick={function() { setTab("moms"); }}>Momsregnskab</button>
      </div>

      {tab === "fakturaer" && (
        <div>
          {loading && <div style={{ padding: 40, textAlign: "center" }}><Spinner /></div>}
          {!loading && invoices.length === 0 && (
            <div style={{ background: surface, border: "1px dashed " + border, borderRadius: 16, padding: 48, textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🧾</div>
              <div style={{ fontFamily: ff.display, fontSize: 18, color: ink, marginBottom: 8 }}>Ingen fakturaer for {year}</div>
              <div style={{ fontFamily: ff.ui, fontSize: 13, color: ink3, marginBottom: 20 }}>Upload en faktura som PDF eller billede — AI scanner og bogforer automatisk</div>
              <Btn onClick={function() { setModal(true); }}>+ Scan forste faktura</Btn>
            </div>
          )}
          <div style={{ background: surface, border: "1px solid " + border, borderRadius: 16, overflow: "hidden" }}>
            {invoices.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "90px 1fr 90px 100px 100px 100px 40px", padding: "10px 16px", borderBottom: "1px solid " + border, background: bg }}>
                {["Dato", "Leverandor", "Nr.", "Ekskl.", "Moms", "Inkl.", ""].map(function(h, i) {
                  return <span key={i} style={{ fontFamily: ff.ui, fontSize: 10, fontWeight: 600, color: ink3, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</span>;
                })}
              </div>
            )}
            {invoices.map(function(inv, i) {
              var cat = CATS.find(function(c) { return c.id === inv.category; });
              return (
                <div key={inv.id} className="hrow" style={{ display: "grid", gridTemplateColumns: "90px 1fr 90px 100px 100px 100px 40px", padding: "12px 16px", borderTop: i > 0 ? "1px solid " + border : "none", alignItems: "center" }}>
                  <Mono size={11} color={ink3}>{inv.invoice_date || "—"}</Mono>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: ff.ui, fontWeight: 600, fontSize: 13, color: ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inv.vendor || "Ukendt"}</div>
                    <div style={{ fontFamily: ff.ui, fontSize: 11, color: ink3 }}>{inv.description} {cat ? "· " + cat.icon + " " + cat.label : ""}</div>
                  </div>
                  <Mono size={11} color={ink3}>{inv.invoice_number || "—"}</Mono>
                  <Mono size={12}>{fmtAmt(Number(inv.amount_excl_vat || 0))}</Mono>
                  <Mono size={12} color={gold}>{fmtAmt(Number(inv.vat_amount || 0))}</Mono>
                  <Mono size={13}>{fmtAmt(Number(inv.amount_incl_vat || 0))}</Mono>
                  <div style={{ display: "flex", gap: 4 }}>
                    {inv.file_url && <a href={inv.file_url} target="_blank" rel="noreferrer" style={{ textDecoration: "none", fontSize: 14 }}>📎</a>}
                    <button onClick={function() { setConfirm(inv.id); }} style={{ background: "none", border: "1px solid " + border, color: ink3, borderRadius: 5, padding: "2px 6px", cursor: "pointer", fontSize: 10 }}>✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "moms" && (
        <div>
          <div style={{ background: surface, border: "1px solid " + border, borderRadius: 16, padding: 24, marginBottom: 16 }}>
            <div style={{ fontFamily: ff.display, fontWeight: 700, fontSize: 20, color: ink, marginBottom: 16 }}>Momsafregning {year}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ background: bg, borderRadius: 12, padding: 16 }}>
                <div style={{ fontFamily: ff.ui, fontSize: 11, fontWeight: 600, color: ink3, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Indgående moms (at betale)</div>
                <div style={{ fontFamily: ff.mono, fontSize: 24, color: "#dc2626" }}>{fmtAmt(totalVat)}</div>
                <div style={{ fontFamily: ff.ui, fontSize: 12, color: ink3, marginTop: 4 }}>Baseret pa {invoices.length} fakturaer</div>
              </div>
              <div style={{ background: bg, borderRadius: 12, padding: 16 }}>
                <div style={{ fontFamily: ff.ui, fontSize: 11, fontWeight: 600, color: ink3, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Nettokob ekskl. moms</div>
                <div style={{ fontFamily: ff.mono, fontSize: 24, color: ink }}>{fmtAmt(totalExcl)}</div>
                <div style={{ fontFamily: ff.ui, fontSize: 12, color: ink3, marginTop: 4 }}>Fradragsberettiget grundlag</div>
              </div>
            </div>
          </div>
          <Lbl>Fordeling per kategori</Lbl>
          <div style={{ background: surface, border: "1px solid " + border, borderRadius: 14, overflow: "hidden", marginTop: 8 }}>
            {Object.keys(byCategory).length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", fontFamily: ff.mono, fontSize: 13, color: ink3 }}>Ingen data</div>
            ) : Object.entries(byCategory).map(function(entry, i) {
              var catId = entry[0]; var vals = entry[1];
              var ci = CATS.find(function(c) { return c.id === catId; });
              return (
                <div key={catId} style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px 60px", padding: "12px 18px", borderTop: i > 0 ? "1px solid " + border : "none", alignItems: "center" }}>
                  <span style={{ fontFamily: ff.ui, fontSize: 13, color: ink }}>{ci ? ci.icon + " " + ci.label : catId}</span>
                  <Mono size={12}>{fmtAmt(vals.excl)}</Mono>
                  <Mono size={12} color={gold}>{fmtAmt(vals.vat)}</Mono>
                  <span style={{ fontFamily: ff.mono, fontSize: 11, color: ink3 }}>{vals.count} stk</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {modal && (
        <Sheet title="Scan faktura med AI" onClose={function() { setModal(false); setFile(null); setPreviewData(null); }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {!previewData ? (
              <>
                <div style={{ background: bg, borderRadius: 10, padding: "12px 14px", fontFamily: ff.ui, fontSize: 13, color: ink2 }}>
                  Upload en faktura som PDF eller billede. Claude laeser den og udfylder alle felter automatisk.
                </div>
                <div>
                  <Lbl>Faktura-fil</Lbl>
                  <label style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "24px", border: "1px dashed " + border, borderRadius: 9, cursor: "pointer", background: file ? gold + "08" : "transparent" }}>
                    <span style={{ fontSize: 32 }}>{file ? "✅" : "🧾"}</span>
                    <span style={{ fontFamily: ff.ui, fontSize: 13, color: file ? ink : ink3, textAlign: "center" }}>{file ? file.name : "Klik for at vaelge PDF eller billede"}</span>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={function(e) { setFile(e.target.files[0]); setPreviewData(null); }} style={{ display: "none" }} />
                  </label>
                </div>
                <Btn full onClick={scanInvoice} disabled={scanning || !file}>
                  {scanning ? <><Spinner /> Scanner med AI…</> : "Scan faktura"}
                </Btn>
              </>
            ) : (
              <>
                <div style={{ background: gold + "10", border: "1px solid " + gold + "30", borderRadius: 10, padding: "12px 14px", fontFamily: ff.ui, fontSize: 13, color: ink2 }}>
                  AI har scannet fakturaen. Tjek og ret om nodvendigt.
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <Field label="Leverandor"><input value={previewData.vendor || ""} onChange={function(e) { setPreviewData(Object.assign({}, previewData, { vendor: e.target.value })); }} /></Field>
                  <Field label="Fakturanummer"><input value={previewData.invoice_number || ""} onChange={function(e) { setPreviewData(Object.assign({}, previewData, { invoice_number: e.target.value })); }} /></Field>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <Field label="Fakturadato"><input type="date" value={previewData.invoice_date || ""} onChange={function(e) { setPreviewData(Object.assign({}, previewData, { invoice_date: e.target.value })); }} /></Field>
                  <Field label="Forfaldsdato"><input type="date" value={previewData.due_date || ""} onChange={function(e) { setPreviewData(Object.assign({}, previewData, { due_date: e.target.value })); }} /></Field>
                </div>
                <Field label="Beskrivelse"><input value={previewData.description || ""} onChange={function(e) { setPreviewData(Object.assign({}, previewData, { description: e.target.value })); }} /></Field>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  <Field label="Ekskl. moms"><input type="number" value={previewData.amount_excl_vat || ""} onChange={function(e) { var excl = Number(e.target.value); var vat = excl * (previewData.vat_rate || vatRate) / 100; setPreviewData(Object.assign({}, previewData, { amount_excl_vat: excl, vat_amount: Math.round(vat * 100) / 100, amount_incl_vat: Math.round((excl + vat) * 100) / 100 })); }} /></Field>
                  <Field label={"Moms (" + (previewData.vat_rate || vatRate) + "%)"}><input type="number" value={previewData.vat_amount || ""} onChange={function(e) { setPreviewData(Object.assign({}, previewData, { vat_amount: Number(e.target.value) })); }} /></Field>
                  <Field label="Inkl. moms"><input type="number" value={previewData.amount_incl_vat || ""} onChange={function(e) { setPreviewData(Object.assign({}, previewData, { amount_incl_vat: Number(e.target.value) })); }} /></Field>
                </div>
                <Field label="Kategori">
                  <select value={previewData.category || "andet"} onChange={function(e) { setPreviewData(Object.assign({}, previewData, { category: e.target.value })); }}>
                    {CATS.map(function(c) { return <option key={c.id} value={c.id}>{c.icon} {c.label}</option>; })}
                  </select>
                </Field>
                <div style={{ display: "flex", gap: 10 }}>
                  <Btn full onClick={saveInvoice}>Gem faktura</Btn>
                  <Btn full variant="outline" onClick={function() { setPreviewData(null); }}>Scan igen</Btn>
                </div>
              </>
            )}
          </div>
        </Sheet>
      )}
      {confirm && <Confirm msg="Vil du slette denne faktura?" onYes={function() { del(confirm); }} onNo={function() { setConfirm(null); }} />}
    </div>
  );
}


const NAV=[
  {id:"dashboard",label:"Oversigt",icon:"◈"},
  {id:"udgifter",label:"Udgifter",icon:"◻"},
  {id:"rejse",label:"Rejse",icon:"✈"},
  {id:"korsel",label:"Kørsel",icon:"○"},
  {id:"valuta",label:"Valuta",icon:"⟳"},
  {id:"fakturaer",label:"Fakturaer & Moms",icon:"🧾"},{id:"bilag",label:"Bilagsmappe",icon:"📂"},
  {id:"skat",label:"Skat & AI",icon:"🧮"},
  {id:"rapporter",label:"Rapport",icon:"≡"},
  {id:"indstillinger",label:"Selskaber",icon:"◇"},
];

const BOTTOM_NAV=[
  {id:"dashboard",label:"Oversigt",icon:"◈"},
  {id:"udgifter",label:"Udgifter",icon:"◻"},
  {id:"skat",label:"Skat & AI",icon:"🧮"},
  {id:"fakturaer",label:"Fakturaer",icon:"🧾"},
  {id:"indstillinger",label:"Mere",icon:"◇"},
];

export default function App() {
  var [companies,setCompanies]=useState([]);
  var [expenses,setExpenses]=useState([]);
  var [travels,setTravels]=useState([]);
  var [kmEntries,setKmEntries]=useState([]);
  var [fx,setFx]=useState(DEFAULT_FX);
  var [activeId,setActiveId]=useState(null);
  var [page,setPage]=useState("dashboard");
  var [sideOpen,setSideOpen]=useState(false);
  var [toast,setToast]=useState(null);
  var [loading,setLoading]=useState(true);
  var showToast=function(m){setToast(m);};
  var goPage=function(id){setPage(id);setSideOpen(false);};
  useEffect(function(){
    var load=async function(){
      setLoading(true);
      var results=await Promise.all([
        supabase.from("companies").select("*").order("created_at"),
        supabase.from("expenses").select("*").order("date",{ascending:false}),
        supabase.from("travels").select("*").order("from_date",{ascending:false}),
        supabase.from("km_entries").select("*").order("date",{ascending:false}),
      ]);
      if(results[0].data){setCompanies(results[0].data);if(results[0].data.length)setActiveId(results[0].data[0].id);}
      if(results[1].data)setExpenses(results[1].data);
      if(results[2].data)setTravels(results[2].data);
      if(results[3].data)setKmEntries(results[3].data);
      setLoading(false);
    };
    load();
  },[]);
  var co=companies.find(function(c){return c.id===activeId;})||companies[0];
  var coExp=expenses.filter(function(e){return e.company_id===activeId;});
  var coTrv=travels.filter(function(t){return t.company_id===activeId;});
  var coKm=kmEntries.filter(function(k){return k.company_id===activeId;});
  var hour=new Date().getHours();
  var greeting=hour<12?"God morgen":hour<17?"God eftermiddag":"God aften";
  if(loading) return (<><style>{G}</style><div style={{height:"100dvh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,background:bg}}><Spinner /><div style={{fontFamily:ff.display,fontSize:18,fontStyle:"italic",color:ink3}}>Indlæser data...</div></div></>);
  return (
    <>
      <style>{G}</style>
      <style>{"@media(max-width:767px){#sidebar{position:fixed!important;top:0;bottom:0;left:0;z-index:201;transform:"+(sideOpen?"translateX(0)":"translateX(-100%)")+";transition:transform .25s cubic-bezier(.4,0,.2,1);}}"}</style>
      <style>{"@media(max-width:767px){#hambtn{display:flex!important}}"}</style>
      <style>{"@media(min-width:768px){#bnav{display:none!important}}"}</style>
      <div style={{display:"flex",height:"100dvh",overflow:"hidden"}}>
        {sideOpen&&<div onClick={function(){setSideOpen(false);}} style={{position:"fixed",inset:0,background:"rgba(28,26,23,.4)",zIndex:200}} className="mobile-only" />}
        <aside id="sidebar" style={{width:252,flexShrink:0,background:sideInk,display:"flex",flexDirection:"column"}}>
          <div style={{padding:"22px 20px 14px",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
            <div style={{fontFamily:ff.display,fontWeight:700,fontSize:18,color:"#fff"}}>Regnskab</div>
            <div style={{fontFamily:ff.mono,fontSize:9,color:"rgba(255,255,255,.2)",marginTop:2,letterSpacing:"0.12em",textTransform:"uppercase"}}>Portfolio Manager</div>
          </div>
          <div style={{padding:"12px 10px 8px",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
            <div style={{fontFamily:ff.ui,fontSize:9,fontWeight:600,color:"rgba(255,255,255,.22)",textTransform:"uppercase",letterSpacing:"0.12em",padding:"0 6px",marginBottom:6}}>Aktiv konto</div>
            <div style={{maxHeight:196,overflowY:"auto",display:"flex",flexDirection:"column",gap:2}}>
              {companies.map(function(c){
                return (
                  <button key={c.id} onClick={function(){setActiveId(c.id);setSideOpen(false);}} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:10,background:activeId===c.id?"hsl("+c.hue+",22%,20%)":"transparent",border:"1px solid "+(activeId===c.id?"hsl("+c.hue+",28%,30%)":"transparent"),cursor:"pointer",width:"100%",textAlign:"left"}}>
                    <div style={{width:28,height:28,borderRadius:7,background:"hsl("+c.hue+",25%,24%)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"hsl("+c.hue+",55%,68%)",flexShrink:0,fontFamily:ff.ui}}>{c.initials}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:ff.ui,fontSize:12,fontWeight:600,color:activeId===c.id?"#fff":"rgba(255,255,255,.45)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
                      <div style={{fontFamily:ff.mono,fontSize:9,color:"rgba(255,255,255,.2)"}}>{(COUNTRIES[c.country]||{}).flag} {c.type}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <nav style={{padding:"10px",flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:2}}>
            {NAV.map(function(n){
              return <button key={n.id} onClick={function(){goPage(n.id);}} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:10,background:page===n.id?"rgba(255,255,255,.09)":"transparent",border:"none",color:page===n.id?"#fff":"rgba(255,255,255,.33)",cursor:"pointer",width:"100%",fontFamily:ff.ui,fontWeight:page===n.id?600:400,fontSize:14,textAlign:"left"}}><span style={{width:18,textAlign:"center",fontSize:14}}>{n.icon}</span>{n.label}</button>;
            })}
          </nav>
          <div style={{padding:"12px 16px",borderTop:"1px solid rgba(255,255,255,.06)"}}><div style={{fontFamily:ff.mono,fontSize:9,color:"rgba(255,255,255,.1)",textAlign:"center",textTransform:"uppercase"}}>André Universe - {new Date().getFullYear()}</div></div>
        </aside>
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
          <header style={{height:54,display:"flex",alignItems:"center",gap:12,padding:"0 20px",borderBottom:"1px solid "+border,background:surface,flexShrink:0}}>
            <button id="hambtn" onClick={function(){setSideOpen(function(o){return !o;});}} style={{display:"none",background:"none",border:"1px solid "+border,borderRadius:8,width:34,height:34,cursor:"pointer",fontSize:16,color:ink,alignItems:"center",justifyContent:"center",flexShrink:0}}>☰</button>
            <div style={{flex:1}}>
              {page==="dashboard"
                ?<span style={{fontFamily:ff.display,fontSize:16,fontStyle:"italic",color:ink}}>{greeting}</span>
                :<span style={{fontFamily:ff.ui,fontSize:14,fontWeight:500,color:ink2}}><span style={{color:ink3}}>{co?co.name:""} - </span>{(NAV.find(function(n){return n.id===page;})||{}).label}</span>
              }
            </div>
            <Mono size={11} color={ink3}>{new Date().toLocaleDateString("da-DK",{weekday:"short",day:"numeric",month:"short"})}</Mono>
          </header>
          <main style={{flex:1,overflowY:"auto",padding:"clamp(14px,4vw,30px)",paddingBottom:"clamp(80px,12vw,30px)"}}>
            {page==="dashboard"&&<Dashboard companies={companies} expenses={expenses} travels={travels} kmEntries={kmEntries} fx={fx} />}
            {page==="udgifter"&&co&&<Expenses co={co} expenses={coExp} fx={fx} onAdd={function(e){setExpenses(function(p){return [e].concat(p);});}} onDelete={function(id){setExpenses(function(p){return p.filter(function(e){return e.id!==id;});});}} toast={showToast} />}
            {page==="rejse"&&co&&<Travel co={co} travels={coTrv} onAdd={function(t){setTravels(function(p){return [t].concat(p);});}} onDelete={function(id){setTravels(function(p){return p.filter(function(t){return t.id!==id;});});}} toast={showToast} />}
            {page==="korsel"&&co&&<Mileage co={co} kmEntries={coKm} onAdd={function(k){setKmEntries(function(p){return [k].concat(p);});}} onDelete={function(id){setKmEntries(function(p){return p.filter(function(k){return k.id!==id;});});}} toast={showToast} />}
            {page==="valuta"&&<CurrencyPage fx={fx} onSaveFx={setFx} toast={showToast} />}
            {page==="fakturaer"&&<InvoicesPage companies={companies} activeId={activeId} toast={showToast} />}
            {page==="bilag"&&<DocumentsPage companies={companies} activeId={activeId} toast={showToast} />}
            {page==="skat"&&<SkatPage companies={companies} expenses={expenses} travels={travels} kmEntries={kmEntries} fx={fx} />}
            {page==="rapporter"&&<ReportPage companies={companies} expenses={expenses} travels={travels} kmEntries={kmEntries} fx={fx} />}
            {page==="indstillinger"&&<SettingsPage companies={companies} onAdd={function(c){setCompanies(function(p){return p.concat([c]);});}} onUpdate={function(c){setCompanies(function(p){return p.map(function(x){return x.id===c.id?c:x;});});}} onDelete={function(id){setCompanies(function(p){return p.filter(function(c){return c.id!==id;});});if(activeId===id)setActiveId((companies.find(function(c){return c.id!==id;})||{}).id||null);}} toast={showToast} />}
          </main>
          <nav id="bnav" style={{display:"flex",position:"fixed",bottom:0,left:0,right:0,background:surface,borderTop:"1px solid "+border,height:60,zIndex:100}}>
            {BOTTOM_NAV.map(function(n){
              return (
                <button key={n.id} onClick={function(){setPage(n.id);}} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,background:"none",border:"none",cursor:"pointer",color:page===n.id?ink:ink3,position:"relative"}}>
                  {page===n.id&&<div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:24,height:2,background:gold,borderRadius:"0 0 2px 2px"}} />}
                  <span style={{fontSize:14,lineHeight:1}}>{n.icon}</span>
                  <span style={{fontFamily:ff.ui,fontSize:10,fontWeight:page===n.id?600:400}}>{n.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
      {toast&&<Toast msg={toast} onDone={function(){setToast(null);}} />}
    </>
  );
}