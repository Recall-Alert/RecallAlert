import { useState, useMemo } from "react";

const MOCK_RECALLS = [
  { id:1, recall_number:"F-2025-0042", recalling_firm:"Sunshine Foods Co.", classification:"Class I", category:"food", reason_for_recall:"Undeclared peanut allergen not listed on label. Consumers with peanut allergies are at risk of serious allergic reaction including anaphylaxis.", product_description:"Sunshine Granola Bars, Chocolate Chip Flavor, 12oz box.", code_info:"Best By 01/2026 through 06/2026, Lot codes SFC-2024-A through SFC-2024-F", distribution_pattern:"Nationwide via Walmart, Target, Kroger and online retailers.", product_quantity:"45,000 units", status:"Ongoing", voluntary_mandated:"Voluntary", city:"Chicago", state:"IL", country:"US", recall_initiation_date:"20250112", report_date:"20250115", termination_date:null },
  { id:2, recall_number:"F-2025-0041", recalling_firm:"Valley Fresh Produce", classification:"Class I", category:"food", reason_for_recall:"Potential Listeria monocytogenes contamination detected during routine testing. Serious illness risk for pregnant women and elderly.", product_description:"Ready-to-eat Romaine Salad Mix, 10oz bags.", code_info:"Use-by Jan 8-22 2025. Plant code: VFP-CA", distribution_pattern:"California, Oregon, Washington, Nevada, and Arizona.", product_quantity:"128,000 units", status:"Ongoing", voluntary_mandated:"Voluntary", city:"Fresno", state:"CA", country:"US", recall_initiation_date:"20250108", report_date:"20250110", termination_date:null },
  { id:3, recall_number:"F-2025-0039", recalling_firm:"Great Lakes Dairy Inc.", classification:"Class II", category:"food", reason_for_recall:"Products may contain small pieces of blue plastic packaging material.", product_description:"Great Lakes Whole Milk Yogurt, Plain and Vanilla, 32oz containers.", code_info:"Lot codes GL-24-289 through GL-24-301.", distribution_pattern:"Michigan, Ohio, Indiana, Illinois, and Wisconsin.", product_quantity:"23,500 units", status:"Terminated", voluntary_mandated:"Voluntary", city:"Detroit", state:"MI", country:"US", recall_initiation_date:"20241228", report_date:"20241230", termination_date:"20250115" },
  { id:4, recall_number:"F-2025-0038", recalling_firm:"Rio Grande Salsa Co.", classification:"Class I", category:"food", reason_for_recall:"Undeclared sulfites exceeding safe limits. May cause difficulty breathing or anaphylaxis in sensitive individuals.", product_description:"Rio Grande Roasted Tomato Salsa, Medium Heat, 16oz glass jars.", code_info:"Lot numbers RGS-2024-44 through RGS-2024-48.", distribution_pattern:"Texas, New Mexico, Arizona, Colorado. Also sold on Amazon.", product_quantity:"67,200 jars", status:"Ongoing", voluntary_mandated:"Voluntary", city:"San Antonio", state:"TX", country:"US", recall_initiation_date:"20250105", report_date:"20250107", termination_date:null },
  { id:5, recall_number:"F-2025-0035", recalling_firm:"Pacific Seafood Group", classification:"Class I", category:"food", reason_for_recall:"Elevated histamine levels detected. Can cause scombroid food poisoning including rash, headache, and vomiting.", product_description:"Wild-caught Yellowfin Tuna Steaks, frozen, 1lb vacuum packs.", code_info:"Lot codes PSG-4451 through PSG-4460.", distribution_pattern:"Nationwide. Whole Foods, Sprouts, independent fish markets.", product_quantity:"12,800 units", status:"Ongoing", voluntary_mandated:"Voluntary", city:"Portland", state:"OR", country:"US", recall_initiation_date:"20250103", report_date:"20250106", termination_date:null },
  { id:6, recall_number:"D-2025-0021", recalling_firm:"MediPharm Solutions", classification:"Class I", category:"drug", reason_for_recall:"Tablets contain 40% more active ingredient than labeled dose. Overdose risk including serious cardiovascular complications.", product_description:"Metoprolol Succinate Extended-Release Tablets 50mg, 90-count bottles.", code_info:"Lot numbers MP2024-001 through MP2024-015. Expiry 08/2026.", distribution_pattern:"Retail pharmacies nationwide including CVS, Walgreens, and Rite Aid.", product_quantity:"1,200,000 tablets", status:"Ongoing", voluntary_mandated:"Voluntary", city:"Princeton", state:"NJ", country:"US", recall_initiation_date:"20250110", report_date:"20250113", termination_date:null },
  { id:7, recall_number:"D-2025-0019", recalling_firm:"GeneriCo Pharma", classification:"Class II", category:"drug", reason_for_recall:"Failed dissolution testing. Tablets may not dissolve properly, reducing effectiveness for patients.", product_description:"Atorvastatin Calcium Tablets, 20mg and 40mg, 30 and 90-count bottles.", code_info:"Lot codes GCP-2024-88 through GCP-2024-95.", distribution_pattern:"Wholesale distributors and pharmacies in all 50 states.", product_quantity:"4,500,000 tablets", status:"Ongoing", voluntary_mandated:"Voluntary", city:"Parsippany", state:"NJ", country:"US", recall_initiation_date:"20250108", report_date:"20250110", termination_date:null },
  { id:8, recall_number:"D-2025-0017", recalling_firm:"Apex Laboratories", classification:"Class I", category:"drug", reason_for_recall:"Microbial contamination detected in injectable product. Administration may cause serious life-threatening infection.", product_description:"Sodium Chloride Injection 0.9%, 1000mL IV bags for intravenous use.", code_info:"Lot numbers APX-IV-2024-330 through APX-IV-2024-345.", distribution_pattern:"Hospitals and healthcare facilities in 38 states.", product_quantity:"85,000 units", status:"Ongoing", voluntary_mandated:"Voluntary", city:"Baltimore", state:"MD", country:"US", recall_initiation_date:"20250104", report_date:"20250107", termination_date:null },
  { id:9, recall_number:"D-2025-0014", recalling_firm:"Tylenol Consumer Healthcare", classification:"Class III", category:"drug", reason_for_recall:"Labeling error on Spanish language insert with incorrect dosing instructions. English label is correct. No adverse events reported.", product_description:"Tylenol Regular Strength Tablets 325mg, 100-count bilingual packaging.", code_info:"Lot code TCH-2024-US-441.", distribution_pattern:"Select retailers in Florida, Texas, California, and New York.", product_quantity:"320,000 bottles", status:"Terminated", voluntary_mandated:"Voluntary", city:"Fort Washington", state:"PA", country:"US", recall_initiation_date:"20241220", report_date:"20241222", termination_date:"20250108" },
  { id:10, recall_number:"DV-2025-0031", recalling_firm:"CardioTech Medical Devices", classification:"Class I", category:"device", reason_for_recall:"Software error may cause pacemaker to deliver incorrect pacing pulses. Risk of serious injury or death.", product_description:"Model CT-7000 Implantable Cardiac Pacemaker, all units made Jan-Oct 2024.", code_info:"Serial numbers CT7-240001 through CT7-248750.", distribution_pattern:"Cardiac centers and hospitals in all 50 states and Canada.", product_quantity:"8,750 devices", status:"Ongoing", voluntary_mandated:"Voluntary", city:"Minneapolis", state:"MN", country:"US", recall_initiation_date:"20250111", report_date:"20250114", termination_date:null },
  { id:11, recall_number:"DV-2025-0028", recalling_firm:"SurgiPro Instruments", classification:"Class II", category:"device", reason_for_recall:"Sterilization packaging may have been compromised during shipping, potentially contaminating sterile surgical instruments.", product_description:"SurgiPro Laparoscopic Instrument Set, 5-piece stainless steel.", code_info:"Lot numbers SP-2024-L-180 through SP-2024-L-210.", distribution_pattern:"Surgical centers and hospitals in 22 states.", product_quantity:"14,200 sets", status:"Ongoing", voluntary_mandated:"Voluntary", city:"Boston", state:"MA", country:"US", recall_initiation_date:"20250106", report_date:"20250109", termination_date:null },
  { id:12, recall_number:"DV-2025-0025", recalling_firm:"GlucoSense Diagnostics", classification:"Class II", category:"device", reason_for_recall:"Blood glucose readings may be inaccurate by up to 20% in cold temperatures, leading to improper insulin dosing.", product_description:"GlucoSense Platinum Blood Glucose Monitor Model GS-3000 with test strips.", code_info:"Monitor serial numbers GS30-2024-00001 through GS30-2024-35000.", distribution_pattern:"Nationwide pharmacy chains and diabetes supply distributors.", product_quantity:"35,000 monitors and 2,100,000 test strips", status:"Ongoing", voluntary_mandated:"Voluntary", city:"San Diego", state:"CA", country:"US", recall_initiation_date:"20250102", report_date:"20250105", termination_date:null },
];

const CATS = [
  { id:"food",   label:"Food",    icon:"🥫", color:"#FF6B35" },
  { id:"drug",   label:"Drugs",   icon:"💊", color:"#3B82F6" },
  { id:"device", label:"Devices", icon:"🩺", color:"#8B5CF6" },
];
const CM = {
  "Class I":   { badge:"#FF4444", bg:"#FFF0F0", txt:"#CC0000", label:"High Risk"  },
  "Class II":  { badge:"#F97316", bg:"#FFF7ED", txt:"#C2410C", label:"Moderate"   },
  "Class III": { badge:"#3B82F6", bg:"#EFF6FF", txt:"#1D4ED8", label:"Low Risk"   },
};
const cm = c => CM[c] || { badge:"#999", bg:"#f5f5f5", txt:"#666", label:"Unknown" };

function fmt(s) {
  if (!s) return "-";
  try { return new Date(`${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}`).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}); }
  catch { return s; }
}
function ago(s) {
  if (!s) return "";
  try {
    const d = Math.floor((Date.now() - new Date(`${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}`).getTime()) / 86400000);
    if (d<1) return "Today"; if (d===1) return "Yesterday";
    if (d<30) return `${d}d ago`; if (d<365) return `${Math.floor(d/30)}mo ago`;
    return `${Math.floor(d/365)}y ago`;
  } catch { return ""; }
}

function Modal({ r, onClose }) {
  if (!r) return null;
  const m = cm(r.classification);
  const c = CATS.find(x => x.id === r.category);
  const fields = [
    ["Recalling Firm", r.recalling_firm],["Classification", `${r.classification} - ${m.label}`],
    ["Category", `${c?.icon} ${c?.label}`],["Status", r.status],
    ["Product Description", r.product_description],["Reason for Recall", r.reason_for_recall],
    ["Code Info / Lot Numbers", r.code_info],["Quantity Recalled", r.product_quantity],
    ["Distribution Pattern", r.distribution_pattern],
    ["Location", [r.city,r.state,r.country].filter(Boolean).join(", ")],
    ["Recall Initiated", fmt(r.recall_initiation_date)],["Report Date", fmt(r.report_date)],
    ["Termination", r.termination_date ? fmt(r.termination_date) : "Active"],
    ["Recall Number", r.recall_number],
  ].filter(([,v]) => v);
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(6,13,31,.82)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(6px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:20,width:"100%",maxWidth:660,maxHeight:"90vh",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:"0 32px 80px rgba(0,0,0,.4)"}}>
        <div style={{padding:"20px 24px 16px",borderBottom:"1px solid #E8ECF4",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
          <div>
            <div style={{display:"flex",gap:7,marginBottom:9,flexWrap:"wrap"}}>
              <span style={{fontWeight:800,fontSize:11,textTransform:"uppercase",letterSpacing:".08em",background:m.bg,color:m.txt,border:`1px solid ${m.badge}44`,borderRadius:6,padding:"3px 11px"}}>{r.classification} - {m.label}</span>
              <span style={{fontSize:12,color:"#8A9BB8"}}>{c?.icon} {c?.label}</span>
            </div>
            <div style={{fontWeight:800,fontSize:20,color:"#0A0F1E",lineHeight:1.3}}>{r.recalling_firm}</div>
          </div>
          <button onClick={onClose} style={{border:"none",background:"#F4F6FA",borderRadius:9,width:34,height:34,cursor:"pointer",fontSize:20,display:"flex",alignItems:"center",justifyContent:"center",color:"#8A9BB8",flexShrink:0}}>x</button>
        </div>
        <div style={{overflowY:"auto",padding:"18px 24px 28px"}}>
          <div style={{display:"grid",gap:14}}>
            {fields.map(([label,val]) => (
              <div key={label} style={{borderBottom:"1px solid #F4F6FA",paddingBottom:12}}>
                <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".09em",color:"#C5D0E0",marginBottom:4}}>{label}</div>
                <div style={{fontSize:14,color:"#0A0F1E",lineHeight:1.65}}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmailWidget() {
  const [email,setEmail] = useState(""), [pref,setPref] = useState("all"), [freq,setFreq] = useState("weekly");
  const [done,setDone] = useState(false), [busy,setBusy] = useState(false);
  const go = () => { if (!email.includes("@")) return; setBusy(true); setTimeout(()=>{setBusy(false);setDone(true);},1000); };
  if (done) return (
    <div style={{background:"linear-gradient(145deg,#060D1F,#0D1B35)",borderRadius:16,padding:"28px 20px",textAlign:"center",color:"#fff"}}>
      <div style={{fontSize:38,marginBottom:10}}>✅</div>
      <div style={{fontWeight:800,fontSize:18,marginBottom:6}}>You are subscribed!</div>
      <div style={{color:"#8A9BB8",fontSize:13,lineHeight:1.6}}>FDA recall alerts coming to your inbox.</div>
    </div>
  );
  return (
    <div style={{background:"linear-gradient(145deg,#060D1F,#0D1B35)",borderRadius:16,padding:"20px",color:"#fff"}}>
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:14}}>
        <div style={{width:34,height:34,background:"rgba(255,68,68,.15)",border:"1px solid rgba(255,68,68,.3)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🔔</div>
        <div><div style={{fontWeight:800,fontSize:15}}>Free Recall Alerts</div><div style={{color:"#8A9BB8",fontSize:11,marginTop:1}}>14,200+ subscribers</div></div>
      </div>
      <p style={{color:"#8A9BB8",fontSize:12,lineHeight:1.6,marginBottom:14}}>Get notified the moment a recall drops before it hits the news.</p>
      <div style={{marginBottom:11}}>
        <div style={{fontSize:10,fontWeight:700,color:"#8A9BB8",textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>Category</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
          {["all","food","drug","device"].map(o=>(
            <button key={o} onClick={()=>setPref(o)} style={{border:`1px solid ${pref===o?"#FF4444":"rgba(255,255,255,.12)"}`,background:pref===o?"rgba(255,68,68,.15)":"transparent",color:pref===o?"#FF8888":"rgba(255,255,255,.4)",borderRadius:7,padding:"4px 10px",cursor:"pointer",fontSize:11,fontWeight:600}}>
              {o==="all"?"All":o.charAt(0).toUpperCase()+o.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div style={{marginBottom:13}}>
        <div style={{fontSize:10,fontWeight:700,color:"#8A9BB8",textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>Frequency</div>
        <div style={{display:"flex",gap:5}}>
          {["instant","daily","weekly"].map(o=>(
            <button key={o} onClick={()=>setFreq(o)} style={{border:`1px solid ${freq===o?"#FF4444":"rgba(255,255,255,.12)"}`,background:freq===o?"rgba(255,68,68,.15)":"transparent",color:freq===o?"#FF8888":"rgba(255,255,255,.4)",borderRadius:7,padding:"4px 10px",cursor:"pointer",fontSize:11,fontWeight:600}}>
              {o.charAt(0).toUpperCase()+o.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <input type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} style={{width:"100%",padding:"11px 13px",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.12)",borderRadius:9,color:"#fff",fontSize:13,marginBottom:8,outline:"none",boxSizing:"border-box"}}/>
      <button onClick={go} disabled={busy} style={{width:"100%",padding:"12px",background:"#FF4444",color:"#fff",border:"none",borderRadius:9,cursor:"pointer",fontWeight:800,fontSize:14,opacity:busy?.7:1}}>
        {busy?"Subscribing...":"Get Free Alerts"}
      </button>
      <div style={{textAlign:"center",marginTop:8,fontSize:10,color:"rgba(255,255,255,.2)"}}>No spam. Unsubscribe anytime.</div>
    </div>
  );
}

export default function Home() {
  const [q,setQ] = useState(""), [cat,setCat] = useState("food"), [cls,setCls] = useState("all"), [sel,setSel] = useState(null);
  const results = useMemo(() => MOCK_RECALLS.filter(r => {
    if (r.category !== cat) return false;
    if (cls !== "all" && r.classification !== cls) return false;
    if (q.trim()) {
      const s = q.toLowerCase();
      return r.recalling_firm.toLowerCase().includes(s) || r.reason_for_recall.toLowerCase().includes(s) || r.product_description.toLowerCase().includes(s) || r.recall_number.toLowerCase().includes(s);
    }
    return true;
  }), [q, cat, cls]);
  const counts = { food:MOCK_RECALLS.filter(r=>r.category==="food").length, drug:MOCK_RECALLS.filter(r=>r.category==="drug").length, device:MOCK_RECALLS.filter(r=>r.category==="device").length };
  return (
    <div style={{minHeight:"100vh",background:"#F4F6FA",fontFamily:"system-ui,sans-serif"}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}input:focus{outline:2px solid #FF4444!important}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#ddd;border-radius:4px}`}</style>
      <nav style={{background:"#060D1F",padding:"0 24px",height:54,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:99}}>
        <div style={{display:"flex",alignItems:"center",gap:11}}>
          <svg width="30" height="30" viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="9" fill="#FF4444"/><circle cx="20" cy="22" r="12" stroke="white" strokeWidth="1.5" strokeDasharray="3 3" opacity=".3"/><ellipse cx="20" cy="22" rx="12" ry="5.5" stroke="white" strokeWidth="1.8" fill="none"/><circle cx="20" cy="22" r="3.5" fill="white" opacity=".95"/><circle cx="20" cy="22" r="1.8" fill="#FF4444"/><line x1="20" y1="6" x2="20" y2="10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
          <div>
            <div style={{fontWeight:800,color:"#fff",fontSize:18}}>RecallAlert</div>
            <div style={{fontSize:9,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:"#8A9BB8",lineHeight:1}}>FDA Recall Intelligence</div>
          </div>
        </div>
      </nav>
      <div style={{background:"linear-gradient(160deg,#060D1F 0%,#1a2f4a 55%,#060D1F 100%)",padding:"50px 20px 44px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle,rgba(255,68,68,.07) 1px,transparent 1px)",backgroundSize:"36px 36px",pointerEvents:"none"}}/>
        <div style={{maxWidth:700,margin:"0 auto",textAlign:"center",position:"relative"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(255,68,68,.12)",border:"1px solid rgba(255,68,68,.28)",borderRadius:30,padding:"5px 16px",marginBottom:22}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:"#FF4444",display:"inline-block",animation:"pulse 2s infinite"}}/>
            <span style={{fontSize:11,fontWeight:700,color:"#FF8888",letterSpacing:".08em",textTransform:"uppercase"}}>Live FDA Data - Updated Every 6 Hours</span>
          </div>
          <h1 style={{fontSize:46,fontWeight:800,color:"#fff",lineHeight:1.1,marginBottom:16,letterSpacing:"-.025em"}}>The Fastest Way to Find<br/><span style={{color:"#FF4444"}}>FDA Recalls</span></h1>
          <p style={{color:"#8A9BB8",fontSize:16,lineHeight:1.65,marginBottom:32,maxWidth:480,marginLeft:"auto",marginRight:"auto"}}>Search 80,000+ food, drug, and device recalls instantly. Plain English. No government maze.</p>
          <div style={{position:"relative",maxWidth:560,margin:"0 auto 22px"}}>
            <span style={{position:"absolute",left:15,top:"50%",transform:"translateY(-50%)",fontSize:16,pointerEvents:"none"}}>🔍</span>
            <input type="text" placeholder="Search brand, product, company, or ingredient..." value={q} onChange={e=>setQ(e.target.value)} style={{width:"100%",padding:"14px 44px 14px 44px",fontSize:15,background:"rgba(255,255,255,.08)",border:"1.5px solid rgba(255,255,255,.18)",borderRadius:12,color:"#fff"}}/>
            {q&&<button onClick={()=>setQ("")} style={{position:"absolute",right:13,top:"50%",transform:"translateY(-50%)",border:"none",background:"transparent",color:"rgba(255,255,255,.45)",cursor:"pointer",fontSize:20,lineHeight:1}}>x</button>}
          </div>
          <div style={{display:"flex",gap:9,justifyContent:"center",flexWrap:"wrap"}}>
            {CATS.map(c=><button key={c.id} onClick={()=>{setCat(c.id);setCls("all");setQ("");}} style={{border:`1.5px solid ${cat===c.id?c.color:"rgba(255,255,255,.12)"}`,background:cat===c.id?c.color+"22":"transparent",color:cat===c.id?"#fff":"rgba(255,255,255,.45)",borderRadius:10,padding:"9px 20px",cursor:"pointer",fontWeight:700,fontSize:14,transition:"all .15s",display:"flex",alignItems:"center",gap:7}}>{c.icon} {c.label}</button>)}
          </div>
        </div>
      </div>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"26px 20px 60px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24}}>
          {[{l:"Food Recalls",v:counts.food,c:"#FF6B35"},{l:"Drug Recalls",v:counts.drug,c:"#3B82F6"},{l:"Device Recalls",v:counts.device,c:"#8B5CF6"},{l:"Auto-Synced",v:"6hr",c:"#2CB67D"}].map(s=>(
            <div key={s.l} style={{background:"#fff",border:"1px solid #E8ECF4",borderRadius:12,padding:"14px 16px",textAlign:"center"}}>
              <div style={{fontSize:22,fontWeight:800,color:s.c}}>{typeof s.v==="number"?s.v.toLocaleString():s.v}</div>
              <div style={{fontSize:10,color:"#8A9BB8",marginTop:3,fontWeight:600,textTransform:"uppercase",letterSpacing:".06em"}}>{s.l}</div>
            </div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:22}}>
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:8}}>
              <div style={{fontWeight:700,color:"#0A0F1E",fontSize:14}}>{results.length} recall{results.length!==1?"s":""}{q&&<span style={{fontWeight:400,color:"#8A9BB8"}}> matching "{q}"</span>}</div>
              <div style={{display:"flex",gap:5}}>
                {["all","Class I","Class II","Class III"].map(c=>(
                  <button key={c} onClick={()=>setCls(c)} style={{border:`1px solid ${cls===c?"#0A0F1E":"#E8ECF4"}`,background:cls===c?"#0A0F1E":"#fff",color:cls===c?"#fff":"#8A9BB8",borderRadius:7,padding:"5px 10px",cursor:"pointer",fontSize:11,fontWeight:700}}>
                    {c==="all"?"All Classes":c}
                  </button>
                ))}
              </div>
            </div>
            {results.length===0?(
              <div style={{background:"#fff",border:"1px solid #E8ECF4",borderRadius:14,padding:"48px",textAlign:"center"}}>
                <div style={{fontSize:36,marginBottom:12}}>🔍</div>
                <div style={{fontWeight:700,color:"#0A0F1E",marginBottom:6,fontSize:16}}>No recalls found</div>
                <div style={{color:"#8A9BB8",fontSize:14}}>Try searching peanut, listeria, Tylenol, or pacemaker</div>
              </div>
            ):(
              <div style={{display:"grid",gap:11}}>
                {results.map(r=>{
                  const m=cm(r.classification); const c=CATS.find(x=>x.id===r.category);
                  return(
                    <div key={r.id} onClick={()=>setSel(r)} style={{background:"#fff",border:"1px solid #E8ECF4",borderLeft:`3px solid ${m.badge}`,borderRadius:14,padding:"16px 18px",cursor:"pointer",transition:"all .18s"}} onMouseEnter={e=>{e.currentTarget.style.boxShadow=`0 6px 22px ${m.badge}22`;e.currentTarget.style.transform="translateY(-2px)";}} onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="none";}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:8,flexWrap:"wrap"}}>
                            <span style={{fontSize:10,fontWeight:800,letterSpacing:".08em",textTransform:"uppercase",background:m.bg,color:m.txt,border:`1px solid ${m.badge}33`,borderRadius:5,padding:"2px 8px"}}>{r.classification} - {m.label}</span>
                            <span style={{fontSize:11,color:"#8A9BB8"}}>{c?.icon} {c?.label}</span>
                            <span style={{fontSize:10,color:"#C5D0E0",fontFamily:"monospace"}}>{r.recall_number}</span>
                          </div>
                          <div style={{fontWeight:700,fontSize:15,color:"#0A0F1E",marginBottom:5,lineHeight:1.3}}>{r.recalling_firm}</div>
                          <div style={{fontSize:13,color:"#6B7A99",lineHeight:1.5,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{r.reason_for_recall}</div>
                          <div style={{marginTop:8,padding:"6px 10px",background:"#F4F6FA",borderRadius:7,fontSize:12,color:"#8A9BB8"}}><strong style={{color:"#6B7A99"}}>Product: </strong>{r.product_description.slice(0,100)}{r.product_description.length>100?"...":""}</div>
                        </div>
                        <div style={{textAlign:"right",flexShrink:0}}>
                          <div style={{fontSize:11,fontWeight:600,color:m.txt,background:m.bg,borderRadius:7,padding:"2px 9px",marginBottom:4,whiteSpace:"nowrap"}}>{ago(r.recall_initiation_date)}</div>
                          <div style={{fontSize:10,color:"#C5D0E0"}}>{fmt(r.recall_initiation_date)}</div>
                          {r.status==="Terminated"&&<div style={{fontSize:10,color:"#2CB67D",fontWeight:700,marginTop:4}}>Resolved</div>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:18}}>
            <EmailWidget/>
            <div style={{background:"#fff",border:"1px solid #E8ECF4",borderRadius:16,padding:"20px"}}>
              <div style={{fontWeight:800,fontSize:14,color:"#0A0F1E",marginBottom:14}}>Severity Classes</div>
              {Object.entries(CM).map(([k,v])=>(
                <div key={k} style={{display:"flex",gap:10,marginBottom:13}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:v.badge,marginTop:4,flexShrink:0}}/>
                  <div>
                    <div style={{fontWeight:700,fontSize:13,color:"#0A0F1E"}}>{k} <span style={{color:v.txt}}>- {v.label}</span></div>
                    <div style={{fontSize:12,color:"#8A9BB8",lineHeight:1.5,marginTop:1}}>
                      {k==="Class I"&&"Most serious - risk of death or injury."}
                      {k==="Class II"&&"Temporary or moderate health risk."}
                      {k==="Class III"&&"Low risk, violates FDA regulations."}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{background:"linear-gradient(135deg,#EFF6FF,#E8F0FF)",border:"1px solid #BFDBFE",borderRadius:16,padding:"16px 18px"}}>
              <div style={{fontWeight:800,fontSize:13,color:"#1E40AF",marginBottom:10}}>Try These Searches</div>
              {["peanut","listeria","Tylenol","pacemaker","yogurt","sodium chloride"].map(t=>(
                <button key={t} onClick={()=>{setQ(t);setCat(t==="pacemaker"?"device":t==="Tylenol"?"drug":"food");}} style={{display:"inline-block",marginRight:6,marginBottom:6,background:"#fff",border:"1px solid #BFDBFE",borderRadius:20,padding:"3px 12px",cursor:"pointer",fontSize:12,color:"#3B82F6",fontWeight:600}}>{t}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{background:"#060D1F",borderTop:"1px solid rgba(255,255,255,.06)",padding:"22px 24px"}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
          <span style={{fontWeight:800,color:"#fff",fontSize:16}}>RecallAlert</span>
          <span style={{color:"rgba(255,255,255,.25)",fontSize:12}}>Data from openFDA.gov - Not affiliated with FDA - Informational use only</span>
        </div>
      </div>
      {sel&&<Modal r={sel} onClose={()=>setSel(null)}/>}
    </div>
  );
}
