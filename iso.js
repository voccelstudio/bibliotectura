/* ══════════════════════════════════════
   ISO.JS v6 — Fixed
   - 4 vistas isométricas discretas correctas
   - Painter's algorithm correcto por vista
   - Top view en coordenadas mundo (sin rotación)
   - Snap robusto por raycasting
   - Colisión AABB
   - Sombras con gradiente
   - Medición en vista superior
══════════════════════════════════════ */

/* ── 4 VISTAS ISOMÉTRICAS CANÓNICAS ─────────────────────
   Cada vista define:
   ax,ay: cómo el eje X del mundo → pantalla
   bx,by: cómo el eje Y del mundo → pantalla
   Z siempre va hacia arriba en pantalla (-1 en Y)

   Vista 0 (NE): mirando desde NE, X va abajo-derecha, Y va abajo-izquierda
   Vista 1 (SE): mirando desde SE
   Vista 2 (SW): mirando desde SW
   Vista 3 (NW): mirando desde NW
─────────────────────────────────────────────────────────── */
const VIEWS = [
  { name:'NE', ax: 0.866, ay: 0.5,  bx:-0.866, by: 0.5  },
  { name:'SE', ax:-0.866, ay: 0.5,  bx:-0.866, by:-0.5  },
  { name:'SW', ax:-0.866, ay:-0.5,  bx: 0.866, by:-0.5  },
  { name:'NW', ax: 0.866, ay:-0.5,  bx: 0.866, by: 0.5  },
];

// Which faces are visible from each camera direction
// Order: top, bottom, front(+y), back(-y), right(+x), left(-x)
const VISIBLE_FACES = {
  0: ['top','front','right'],   // NE: sees top, south face (+y), east face (+x)
  1: ['top','front','left'],    // SE: sees top, south face (+y), west face (-x)
  2: ['top','back','left'],     // SW: sees top, north face (-y), west face (-x)
  3: ['top','back','right'],    // NW: sees top, north face (-y), east face (+x)
};

// Painter's sort depth sign per view
// We sort elements so that the "deepest" (furthest from camera) draws first
const DEPTH_SIGNS = [
  (rx,ry) =>  rx + ry,   // NE: further = more negative rx+ry
  (rx,ry) => -rx + ry,   // SE
  (rx,ry) => -rx - ry,   // SW
  (rx,ry) =>  rx - ry,   // NW
];

/* ── STATE ── */
let isoScale=22, isoPan={x:0,y:0}, isoNorth=0;
let isoShadow=false, isoMode='select', isoSelColor='#42A5F5';
let isoElements=[], isoElId=0, isoLot=null, isoMeasurePts=[];
let isoSelectedEl=null, isoSelectedFace=null;
let isoCamView=0;            // 0-3, index into VIEWS
let isoOrbitAngle=0;         // continuous 0-360, for smooth widget display

let ghostPos=null;

/* ── MOUSE ── */
let mDown=false,mBtn=-1,mSX=0,mSY=0,mLX=0,mLY=0;
let mPan={x:0,y:0},mDragEl=null,mDragOX=0,mDragOY=0,mMoved=false;
let mOrbiting=false,mOrbitStartX=0,mOrbitStartView=0;

/* ── TOP VIEW ── */
let tvMeasurePts=[], tvMode='normal', tvMousePos=null, tvMeasureStart=null;

/* ── CANVAS ── */
let isoCanvas,isoCtx,isoArea,topCanvas,topCtx;

/* ══════════════════════════════════════ INIT */
function isoInit(){
  isoCanvas=document.getElementById('iso-canvas');
  if(!isoCanvas)return;
  isoCtx=isoCanvas.getContext('2d');
  isoArea=document.getElementById('iso-canvas-area');

  const existingTop = document.getElementById('top-view-canvas');
  if (existingTop) existingTop.remove();
  topCanvas=document.createElement('canvas');
  topCanvas.id='top-view-canvas';
  topCanvas.width=topCanvas.height=280;
  Object.assign(topCanvas.style,{
    position:'absolute',top:'12px',right:'12px',
    borderRadius:'12px',border:'1px solid rgba(128,128,128,0.20)',
    cursor:'crosshair',boxShadow:'0 4px 24px rgba(0,0,0,0.22)',
    zIndex:'10', background:'#fff'
  });
  isoArea.appendChild(topCanvas);
  topCtx=topCanvas.getContext('2d');

  isoResize();
  isoCanvas.addEventListener('mousedown',  isoMD);
  isoCanvas.addEventListener('mousemove',  isoMV);
  isoCanvas.addEventListener('mouseup',    isoMU);
  isoCanvas.addEventListener('mouseleave', isoML);
  isoCanvas.addEventListener('wheel',      isoWH,{passive:false});
  isoCanvas.addEventListener('contextmenu',e=>e.preventDefault());
  topCanvas.addEventListener('mousedown',  tvMD);
  topCanvas.addEventListener('mousemove',  tvMV);
  topCanvas.addEventListener('mouseleave', ()=>{ghostPos=null;tvMousePos=null;renderTopView();isoRenderAll();});

  isoBuildColorGrid();
  isoApplyLot();
}

function isoResize(){
  if(!isoCanvas||!isoArea)return;
  isoCanvas.width=isoArea.clientWidth;
  isoCanvas.height=isoArea.clientHeight;
  isoPan={x:isoCanvas.width*.5,y:isoCanvas.height*.58};
  isoRenderAll();
}

/* ══════════════════════════════════════ PROJECTION */
function V(){ return VIEWS[isoCamView]; }

// Project world → screen
function proj(wx,wy,wz){
  // Apply north rotation to world coords
  const nr=isoNorth*Math.PI/180;
  const rx=wx*Math.cos(nr)-wy*Math.sin(nr);
  const ry=wx*Math.sin(nr)+wy*Math.cos(nr);
  const v=V();
  return{
    x: isoPan.x + (rx*v.ax + ry*v.bx)*isoScale,
    y: isoPan.y + (rx*v.ay + ry*v.by)*isoScale - wz*isoScale
  };
}

// Unproject screen → world (at z=0 unless overridden)
function unproj(sx,sy){
  const v=V(), s=isoScale;
  const dx=(sx-isoPan.x)/s, dy=(sy-isoPan.y)/s;
  const det=v.ax*v.by - v.bx*v.ay;
  if(Math.abs(det)<.0001) return{wx:0,wy:0};
  const rx=(dx*v.by - dy*v.bx)/det;
  const ry=(dy*v.ax - dx*v.ay)/det;
  // Un-rotate north
  const nr=-isoNorth*Math.PI/180;
  return{
    wx: rx*Math.cos(nr) - ry*Math.sin(nr),
    wy: rx*Math.sin(nr) + ry*Math.cos(nr)
  };
}

// Painter's depth for an element
function elDepth(el){
  const nr=isoNorth*Math.PI/180;
  const cx=el.x+(el.w||0)/2, cy=el.y+(el.d||0)/2;
  const rx=cx*Math.cos(nr)-cy*Math.sin(nr);
  const ry=cx*Math.sin(nr)+cy*Math.cos(nr);
  return DEPTH_SIGNS[isoCamView](rx,ry);
}

/* ══════════════════════════════════════ LOT */
function isoGetLotPts(type,w,d,w2){
  switch(type){
    case'l':    return[{x:0,y:0},{x:w,y:0},{x:w,y:d/2},{x:w/2,y:d/2},{x:w/2,y:d},{x:0,y:d}];
    case'trap': return[{x:0,y:0},{x:w,y:0},{x:w-(w-w2)/2,y:d},{x:(w-w2)/2,y:d}];
    case'irreg':return[{x:0,y:0},{x:w,y:0},{x:w+w*.08,y:d*.38},{x:w*.88,y:d},{x:w*.12,y:d},{x:-w*.05,y:d*.62}];
    default:    return[{x:0,y:0},{x:w,y:0},{x:w,y:d},{x:0,y:d}];
  }
}

function isoApplyLot(){
  const w=+document.getElementById('iso-lot-w').value||20;
  const d=+document.getElementById('iso-lot-d').value||30;
  const w2=+document.getElementById('iso-lot-w2').value||15;
  const type=document.getElementById('iso-lot-type').value;
  isoLot={type,w,d,w2,pts:isoGetLotPts(type,w,d,w2)};
  if(isoCanvas)isoPan={x:isoCanvas.width*.5,y:isoCanvas.height*.55};
  isoUpdateStats();
  isoRenderAll();
  isoSetHint('Lote listo · Scroll-click+arrastrar para orbitar · Click derecho para mover vista');
}

/* ══════════════════════════════════════ SNAP / RAY CAST */
// For isometric projection, a screen ray is: fixed (wx0,wy0) + t*(0,0,1)
// because X and Y world coords are fully determined by screen X,Y (Z shifts only screen Y)
function screenRayXY(sx,sy){
  // Returns (wx0,wy0) — the XY world coords this screen pixel maps to at Z=0
  // Actually wx,wy are fixed regardless of z (only sy shifts by -wz*isoScale)
  return unproj(sx,sy);
}

function snapForVolume(sx,sy){
  const nw=+document.getElementById('iso-vol-w').value||8;
  const nd=+document.getElementById('iso-vol-d').value||10;
  let best=null, bestScreenDist=50; // px threshold

  for(const el of isoElements){
    if(el.type!=='volume')continue;

    // TOP face — unproject at z=el.z+el.h
    const topZ=el.z+el.h;
    // At topZ, screen_y = pan.y + (rx*ay+ry*by)*s - topZ*s
    // So for a given (sx,sy), the effective dy when projecting at topZ is:
    const adjSy = sy + topZ*isoScale; // compensate for Z offset
    const wp=unprojAt(sx,adjSy);
    if(wp.wx>=el.x-0.5&&wp.wx<=el.x+el.w+0.5&&wp.wy>=el.y-0.5&&wp.wy<=el.y+el.d+0.5){
      const snapX=clamp(wp.wx,el.x,el.x+el.w-nw);
      const snapY=clamp(wp.wy,el.y,el.y+el.d-nd);
      const fc=proj(el.x+el.w/2,el.y+el.d/2,topZ);
      const d=Math.hypot(sx-fc.x,sy-fc.y);
      if(d<bestScreenDist){bestScreenDist=d;best={wx:snapX,wy:snapY,wz:topZ,snapEl:el,snapFace:{id:'top'}};}
    }

    // SIDE FACES — detect by proximity to face center on screen
    const faceCenters=[
      {id:'front', wx:el.x+el.w/2, wy:el.y+el.d,   wz:el.z+el.h/2, placeX:el.x,     placeY:el.y+el.d},
      {id:'back',  wx:el.x+el.w/2, wy:el.y,         wz:el.z+el.h/2, placeX:el.x,     placeY:el.y-nd},
      {id:'right', wx:el.x+el.w,   wy:el.y+el.d/2,  wz:el.z+el.h/2, placeX:el.x+el.w,placeY:el.y},
      {id:'left',  wx:el.x,        wy:el.y+el.d/2,  wz:el.z+el.h/2, placeX:el.x-nw,  placeY:el.y},
    ];
    for(const fc_ of faceCenters){
      if(!isFaceVisible(fc_.id))continue;
      const sp=proj(fc_.wx,fc_.wy,fc_.wz);
      const d=Math.hypot(sx-sp.x,sy-sp.y);
      if(d<bestScreenDist){
        bestScreenDist=d;
        best={wx:fc_.placeX,wy:fc_.placeY,wz:el.z,snapEl:el,snapFace:{id:fc_.id}};
      }
    }
  }

  if(!best){
    const wp=unproj(sx,sy);
    const stackZ=getStackZ(wp.wx,wp.wy,nw,nd);
    return{wx:wp.wx,wy:wp.wy,wz:stackZ,snapEl:null,snapFace:null};
  }
  return best;
}

function unprojAt(sx,sy){
  // Same as unproj but with pre-adjusted sy
  const v=V(),s=isoScale;
  const dx=(sx-isoPan.x)/s,dy=(sy-isoPan.y)/s;
  const det=v.ax*v.by-v.bx*v.ay;
  if(Math.abs(det)<.0001)return{wx:0,wy:0};
  const rx=(dx*v.by-dy*v.bx)/det;
  const ry=(dy*v.ax-dx*v.ay)/det;
  const nr=-isoNorth*Math.PI/180;
  return{wx:rx*Math.cos(nr)-ry*Math.sin(nr),wy:rx*Math.sin(nr)+ry*Math.cos(nr)};
}

function clamp(v,mn,mx){return Math.max(mn,Math.min(mx,v));}

function isFaceVisible(faceId){
  return VISIBLE_FACES[isoCamView].includes(faceId);
}

function getStackZ(nx,ny,nw,nd){
  let maxZ=0;
  isoElements.filter(e=>e.type==='volume').forEach(el=>{
    if(nx<el.x+el.w&&nx+nw>el.x&&ny<el.y+el.d&&ny+nd>el.y){
      if(el.z+el.h>maxZ)maxZ=el.z+el.h;
    }
  });
  return maxZ;
}

/* ══════════════════════════════════════ COLLISION */
function checkCollision(newEl,excludeId=null){
  for(const el of isoElements){
    if(el.type!=='volume'||el.id===excludeId)continue;
    const ox=newEl.x<el.x+el.w&&newEl.x+newEl.w>el.x;
    const oy=newEl.y<el.y+el.d&&newEl.y+newEl.d>el.y;
    const oz=newEl.z<el.z+el.h-0.05&&newEl.z+newEl.h>el.z+0.05;
    if(ox&&oy&&oz)return el;
  }
  return null;
}

/* ══════════════════════════════════════ HIT TEST */
function hitTest(sx,sy){
  // Test in reverse depth order (front-to-back)
  const sorted=[...isoElements].sort((a,b)=>elDepth(a)-elDepth(b));
  for(const el of sorted){
    if(el.type==='volume'){
      // Test visible faces
      const vf=VISIBLE_FACES[isoCamView];
      const{x,y,z,w,d,h}=el;
      const facePts={
        top:  [proj(x,y,z+h),proj(x+w,y,z+h),proj(x+w,y+d,z+h),proj(x,y+d,z+h)],
        front:[proj(x,y+d,z),proj(x+w,y+d,z),proj(x+w,y+d,z+h),proj(x,y+d,z+h)],
        back: [proj(x,y,z),proj(x+w,y,z),proj(x+w,y,z+h),proj(x,y,z+h)],
        right:[proj(x+w,y,z),proj(x+w,y+d,z),proj(x+w,y+d,z+h),proj(x+w,y,z+h)],
        left: [proj(x,y,z),proj(x,y+d,z),proj(x,y+d,z+h),proj(x,y,z+h)],
      };
      for(const fid of vf){
        if(facePts[fid]&&polyContains(sx,sy,facePts[fid]))
          return{el,faceId:fid};
      }
    }
    if(el.type==='tree'){
      const p=proj(el.x,el.y,el.z+el.h);
      if(Math.hypot(sx-p.x,sy-p.y)<el.r*isoScale*.7)return{el,faceId:null};
    }
  }
  return null;
}

function polyContains(px,py,pts){
  let inside=false;
  for(let i=0,j=pts.length-1;i<pts.length;j=i++){
    const{x:xi,y:yi}=pts[i],{x:xj,y:yj}=pts[j];
    if((yi>py)!==(yj>py)&&px<(xj-xi)*(py-yi)/(yj-yi)+xi)inside=!inside;
  }
  return inside;
}

/* ══════════════════════════════════════ MOUSE */
function evXY(e,c){const r=(c||isoCanvas).getBoundingClientRect();return{sx:e.clientX-r.left,sy:e.clientY-r.top};}

function isoMD(e){
  e.preventDefault();
  const{sx,sy}=evXY(e);
  mDown=true;mBtn=e.button;mSX=sx;mSY=sy;mLX=sx;mLY=sy;mMoved=false;
  mPan={x:isoPan.x,y:isoPan.y};

  if(e.button===1){
    mOrbiting=true;mOrbitStartX=sx;mOrbitStartView=isoCamView;
    isoCanvas.style.cursor='ew-resize';return;
  }
  if(e.button===2){isoCanvas.style.cursor='grabbing';return;}

  if(e.button===0&&isoMode==='select'){
    const hit=hitTest(sx,sy);
    if(hit&&hit.el){
      isoElements.forEach(el=>el.selected=false);
      hit.el.selected=true;isoSelectedEl=hit.el;isoSelectedFace=hit.faceId;
      mDragEl=hit.el;
      const wp=unproj(sx,sy);
      mDragOX=wp.wx-hit.el.x; mDragOY=wp.wy-hit.el.y;
      isoCanvas.style.cursor='grabbing';
      isoUpdateElList();isoRenderAll();
    }else{
      isoElements.forEach(el=>el.selected=false);
      isoSelectedEl=null;isoSelectedFace=null;
      isoUpdateElList();isoRenderAll();
    }
  }
}

function isoMV(e){
  const{sx,sy}=evXY(e);
  if(Math.hypot(sx-mLX,sy-mLY)>0.8)mMoved=true;
  mLX=sx;mLY=sy;

  // Orbit with middle mouse — 4 views, snap at 90° increments based on drag
  if(mOrbiting&&mDown){
    const dx=sx-mOrbitStartX;
    const steps=Math.round(dx/80);  // 80px per view step
    isoOrbitAngle=mOrbitStartView*90 + dx*0.5;
    // Preview: show the view we'd commit to
    const previewView=((mOrbitStartView+steps)%4+4)%4;
    if(previewView!==isoCamView){
      isoCamView=previewView;
      isoRenderAll();
    }
    return;
  }

  // Pan
  if(mDown&&(mBtn===2||(mBtn===0&&isoMode==='select'&&!mDragEl))){
    isoPan.x=mPan.x+(sx-mSX);isoPan.y=mPan.y+(sy-mSY);
    isoCanvas.style.cursor='grabbing';isoRenderAll();return;
  }

  // Drag element
  if(mDown&&mBtn===0&&mDragEl){
    const wp=unproj(sx,sy);
    const nx=wp.wx-mDragOX, ny=wp.wy-mDragOY;
    // Snap Z: if hovering over another element's top
    const adjSy=sy+mDragEl.z*isoScale;
    const wpTop=unprojAt(sx,adjSy);
    let nz=mDragEl.z;
    // Check if we can drop on top of something
    for(const el of isoElements){
      if(el===mDragEl||el.type!=='volume')continue;
      const topZ=el.z+el.h;
      const adjSy2=sy+topZ*isoScale;
      const wpT=unprojAt(sx,adjSy2);
      if(wpT.wx>=el.x&&wpT.wx<=el.x+el.w&&wpT.wy>=el.y&&wpT.wy<=el.y+el.d){nz=topZ;break;}
    }
    const testEl={...mDragEl,x:nx,y:ny,z:nz};
    if(!checkCollision(testEl,mDragEl.id)){
      mDragEl.x=nx;mDragEl.y=ny;mDragEl.z=nz;
    }
    isoCanvas.style.cursor='grabbing';isoRenderAll();return;
  }

  // Ghost preview
  if(!mDown&&isoMode==='volume'){
    ghostPos=snapForVolume(sx,sy);
    const cur=ghostPos.snapEl?'cell':'crosshair';
    isoCanvas.style.cursor=cur;
    isoRenderAll();return;
  }
  if(!mDown&&isoMode==='tree'){
    const wp=unproj(sx,sy);
    ghostPos={wx:wp.wx,wy:wp.wy,wz:0,snapEl:null,snapFace:null};
    isoCanvas.style.cursor='crosshair';
    isoRenderAll();return;
  }

  if(!mDown&&isoMode==='select'){
    const hit=hitTest(sx,sy);
    isoCanvas.style.cursor=hit?'grab':'default';
  }
}

function isoMU(e){
  if(!mDown)return;
  const{sx,sy}=evXY(e);

  if(mOrbiting){
    // Already committed the view in mousemove
    mOrbiting=false;
    isoCanvas.style.cursor='default';
    isoRenderAll();mDown=false;mBtn=-1;return;
  }

  if(!mMoved&&mBtn===0) isoHandleClick(sx,sy);
  if(mDragEl){isoUpdateElList();mDragEl=null;}
  mDown=false;mBtn=-1;
  isoCanvas.style.cursor=isoMode==='select'?'default':'crosshair';
}

function isoML(){
  ghostPos=null;
  if(mDragEl){isoUpdateElList();mDragEl=null;}
  mDown=false;mBtn=-1;mOrbiting=false;
  isoRenderAll();
}

function isoWH(e){
  e.preventDefault();
  const r=isoCanvas.getBoundingClientRect();
  const mx=e.clientX-r.left,my=e.clientY-r.top;
  const f=e.deltaY<0?1.1:.91;
  isoPan.x=mx+(isoPan.x-mx)*f;isoPan.y=my+(isoPan.y-my)*f;
  isoScale=Math.max(5,Math.min(90,isoScale*f));
  isoRenderAll();
}

/* ══════════════════════════════════════ CLICK */
function isoHandleClick(sx,sy){
  if(checkCamWidget(sx,sy))return;

  if(isoMode==='measure'){
    const wp=unproj(sx,sy);
    isoMeasurePts.push({sx,sy,wx:wp.wx,wy:wp.wy});isoRenderAll();return;
  }

  if(isoMode==='volume'&&ghostPos){
    const nw=+document.getElementById('iso-vol-w').value||8;
    const nd=+document.getElementById('iso-vol-d').value||10;
    const nh=+document.getElementById('iso-vol-h').value||3;
    const func=document.getElementById('iso-vol-func').value;
    const nameRaw=document.getElementById('iso-vol-name').value.trim();
    const FL={vivienda:'Vivienda',dormitorios:'Dormitorios',living:'Living',cocina:'Cocina',
              servicios:'Servicios',garage:'Garaje',galeria:'Galería',piscina:'Piscina',custom:''};
    const newEl={id:++isoElId,type:'volume',
      x:ghostPos.wx,y:ghostPos.wy,z:ghostPos.wz,
      w:nw,d:nd,h:nh,color:isoSelColor,
      label:nameRaw||FL[func]||func,func,selected:false};
    const col=checkCollision(newEl);
    if(col){isoSetHint(`⚠ Colisión con "${col.label||'?'}" — mové el cursor`);return;}
    isoElements.push(newEl);
    ghostPos=null;isoUpdateElList();isoRenderAll();isoSetMode('select');return;
  }

  if(isoMode==='tree'){
    const wp=unproj(sx,sy);
    isoElements.push({id:++isoElId,type:'tree',x:wp.wx,y:wp.wy,z:0,
      r:+document.getElementById('iso-tree-r').value||4,
      h:+document.getElementById('iso-tree-h').value||8,
      treeType:document.getElementById('iso-tree-type').value,selected:false});
    ghostPos=null;isoUpdateElList();isoRenderAll();isoSetMode('select');return;
  }

  if(isoMode==='select'){
    isoElements.forEach(el=>el.selected=false);
    isoSelectedEl=null;isoSelectedFace=null;
    const hit=hitTest(sx,sy);
    if(hit&&hit.el){hit.el.selected=true;isoSelectedEl=hit.el;isoSelectedFace=hit.faceId;}
    isoUpdateElList();isoRenderAll();
  }
}

/* ══════════════════════════════════════ TOP VIEW */
// Top view always uses WORLD coordinates directly (no camera rotation)
const TV=200, TVP=18;
function tvS(){return isoLot?(TV-TVP*2)/Math.max(isoLot.w,isoLot.d):4;}
function tvProj(wx,wy){
  const s=tvS();
  const ox=(TV-isoLot.w*s)/2, oy=TVP;
  return{x:ox+wx*s, y:oy+wy*s};
}
function tvUnproj(tx,ty){
  const s=tvS();
  const ox=(TV-isoLot.w*s)/2, oy=TVP;
  return{wx:(tx-ox)/s, wy:(ty-oy)/s};
}

function tvMD(e){
  const r=topCanvas.getBoundingClientRect();
  const tx=e.clientX-r.left, ty=e.clientY-r.top;

  // Measure toggle icon (top-left)
  if(tx<16&&ty<16){tvToggleMeasure();return;}
  if(ty<TVP||!isoLot)return;

  const{wx,wy}=tvUnproj(tx,ty);

  if(tvMode==='measure'){
    if(!tvMeasureStart){tvMeasureStart={tx,ty,wx,wy};}
    else{
      tvMeasurePts.push({ax:tvMeasureStart.tx,ay:tvMeasureStart.ty,
        bx:tx,by:ty,wax:tvMeasureStart.wx,way:tvMeasureStart.wy,wbx:wx,wby:wy});
      tvMeasureStart=null;
    }
    renderTopView();return;
  }

  if(isoMode==='volume'){
    const nw=+document.getElementById('iso-vol-w').value||8;
    const nd=+document.getElementById('iso-vol-d').value||10;
    const nh=+document.getElementById('iso-vol-h').value||3;
    const func=document.getElementById('iso-vol-func').value;
    const nameRaw=document.getElementById('iso-vol-name').value.trim();
    const FL={vivienda:'Vivienda',dormitorios:'Dormitorios',living:'Living',cocina:'Cocina',
              servicios:'Servicios',garage:'Garaje',galeria:'Galería',piscina:'Piscina',custom:''};
    const newEl={id:++isoElId,type:'volume',x:wx,y:wy,z:getStackZ(wx,wy,nw,nd),
      w:nw,d:nd,h:nh,color:isoSelColor,label:nameRaw||FL[func]||func,func,selected:false};
    if(!checkCollision(newEl)){isoElements.push(newEl);isoUpdateElList();isoRenderAll();}
    return;
  }
  if(isoMode==='tree'){
    isoElements.push({id:++isoElId,type:'tree',x:wx,y:wy,z:0,
      r:+document.getElementById('iso-tree-r').value||4,
      h:+document.getElementById('iso-tree-h').value||8,
      treeType:document.getElementById('iso-tree-type').value,selected:false});
    isoUpdateElList();isoRenderAll();return;
  }

  // Select from top view
  isoElements.forEach(el=>el.selected=false);isoSelectedEl=null;
  for(const el of isoElements){
    if(el.type==='volume'){
      if(wx>=el.x&&wx<=el.x+el.w&&wy>=el.y&&wy<=el.y+el.d){
        el.selected=true;isoSelectedEl=el;break;
      }
    }
  }
  isoUpdateElList();isoRenderAll();
}

function tvMV(e){
  const r=topCanvas.getBoundingClientRect();
  const tx=e.clientX-r.left,ty=e.clientY-r.top;
  tvMousePos={tx,ty};
  if(ty>=TVP&&isoLot){
    const{wx,wy}=tvUnproj(tx,ty);
    ghostPos={wx,wy,wz:0,snapEl:null,snapFace:null};
  }
  renderTopView();
  if(isoMode==='volume'||isoMode==='tree')isoRenderAll();
}

function tvMU(){}

function tvToggleMeasure(){
  tvMode=tvMode==='measure'?'normal':'measure';
  if(tvMode!=='measure'){tvMeasureStart=null;tvMeasurePts=[];}
  renderTopView();
}

function renderTopView(){
  if(!topCtx||!isoLot)return;
  const W=TV, ct=currentCanvasTheme;
  topCtx.clearRect(0,0,W,W);
  topCtx.fillStyle=ct.bg1||'#f0f4f8';topCtx.fillRect(0,0,W,W);

  // Title
  topCtx.fillStyle='rgba(128,128,128,0.12)';topCtx.fillRect(0,0,W,TVP);
  topCtx.fillStyle=ct.dim||'#333';topCtx.font='bold 8px sans-serif';
  topCtx.textAlign='center';topCtx.textBaseline='middle';
  topCtx.fillText(tvMode==='measure'?'📏 MEDICIÓN':'VISTA SUPERIOR',W/2,TVP/2);

  // Grid
  const s=tvS();
  topCtx.strokeStyle=ct.grid||'rgba(0,0,0,0.05)';topCtx.lineWidth=0.4;
  for(let x=0;x<=isoLot.w;x++){const a=tvProj(x,0),b=tvProj(x,isoLot.d);topCtx.beginPath();topCtx.moveTo(a.x,a.y);topCtx.lineTo(b.x,b.y);topCtx.stroke();}
  for(let y=0;y<=isoLot.d;y++){const a=tvProj(0,y),b=tvProj(isoLot.w,y);topCtx.beginPath();topCtx.moveTo(a.x,a.y);topCtx.lineTo(b.x,b.y);topCtx.stroke();}

  // Lot polygon
  topCtx.beginPath();
  isoLot.pts.forEach((p,i)=>{const tp=tvProj(p.x,p.y);i===0?topCtx.moveTo(tp.x,tp.y):topCtx.lineTo(tp.x,tp.y);});
  topCtx.closePath();
  topCtx.fillStyle=ct.ground||'#eef2e8';topCtx.fill();
  topCtx.strokeStyle=ct.border||'#1a1a1a';topCtx.lineWidth=1.2;topCtx.stroke();

  // Shadow footprints
  if(isoShadow){
    const sun=getSun();
    topCtx.fillStyle='rgba(60,70,120,0.15)';
    isoElements.filter(e=>e.type==='volume').forEach(el=>{
      const tz=el.z+el.h;
      const corners=[[el.x,el.y],[el.x+el.w,el.y],[el.x+el.w,el.y+el.d],[el.x,el.y+el.d]];
      const shPts=corners.map(([cx,cy])=>({x:cx+sun.dx*tz,y:cy+sun.dy*tz}));
      const allPts=[...corners.map(([cx,cy])=>({x:cx,y:cy})),...shPts];
      const hull=convexHull(allPts);
      topCtx.beginPath();
      hull.forEach((p,i)=>{const tp=tvProj(p.x,p.y);i===0?topCtx.moveTo(tp.x,tp.y):topCtx.lineTo(tp.x,tp.y);});
      topCtx.closePath();topCtx.fill();
    });
  }

  // Elements sorted by Z (bottom first)
  const sorted=[...isoElements].sort((a,b)=>(a.z||0)-(b.z||0));
  sorted.forEach(el=>{
    if(el.type==='volume'){
      const a=tvProj(el.x,el.y),b=tvProj(el.x+el.w,el.y+el.d);
      topCtx.globalAlpha=0.82;topCtx.fillStyle=el.color||'#42A5F5';
      topCtx.fillRect(a.x,a.y,b.x-a.x,b.y-a.y);topCtx.globalAlpha=1;
      topCtx.strokeStyle=el.selected?'#FF6B35':'rgba(0,0,0,0.35)';
      topCtx.lineWidth=el.selected?1.5:.6;topCtx.strokeRect(a.x,a.y,b.x-a.x,b.y-a.y);
      if(Math.abs(b.x-a.x)>20){
        topCtx.fillStyle='rgba(0,0,0,0.6)';topCtx.font='6px sans-serif';
        topCtx.textAlign='center';topCtx.textBaseline='middle';
        topCtx.fillText((el.label||'').slice(0,8),(a.x+b.x)/2,(a.y+b.y)/2);
      }
    }
    if(el.type==='tree'){
      const tp=tvProj(el.x,el.y),sr=el.r*tvS()*.5;
      topCtx.beginPath();topCtx.arc(tp.x,tp.y,sr,0,Math.PI*2);
      topCtx.fillStyle='rgba(76,175,80,0.6)';topCtx.fill();
      topCtx.strokeStyle=el.selected?'#FF6B35':'rgba(0,100,0,0.4)';
      topCtx.lineWidth=.6;topCtx.stroke();
    }
  });

  // Ghost in top view
  if(ghostPos&&(isoMode==='volume'||isoMode==='tree')){
    const tp=tvProj(ghostPos.wx,ghostPos.wy);
    if(isoMode==='volume'){
      const nw=+document.getElementById('iso-vol-w').value||8;
      const nd=+document.getElementById('iso-vol-d').value||10;
      const b=tvProj(ghostPos.wx+nw,ghostPos.wy+nd);
      const col=checkCollision({id:-1,type:'volume',x:ghostPos.wx,y:ghostPos.wy,z:ghostPos.wz||0,
        w:nw,d:nd,h:+document.getElementById('iso-vol-h').value||3});
      topCtx.fillStyle=col?'rgba(255,0,0,0.2)':'rgba(255,107,53,0.25)';
      topCtx.strokeStyle=col?'#e00':'#FF6B35';
      topCtx.lineWidth=1;topCtx.setLineDash([3,2]);
      topCtx.fillRect(tp.x,tp.y,b.x-tp.x,b.y-tp.y);
      topCtx.strokeRect(tp.x,tp.y,b.x-tp.x,b.y-tp.y);
      topCtx.setLineDash([]);
    }else{
      const r=(+document.getElementById('iso-tree-r').value||4)*tvS()*.5;
      topCtx.beginPath();topCtx.arc(tp.x,tp.y,r,0,Math.PI*2);
      topCtx.fillStyle='rgba(76,175,80,0.3)';topCtx.fill();
      topCtx.strokeStyle='#4CAF50';topCtx.lineWidth=1;topCtx.stroke();
    }
  }

  // Measure lines
  tvMeasurePts.forEach(m=>{
    topCtx.strokeStyle='#FF6B35';topCtx.lineWidth=1.5;topCtx.setLineDash([3,2]);
    topCtx.beginPath();topCtx.moveTo(m.ax,m.ay);topCtx.lineTo(m.bx,m.by);topCtx.stroke();
    topCtx.setLineDash([]);
    const d=Math.hypot(m.wbx-m.wax,m.wby-m.way);
    topCtx.fillStyle='#FF6B35';topCtx.font='bold 8px sans-serif';
    topCtx.textAlign='center';topCtx.textBaseline='bottom';
    topCtx.fillText(d.toFixed(1)+'m',(m.ax+m.bx)/2,(m.ay+m.by)/2-2);
    [[m.ax,m.ay],[m.bx,m.by]].forEach(([px,py])=>{
      topCtx.beginPath();topCtx.arc(px,py,3,0,Math.PI*2);topCtx.fillStyle='#FF6B35';topCtx.fill();
    });
  });
  if(tvMeasureStart&&tvMousePos){
    topCtx.strokeStyle='rgba(255,107,53,0.6)';topCtx.lineWidth=1;topCtx.setLineDash([3,2]);
    topCtx.beginPath();topCtx.moveTo(tvMeasureStart.tx,tvMeasureStart.ty);
    topCtx.lineTo(tvMousePos.tx,tvMousePos.ty);topCtx.stroke();topCtx.setLineDash([]);
    topCtx.beginPath();topCtx.arc(tvMeasureStart.tx,tvMeasureStart.ty,3,0,Math.PI*2);
    topCtx.fillStyle='#FF6B35';topCtx.fill();
  }

  // North
  topCtx.save();topCtx.translate(W-13,W-13);
  topCtx.beginPath();topCtx.arc(0,0,9,0,Math.PI*2);
  topCtx.fillStyle='rgba(255,255,255,0.9)';topCtx.fill();
  topCtx.fillStyle='#e33';topCtx.font='bold 8px sans-serif';
  topCtx.textAlign='center';topCtx.textBaseline='middle';topCtx.fillText('N',0,-1);
  topCtx.restore();

  // Scale bar
  const barW=Math.min(5,isoLot.w)*tvS();
  topCtx.fillStyle=ct.dim||'#333';topCtx.fillRect(8,W-7,barW,2);
  topCtx.font='6px sans-serif';topCtx.textBaseline='bottom';topCtx.textAlign='left';
  topCtx.fillText(Math.min(5,isoLot.w)+'m',8+barW+2,W-4);

  // Measure toggle
  topCtx.fillStyle=tvMode==='measure'?'#FF6B35':'rgba(128,128,128,0.5)';
  topCtx.font='8px sans-serif';topCtx.textAlign='left';topCtx.textBaseline='top';
  topCtx.fillText('📏',3,1);
}

/* ══════════════════════════════════════ RENDER */
function isoRenderAll(){
  if(!isoCtx||!isoCanvas)return;
  const W=isoCanvas.width,H=isoCanvas.height,ct=currentCanvasTheme;
  isoCtx.clearRect(0,0,W,H);
  const bg=isoCtx.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,ct.bg1);bg.addColorStop(1,ct.bg2);
  isoCtx.fillStyle=bg;isoCtx.fillRect(0,0,W,H);

  if(!isoLot){drawNorthArrow();drawCamWidget();renderTopView();return;}

  // Draw shadows FIRST (under everything)
  if(isoShadow)drawShadows();

  // Draw ground
  drawGround();
  drawLotGrid();

  // Sort elements back-to-front using correct depth for current camera
  const sorted=[...isoElements].sort((a,b)=>elDepth(b)-elDepth(a));
  sorted.forEach(el=>{
    if(el.type==='volume')drawVolume(el);
    else if(el.type==='tree')drawTree(el);
  });

  // Draw lot border ON TOP of elements
  drawBorder();
  drawDimensions();

  // Ghost
  if(ghostPos&&(isoMode==='volume'||isoMode==='tree')){
    isoCtx.save();
    const nw=+document.getElementById('iso-vol-w').value||8;
    const nd=+document.getElementById('iso-vol-d').value||10;
    const nh=+document.getElementById('iso-vol-h').value||3;
    if(isoMode==='volume'){
      const col=checkCollision({id:-1,type:'volume',x:ghostPos.wx,y:ghostPos.wy,z:ghostPos.wz||0,w:nw,d:nd,h:nh});
      isoCtx.globalAlpha=0.45;
      drawVolumeRaw(ghostPos.wx,ghostPos.wy,ghostPos.wz||0,nw,nd,nh,col?'#ff3333':isoSelColor,null,false);
      isoCtx.globalAlpha=1;
      // Snap face highlight
      if(ghostPos.snapEl&&ghostPos.snapFace){
        const fe=ghostPos.snapEl,fid=ghostPos.snapFace.id;
        const{x,y,z,w,d,h}=fe;
        const snapPolys={
          top:  [proj(x,y,z+h),proj(x+w,y,z+h),proj(x+w,y+d,z+h),proj(x,y+d,z+h)],
          front:[proj(x,y+d,z),proj(x+w,y+d,z),proj(x+w,y+d,z+h),proj(x,y+d,z+h)],
          back: [proj(x,y,z),proj(x+w,y,z),proj(x+w,y,z+h),proj(x,y,z+h)],
          right:[proj(x+w,y,z),proj(x+w,y+d,z),proj(x+w,y+d,z+h),proj(x+w,y,z+h)],
          left: [proj(x,y,z),proj(x,y+d,z),proj(x,y+d,z+h),proj(x,y,z+h)],
        };
        const fp=snapPolys[fid];
        if(fp){
          isoCtx.strokeStyle='#FF6B35';isoCtx.lineWidth=2;isoCtx.setLineDash([5,3]);
          isoCtx.fillStyle='rgba(255,107,53,0.12)';
          isoCtx.beginPath();fp.forEach((p,i)=>i===0?isoCtx.moveTo(p.x,p.y):isoCtx.lineTo(p.x,p.y));
          isoCtx.closePath();isoCtx.fill();isoCtx.stroke();isoCtx.setLineDash([]);
          const fLabels={top:'↑ encima',front:'→ frente',back:'← detrás',right:'→ derecha',left:'← izquierda'};
          const cx=fp.reduce((s,p)=>s+p.x,0)/4,cy=fp.reduce((s,p)=>s+p.y,0)/4;
          isoCtx.fillStyle='#FF6B35';isoCtx.font='bold 10px sans-serif';
          isoCtx.textAlign='center';isoCtx.textBaseline='middle';
          isoCtx.fillText(fLabels[fid]||'',cx,cy);
        }
      }
    }else{
      isoCtx.globalAlpha=0.45;
      drawTreeRaw(ghostPos.wx,ghostPos.wy,0,
        +document.getElementById('iso-tree-r').value||4,
        +document.getElementById('iso-tree-h').value||8,
        document.getElementById('iso-tree-type').value,false);
      isoCtx.globalAlpha=1;
    }
    isoCtx.restore();
  }

  if(isoMeasurePts.length)drawMeasure();
  drawNorthArrow();drawCamWidget();
  if(isoShadow)drawSunWidget();
  isoUpdateStats();
  renderTopView();
}

/* ── GROUND (filled polygon) ── */
function drawGround(){
  const ct=currentCanvasTheme;
  isoCtx.beginPath();
  isoLot.pts.forEach((p,i)=>{const pp=proj(p.x,p.y,0);i===0?isoCtx.moveTo(pp.x,pp.y):isoCtx.lineTo(pp.x,pp.y);});
  isoCtx.closePath();
  isoCtx.fillStyle=ct.ground;isoCtx.fill();
}

function drawBorder(){
  const ct=currentCanvasTheme;
  isoCtx.beginPath();
  isoLot.pts.forEach((p,i)=>{const pp=proj(p.x,p.y,0);i===0?isoCtx.moveTo(pp.x,pp.y):isoCtx.lineTo(pp.x,pp.y);});
  isoCtx.closePath();
  isoCtx.strokeStyle=ct.border;isoCtx.lineWidth=2;isoCtx.stroke();
}

function drawLotGrid(){
  const ct=currentCanvasTheme;
  isoCtx.save();isoCtx.strokeStyle=ct.grid;isoCtx.lineWidth=0.5;
  const{w,d}=isoLot;
  for(let x=0;x<=w;x++){const a=proj(x,0,0),b=proj(x,d,0);isoCtx.beginPath();isoCtx.moveTo(a.x,a.y);isoCtx.lineTo(b.x,b.y);isoCtx.stroke();}
  for(let y=0;y<=d;y++){const a=proj(0,y,0),b=proj(w,y,0);isoCtx.beginPath();isoCtx.moveTo(a.x,a.y);isoCtx.lineTo(b.x,b.y);isoCtx.stroke();}
  isoCtx.restore();
}

/* ── DIMENSIONS ── */
function drawDimensions(){
  const ct=currentCanvasTheme;
  isoCtx.save();
  const fs=Math.max(10,isoScale*.52);
  isoCtx.font=`500 ${fs}px 'Inter',sans-serif`;
  const pts=isoLot.pts;
  for(let i=0;i<pts.length;i++){
    const a=pts[i],b=pts[(i+1)%pts.length];
    const len=Math.hypot(b.x-a.x,b.y-a.y);if(len<0.3)continue;
    const pa=proj(a.x,a.y,0),pb=proj(b.x,b.y,0),pm=proj((a.x+b.x)/2,(a.y+b.y)/2,0);
    const dx=pb.x-pa.x,dy=pb.y-pa.y,nm=Math.hypot(dx,dy)||1;
    isoCtx.fillStyle=ct.dim;isoCtx.textAlign='center';isoCtx.textBaseline='middle';
    isoCtx.fillText(len.toFixed(1)+'m',pm.x-dy/nm*14,pm.y+dx/nm*14);
  }
  isoCtx.restore();
}

/* ── SHADOWS ── */
function getSun(){
  const s={verano:{alt:88,az:185},equinox:{alt:66,az:175},invierno:{alt:41,az:165}};
  const c=s[document.getElementById('iso-season').value]||s.verano;
  const alt=c.alt*Math.PI/180,az=(c.az+180)*Math.PI/180;
  return{dx:Math.sin(az)/Math.tan(alt),dy:Math.cos(az)/Math.tan(alt),altDeg:c.alt};
}

function drawShadows(){
  const sun=getSun();
  const alpha=0.08+0.18*(1-sun.altDeg/90);

  isoElements.filter(e=>e.type==='volume').forEach(el=>{
    const tz=el.z+el.h;
    const corners=[[el.x,el.y],[el.x+el.w,el.y],[el.x+el.w,el.y+el.d],[el.x,el.y+el.d]];
    const topSh=corners.map(([cx,cy])=>proj(cx+sun.dx*tz,cy+sun.dy*tz,0));
    const botSh=corners.map(([cx,cy])=>proj(cx,cy,0));
    const hull=convexHull([...topSh,...botSh]);
    const basePt=proj(el.x+el.w/2,el.y+el.d/2,0);
    const farPt=proj(el.x+el.w/2+sun.dx*tz,el.y+el.d/2+sun.dy*tz,0);
    const g=isoCtx.createLinearGradient(basePt.x,basePt.y,farPt.x,farPt.y);
    g.addColorStop(0,`rgba(30,40,70,${alpha*1.6})`);
    g.addColorStop(0.5,`rgba(30,40,70,${alpha})`);
    g.addColorStop(1,`rgba(30,40,70,0)`);
    isoCtx.save();isoCtx.beginPath();
    hull.forEach((p,i)=>i===0?isoCtx.moveTo(p.x,p.y):isoCtx.lineTo(p.x,p.y));
    isoCtx.closePath();isoCtx.fillStyle=g;isoCtx.fill();isoCtx.restore();
  });

  isoElements.filter(e=>e.type==='tree').forEach(el=>{
    const sx=el.x+sun.dx*el.h,sy=el.y+sun.dy*el.h;
    const sc=proj(sx,sy,0),r=el.r*isoScale*.7;
    if(r<2)return;
    const g=isoCtx.createRadialGradient(sc.x,sc.y,0,sc.x,sc.y,r);
    g.addColorStop(0,`rgba(30,40,70,${alpha*1.2})`);
    g.addColorStop(1,'rgba(30,40,70,0)');
    isoCtx.beginPath();isoCtx.ellipse(sc.x,sc.y,r,r*.45,0,0,Math.PI*2);
    isoCtx.fillStyle=g;isoCtx.fill();
  });
}

function convexHull(pts){
  if(pts.length<3)return pts;
  pts=[...pts].sort((a,b)=>a.x-b.x||a.y-b.y);
  const cr=(O,A,B)=>(A.x-O.x)*(B.y-O.y)-(A.y-O.y)*(B.x-O.x);
  const lo=[],up=[];
  for(const p of pts){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p);}
  for(const p of[...pts].reverse()){while(up.length>=2&&cr(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p);}
  up.pop();lo.pop();return lo.concat(up);
}

/* ── VOLUME ── */
function drawVolume(el){
  drawVolumeRaw(el.x,el.y,el.z,el.w,el.d,el.h,el.color,el.label,el.selected,el);
}

function drawVolumeRaw(x,y,z,w,d,h,color,label,selected,elRef){
  const col=color||'#42A5F5';
  const p=(wx,wy,wz)=>proj(x+wx,y+wy,z+wz);
  const vf=VISIBLE_FACES[isoCamView];

  // Face definitions: all 6
  const allFaces=[
    {id:'top',   shade:0,    pts:[p(0,0,h),p(w,0,h),p(w,d,h),p(0,d,h)]},
    {id:'bottom',shade:0.45, pts:[p(0,0,0),p(w,0,0),p(w,d,0),p(0,d,0)]},
    {id:'front', shade:0.18, pts:[p(0,d,0),p(w,d,0),p(w,d,h),p(0,d,h)]},
    {id:'back',  shade:0.28, pts:[p(0,0,0),p(w,0,0),p(w,0,h),p(0,0,h)]},
    {id:'right', shade:0.35, pts:[p(w,0,0),p(w,d,0),p(w,d,h),p(w,0,h)]},
    {id:'left',  shade:0.3,  pts:[p(0,0,0),p(0,d,0),p(0,d,h),p(0,0,h)]},
  ];

  // Draw hidden faces first (dark edges), then visible faces on top
  const hidden=allFaces.filter(f=>!vf.includes(f.id));
  const visible=allFaces.filter(f=>vf.includes(f.id));

  hidden.forEach(f=>{
    isoCtx.beginPath();f.pts.forEach((pt,i)=>i===0?isoCtx.moveTo(pt.x,pt.y):isoCtx.lineTo(pt.x,pt.y));
    isoCtx.closePath();
    isoCtx.fillStyle=colorDk(col,f.shade+0.15);isoCtx.fill();
    isoCtx.strokeStyle='rgba(0,0,0,0.6)';isoCtx.lineWidth=0.7;isoCtx.stroke();
  });

  visible.forEach(f=>{
    isoCtx.beginPath();f.pts.forEach((pt,i)=>i===0?isoCtx.moveTo(pt.x,pt.y):isoCtx.lineTo(pt.x,pt.y));
    isoCtx.closePath();
    isoCtx.fillStyle=colorDk(col,f.shade);isoCtx.fill();
    isoCtx.strokeStyle='rgba(0,0,0,0.55)';isoCtx.lineWidth=0.9;isoCtx.stroke();
  });

  // Label on top face
  if(label){
    const topF=allFaces[0].pts;
    const cx=(topF[0].x+topF[1].x+topF[2].x+topF[3].x)/4;
    const cy=(topF[0].y+topF[1].y+topF[2].y+topF[3].y)/4;
    isoCtx.save();
    const fs=Math.max(8,Math.min(14,isoScale*.55));
    isoCtx.font=`bold ${fs}px 'Inter',sans-serif`;
    isoCtx.fillStyle=isoLuma(col)>.52?'rgba(0,0,0,0.75)':'rgba(255,255,255,0.9)';
    isoCtx.textAlign='center';isoCtx.textBaseline='middle';
    isoCtx.setTransform(1,-0.13,0.42,0.76,cx,cy);
    isoCtx.fillText(label.toUpperCase(),0,0);
    isoCtx.restore();
  }

  // Selection: orange outline on top + selected face
  if(selected){
    const topF=allFaces[0].pts;
    isoCtx.save();isoCtx.strokeStyle='#FF6B35';isoCtx.lineWidth=2.5;
    isoCtx.beginPath();topF.forEach((pt,i)=>i===0?isoCtx.moveTo(pt.x,pt.y):isoCtx.lineTo(pt.x,pt.y));
    isoCtx.closePath();isoCtx.stroke();
    // Highlight selected face if any
    if(isoSelectedFace&&elRef===isoSelectedEl){
      const sf=allFaces.find(f=>f.id===isoSelectedFace);
      if(sf){
        isoCtx.strokeStyle='#FF6B35';isoCtx.lineWidth=2;isoCtx.setLineDash([4,2]);
        isoCtx.beginPath();sf.pts.forEach((pt,i)=>i===0?isoCtx.moveTo(pt.x,pt.y):isoCtx.lineTo(pt.x,pt.y));
        isoCtx.closePath();isoCtx.stroke();isoCtx.setLineDash([]);
      }
    }
    isoCtx.restore();
  }
}

/* ── TREE ── */
function drawTree(el){drawTreeRaw(el.x,el.y,el.z,el.r,el.h,el.treeType,el.selected);}

function drawTreeRaw(x,y,z,r,h,treeType,selected){
  const bp=proj(x,y,z),tp=proj(x,y,z+h);
  isoCtx.beginPath();isoCtx.moveTo(bp.x,bp.y);isoCtx.lineTo(tp.x,tp.y);
  isoCtx.strokeStyle='#7D5A3C';isoCtx.lineWidth=Math.max(2,isoScale*.12);isoCtx.lineCap='round';isoCtx.stroke();
  const pr=r*isoScale*.56;
  if(treeType==='palmera')drawPalmTop(tp.x,tp.y,pr,selected);
  else if(treeType==='arbusto')drawBushTop(x,y,z,r,selected);
  else drawSphereTop(tp.x,tp.y,pr,treeType,selected);
}

function drawSphereTop(cx,cy,r,tt,sel){
  const isD=tt==='caducifolia';
  const g=isoCtx.createRadialGradient(cx-r*.28,cy-r*.32,r*.04,cx,cy,r);
  if(isD){g.addColorStop(0,'#d4edaa');g.addColorStop(.45,'#8bc34a');g.addColorStop(1,'#4a7c20');}
  else{g.addColorStop(0,'#b2dfb8');g.addColorStop(.45,'#43a047');g.addColorStop(1,'#1b5e20');}
  isoCtx.beginPath();isoCtx.arc(cx+r*.08,cy+r*.08,r,0,Math.PI*2);isoCtx.fillStyle='rgba(0,0,0,0.08)';isoCtx.fill();
  isoCtx.beginPath();isoCtx.arc(cx,cy,r,0,Math.PI*2);isoCtx.fillStyle=g;isoCtx.fill();
  isoCtx.save();isoCtx.beginPath();isoCtx.arc(cx,cy,r,0,Math.PI*2);isoCtx.clip();
  isoCtx.strokeStyle='rgba(255,255,255,0.3)';isoCtx.lineWidth=0.7;
  if(isD){for(let i=0;i<8;i++){const a=(i/8)*Math.PI*2;isoCtx.beginPath();isoCtx.moveTo(cx,cy);isoCtx.lineTo(cx+Math.cos(a)*r*.88,cy+Math.sin(a)*r*.88);isoCtx.stroke();}[.3,.58,.82].forEach(ri=>{isoCtx.beginPath();isoCtx.arc(cx,cy,r*ri,0,Math.PI*2);isoCtx.stroke();});}
  else{for(let i=0;i<7;i++){const a=(i/7)*Math.PI*2+.4;isoCtx.beginPath();isoCtx.moveTo(cx,cy);isoCtx.quadraticCurveTo(cx+Math.cos(a+.6)*r*.5,cy+Math.sin(a+.6)*r*.5,cx+Math.cos(a)*r*.84,cy+Math.sin(a)*r*.84);isoCtx.stroke();}}
  isoCtx.restore();
  isoCtx.beginPath();isoCtx.arc(cx,cy,r,0,Math.PI*2);
  isoCtx.strokeStyle=sel?'#FF6B35':'rgba(0,0,0,0.22)';isoCtx.lineWidth=sel?3:1;isoCtx.stroke();
  isoCtx.beginPath();isoCtx.arc(cx-r*.24,cy-r*.28,r*.26,0,Math.PI*2);isoCtx.fillStyle='rgba(255,255,255,0.18)';isoCtx.fill();
}

function drawPalmTop(cx,cy,r,sel){
  const c=['#558b2f','#7cb342','#8bc34a','#aed581','#66bb6a'];
  for(let i=0;i<7;i++){const a=(i/7)*Math.PI*2-Math.PI/2;isoCtx.beginPath();isoCtx.moveTo(cx,cy);isoCtx.quadraticCurveTo(cx+Math.cos(a)*r*.7+Math.cos(a+1.3)*r*.28,cy+Math.sin(a)*r*.7+Math.sin(a+1.3)*r*.28,cx+Math.cos(a)*r*1.5,cy+Math.sin(a)*r*1.5);isoCtx.strokeStyle=c[i%c.length];isoCtx.lineWidth=Math.max(2,r*.18);isoCtx.lineCap='round';isoCtx.stroke();}
  isoCtx.beginPath();isoCtx.arc(cx,cy,r*.17,0,Math.PI*2);isoCtx.fillStyle='#33691e';isoCtx.fill();
}

function drawBushTop(wx,wy,wz,r,sel){
  const o=[{dx:-.55,dy:-.3},{dx:.55,dy:-.4},{dx:0,dy:.55},{dx:-.6,dy:.42},{dx:.62,dy:.32},{dx:0,dy:0}];
  o.forEach(off=>{
    const pp=proj(wx+off.dx*r,wy+off.dy*r,wz+r*.38),sr=r*isoScale*.27;
    const g=isoCtx.createRadialGradient(pp.x-sr*.2,pp.y-sr*.2,sr*.04,pp.x,pp.y,sr);
    g.addColorStop(0,'#c5e1a5');g.addColorStop(1,'#558b2f');
    isoCtx.beginPath();isoCtx.arc(pp.x,pp.y,sr,0,Math.PI*2);isoCtx.fillStyle=g;isoCtx.fill();
    isoCtx.strokeStyle=sel?'#FF6B35':'rgba(0,0,0,0.12)';isoCtx.lineWidth=sel?2.5:.6;isoCtx.stroke();
  });
}

/* ── NORTH ARROW ── */
function drawNorthArrow(){
  if(!isoCanvas)return;
  const ct=currentCanvasTheme,x=isoCanvas.width-58,y=58,r=28;
  const v=V(),nr=isoNorth*Math.PI/180;
  const nwx=-Math.sin(nr),nwy=Math.cos(nr);
  const nsx=nwx*v.ax+nwy*v.bx,nsy=nwx*v.ay+nwy*v.by;
  const len=Math.hypot(nsx,nsy)||1;
  const nx=nsx/len*r*.78,ny=nsy/len*r*.78;
  isoCtx.save();isoCtx.translate(x,y);
  isoCtx.beginPath();isoCtx.arc(0,0,r,0,Math.PI*2);isoCtx.fillStyle='rgba(255,255,255,0.92)';isoCtx.fill();isoCtx.strokeStyle=ct.border;isoCtx.lineWidth=.5;isoCtx.stroke();
  const lx=ny*.25,ly=-nx*.25;
  isoCtx.beginPath();isoCtx.moveTo(nx,ny);isoCtx.lineTo(lx,ly);isoCtx.lineTo(-nx,-ny);isoCtx.lineTo(-lx,-ly);isoCtx.closePath();isoCtx.fillStyle=ct.border;isoCtx.fill();
  isoCtx.beginPath();isoCtx.moveTo(nx,ny);isoCtx.lineTo(lx,ly);isoCtx.lineTo(nx*.15,ny*.15);isoCtx.lineTo(-lx,-ly);isoCtx.closePath();isoCtx.fillStyle='#fff';isoCtx.fill();
  isoCtx.font='bold 11px sans-serif';isoCtx.fillStyle=ct.dim;isoCtx.textAlign='center';isoCtx.textBaseline='middle';isoCtx.fillText('N',nx*1.45,ny*1.45);
  isoCtx.restore();
}

/* ── CAM WIDGET ── */
function drawCamWidget(){
  if(!isoCanvas)return;
  const ct=currentCanvasTheme,x=isoCanvas.width-58,y=110,r=28;
  const vNames=['NE','SE','SW','NW'];
  isoCtx.save();isoCtx.translate(x,y);
  isoCtx.beginPath();isoCtx.arc(0,0,r,0,Math.PI*2);isoCtx.fillStyle='rgba(255,255,255,0.92)';isoCtx.fill();isoCtx.strokeStyle=ct.border;isoCtx.lineWidth=.5;isoCtx.stroke();
  // 4 direction buttons
  [0,1,2,3].forEach(i=>{
    const a=(i*90-90)*Math.PI/180;
    const bx=Math.cos(a)*16,by=Math.sin(a)*16;
    isoCtx.beginPath();isoCtx.arc(bx,by,9,0,Math.PI*2);
    isoCtx.fillStyle=i===isoCamView?ct.border:'rgba(160,160,160,0.15)';isoCtx.fill();
    isoCtx.strokeStyle='rgba(128,128,128,0.3)';isoCtx.lineWidth=.5;isoCtx.stroke();
    isoCtx.fillStyle=i===isoCamView?'#fff':ct.dim||'#666';
    isoCtx.font='bold 7px sans-serif';isoCtx.textAlign='center';isoCtx.textBaseline='middle';
    isoCtx.fillText(vNames[i],bx,by);
  });
  isoCtx.fillStyle='rgba(128,128,128,0.4)';isoCtx.font='6px sans-serif';
  isoCtx.textAlign='center';isoCtx.textBaseline='top';isoCtx.fillText('CÁMARA',0,-r+3);
  isoCtx.restore();
}

function checkCamWidget(sx,sy){
  if(!isoCanvas)return false;
  const cx=isoCanvas.width-58,cy=110;
  if(Math.hypot(sx-cx,sy-cy)>32)return false;
  const dx=sx-cx,dy=sy-cy;
  const angle=((Math.atan2(dy,dx)*180/Math.PI)+90+360)%360;
  isoCamView=Math.round(angle/90)%4;
  isoRenderAll();return true;
}

/* ── SUN WIDGET ── */
function drawSunWidget(){
  if(!isoCanvas)return;
  const sun=getSun(),x=isoCanvas.width-58,y=165,r=20;
  isoCtx.save();isoCtx.translate(x,y);
  isoCtx.beginPath();isoCtx.arc(0,0,r,0,Math.PI*2);isoCtx.fillStyle='rgba(255,255,255,0.85)';isoCtx.fill();
  const altA=-sun.altDeg/90*Math.PI;
  isoCtx.beginPath();isoCtx.arc(0,0,r-4,-Math.PI/2,altA-Math.PI/2);
  isoCtx.strokeStyle='rgba(255,160,0,0.7)';isoCtx.lineWidth=2.5;isoCtx.stroke();
  const sx=Math.cos(altA-Math.PI/2)*(r-4),sy=Math.sin(altA-Math.PI/2)*(r-4);
  isoCtx.beginPath();isoCtx.arc(sx,sy,3.5,0,Math.PI*2);isoCtx.fillStyle='#FFB300';isoCtx.fill();
  isoCtx.fillStyle='rgba(128,128,128,0.6)';isoCtx.font='6px sans-serif';isoCtx.textAlign='center';isoCtx.textBaseline='middle';
  isoCtx.fillText(sun.altDeg+'°',0,0);
  isoCtx.restore();
}

/* ── MEASURE ── */
function drawMeasure(){
  isoCtx.save();isoCtx.strokeStyle='#FF6B35';isoCtx.lineWidth=1.5;isoCtx.setLineDash([4,3]);
  for(let i=1;i<isoMeasurePts.length;i++){
    const a=isoMeasurePts[i-1],b=isoMeasurePts[i];
    isoCtx.beginPath();isoCtx.moveTo(a.sx,a.sy);isoCtx.lineTo(b.sx,b.sy);isoCtx.stroke();
    const d=Math.hypot(b.wx-a.wx,b.wy-a.wy);
    isoCtx.setLineDash([]);isoCtx.font='bold 11px sans-serif';isoCtx.fillStyle='#FF6B35';
    isoCtx.textAlign='center';isoCtx.textBaseline='bottom';
    isoCtx.fillText(d.toFixed(2)+'m',(a.sx+b.sx)/2,(a.sy+b.sy)/2-4);isoCtx.setLineDash([4,3]);
  }
  isoMeasurePts.forEach(p=>{isoCtx.beginPath();isoCtx.arc(p.sx,p.sy,4,0,Math.PI*2);isoCtx.setLineDash([]);isoCtx.fillStyle='#FF6B35';isoCtx.fill();});
  isoCtx.restore();
}

/* ══════════════════════════════════════ CONTROLS */
function isoSetMode(m){
  isoMode=m;ghostPos=null;
  ['select','volume','tree','measure'].forEach(id=>{const b=document.getElementById('iso-mode-'+id);if(b)b.classList.toggle('on',id===m);});
  isoCanvas.style.cursor=m==='select'?'default':'crosshair';
  if(m==='measure')isoMeasurePts=[];
  const hints={
    select:'Click en elemento para seleccionar · Arrastrá para mover · Click derecho para mover vista · Scroll-click para orbitar',
    volume:'Hover para previsualizar · Snap a caras · Click para colocar (también en vista superior)',
    tree:'Click para plantar · También en vista superior',
    measure:'Click para medir · En vista superior: click 📏 para medir en planta'
  };
  isoSetHint(hints[m]||'');renderTopView();
}

function isoSetHint(t){const h=document.getElementById('iso-hint');if(h)h.textContent=t;}

function isoBuildColorGrid(){
  const g=document.getElementById('iso-color-grid');
  if(!g||g.children.length>0)return;
  const cols=['#c4462a','#6b7f4e','#3B8BD4','#EF9F27','#42A5F5','#9C27B0','#4CAF50','#F44336','#607D8B','#795548','#212121','#f5f5f5'];
  cols.forEach(c=>{
    const s=document.createElement('div');
    s.className='iso-swatch'+(c===isoSelColor?' on':'');
    s.style.background=c;
    s.dataset.col=c;
    s.onclick=()=>isoSelColorFn(s);
    g.appendChild(s);
  });
}

function isoSelColorFn(el){
  document.querySelectorAll('.iso-swatch').forEach(s=>s.classList.remove('on'));
  el.classList.add('on');isoSelColor=el.dataset.col;
}

function isoToggleShadow(){
  isoShadow=!isoShadow;
  const b=document.getElementById('iso-btn-shadow');if(b)b.classList.toggle('on',isoShadow);
  isoRenderAll();
}

function isoUpdateNorth(val){
  isoNorth=+val;const d=document.getElementById('iso-north-deg');if(d)d.textContent=val+'°';isoRenderAll();
}

function isoZoom(delta){
  const cx=isoCanvas.width/2,cy=isoCanvas.height/2;
  const f=delta>0?1.12:.89;
  isoPan.x=cx+(isoPan.x-cx)*f;isoPan.y=cy+(isoPan.y-cy)*f;
  isoScale=Math.max(5,Math.min(90,isoScale*f));isoRenderAll();
}

function isoResetView(){isoScale=22;isoPan={x:isoCanvas.width*.5,y:isoCanvas.height*.55};isoRenderAll();}

function isoRotateCam(dir){isoCamView=((isoCamView+dir+4)%4);isoRenderAll();}

function isoClearAll(){
  if(!confirm('¿Eliminar todos los elementos?'))return;
  isoElements=[];isoLot=null;isoElId=0;isoMeasurePts=[];ghostPos=null;tvMeasurePts=[];tvMeasureStart=null;
  isoUpdateElList();isoRenderAll();
}

/* ── ELEMENT LIST ── */
function isoUpdateElList(){
  const list=document.getElementById('iso-el-list');if(!list)return;
  list.innerHTML=isoElements.map(el=>`
    <div class="iso-el-item${el.selected?' sel':''}" onclick="isoSelectEl(${el.id})">
      <div class="iso-el-dot" style="background:${el.type==='tree'?'#558b2f':el.color||'#eee'}"></div>
      <span class="iso-el-name">${el.label||el.treeType||'?'}${el.z>.1?` <span style="font-size:9px;opacity:.5">z=${el.z.toFixed(1)}</span>`:''}</span>
      <span class="iso-el-del" onclick="isoDelEl(event,${el.id})">×</span>
    </div>`).join('');
}

function isoSelectEl(id){
  isoElements.forEach(e=>e.selected=e.id===id);
  isoSelectedEl=isoElements.find(e=>e.id===id)||null;isoSelectedFace=null;
  isoUpdateElList();isoRenderAll();
}

function isoDelEl(event,id){
  event.stopPropagation();isoElements=isoElements.filter(e=>e.id!==id);isoUpdateElList();isoRenderAll();
}

/* ── STATS ── */
function isoPolyArea(pts){let a=0;for(let i=0;i<pts.length;i++){const j=(i+1)%pts.length;a+=pts[i].x*pts[j].y-pts[j].x*pts[i].y;}return Math.abs(a)/2;}

function isoUpdateStats(){
  if(!isoLot)return;
  const lA=isoPolyArea(isoLot.pts);
  const bA=isoElements.filter(e=>e.type==='volume'&&e.z<.1&&e.func!=='piscina'&&e.func!=='galeria').reduce((s,e)=>s+e.w*e.d,0);
  const fos=lA>0?Math.min(1,bA/lA):0;
  const sv=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  sv('iso-st-lot',lA.toFixed(1)+' m²');sv('iso-st-built',bA.toFixed(1)+' m²');sv('iso-st-fos',(fos*100).toFixed(1)+'%');
  const fill=document.getElementById('iso-fos-fill');
  if(fill){fill.style.width=(fos*100)+'%';fill.style.background=fos>.6?'#e33':fos>.4?'#f90':'var(--primary,#000101)';}
}

/* ── EXPORT ── */
function isoExportPNG(){
  const sbW=isoScale*5,sbX=20,sbY=isoCanvas.height-24;
  isoCtx.save();
  isoCtx.fillStyle='rgba(255,255,255,0.9)';isoCtx.fillRect(sbX-6,sbY-18,sbW+52,26);
  isoCtx.fillStyle='#1a1a1a';isoCtx.fillRect(sbX,sbY-8,sbW,6);
  [0,.5,1].forEach(t=>{isoCtx.fillRect(sbX+t*sbW-.5,sbY-10,1.5,8);isoCtx.font='9px sans-serif';isoCtx.textAlign='center';isoCtx.textBaseline='top';isoCtx.fillText((t*5).toFixed(0)+'m',sbX+t*sbW,sbY+2);});
  isoCtx.fillStyle='rgba(0,0,0,0.15)';isoCtx.textAlign='right';isoCtx.font='9px sans-serif';
  isoCtx.fillText('Bioclimática Paraguay',isoCanvas.width-10,isoCanvas.height-8);
  isoCtx.restore();
  const link=document.createElement('a');link.download='diagrama-iso.png';link.href=isoCanvas.toDataURL('image/png');link.click();
  setTimeout(isoRenderAll,200);
}

/* ── COLOR ── */
function colorDk(hex,amt){try{const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return`rgb(${Math.round(r*(1-amt))},${Math.round(g*(1-amt))},${Math.round(b*(1-amt))})`;}catch(e){return hex;}}
function isoLuma(hex){try{const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return(0.299*r+0.587*g+0.114*b)/255;}catch(e){return.5;}}
