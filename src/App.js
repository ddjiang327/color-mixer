import { useState, useRef, useCallback, useEffect } from "react";

// ─── i18n ────────────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    subtitle: "PIGMENT STUDIO",
    title: "Color Workshop",
    eyedropperTitle: "🔬 Eyedropper",
    eyedropperHint: "Hover to preview · Double-click to lock color",
    hover: "Hover",
    selected: "Selected",
    clickConfirm: "Click to confirm this color",
    dblClickLock: "Double-click image to lock a color",
    changeImage: "Change",
    confirmUse: "Confirm — use this color",
    pickFirst: "Pick a color from the image first",
    importImage: "📁 Import Image",
    swatches: "🎨 Swatches",
    eyedropperBtn: "🔬 Eyedropper",
    targetLabel: "Target",
    mixedLabel: "Mixed",
    waiting: "Waiting…",
    reset: "↺ Reset",
    similarity: "Match",
    ratioTitle: "Mix Ratio",
    baseColors: "BASE COLORS",
    secondaryDivider: "SECONDARY  (mixed)",
    hint: "Tap swatch or ＋ to add · — to remove · Secondaries blend from primaries via subtractive mixing",
  },
  zh: {
    subtitle: "PIGMENT STUDIO",
    title: "调色工坊",
    eyedropperTitle: "🔬 吸管取色",
    eyedropperHint: "移动鼠标预览颜色，双击确认选取",
    hover: "悬停",
    selected: "已选",
    clickConfirm: "点击确认使用此颜色",
    dblClickLock: "双击图片锁定颜色",
    changeImage: "换图",
    confirmUse: "确认使用此颜色",
    pickFirst: "请先点击图片选取颜色",
    importImage: "📁 导入图片",
    swatches: "🎨 色卡",
    eyedropperBtn: "🔬 吸管取色",
    targetLabel: "目标色",
    mixedLabel: "调出色",
    waiting: "待调色",
    reset: "↺ 重置",
    similarity: "相似度",
    ratioTitle: "调色比例",
    baseColors: "基 色",
    secondaryDivider: "间 色（混合生色）",
    hint: "点击色块或 ＋ 叠加 · — 减色 · 间色由基色混合而来",
  },
};

// ─── Color data ───────────────────────────────────────────────────────────────
const BASE_COLORS = [
  { id: "red",    label: { en: "Red",    zh: "红" }, rgb: [255, 0, 0],     hex: "#FF0000" },
  { id: "yellow", label: { en: "Yellow", zh: "黄" }, rgb: [255, 255, 0],   hex: "#FFFF00" },
  { id: "blue",   label: { en: "Blue",   zh: "蓝" }, rgb: [0, 0, 255],     hex: "#0000FF" },
  { id: "black",  label: { en: "Black",  zh: "黑" }, rgb: [15, 15, 15],    hex: "#0F0F0F" },
  { id: "white",  label: { en: "White",  zh: "白" }, rgb: [245, 245, 245], hex: "#F5F5F5" },
];

const SECONDARY_COLORS = [
  { id: "orange", label: { en: "Orange", zh: "橙" }, from: ["red","yellow"], fromLabel: { en: "Red＋Yellow", zh: "红＋黄" }, hex: "#FF8000", rgb: [255, 128, 0] },
  { id: "green",  label: { en: "Green",  zh: "绿" }, from: ["blue","yellow"], fromLabel: { en: "Blue＋Yellow", zh: "蓝＋黄" }, hex: "#00AA00", rgb: [0, 170, 0] },
  { id: "purple", label: { en: "Purple", zh: "紫" }, from: ["red","blue"],   fromLabel: { en: "Red＋Blue", zh: "红＋蓝" },   hex: "#8B00FF", rgb: [139, 0, 255] },
];

const ALL_COLORS = [...BASE_COLORS, ...SECONDARY_COLORS];

const SWATCH_CATEGORIES = [
  {
    name: { en: "Earth · Nature", zh: "大地·自然" },
    swatches: [
      { name: { en: "Ivory",       zh: "象牙白" }, hex: "#FFFFF0" }, { name: { en: "Cream",      zh: "奶油"   }, hex: "#FFFDD0" },
      { name: { en: "Linen",       zh: "米白"   }, hex: "#FAF0E6" }, { name: { en: "Dune",       zh: "沙丘"   }, hex: "#E8D5B7" },
      { name: { en: "Oat",         zh: "燕麦"   }, hex: "#D4B896" }, { name: { en: "Camel",      zh: "驼色"   }, hex: "#C19A6B" },
      { name: { en: "Caramel",     zh: "焦糖"   }, hex: "#A0522D" }, { name: { en: "Chocolate",  zh: "巧克力" }, hex: "#7B3F00" },
      { name: { en: "Dark Brown",  zh: "深棕"   }, hex: "#4A2C0A" }, { name: { en: "Charcoal",   zh: "墨炭"   }, hex: "#2C2C2C" },
      { name: { en: "Moss",        zh: "苔藓"   }, hex: "#8A9A5B" }, { name: { en: "Olive",      zh: "橄榄"   }, hex: "#6B7C3A" },
    ]
  },
  {
    name: { en: "Red · Pink · Orange", zh: "红·粉·橙" },
    swatches: [
      { name: { en: "Baby Pink",   zh: "婴儿粉" }, hex: "#FFD1DC" }, { name: { en: "Rose Pink",  zh: "玫瑰粉" }, hex: "#F783AC" },
      { name: { en: "Sakura",      zh: "樱花"   }, hex: "#FFB7C5" }, { name: { en: "Coral",      zh: "珊瑚"   }, hex: "#FF6B6B" },
      { name: { en: "Hot Pink",    zh: "桃红"   }, hex: "#FF4D6D" }, { name: { en: "Carmine",    zh: "胭脂"   }, hex: "#E0003C" },
      { name: { en: "Vermilion",   zh: "朱砂"   }, hex: "#C0392B" }, { name: { en: "Brick Red",  zh: "砖红"   }, hex: "#C92A2A" },
      { name: { en: "Persimmon",   zh: "柿子橙" }, hex: "#FF6929" }, { name: { en: "Apricot",    zh: "杏橙"   }, hex: "#FF922B" },
      { name: { en: "Tangerine",   zh: "蜜橘"   }, hex: "#FFA94D" }, { name: { en: "Amber",      zh: "琥珀"   }, hex: "#E67E22" },
    ]
  },
  {
    name: { en: "Yellow · Gold · Green", zh: "黄·金·绿" },
    swatches: [
      { name: { en: "Champagne",   zh: "香槟"   }, hex: "#FAF0BE" }, { name: { en: "Lemon",      zh: "柠檬"   }, hex: "#FFF44F" },
      { name: { en: "Marigold",    zh: "金菊"   }, hex: "#FAB005" }, { name: { en: "Sunflower",  zh: "向日葵" }, hex: "#FFC300" },
      { name: { en: "Lime",        zh: "黄绿"   }, hex: "#ADFF2F" }, { name: { en: "Celadon",    zh: "嫩草"   }, hex: "#90EE90" },
      { name: { en: "Mint",        zh: "薄荷"   }, hex: "#51CF66" }, { name: { en: "Emerald",    zh: "翡翠"   }, hex: "#20C997" },
      { name: { en: "Turquoise",   zh: "松石绿" }, hex: "#2EC4B6" }, { name: { en: "Forest",     zh: "深绿"   }, hex: "#1A7431" },
      { name: { en: "Peacock",     zh: "孔雀绿" }, hex: "#009B77" }, { name: { en: "Army",       zh: "军绿"   }, hex: "#4B5320" },
    ]
  },
  {
    name: { en: "Blue · Teal · Purple", zh: "蓝·青·紫" },
    swatches: [
      { name: { en: "Ice Blue",    zh: "冰蓝"   }, hex: "#D6EAF8" }, { name: { en: "Sky Blue",   zh: "天空蓝" }, hex: "#339AF0" },
      { name: { en: "Cornflower",  zh: "矢车菊" }, hex: "#6495ED" }, { name: { en: "Sapphire",   zh: "宝蓝"   }, hex: "#2563EB" },
      { name: { en: "Indigo",      zh: "靛青"   }, hex: "#4C6EF5" }, { name: { en: "Prussian",   zh: "普鲁士蓝"},hex: "#003153" },
      { name: { en: "Ocean",       zh: "青玉"   }, hex: "#0077B6" }, { name: { en: "Teal",       zh: "水鸭"   }, hex: "#008B8B" },
      { name: { en: "Lavender",    zh: "薰衣草" }, hex: "#E6CCFF" }, { name: { en: "Lilac",      zh: "丁香紫" }, hex: "#CC5DE8" },
      { name: { en: "Violet",      zh: "紫罗兰" }, hex: "#8B5CF6" }, { name: { en: "Deep Purple", zh: "深紫"  }, hex: "#4C1D95" },
    ]
  },
  {
    name: { en: "Traditional Chinese", zh: "中国传统色" },
    swatches: [
      { name: { en: "Zhu Hong",    zh: "朱红"   }, hex: "#E63022" }, { name: { en: "Jiang Hong",  zh: "绛红"  }, hex: "#8B1A1A" },
      { name: { en: "Peony",       zh: "牡丹"   }, hex: "#EE4E85" }, { name: { en: "Ou He",      zh: "藕荷"   }, hex: "#E8A0BF" },
      { name: { en: "Pomegranate", zh: "石榴"   }, hex: "#F75C2F" }, { name: { en: "Ochre",      zh: "赭石"   }, hex: "#9C4A1A" },
      { name: { en: "Xiang Se",    zh: "缃色"   }, hex: "#F0C040" }, { name: { en: "Qiu Xiang",  zh: "秋香"   }, hex: "#8E7618" },
      { name: { en: "Scallion",    zh: "葱绿"   }, hex: "#9ABB61" }, { name: { en: "Shi Lü",     zh: "石绿"   }, hex: "#57AC45" },
      { name: { en: "Blue & White",zh: "青花"   }, hex: "#2D5FA8" }, { name: { en: "Ultramarine", zh: "群青"  }, hex: "#3568A5" },
    ]
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
}
function rgbToHex(r,g,b) {
  return "#"+[r,g,b].map(v=>Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,"0")).join("");
}
// RYB ↔ RGB conversion based on the Itten/Heer colour wheel.
// Maps 12 RYB hue steps (0..1) to known RGB values, then interpolates.
// This is the only approach that gives correct artist-paint results:
// red+yellow=orange, yellow+blue=green, red+blue=purple.
const RYB_TO_RGB_MAP = [
  [255,  0,  0],  // 0/12  red
  [255, 83,  0],  // 1/12  red-orange
  [255,165,  0],  // 2/12  orange
  [255,211,  0],  // 3/12  yellow-orange
  [255,255,  0],  // 4/12  yellow
  [128,255,  0],  // 5/12  yellow-green
  [  0,200,  0],  // 6/12  green
  [  0,158, 96],  // 7/12  blue-green
  [  0, 90,171],  // 8/12  blue
  [ 75,  0,130],  // 9/12  blue-violet
  [139,  0,255],  // 10/12 violet
  [210,  0,150],  // 11/12 red-violet
];

function rybHueToRgb(h) {
  // h is 0..1 around the RYB wheel
  const n = RYB_TO_RGB_MAP.length;
  const pos = ((h % 1) + 1) % 1 * n;
  const lo = Math.floor(pos) % n;
  const hi = (lo + 1) % n;
  const t = pos - Math.floor(pos);
  const a = RYB_TO_RGB_MAP[lo];
  const b = RYB_TO_RGB_MAP[hi];
  return [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t];
}

// Convert an RGB colour to RYB hue (0..1), saturation (0..1), value (0..1)
function rgbToRybHsv(r, g, b) {
  // Normalise
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r,g,b), mn = Math.min(r,g,b);
  const v = mx;
  const s = mx === 0 ? 0 : (mx-mn)/mx;

  if (s === 0) return { h: 0, s: 0, v };

  // Standard RGB hue (0..1)
  let rgbH;
  if (mx === r)      rgbH = (g - b) / (mx - mn) / 6;
  else if (mx === g) rgbH = (2 + (b - r) / (mx - mn)) / 6;
  else               rgbH = (4 + (r - g) / (mx - mn)) / 6;
  rgbH = ((rgbH % 1) + 1) % 1;

  // Map RGB hue → RYB hue using a piecewise remap.
  // Key anchors: RGB 0=red, 0.167=yellow, 0.333=green, 0.5=cyan, 0.667=blue, 0.833=magenta
  //   maps to  RYB 0=red, 0.333=yellow, 0.5=green,  0.583=teal, 0.667=blue, 0.833=purple
  const rgbAnchors = [0, 0.167, 0.333, 0.5,   0.667, 0.833, 1.0];
  const rybAnchors = [0, 0.333, 0.5,   0.583, 0.667, 0.833, 1.0];
  let rybH = rgbH;
  for (let i = 0; i < rgbAnchors.length - 1; i++) {
    if (rgbH >= rgbAnchors[i] && rgbH <= rgbAnchors[i+1]) {
      const t = (rgbH - rgbAnchors[i]) / (rgbAnchors[i+1] - rgbAnchors[i]);
      rybH = rybAnchors[i] + t * (rybAnchors[i+1] - rybAnchors[i]);
      break;
    }
  }
  return { h: rybH, s, v };
}

function rybHsvToRgb(h, s, v) {
  if (s === 0) {
    const c = Math.round(v * 255);
    return [c, c, c];
  }
  const [r, g, b] = rybHueToRgb(h);
  // Desaturate toward white, then scale by value toward black
  const mix = (ch) => ((ch/255) * s + (1 - s)) * v * 255;
  return [mix(r), mix(g), mix(b)];
}

function mixColors(counts) {
  const total = Object.values(counts).reduce((a,b)=>a+b,0);
  if (total===0) return [255,255,255];

  // Separate chromatic colours from white/black (they affect sat/value, not hue)
  const chromatic = ALL_COLORS.filter(c => c.id !== 'white' && c.id !== 'black');
  const whiteW  = (counts['white']  || 0) / total;
  const blackW  = (counts['black']  || 0) / total;
  const colorW  = 1 - whiteW - blackW;

  if (colorW <= 0) {
    // Only white/black: interpolate grey
    const v = whiteW / (whiteW + blackW);
    const c = Math.round(v * 245 + (1-v) * 15);
    return [c, c, c];
  }

  // Weighted average of RYB hue components using unit-circle averaging
  // (prevents red+violet wrapping issues)
  let sinSum = 0, cosSum = 0, sSum = 0, vSum = 0, wTotal = 0;
  chromatic.forEach(({ id, rgb }) => {
    const w = (counts[id] || 0) / total;
    if (w === 0) return;
    const { h, s, v } = rgbToRybHsv(...rgb);
    const angle = h * 2 * Math.PI;
    sinSum += Math.sin(angle) * w;
    cosSum += Math.cos(angle) * w;
    sSum   += s * w;
    vSum   += v * w;
    wTotal += w;
  });

  const avgH = ((Math.atan2(sinSum, cosSum) / (2 * Math.PI)) + 1) % 1;
  const avgS = sSum / wTotal;
  const avgV = vSum / wTotal;

  let [r, g, b] = rybHsvToRgb(avgH, avgS, avgV);

  // Apply white (tints) and black (shades)
  r = r * colorW + 245 * whiteW + 15 * blackW;
  g = g * colorW + 245 * whiteW + 15 * blackW;
  b = b * colorW + 245 * whiteW + 15 * blackW;

  return [Math.round(r), Math.round(g), Math.round(b)];
}
function colorSimilarity(rgb1,rgb2) {
  const d = Math.sqrt((rgb1[0]-rgb2[0])**2+(rgb1[1]-rgb2[1])**2+(rgb1[2]-rgb2[2])**2);
  return Math.max(0,Math.round((1-d/Math.sqrt(3*255*255))*100));
}
const initCounts = () => Object.fromEntries(ALL_COLORS.map(c=>[c.id,0]));

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState("en");
  const t = TRANSLATIONS[lang];
  const L = (obj) => (typeof obj === "string" ? obj : obj[lang]);

  const [counts, setCounts] = useState(initCounts());
  const [targetHex, setTargetHex] = useState("#FF6B6B");
  const [showSwatches, setShowSwatches] = useState(false);
  const [activeCat, setActiveCat] = useState(0);
  const [flash, setFlash] = useState(null);

  const [uploadedImage, setUploadedImage] = useState(null);
  const [showEyedropper, setShowEyedropper] = useState(false);
  const [hoverColor, setHoverColor] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [crosshair, setCrosshair] = useState({ x: 0, y: 0 });

  const fileRef = useRef();
  const canvasRef = useRef();
  const imgRef = useRef();
  const eyedropperContainerRef = useRef();

  const total = Object.values(counts).reduce((a,b)=>a+b,0);
  const mixedRgb = mixColors(counts);
  const mixedHex = rgbToHex(...mixedRgb);
  const targetRgb = hexToRgb(targetHex);
  const similarity = colorSimilarity(mixedRgb, targetRgb);

  const add = (id) => { setCounts(p=>({...p,[id]:p[id]+1})); setFlash(id); setTimeout(()=>setFlash(null),300); };
  const sub = (id) => setCounts(p=>({...p,[id]:Math.max(0,p[id]-1)}));
  const reset = () => setCounts(initCounts());

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadedImage(ev.target.result);
      setShowEyedropper(true);
      setShowSwatches(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, []);

  useEffect(() => {
    if (!showEyedropper || !uploadedImage || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const maxW = 460;
      let w = img.width, h = img.height;
      if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = uploadedImage;
  }, [showEyedropper, uploadedImage]);

  const getColorAt = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);
    const px = Math.max(0, Math.min(canvas.width-1, x));
    const py = Math.max(0, Math.min(canvas.height-1, y));
    const d = canvas.getContext("2d").getImageData(px, py, 1, 1).data;
    return { hex: rgbToHex(d[0],d[1],d[2]), x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleCanvasMove = (e) => {
    const result = getColorAt(e);
    if (result) { setHoverColor(result.hex); setCrosshair({ x: result.x, y: result.y }); }
  };

  const handleCanvasDblClick = (e) => {
    const result = getColorAt(e);
    if (result) setSelectedColor(result.hex);
  };

  const getBar = (id) => total===0 ? 0 : Math.round((counts[id]/total)*100);
  const radius = 44, circ = 2*Math.PI*radius;
  const simColor = similarity>=85?"#4ade80":similarity>=60?"#facc15":"#f87171";

  const ColorCard = ({ color, secondary }) => {
    const cnt = counts[color.id];
    const isWhite = color.id==="white";
    const glow = color.id==="black"?"#666":isWhite?"#ccc":color.hex;
    return (
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,flex:1,minWidth:0}}>
        <div onClick={()=>add(color.id)} style={{
          width:"100%", aspectRatio:"1",
          borderRadius: secondary ? "50%" : 12,
          background: color.hex,
          border: isWhite ? "1px solid rgba(255,255,255,0.2)" : secondary ? `2px solid ${color.hex}55` : "none",
          cursor:"pointer", position:"relative",
          boxShadow: cnt>0 ? `0 0 20px ${glow}80, 0 4px 12px rgba(0,0,0,0.5)` : "0 2px 8px rgba(0,0,0,0.3)",
          transform: flash===color.id ? "scale(0.87)" : "scale(1)",
          transition:"transform 0.15s, box-shadow 0.3s",
          outline: secondary && cnt>0 ? `2px solid ${color.hex}` : "none",
          outlineOffset: 2,
        }}>
          {cnt>0 && (
            <div style={{position:"absolute",top:-6,right:-6,width:18,height:18,borderRadius:"50%",background:"#0e0e12",border:"1px solid rgba(255,255,255,0.2)",fontSize:10,fontFamily:"monospace",color:"#f0ece3",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{cnt}</div>
          )}
          {secondary && (
            <div style={{position:"absolute",bottom:"2px",left:"50%",transform:"translateX(-50%)",fontSize:7,color:"rgba(255,255,255,0.65)",background:"rgba(0,0,0,0.55)",padding:"1px 4px",borderRadius:3,letterSpacing:"0.03em",whiteSpace:"nowrap",pointerEvents:"none"}}>{L(color.fromLabel)}</div>
          )}
        </div>
        <div style={{fontSize:11,letterSpacing:"0.05em",color:cnt>0?"#f0ece3":"#5a5850",fontWeight:cnt>0?600:400,transition:"color 0.2s"}}>{L(color.label)}</div>
        <div style={{display:"flex",gap:4,width:"100%"}}>
          <button onClick={()=>sub(color.id)} disabled={cnt===0} style={{flex:1,height:28,fontSize:18,fontWeight:700,background:cnt>0?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.03)",border:"none",borderRadius:7,color:cnt>0?"#f0ece3":"#333",cursor:cnt>0?"pointer":"not-allowed",transition:"all 0.12s",display:"flex",alignItems:"center",justifyContent:"center"}}
            onMouseDown={e=>cnt>0&&(e.currentTarget.style.transform="scale(0.88)")}
            onMouseUp={e=>(e.currentTarget.style.transform="scale(1)")}
            onMouseLeave={e=>(e.currentTarget.style.transform="scale(1)")}
          >−</button>
          <button onClick={()=>add(color.id)} style={{flex:1,height:28,fontSize:16,fontWeight:700,background:secondary?`linear-gradient(135deg,${color.hex}50,${color.hex}25)`:"rgba(255,255,255,0.1)",border:secondary?`1px solid ${color.hex}50`:"none",borderRadius:7,color:"#f0ece3",cursor:"pointer",transition:"all 0.12s",display:"flex",alignItems:"center",justifyContent:"center"}}
            onMouseDown={e=>(e.currentTarget.style.transform="scale(0.88)")}
            onMouseUp={e=>(e.currentTarget.style.transform="scale(1)")}
            onMouseLeave={e=>(e.currentTarget.style.transform="scale(1)")}
          >＋</button>
        </div>
      </div>
    );
  };

  return (
    <div style={{minHeight:"100vh",background:"#0e0e12",color:"#f0ece3",fontFamily:"'Noto Serif SC','SimSun',serif",display:"flex",flexDirection:"column",alignItems:"center",padding:"60px 16px 50px",boxSizing:"border-box",position:"relative"}}>

      {/* ── Language switcher (top-right, below status bar) ── */}
      <div style={{position:"absolute",top:52,right:18,zIndex:200}}>
        <select
          value={lang}
          onChange={e=>setLang(e.target.value)}
          style={{
            background:"rgba(255,255,255,0.06)",
            border:"1px solid rgba(255,255,255,0.14)",
            borderRadius:8,
            color:"#c9b99a",
            fontSize:11,
            padding:"5px 10px",
            cursor:"pointer",
            outline:"none",
            letterSpacing:"0.06em",
            appearance:"none",
            WebkitAppearance:"none",
            paddingRight:24,
            backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23c9b99a'/%3E%3C/svg%3E")`,
            backgroundRepeat:"no-repeat",
            backgroundPosition:"right 8px center",
          }}
        >
          <option value="en">🌐 English</option>
          <option value="zh">🌐 中文</option>
        </select>
      </div>

      {/* ── Title ── */}
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontSize:10,letterSpacing:"0.35em",color:"#3d3c38",marginBottom:4}}>{t.subtitle}</div>
        <h1 style={{fontSize:26,fontWeight:700,margin:0,letterSpacing:"0.06em",background:"linear-gradient(135deg,#f0ece3,#c9b99a)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{t.title}</h1>
      </div>

      {/* ── Eyedropper modal ── */}
      {showEyedropper && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:100,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:16}} onClick={(e)=>{ if(e.target===e.currentTarget) setShowEyedropper(false); }}>
          <div style={{background:"#18181e",borderRadius:16,padding:16,maxWidth:500,width:"100%",border:"1px solid rgba(255,255,255,0.1)",maxHeight:"90vh",display:"flex",flexDirection:"column"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexShrink:0}}>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:"#f0ece3",letterSpacing:"0.05em"}}>{t.eyedropperTitle}</div>
                <div style={{fontSize:10,color:"#6b6860",marginTop:2}}>{t.eyedropperHint}</div>
              </div>
              <button onClick={()=>setShowEyedropper(false)} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,color:"#a09880",fontSize:16,width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>

            <div ref={eyedropperContainerRef} style={{position:"relative",borderRadius:10,overflow:"auto",cursor:"crosshair",lineHeight:0,border:"1px solid rgba(255,255,255,0.08)",flexShrink:1,maxHeight:"50vh"}}>
              <canvas
                ref={canvasRef}
                style={{width:"100%",display:"block",borderRadius:10}}
                onMouseMove={handleCanvasMove}
                onMouseLeave={()=>setHoverColor(null)}
                onDoubleClick={handleCanvasDblClick}
              />
              {hoverColor && (
                <div style={{position:"absolute",left:crosshair.x,top:crosshair.y,transform:"translate(-50%,-50%)",pointerEvents:"none",zIndex:10}}>
                  <div style={{width:28,height:28,borderRadius:"50%",border:"2px solid #fff",boxShadow:"0 0 0 1px rgba(0,0,0,0.5)",position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <div style={{width:4,height:4,borderRadius:"50%",background:"#fff",boxShadow:"0 0 0 1px rgba(0,0,0,0.4)"}}/>
                  </div>
                  <div style={{position:"absolute",left:"50%",top:-52,transform:"translateX(-50%)",background:"rgba(14,14,18,0.95)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"5px 10px",display:"flex",alignItems:"center",gap:8,whiteSpace:"nowrap",boxShadow:"0 4px 16px rgba(0,0,0,0.5)"}}>
                    <div style={{width:20,height:20,borderRadius:4,background:hoverColor,border:"1px solid rgba(255,255,255,0.15)",flexShrink:0}}/>
                    <span style={{fontSize:11,fontFamily:"monospace",color:"#f0ece3",letterSpacing:"0.05em"}}>{hoverColor.toUpperCase()}</span>
                  </div>
                </div>
              )}
            </div>

            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:12,padding:"8px 12px",background:"rgba(255,255,255,0.04)",borderRadius:8}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,flexShrink:0}}>
                <div style={{width:26,height:26,borderRadius:6,background:hoverColor||"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",transition:"background 0.05s"}}/>
                <div style={{fontSize:8,color:"#4a4840"}}>{t.hover}</div>
              </div>
              <div style={{fontSize:13,color:"#3d3c38",flexShrink:0}}>→</div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,flexShrink:0}}>
                <div style={{width:26,height:26,borderRadius:6,background:selectedColor||"rgba(255,255,255,0.04)",border:`2px solid ${selectedColor?"rgba(255,255,255,0.35)":"rgba(255,255,255,0.08)"}`,boxShadow:selectedColor?`0 0 8px ${selectedColor}90`:"none",transition:"all 0.2s"}}/>
                <div style={{fontSize:8,color:selectedColor?"#c9b99a":"#4a4840"}}>{t.selected}</div>
              </div>
              <div style={{flex:1,minWidth:0,paddingLeft:2}}>
                <div style={{fontSize:10,color:"#6b6860"}}>{selectedColor ? t.clickConfirm : t.dblClickLock}</div>
                <div style={{fontSize:11,fontFamily:"monospace",color:"#c9b99a",letterSpacing:"0.05em",marginTop:1}}>{(selectedColor||hoverColor||"").toUpperCase()}</div>
              </div>
              <button onClick={()=>fileRef.current.click()} style={{fontSize:10,padding:"5px 8px",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,color:"#a09880",cursor:"pointer",flexShrink:0}}>{t.changeImage}</button>
            </div>

            <button
              onClick={()=>{if(selectedColor){setTargetHex(selectedColor);setShowEyedropper(false);setHoverColor(null);setSelectedColor(null);}}}
              disabled={!selectedColor}
              style={{
                width:"100%",marginTop:10,padding:"12px 0",
                borderRadius:9,border:"none",
                cursor:selectedColor?"pointer":"not-allowed",
                fontSize:13,fontWeight:700,letterSpacing:"0.1em",
                background:selectedColor?`linear-gradient(135deg,${selectedColor}ee,${selectedColor}aa)`:"rgba(255,255,255,0.05)",
                color:selectedColor?"#fff":"#3a3a38",
                boxShadow:selectedColor?`0 4px 22px ${selectedColor}55`:"none",
                transition:"all 0.25s",
                display:"flex",alignItems:"center",justifyContent:"center",gap:10,
              }}
            >
              {selectedColor?(
                <>
                  <div style={{width:16,height:16,borderRadius:4,background:selectedColor,border:"2px solid rgba(255,255,255,0.5)",flexShrink:0}}/>
                  {t.confirmUse}
                </>
              ):t.pickFirst}
            </button>
          </div>
        </div>
      )}

      {/* ── Comparison row ── */}
      <div style={{display:"flex",gap:12,marginBottom:18,width:"100%",maxWidth:500}}>
        {/* Target */}
        <div style={{flex:1,display:"flex",flexDirection:"column",gap:7}}>
          <div style={{fontSize:10,letterSpacing:"0.2em",color:"#6b6860"}}>{t.targetLabel}</div>
          <div style={{height:92,borderRadius:12,background:targetHex,border:"1px solid rgba(255,255,255,0.08)",boxShadow:`0 8px 28px ${targetHex}50`,display:"flex",alignItems:"flex-end",padding:"8px 10px"}}>
            <span style={{fontSize:10,background:"rgba(0,0,0,0.5)",color:"#fff",padding:"2px 6px",borderRadius:4}}>{targetHex.toUpperCase()}</span>
          </div>
          <div style={{display:"flex",gap:5}}>
            <button onClick={()=>fileRef.current.click()} style={{flex:1,fontSize:10,padding:"6px 0",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,color:"#c9b99a",cursor:"pointer",letterSpacing:"0.03em"}}>{t.importImage}</button>
            <button onClick={()=>{setShowSwatches(!showSwatches);setShowEyedropper(false);}} style={{flex:1,fontSize:10,padding:"6px 0",background:showSwatches?"rgba(201,185,154,0.15)":"rgba(255,255,255,0.05)",border:`1px solid ${showSwatches?"rgba(201,185,154,0.4)":"rgba(255,255,255,0.1)"}`,borderRadius:6,color:"#c9b99a",cursor:"pointer"}}>{t.swatches}</button>
          </div>
          {uploadedImage && (
            <button onClick={()=>setShowEyedropper(true)} style={{fontSize:10,padding:"6px 0",background:"rgba(255,200,100,0.1)",border:"1px solid rgba(255,200,100,0.3)",borderRadius:6,color:"#fbbf24",cursor:"pointer",letterSpacing:"0.05em"}}>{t.eyedropperBtn}</button>
          )}
          <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleImageUpload}/>
        </div>

        {/* Ring */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",width:92}}>
          <div style={{position:"relative",width:92,height:92}}>
            <svg width="92" height="92" viewBox="0 0 100 100" style={{transform:"rotate(-90deg)",position:"absolute",top:0,left:0}}>
              <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
              <circle cx="50" cy="50" r={radius} fill="none" stroke={simColor} strokeWidth="8" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ*(1-similarity/100)} style={{transition:"stroke-dashoffset 0.5s ease,stroke 0.3s"}}/>
            </svg>
            <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
              <div style={{fontSize:19,fontWeight:700,color:simColor,lineHeight:1,fontFamily:"monospace"}}>{similarity}%</div>
              <div style={{fontSize:9,color:"#6b6860",letterSpacing:"0.1em",marginTop:2}}>{t.similarity}</div>
            </div>
          </div>
        </div>

        {/* Mixed */}
        <div style={{flex:1,display:"flex",flexDirection:"column",gap:7}}>
          <div style={{fontSize:10,letterSpacing:"0.2em",color:"#6b6860"}}>{t.mixedLabel}</div>
          <div style={{height:92,borderRadius:12,background:total===0?"rgba(255,255,255,0.04)":mixedHex,border:"1px solid rgba(255,255,255,0.08)",boxShadow:total===0?"none":`0 8px 28px ${mixedHex}50`,display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.4s,box-shadow 0.4s",position:"relative",overflow:"hidden"}}>
            {total===0&&<span style={{fontSize:10,color:"#6b6860"}}>{t.waiting}</span>}
            {total>0&&<div style={{position:"absolute",bottom:8,left:10,fontSize:10,background:"rgba(0,0,0,0.5)",color:"#fff",padding:"2px 6px",borderRadius:4}}>{mixedHex.toUpperCase()}</div>}
          </div>
          <button onClick={reset} style={{fontSize:10,padding:"6px 0",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,color:"#c9b99a",cursor:"pointer"}}>{t.reset}</button>
        </div>
      </div>

      {/* ── Swatch panel ── */}
      {showSwatches && (
        <div style={{width:"100%",maxWidth:500,background:"rgba(14,14,20,0.98)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:14,marginBottom:16,overflow:"hidden"}}>
          <div style={{display:"flex",overflowX:"auto",borderBottom:"1px solid rgba(255,255,255,0.07)",padding:"0 4px",gap:2,scrollbarWidth:"none"}}>
            {SWATCH_CATEGORIES.map((cat,i)=>(
              <button key={i} onClick={()=>setActiveCat(i)} style={{
                flexShrink:0, fontSize:10, padding:"9px 10px",
                background:"none", border:"none",
                borderBottom: activeCat===i ? "2px solid #c9b99a" : "2px solid transparent",
                color: activeCat===i ? "#f0ece3" : "#6b6860",
                cursor:"pointer", whiteSpace:"nowrap",
                letterSpacing:"0.05em", transition:"color 0.15s",
              }}>{L(cat.name)}</button>
            ))}
          </div>
          <div style={{padding:12,display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:7}}>
            {SWATCH_CATEGORIES[activeCat].swatches.map(s=>(
              <div key={s.hex} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"pointer"}}
                onClick={()=>{setTargetHex(s.hex);setShowSwatches(false);}}
              >
                <div style={{
                  width:"100%", aspectRatio:"1", borderRadius:8,
                  background:s.hex,
                  border: targetHex===s.hex ? "2px solid #f0ece3" : "2px solid transparent",
                  boxShadow: targetHex===s.hex ? `0 0 10px ${s.hex}80` : `0 2px 6px rgba(0,0,0,0.4)`,
                  transition:"transform 0.15s, box-shadow 0.2s",
                }}
                  onMouseEnter={e=>e.currentTarget.style.transform="scale(1.12)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
                />
                <div style={{fontSize:9,color:"#5a5850",letterSpacing:"0.02em",textAlign:"center",lineHeight:1.2,maxWidth:"100%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{L(s.name)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Proportion bars ── */}
      {total>0 && (
        <div style={{width:"100%",maxWidth:500,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:12,padding:"12px 14px",marginBottom:18,display:"flex",flexDirection:"column",gap:7}}>
          <div style={{fontSize:10,letterSpacing:"0.2em",color:"#6b6860",marginBottom:2}}>{t.ratioTitle}</div>
          {ALL_COLORS.filter(c=>counts[c.id]>0).map(c=>(
            <div key={c.id} style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:10,height:10,borderRadius:"50%",background:c.hex,border:c.id==="white"?"1px solid rgba(255,255,255,0.25)":"none",flexShrink:0}}/>
              <div style={{fontSize:11,color:"#a09880",width:40}}>{L(c.label)}</div>
              <div style={{flex:1,height:5,borderRadius:3,background:"rgba(255,255,255,0.06)",overflow:"hidden"}}>
                <div style={{width:`${getBar(c.id)}%`,height:"100%",background:c.id==="white"?"#d4d0c8":c.hex,borderRadius:3,transition:"width 0.3s ease"}}/>
              </div>
              <div style={{fontSize:11,color:"#c9b99a",width:32,textAlign:"right",fontFamily:"monospace"}}>{getBar(c.id)}%</div>
              <div style={{fontSize:10,color:"#6b6860",width:24,textAlign:"right",fontFamily:"monospace"}}>×{counts[c.id]}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Base colors ── */}
      <div style={{width:"100%",maxWidth:500}}>
        <div style={{fontSize:10,letterSpacing:"0.25em",color:"#3d3c38",marginBottom:10}}>{t.baseColors}</div>
        <div style={{display:"flex",gap:8}}>
          {BASE_COLORS.map(c=><ColorCard key={c.id} color={c} secondary={false}/>)}
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{width:"100%",maxWidth:500,display:"flex",alignItems:"center",gap:10,margin:"18px 0 14px"}}>
        <div style={{flex:1,height:1,background:"rgba(255,255,255,0.07)"}}/>
        <div style={{fontSize:10,letterSpacing:"0.2em",color:"#4a4840",whiteSpace:"nowrap"}}>{t.secondaryDivider}</div>
        <div style={{flex:1,height:1,background:"rgba(255,255,255,0.07)"}}/>
      </div>

      {/* ── Secondary colors ── */}
      <div style={{width:"100%",maxWidth:500}}>
        <div style={{display:"flex",gap:14,justifyContent:"center"}}>
          {SECONDARY_COLORS.map(c=>(
            <div key={c.id} style={{flex:1,maxWidth:130}}>
              <ColorCard color={c} secondary={true}/>
            </div>
          ))}
        </div>
      </div>

      <div style={{marginTop:28,fontSize:10,color:"#2a2925",letterSpacing:"0.18em",textAlign:"center"}}>
        {t.hint}
      </div>
    </div>
  );
}
