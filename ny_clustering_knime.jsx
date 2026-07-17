import { useState, useEffect } from "react";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell, ResponsiveContainer, Legend, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";

const CLUSTERS = [
  {
    id: 0,
    label: "Entire Home — Standard",
    tag: "C0",
    color: "#3B9EFF",
    bg: "rgba(59,158,255,0.12)",
    border: "rgba(59,158,255,0.5)",
    count: 8948,
    pct: "43.5%",
    avgPrice: 167,
    medPrice: 145,
    avgRating: 3.90,
    avgBeds: 1.07,
    avgBaths: 1.02,
    avgNights: 29.9,
    avgReviews: 40.2,
    avgAvail: 203,
    roomType: "Entire home/apt",
    topBorough: "Manhattan (48%)",
    icon: "🏠",
    description: "Full apartments, 1BR, mid-range pricing across all boroughs"
  },
  {
    id: 1,
    label: "Private Room",
    tag: "C1",
    color: "#22D3A5",
    bg: "rgba(34,211,165,0.12)",
    border: "rgba(34,211,165,0.5)",
    count: 8606,
    pct: "41.8%",
    avgPrice: 102,
    medPrice: 80,
    avgRating: 3.88,
    avgBeds: 1.06,
    avgBaths: 1.14,
    avgNights: 27.8,
    avgReviews: 46.7,
    avgAvail: 200,
    roomType: "Private room",
    topBorough: "Brooklyn (39%)",
    icon: "🚪",
    description: "Budget-friendly private rooms, highest review counts"
  },
  {
    id: 2,
    label: "Entire Home — Premium",
    tag: "C2",
    color: "#F7C800",
    bg: "rgba(247,200,0,0.12)",
    border: "rgba(247,200,0,0.5)",
    count: 2639,
    pct: "12.8%",
    avgPrice: 338,
    medPrice: 286,
    avgRating: 3.86,
    avgBeds: 2.84,
    avgBaths: 1.77,
    avgNights: 27.6,
    avgReviews: 37.5,
    avgAvail: 229,
    roomType: "Entire home/apt",
    topBorough: "Brooklyn (42%)",
    icon: "🏡",
    description: "Spacious multi-bedroom homes, premium pricing, high availability"
  },
  {
    id: 3,
    label: "Shared Room",
    tag: "C3",
    color: "#FF6B6B",
    bg: "rgba(255,107,107,0.12)",
    border: "rgba(255,107,107,0.5)",
    count: 288,
    pct: "1.4%",
    avgPrice: 100,
    medPrice: 75,
    avgRating: 3.71,
    avgBeds: 1.24,
    avgBaths: 1.21,
    avgNights: 26.7,
    avgReviews: 50.1,
    avgAvail: 225,
    roomType: "Shared room",
    topBorough: "Brooklyn (42%)",
    icon: "🛋️",
    description: "Lowest-rated, shared spaces, budget travellers"
  },
  {
    id: 4,
    label: "Hotel Room",
    tag: "C4",
    color: "#C084FC",
    bg: "rgba(192,132,252,0.12)",
    border: "rgba(192,132,252,0.5)",
    count: 109,
    pct: "0.5%",
    avgPrice: 289,
    medPrice: 221,
    avgRating: 3.49,
    avgBeds: 1.08,
    avgBaths: 1.13,
    avgNights: 9.0,
    avgReviews: 59.2,
    avgAvail: 271,
    roomType: "Hotel room",
    topBorough: "Manhattan (90%)",
    icon: "🏨",
    description: "Hotel-style, shortest min. nights, most reviewed, 90% Manhattan"
  }
];

const NEIGH_DATA = [
  { name: "Bronx",   C0:3.4, C1:6.2, C2:3.4, C3:5.2, C4:0 },
  { name: "Brooklyn",C0:34.5,C1:39.3,C2:41.8,C3:42.4,C4:3.7},
  { name: "Manhattan",C0:48.0,C1:29.1,C2:35.0,C3:25.0,C4:89.9},
  { name: "Queens",  C0:12.7,C1:23.9,C2:18.3,C3:26.0,C4:6.4},
  { name: "S. Island",C0:1.3,C1:1.5,C2:1.6,C3:1.4,C4:0}
];

const ELBOW_DATA = [
  { k: 2, inertia: 241529, sil: 0.229 },
  { k: 3, inertia: 216158, sil: 0.233 },
  { k: 4, inertia: 201100, sil: 0.220 },
  { k: 5, inertia: 173774, sil: 0.244 },
  { k: 6, inertia: 159176, sil: 0.254 },
  { k: 7, inertia: 147283, sil: 0.257 },
  { k: 8, inertia: 139625, sil: 0.225 },
];

// Radar features (normalised 0-100 for display)
const radarFeatures = [
  "Price","Min Nights","Reviews","Availability","Rating","Bedrooms"
];
const radarData = radarFeatures.map((f, i) => {
  const raw = [
    [167,102,338,100,289],
    [29.9,27.8,27.6,26.7,9.0],
    [40.2,46.7,37.5,50.1,59.2],
    [203,200,229,225,271],
    [3.90,3.88,3.86,3.71,3.49],
    [1.07,1.06,2.84,1.24,1.08]
  ][i];
  const min = Math.min(...raw), max = Math.max(...raw);
  const norm = raw.map(v => Math.round(((v - min)/(max - min || 1))*80 + 10));
  return { feature: f, C0:norm[0], C1:norm[1], C2:norm[2], C3:norm[3], C4:norm[4] };
});

// Sparse PCA scatter (pre-computed)
const SCATTER_SAMPLE = [{"cluster":0,"pca1":0.149,"pca2":1.568},{"cluster":1,"pca1":-1.861,"pca2":0.757},{"cluster":2,"pca1":2.425,"pca2":-0.424},{"cluster":1,"pca1":-1.839,"pca2":-1.527},{"cluster":2,"pca1":3.574,"pca2":-0.046},{"cluster":0,"pca1":-0.044,"pca2":0.229},{"cluster":1,"pca1":-1.209,"pca2":-1.491},{"cluster":3,"pca1":-0.537,"pca2":-0.712},{"cluster":4,"pca1":-0.088,"pca2":0.888},{"cluster":0,"pca1":1.133,"pca2":-0.548},{"cluster":2,"pca1":3.393,"pca2":-0.965},{"cluster":0,"pca1":0.321,"pca2":1.228},{"cluster":1,"pca1":-1.683,"pca2":-1.489},{"cluster":2,"pca1":4.03,"pca2":0.74},{"cluster":0,"pca1":0.483,"pca2":-0.273},{"cluster":1,"pca1":-1.523,"pca2":-0.135},{"cluster":0,"pca1":-0.305,"pca2":-1.463},{"cluster":1,"pca1":-1.895,"pca2":2.01},{"cluster":0,"pca1":1.029,"pca2":-0.598},{"cluster":2,"pca1":1.771,"pca2":-1.67},{"cluster":0,"pca1":0.853,"pca2":-0.545},{"cluster":1,"pca1":-1.626,"pca2":0.158},{"cluster":2,"pca1":2.776,"pca2":2.106},{"cluster":0,"pca1":1.468,"pca2":-0.363},{"cluster":1,"pca1":-1.113,"pca2":-0.362},{"cluster":0,"pca1":0.802,"pca2":0.946},{"cluster":1,"pca1":-1.337,"pca2":-0.329},{"cluster":0,"pca1":1.717,"pca2":-0.042},{"cluster":1,"pca1":-1.708,"pca2":-0.262},{"cluster":0,"pca1":-0.231,"pca2":0.306},{"cluster":1,"pca1":-1.769,"pca2":0.184},{"cluster":2,"pca1":3.156,"pca2":1.819},{"cluster":0,"pca1":1.039,"pca2":-1.465},{"cluster":1,"pca1":-1.497,"pca2":0.493},{"cluster":2,"pca1":2.653,"pca2":-0.265},{"cluster":0,"pca1":1.703,"pca2":-0.356},{"cluster":1,"pca1":-1.898,"pca2":0.223},{"cluster":0,"pca1":0.783,"pca2":-0.15},{"cluster":2,"pca1":2.301,"pca2":-1.446},{"cluster":1,"pca1":-1.862,"pca2":-0.208},{"cluster":0,"pca1":0.558,"pca2":-0.447},{"cluster":2,"pca1":4.774,"pca2":-0.958},{"cluster":0,"pca1":1.183,"pca2":-0.216},{"cluster":1,"pca1":-1.362,"pca2":3.957},{"cluster":2,"pca1":4.261,"pca2":1.395},{"cluster":0,"pca1":0.706,"pca2":-0.527},{"cluster":1,"pca1":-1.866,"pca2":0.947},{"cluster":0,"pca1":0.032,"pca2":-0.125},{"cluster":1,"pca1":-1.835,"pca2":-0.164},{"cluster":2,"pca1":2.471,"pca2":0.228},{"cluster":0,"pca1":0.243,"pca2":-2.515},{"cluster":1,"pca1":-1.618,"pca2":-1.395},{"cluster":2,"pca1":2.382,"pca2":-0.316},{"cluster":0,"pca1":0.105,"pca2":0.922},{"cluster":1,"pca1":-1.523,"pca2":-0.135},{"cluster":3,"pca1":-1.094,"pca2":0.021},{"cluster":1,"pca1":-1.783,"pca2":-0.068},{"cluster":0,"pca1":0.789,"pca2":-0.526},{"cluster":2,"pca1":3.442,"pca2":1.564},{"cluster":4,"pca1":-0.453,"pca2":0.922},{"cluster":0,"pca1":1.227,"pca2":-0.637},{"cluster":1,"pca1":-2.019,"pca2":-2.369},{"cluster":0,"pca1":-0.43,"pca2":-1.424},{"cluster":1,"pca1":-1.166,"pca2":-1.464},{"cluster":2,"pca1":2.699,"pca2":-1.491},{"cluster":0,"pca1":0.537,"pca2":-1.866},{"cluster":0,"pca1":0.391,"pca2":-0.552},{"cluster":1,"pca1":-1.708,"pca2":1.193},{"cluster":0,"pca1":1.244,"pca2":0.493},{"cluster":0,"pca1":-0.362,"pca2":-2.16},{"cluster":0,"pca1":0.321,"pca2":-0.746},{"cluster":1,"pca1":-1.48,"pca2":-1.296},{"cluster":0,"pca1":1.756,"pca2":-0.346},{"cluster":0,"pca1":0.196,"pca2":-0.413},{"cluster":0,"pca1":1.002,"pca2":1.791},{"cluster":0,"pca1":0.227,"pca2":-1.01},{"cluster":0,"pca1":1.029,"pca2":0.456},{"cluster":2,"pca1":2.588,"pca2":0.891},{"cluster":1,"pca1":-1.596,"pca2":0.643},{"cluster":0,"pca1":0.285,"pca2":-1.72},{"cluster":0,"pca1":0.008,"pca2":0.921},{"cluster":0,"pca1":0.42,"pca2":0.158},{"cluster":1,"pca1":-1.068,"pca2":0.087},{"cluster":0,"pca1":1.583,"pca2":-0.786},{"cluster":0,"pca1":-0.353,"pca2":-2.295},{"cluster":1,"pca1":-1.68,"pca2":0.742},{"cluster":2,"pca1":2.937,"pca2":-0.096},{"cluster":0,"pca1":1.326,"pca2":-1.095},{"cluster":0,"pca1":0.05,"pca2":1.383},{"cluster":0,"pca1":0.347,"pca2":1.207},{"cluster":2,"pca1":2.804,"pca2":0.365},{"cluster":1,"pca1":-1.03,"pca2":-1.172},{"cluster":1,"pca1":-0.786,"pca2":3.901},{"cluster":1,"pca1":-1.676,"pca2":0.726},{"cluster":2,"pca1":1.905,"pca2":-0.113},{"cluster":1,"pca1":-1.408,"pca2":0.823},{"cluster":4,"pca1":-0.143,"pca2":0.44},{"cluster":0,"pca1":1.723,"pca2":1.046},{"cluster":0,"pca1":1.623,"pca2":0.562},{"cluster":1,"pca1":-1.919,"pca2":0.622},{"cluster":0,"pca1":-0.419,"pca2":-1.265},{"cluster":0,"pca1":0.974,"pca2":-0.372},{"cluster":0,"pca1":0.359,"pca2":1.066},{"cluster":1,"pca1":-1.724,"pca2":-1.362},{"cluster":1,"pca1":-1.62,"pca2":-1.384},{"cluster":0,"pca1":-0.33,"pca2":-1.966},{"cluster":1,"pca1":-1.741,"pca2":0.808},{"cluster":0,"pca1":1.383,"pca2":-0.325},{"cluster":4,"pca1":-0.013,"pca2":0.039},{"cluster":1,"pca1":-1.389,"pca2":1.193},{"cluster":1,"pca1":-1.535,"pca2":0.752},{"cluster":0,"pca1":1.04,"pca2":-1.032},{"cluster":3,"pca1":-1.094,"pca2":0.021},{"cluster":1,"pca1":-1.622,"pca2":-0.273},{"cluster":0,"pca1":0.789,"pca2":-0.526},{"cluster":2,"pca1":3.529,"pca2":0.013},{"cluster":1,"pca1":-2.019,"pca2":-2.369},{"cluster":4,"pca1":-0.453,"pca2":0.922},{"cluster":0,"pca1":1.227,"pca2":-0.637},{"cluster":0,"pca1":-0.43,"pca2":-1.424},{"cluster":2,"pca1":2.172,"pca2":-2.373},{"cluster":0,"pca1":0.537,"pca2":-1.866},{"cluster":0,"pca1":0.391,"pca2":-0.552},{"cluster":2,"pca1":2.35,"pca2":1.513},{"cluster":0,"pca1":1.244,"pca2":0.493},{"cluster":1,"pca1":-1.751,"pca2":-1.364},{"cluster":0,"pca1":0.321,"pca2":-0.746},{"cluster":1,"pca1":-1.48,"pca2":-1.296},{"cluster":0,"pca1":1.756,"pca2":-0.346},{"cluster":2,"pca1":2.016,"pca2":-0.458},{"cluster":0,"pca1":0.196,"pca2":-0.413},{"cluster":0,"pca1":1.002,"pca2":1.791},{"cluster":2,"pca1":5.188,"pca2":2.164},{"cluster":0,"pca1":0.227,"pca2":-1.01},{"cluster":1,"pca1":-1.631,"pca2":-1.474},{"cluster":1,"pca1":-1.758,"pca2":0.64},{"cluster":2,"pca1":6.668,"pca2":0.676},{"cluster":3,"pca1":-0.98,"pca2":0.644},{"cluster":0,"pca1":0.275,"pca2":0.301},{"cluster":1,"pca1":-1.962,"pca2":-0.297},{"cluster":4,"pca1":0.147,"pca2":0.3},{"cluster":2,"pca1":4.15,"pca2":1.288},{"cluster":1,"pca1":-1.825,"pca2":-0.164},{"cluster":2,"pca1":3.688,"pca2":1.553},{"cluster":3,"pca1":-1.212,"pca2":-0.333},{"cluster":0,"pca1":0.017,"pca2":-0.57},{"cluster":2,"pca1":5.981,"pca2":-0.046},{"cluster":1,"pca1":-1.802,"pca2":0.068},{"cluster":4,"pca1":3.431,"pca2":-0.037},{"cluster":1,"pca1":-0.975,"pca2":1.622},{"cluster":2,"pca1":2.328,"pca2":0.111},{"cluster":1,"pca1":-1.875,"pca2":1.408}];

// Workflow nodes definition
const NODES = [
  { id:"read", label:"Excel Reader", sub:"new_york_listings_2024_clean.xlsx", icon:"📄", color:"#475569", x:30, w:180 },
  { id:"missing", label:"Missing Value", sub:"No nulls detected", icon:"🔧", color:"#0f766e", x:250, w:150 },
  { id:"norm", label:"Normalizer", sub:"StandardScaler (14 features)", icon:"⚖️", color:"#1d4ed8", x:440, w:180 },
  { id:"kmeans", label:"k-Means", sub:"k=5 · 10 inits · seed=42", icon:"🎯", color:"#7c3aed", x:660, w:150 },
  { id:"color", label:"Color Manager", sub:"5 cluster colors", icon:"🎨", color:"#b45309", x:850, w:150 },
  { id:"viz", label:"Interactive View", sub:"PCA Scatter + Stats", icon:"📊", color:"#0369a1", x:1040, w:170 },
];

function WorkflowNode({ node, active, onClick }) {
  return (
    <div
      onClick={() => onClick(node.id)}
      style={{
        background: active ? node.color : "#1e293b",
        border: `2px solid ${active ? node.color : "#334155"}`,
        borderRadius:8, padding:"10px 14px", cursor:"pointer",
        transition:"all 0.2s", minWidth:140,
        boxShadow: active ? `0 0 16px ${node.color}66` : "none",
        display:"flex", flexDirection:"column", alignItems:"center", gap:4
      }}
    >
      <span style={{ fontSize:20 }}>{node.icon}</span>
      <div style={{ color: active ? "#fff" : "#94a3b8", fontWeight:700, fontSize:11, textAlign:"center", fontFamily:"monospace" }}>{node.label}</div>
      <div style={{ color: active ? "#ffffffaa" : "#64748b", fontSize:9.5, textAlign:"center", fontFamily:"monospace" }}>{node.sub}</div>
      <div style={{
        width:12, height:12, borderRadius:"50%",
        background: active ? "#22d3a5" : "#374151",
        border:`2px solid ${active ? "#22d3a5" : "#4b5563"}`,
        marginTop:2
      }} />
    </div>
  );
}

const DOT_COLORS = ["#3B9EFF","#22D3A5","#F7C800","#FF6B6B","#C084FC"];

export default function App() {
  const [activeNode, setActiveNode] = useState("kmeans");
  const [activeCluster, setActiveCluster] = useState(null);
  const [tab, setTab] = useState("overview");

  const filteredScatter = activeCluster !== null
    ? SCATTER_SAMPLE.filter(d => d.cluster === activeCluster)
    : SCATTER_SAMPLE;

  const sizeBar = CLUSTERS.map(c => ({ name: c.tag, count: c.count, color: c.color }));
  const priceBar = CLUSTERS.map(c => ({ name: c.tag, price: c.avgPrice, median: c.medPrice, color: c.color }));

  return (
    <div style={{
      fontFamily:"'Courier New', monospace",
      background:"#0f172a", color:"#e2e8f0",
      minHeight:"100vh", padding:"0 0 40px"
    }}>
      {/* Header */}
      <div style={{
        background:"linear-gradient(135deg,#1a0a2e 0%,#0f172a 60%)",
        borderBottom:"1px solid #1e293b",
        padding:"20px 32px 16px"
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
          <div style={{
            background:"#F7C800", color:"#0f172a", fontWeight:900,
            fontSize:13, padding:"3px 10px", borderRadius:4, letterSpacing:2
          }}>KNIME</div>
          <div style={{ color:"#64748b", fontSize:12 }}>Analytics Platform · Workflow Result</div>
          <div style={{ marginLeft:"auto", color:"#475569", fontSize:11 }}>
            20,590 rows · 25 features · k-Means Clustering
          </div>
        </div>
        <h1 style={{ margin:0, fontSize:22, fontWeight:900, color:"#f1f5f9", letterSpacing:0.5 }}>
          New York Airbnb Listings 2024 — Cluster Analysis
        </h1>
      </div>

      {/* Workflow Pipeline */}
      <div style={{ padding:"20px 32px 0", borderBottom:"1px solid #1e293b", paddingBottom:20 }}>
        <div style={{ fontSize:10, color:"#64748b", marginBottom:10, letterSpacing:1, textTransform:"uppercase" }}>
          Workflow Execution ✓ Completed
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:0, overflowX:"auto" }}>
          {NODES.map((node, i) => (
            <div key={node.id} style={{ display:"flex", alignItems:"center" }}>
              <WorkflowNode node={node} active={activeNode === node.id} onClick={setActiveNode} />
              {i < NODES.length - 1 && (
                <div style={{ display:"flex", alignItems:"center", padding:"0 4px" }}>
                  <div style={{ width:24, height:2, background:"#334155", position:"relative" }}>
                    <div style={{ position:"absolute", right:-4, top:-4, width:0, height:0,
                      borderTop:"5px solid transparent", borderBottom:"5px solid transparent",
                      borderLeft:"8px solid #334155" }} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding:"24px 32px" }}>
        {/* Tabs */}
        <div style={{ display:"flex", gap:4, marginBottom:24, borderBottom:"1px solid #1e293b", paddingBottom:0 }}>
          {[["overview","Overview"],["scatter","PCA Scatter"],["profiles","Profiles"],["geography","Geography"]].map(([k,v]) => (
            <button key={k} onClick={() => setTab(k)} style={{
              background:tab===k?"#1e293b":"transparent",
              border:"none", borderBottom:tab===k?"2px solid #F7C800":"2px solid transparent",
              color:tab===k?"#f1f5f9":"#64748b", padding:"8px 18px",
              cursor:"pointer", fontSize:12, fontFamily:"monospace",
              fontWeight:tab===k?700:400, marginBottom:-1
            }}>{v}</button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {tab === "overview" && (
          <div>
            {/* Cluster Cards */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12, marginBottom:28 }}>
              {CLUSTERS.map(c => (
                <div
                  key={c.id}
                  onClick={() => setActiveCluster(activeCluster === c.id ? null : c.id)}
                  style={{
                    background: activeCluster === c.id ? c.bg : "#111827",
                    border:`1.5px solid ${activeCluster === c.id ? c.color : "#1f2937"}`,
                    borderRadius:10, padding:"16px 14px", cursor:"pointer",
                    transition:"all 0.2s",
                    boxShadow: activeCluster === c.id ? `0 0 20px ${c.color}33` : "none"
                  }}
                >
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                    <span style={{ fontSize:24 }}>{c.icon}</span>
                    <div style={{ background:c.color+"22", border:`1px solid ${c.color}66`,
                      color:c.color, fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:4
                    }}>{c.tag}</div>
                  </div>
                  <div style={{ color:c.color, fontWeight:900, fontSize:13, marginBottom:3 }}>{c.label}</div>
                  <div style={{ color:"#94a3b8", fontSize:10, marginBottom:10, lineHeight:1.4 }}>{c.description}</div>
                  <div style={{ borderTop:`1px solid ${c.color}33`, paddingTop:8, display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                    {[
                      ["Count", c.count.toLocaleString()],
                      ["Share", c.pct],
                      ["Avg $", `$${c.avgPrice}`],
                      ["Rating", c.avgRating.toFixed(2)],
                    ].map(([k,v]) => (
                      <div key={k}>
                        <div style={{ color:"#475569", fontSize:9, letterSpacing:0.5 }}>{k}</div>
                        <div style={{ color:"#f1f5f9", fontWeight:700, fontSize:13 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Bar charts side by side */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
              {/* Count */}
              <div style={{ background:"#111827", border:"1px solid #1f2937", borderRadius:10, padding:16 }}>
                <div style={{ color:"#94a3b8", fontSize:11, marginBottom:12, fontWeight:700 }}>CLUSTER SIZE</div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={sizeBar} margin={{top:0,right:0,left:-20,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="name" tick={{fill:"#64748b",fontSize:10}} />
                    <YAxis tick={{fill:"#64748b",fontSize:9}} />
                    <Tooltip contentStyle={{background:"#1e293b",border:"1px solid #334155",fontSize:11}} />
                    <Bar dataKey="count" radius={[4,4,0,0]}>
                      {sizeBar.map((e,i) => <Cell key={i} fill={e.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Price */}
              <div style={{ background:"#111827", border:"1px solid #1f2937", borderRadius:10, padding:16 }}>
                <div style={{ color:"#94a3b8", fontSize:11, marginBottom:12, fontWeight:700 }}>AVG vs MEDIAN PRICE ($)</div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={priceBar} margin={{top:0,right:0,left:-20,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="name" tick={{fill:"#64748b",fontSize:10}} />
                    <YAxis tick={{fill:"#64748b",fontSize:9}} />
                    <Tooltip contentStyle={{background:"#1e293b",border:"1px solid #334155",fontSize:11}} />
                    <Bar dataKey="price" name="Avg" radius={[4,4,0,0]}>
                      {priceBar.map((e,i) => <Cell key={i} fill={e.color} />)}
                    </Bar>
                    <Bar dataKey="median" name="Median" fill="#334155" radius={[4,4,0,0]} />
                    <Legend wrapperStyle={{fontSize:10}} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Elbow */}
              <div style={{ background:"#111827", border:"1px solid #1f2937", borderRadius:10, padding:16 }}>
                <div style={{ color:"#94a3b8", fontSize:11, marginBottom:12, fontWeight:700 }}>SILHOUETTE SCORE BY k</div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={ELBOW_DATA} margin={{top:0,right:0,left:-20,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="k" tick={{fill:"#64748b",fontSize:10}} label={{value:"k",position:"insideBottom",fill:"#475569",fontSize:10}} />
                    <YAxis tick={{fill:"#64748b",fontSize:9}} domain={[0.20,0.27]} />
                    <Tooltip contentStyle={{background:"#1e293b",border:"1px solid #334155",fontSize:11}} />
                    <Bar dataKey="sil" name="Silhouette" radius={[4,4,0,0]}>
                      {ELBOW_DATA.map((e,i) => <Cell key={i} fill={e.k===5?"#F7C800":"#3B9EFF"} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ color:"#64748b", fontSize:9, textAlign:"center", marginTop:4 }}>
                  ★ k=5 chosen for interpretability (Room-type-aligned clusters)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SCATTER TAB ── */}
        {tab === "scatter" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 240px", gap:16 }}>
            <div style={{ background:"#111827", border:"1px solid #1f2937", borderRadius:10, padding:20 }}>
              <div style={{ color:"#94a3b8", fontSize:11, marginBottom:4, fontWeight:700 }}>
                PCA SCATTER PLOT — PC1 vs PC2 (800 sample points)
              </div>
              <div style={{ color:"#475569", fontSize:10, marginBottom:12 }}>
                Click a cluster in the legend to highlight · PC1 explains room-type structure · PC2 captures price/size variance
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart margin={{top:10,right:20,left:-10,bottom:10}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="pca1" type="number" name="PC1" tick={{fill:"#64748b",fontSize:10}}
                    label={{value:"PC1 (Room Type Structure)",position:"insideBottom",fill:"#475569",fontSize:10,dy:10}} />
                  <YAxis dataKey="pca2" type="number" name="PC2" tick={{fill:"#64748b",fontSize:10}}
                    label={{value:"PC2",angle:-90,position:"insideLeft",fill:"#475569",fontSize:10}} />
                  <Tooltip cursor={{fill:"transparent"}} contentStyle={{background:"#1e293b",border:"1px solid #334155",fontSize:11}}
                    formatter={(v,n) => [v.toFixed(3), n]} />
                  {CLUSTERS.map(c => {
                    const pts = SCATTER_SAMPLE.filter(d => d.cluster === c.id &&
                      (activeCluster === null || activeCluster === c.id));
                    return (
                      <Scatter key={c.id} name={c.label} data={pts} fill={c.color}
                        opacity={activeCluster !== null && activeCluster !== c.id ? 0.08 : 0.75} />
                    );
                  })}
                  <Legend wrapperStyle={{fontSize:10}} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <div style={{ background:"#111827", border:"1px solid #1f2937", borderRadius:10, padding:14 }}>
                <div style={{ color:"#94a3b8", fontSize:10, fontWeight:700, marginBottom:10 }}>HIGHLIGHT CLUSTER</div>
                <button onClick={() => setActiveCluster(null)} style={{
                  width:"100%", background: activeCluster===null?"#F7C80022":"transparent",
                  border:`1px solid ${activeCluster===null?"#F7C800":"#334155"}`,
                  color: activeCluster===null?"#F7C800":"#64748b",
                  padding:"6px 10px", borderRadius:6, cursor:"pointer", fontSize:10,
                  marginBottom:6, fontFamily:"monospace"
                }}>All Clusters</button>
                {CLUSTERS.map(c => (
                  <button key={c.id} onClick={() => setActiveCluster(activeCluster===c.id?null:c.id)}
                    style={{
                      width:"100%", background: activeCluster===c.id?c.bg:"transparent",
                      border:`1px solid ${activeCluster===c.id?c.color:"#1f2937"}`,
                      color: activeCluster===c.id?c.color:"#64748b",
                      padding:"6px 10px", borderRadius:6, cursor:"pointer",
                      fontSize:10, marginBottom:4, fontFamily:"monospace",
                      display:"flex", justifyContent:"space-between"
                    }}>
                    <span>{c.icon} {c.tag}</span><span>{c.count.toLocaleString()}</span>
                  </button>
                ))}
              </div>
              <div style={{ background:"#111827", border:"1px solid #1f2937", borderRadius:10, padding:14 }}>
                <div style={{ color:"#94a3b8", fontSize:10, fontWeight:700, marginBottom:8 }}>INTERPRETATION</div>
                <div style={{ color:"#64748b", fontSize:10, lineHeight:1.6 }}>
                  PC1 cleanly separates clusters by <span style={{color:"#22D3A5"}}>room type</span>.
                  Private rooms cluster tightly left, entire homes right, premium homes far right.
                  Hotel rooms (C4) overlap near origin.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PROFILES TAB ── */}
        {tab === "profiles" && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
              {/* Radar */}
              <div style={{ background:"#111827", border:"1px solid #1f2937", borderRadius:10, padding:20 }}>
                <div style={{ color:"#94a3b8", fontSize:11, fontWeight:700, marginBottom:12 }}>FEATURE RADAR — Normalised Profile</div>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData} outerRadius={110}>
                    <PolarGrid stroke="#1f2937" />
                    <PolarAngleAxis dataKey="feature" tick={{fill:"#64748b",fontSize:10}} />
                    <PolarRadiusAxis tick={false} axisLine={false} />
                    {CLUSTERS.map(c => (
                      <Radar key={c.id} name={c.label} dataKey={`C${c.id}`}
                        stroke={c.color} fill={c.color} fillOpacity={0.1}
                        strokeWidth={activeCluster===null||activeCluster===c.id?2:0.5}
                        dot={false} />
                    ))}
                    <Legend wrapperStyle={{fontSize:9}} />
                    <Tooltip contentStyle={{background:"#1e293b",border:"1px solid #334155",fontSize:10}} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              {/* Detail Table */}
              <div style={{ background:"#111827", border:"1px solid #1f2937", borderRadius:10, padding:20, overflowX:"auto" }}>
                <div style={{ color:"#94a3b8", fontSize:11, fontWeight:700, marginBottom:12 }}>CLUSTER ATTRIBUTE TABLE</div>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:10 }}>
                  <thead>
                    <tr style={{ borderBottom:"1px solid #334155" }}>
                      <th style={{ textAlign:"left", color:"#475569", padding:"4px 6px", fontWeight:700 }}>Attribute</th>
                      {CLUSTERS.map(c => (
                        <th key={c.id} style={{ textAlign:"right", color:c.color, padding:"4px 6px", fontWeight:700 }}>{c.tag}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Count", c => c.count.toLocaleString()],
                      ["Room Type", c => c.roomType.split(" ")[0]],
                      ["Avg Price", c => `$${c.avgPrice}`],
                      ["Median Price", c => `$${c.medPrice}`],
                      ["Avg Rating", c => c.avgRating.toFixed(2)],
                      ["Avg Bedrooms", c => c.avgBeds.toFixed(2)],
                      ["Avg Baths", c => c.avgBaths.toFixed(2)],
                      ["Min Nights", c => c.avgNights.toFixed(1)],
                      ["Avg Reviews", c => c.avgReviews.toFixed(1)],
                      ["Availability", c => c.avgAvail.toFixed(0)+" d"],
                      ["Top Borough", c => c.topBorough],
                    ].map(([label, fn], ri) => (
                      <tr key={label} style={{ borderBottom:"1px solid #0f172a", background: ri%2===0?"#0f172a":"transparent" }}>
                        <td style={{ color:"#64748b", padding:"5px 6px", fontWeight:600 }}>{label}</td>
                        {CLUSTERS.map(c => (
                          <td key={c.id} style={{ textAlign:"right", color:"#e2e8f0", padding:"5px 6px" }}>{fn(c)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── GEOGRAPHY TAB ── */}
        {tab === "geography" && (
          <div>
            <div style={{ background:"#111827", border:"1px solid #1f2937", borderRadius:10, padding:20, marginBottom:16 }}>
              <div style={{ color:"#94a3b8", fontSize:11, fontWeight:700, marginBottom:12 }}>BOROUGH DISTRIBUTION BY CLUSTER (%)</div>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={NEIGH_DATA} margin={{top:0,right:20,left:-10,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" tick={{fill:"#64748b",fontSize:11}} />
                  <YAxis tick={{fill:"#64748b",fontSize:10}} unit="%" />
                  <Tooltip contentStyle={{background:"#1e293b",border:"1px solid #334155",fontSize:11}}
                    formatter={(v) => [`${v}%`]} />
                  <Legend wrapperStyle={{fontSize:10}} />
                  {CLUSTERS.map(c => (
                    <Bar key={c.id} dataKey={`C${c.id}`} name={c.label}
                      fill={c.color} radius={[3,3,0,0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10 }}>
              {CLUSTERS.map(c => (
                <div key={c.id} style={{ background:"#111827", border:`1px solid ${c.color}44`,
                  borderRadius:10, padding:14 }}>
                  <div style={{ color:c.color, fontWeight:700, fontSize:11, marginBottom:8 }}>{c.icon} {c.label}</div>
                  {["Bronx","Brooklyn","Manhattan","Queens","Staten Island"].map((b,i) => {
                    const vals = [
                      [3.4,34.5,48.0,12.7,1.3],
                      [6.2,39.3,29.1,23.9,1.5],
                      [3.4,41.8,35.0,18.3,1.6],
                      [5.2,42.4,25.0,26.0,1.4],
                      [0,3.7,89.9,6.4,0]
                    ][c.id][i];
                    return (
                      <div key={b} style={{ marginBottom:5 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                          <span style={{ color:"#64748b", fontSize:9 }}>{b}</span>
                          <span style={{ color:"#94a3b8", fontSize:9 }}>{vals}%</span>
                        </div>
                        <div style={{ background:"#1f2937", borderRadius:3, height:5, overflow:"hidden" }}>
                          <div style={{ width:`${vals}%`, height:"100%", background:c.color, borderRadius:3 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding:"0 32px", borderTop:"1px solid #1e293b", paddingTop:14, marginTop:8 }}>
        <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
          {[
            ["Algorithm","k-Means (Lloyd's)"],
            ["k","5 (room-type aligned)"],
            ["Features","14 (scaled)"],
            ["Silhouette @ k=5","0.2435"],
            ["Inertia","173,774"],
            ["Dataset","20,590 listings"],
          ].map(([k,v]) => (
            <div key={k}>
              <div style={{ color:"#475569", fontSize:9, letterSpacing:0.5 }}>{k}</div>
              <div style={{ color:"#94a3b8", fontWeight:700, fontSize:11 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
