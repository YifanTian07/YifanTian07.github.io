import * as THREE from './assets/vendor/three/three.module.min.js';
import { GalaxyEnvironment } from './galaxy-environment.js?v=20260905e';

const vertex = `attribute float aSize; attribute float aPhase; varying float vPhase;
void main(){ vPhase=aPhase; vec4 mv=modelViewMatrix*vec4(position,1.); gl_Position=projectionMatrix*mv; gl_PointSize=clamp(aSize*240./-mv.z,1.,58.); }`;
const fragment = `uniform vec3 color; uniform float time; uniform float opacity; varying float vPhase;
void main(){float r=length(gl_PointCoord-.5)*2.; if(r>1.)discard;
float glow=exp(-r*r*5.)*.38+exp(-r*r*70.)*.92;
float pulse=.8+.2*sin(time*.8+vPhase);
gl_FragColor=vec4(color*1.35,glow*pulse*opacity);}`;

export const palettes = [
  { color: '#5ff5d4', dark: '#062e30', secondary: '#1389a0' },
  { color: '#67cfff', dark: '#092947', secondary: '#174fa9' },
  { color: '#bda0ff', dark: '#24143d', secondary: '#784ac9' },
  { color: '#f0b66b', dark: '#382417', secondary: '#be642d' },
  { color: '#fa8eac', dark: '#371625', secondary: '#a13869' }
];

export class GalaxyEngine {
  constructor(host, onFrame, onLost) {
    this.host=host; this.onFrame=onFrame; this.motion=!matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
    this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    host.prepend(this.renderer.domElement);
    this.renderer.domElement.setAttribute('aria-hidden','true');
    this.renderer.domElement.addEventListener('webglcontextlost', event=>{event.preventDefault();this.stop();onLost();});
    this.scene=new THREE.Scene();
    this.camera=new THREE.PerspectiveCamera(43,1,.1,300);
    this.camera.position.z=23;
    this.world=new THREE.Group();this.scene.add(this.world);
    this.rotation=new THREE.Quaternion();this.zoom=23;this.time=0;this.previous=0;this.running=false;
    this.bodies=[];this.glowTexture=this.makeGlow();
    this.scene.add(new THREE.AmbientLight('#b8d9ff',1.3));
    const light=new THREE.DirectionalLight('#e6fbff',3.7);light.position.set(-6,8,12);this.scene.add(light);
    const rim=new THREE.DirectionalLight('#3177bd',2);rim.position.set(6,-3,-5);this.scene.add(rim);
    this.makeBackground();
    this.resize();
  }
  random() { this.seed=(this.seed*16807)%2147483647;return(this.seed-1)/2147483646; }
  makeGlow() {
    const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');
    const g=ctx.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.1,'rgba(255,255,255,.6)');g.addColorStop(.38,'rgba(255,255,255,.12)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);
    return new THREE.CanvasTexture(c);
  }
  glow(color,size,opacity) {
    const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:this.glowTexture,color,transparent:true,opacity,depthWrite:false,blending:THREE.AdditiveBlending}));sprite.scale.set(size,size,1);return sprite;
  }
  points(positions,sizes,phases,color,opacity=1) {
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('aSize',new THREE.Float32BufferAttribute(sizes,1));geo.setAttribute('aPhase',new THREE.Float32BufferAttribute(phases,1));
    const mat=new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:fragment,uniforms:{color:{value:new THREE.Color(color)},time:{value:0},opacity:{value:opacity}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});return new THREE.Points(geo,mat);
  }
  makeBackground() {
    this.environment=new GalaxyEnvironment(this.scene,(...args)=>this.points(...args),this.glowTexture);
  }
  cluster(index) {
    this.seed=2026+index*301;const group=new THREE.Group(),p=[],s=[],f=[];
    const arms=3+index%2;
    for(let i=0;i<2200;i++){
      const r=Math.pow(this.random(),.7)*2.45;
      const a=(i%arms)/arms*Math.PI*2+r*1.5+(this.random()-.5)*(.5+r*.13);
      const thickness=(this.random()-.5)*(.14+.32*(1-r/2.5));
      p.push(Math.cos(a)*r,thickness,Math.sin(a)*r);
      s.push(.085+Math.pow(this.random(),4)*.48);f.push(this.random()*6.28);
    }
    group.add(this.points(p,s,f,palettes[index].color));
    group.add(this.glow(palettes[index].color,5.4,.45));
    group.add(this.glow('#d8fff9',.65,.9));
    group.rotation.set(.65+index*.2,.1,index*.25-.2);
    return group;
  }
  texture(theme,palette) {
    const c=document.createElement('canvas');c.width=1024;c.height=512;const ctx=c.getContext('2d');
    const grad=ctx.createLinearGradient(0,0,0,512);grad.addColorStop(0,palette.dark);grad.addColorStop(.5,palette.secondary);grad.addColorStop(1,palette.dark);ctx.fillStyle=grad;ctx.fillRect(0,0,1024,512);
    this.seed=97+theme*123;ctx.globalAlpha=.085;
    for(let i=0;i<35;i++){ctx.strokeStyle=i%3?palette.color:'#e4fbff';ctx.lineWidth=3+this.random()*12;ctx.beginPath();for(let x=0;x<=1024;x+=8){const a=x/1024*Math.PI*2;const y=i*16+Math.sin(a*2+i*.14)*15+Math.sin(a+i)*22;x?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();}
    ctx.globalAlpha=.85;ctx.strokeStyle=palette.color;ctx.fillStyle=palette.color;ctx.lineWidth=4;
    // Repeated thematic glyphs wrap around a real sphere, not a flat image card.
    for(const cx of [256,768]) {
      ctx.save();ctx.translate(cx,256);
      if(theme===0) { // Human / profile: small celestial compass.
        for(const r of [42,65,87]){ctx.beginPath();ctx.ellipse(0,0,r,r*.7,-.3,0,Math.PI*2);ctx.stroke();}
        ctx.font='500 38px sans-serif';ctx.textAlign='center';ctx.fillText('YT',0,13);
      } else if(theme===1) { // Vision: lens and iris.
        ctx.beginPath();ctx.ellipse(0,0,105,48,0,0,Math.PI*2);ctx.stroke();
        for(const r of [17,32,41]){ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();}
      } else if(theme===2) { // Scene graphs: deliberate linked semantic nodes.
        const pts=[[-76,-36],[0,-65],[65,-22],[45,63],[-49,55]];
        ctx.beginPath();pts.forEach(([x,y],i)=>{ctx.moveTo(0,0);ctx.lineTo(x,y);ctx.moveTo(x,y);ctx.lineTo(...pts[(i+1)%pts.length]);});ctx.stroke();
        [...pts,[0,0]].forEach(([x,y])=>{ctx.beginPath();ctx.arc(x,y,8,0,Math.PI*2);ctx.fill();});
      } else if(theme===3) { // Robot: head, torso, articulated limbs.
        ctx.strokeRect(-23,-72,46,34);ctx.strokeRect(-34,-22,68,61);
        ctx.beginPath();ctx.moveTo(-34,-10);ctx.lineTo(-63,16);ctx.lineTo(-73,46);ctx.moveTo(34,-10);ctx.lineTo(63,16);ctx.lineTo(73,46);ctx.moveTo(-19,39);ctx.lineTo(-25,89);ctx.moveTo(19,39);ctx.lineTo(25,89);ctx.stroke();
        ctx.fillRect(-13,-60,7,6);ctx.fillRect(6,-60,7,6);
      } else { // Healthcare: pulse and cross.
        ctx.beginPath();ctx.moveTo(-110,12);ctx.lineTo(-50,12);ctx.lineTo(-28,-29);ctx.lineTo(-7,44);ctx.lineTo(18,-60);ctx.lineTo(38,12);ctx.lineTo(108,12);ctx.stroke();
      }
      ctx.restore();
    }
    ctx.globalAlpha=1;const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(this.renderer.capabilities.getMaxAnisotropy(),4);return texture;
  }
  planet(index,theme,palette) {
    const group=new THREE.Group();const map=this.texture(theme,palette);
    const sphere=new THREE.Mesh(new THREE.SphereGeometry(1.18,64,40),new THREE.MeshStandardMaterial({map,emissiveMap:map,emissive:palette.color,emissiveIntensity:.22,roughness:.61,metalness:.22}));
    sphere.rotation.y=0;group.add(sphere);group.userData.sphere=sphere;
    const atmosphere=new THREE.Mesh(new THREE.SphereGeometry(1.24,48,32),new THREE.ShaderMaterial({uniforms:{color:{value:new THREE.Color(palette.color)}},vertexShader:`varying vec3 vN;varying vec3 vP;void main(){vN=normalize(normalMatrix*normal);vec4 p=modelViewMatrix*vec4(position,1.);vP=p.xyz;gl_Position=projectionMatrix*p;}`,fragmentShader:`uniform vec3 color;varying vec3 vN;varying vec3 vP;void main(){float f=pow(1.-max(dot(normalize(vN),normalize(-vP)),0.),3.);gl_FragColor=vec4(color,f*.75);}`,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false}));group.add(atmosphere);
    group.add(this.glow(palette.color,4.5,.16));
    if(index%2===1){const ring=new THREE.Mesh(new THREE.RingGeometry(1.5,1.57,100),new THREE.MeshBasicMaterial({color:palette.color,side:THREE.DoubleSide,transparent:true,opacity:.35,depthWrite:false}));ring.rotation.set(1.1,.25,.2);group.add(ring);}
    return group;
  }
  clear() {
    for(const body of this.bodies){body.object.traverse(node=>{node.geometry?.dispose();if(node.material){if(node.material.map!==this.glowTexture)node.material.map?.dispose();node.material.dispose();}});this.world.remove(body.object);}
    this.bodies=[];
  }
  setBodies(entries,detail=false,theme=null) {
    this.clear();this.detail=detail;
    this.environment.setTheme(theme);
    const positions=detail?[[0,.5,7],[-5.8,3.2,2.8],[5.8,-2.7,2],[1.8,-5.7,-3]]:[[0,.2,7],[-6.5,3.2,.7],[6.1,3.1,-1],[3,-5.2,1.5]];
    entries.forEach((entry,index)=>{
      const object=detail?this.planet(index,entry.theme,entry.palette):this.cluster(index);
      const position=new THREE.Vector3(...positions[index]);object.position.copy(position);this.world.add(object);
      this.bodies.push({object,position,entry,screen:{}});
    });
    this.rotation.identity();this.world.quaternion.identity();this.zoom=this.host.clientWidth<700?28:23;
    this.environment.rebaseOrientation(this.world.quaternion);
    this.camera.position.z=this.zoom+(this.motion?5:0);this.resize();
  }
  rotate(dx,dy) {
    const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(dy*.005,dx*.005,0,'YXZ'));
    this.rotation.premultiply(q).normalize();
  }
  focus(index) {const body=this.bodies[index];if(body)this.rotation.setFromUnitVectors(body.position.clone().normalize(),new THREE.Vector3(0,0,1));}
  resize() {this.width=this.host.clientWidth;this.height=this.host.clientHeight;this.renderer.setSize(this.width,this.height);this.camera.aspect=this.width/this.height;this.camera.updateProjectionMatrix();this.environment.resize(this.camera.aspect);}
  start() {if(this.running)return;this.running=true;this.previous=performance.now();this.frame=requestAnimationFrame(t=>this.tick(t));}
  stop() {this.running=false;cancelAnimationFrame(this.frame);}
  tick(now) {
    if(!this.running)return;
    const dt=Math.min((now-this.previous)/1000,.05);this.previous=now;
    const ease=this.motion?1-Math.exp(-dt*9):1;
    this.world.quaternion.slerp(this.rotation,ease);this.camera.position.z+=(this.zoom-this.camera.position.z)*ease;
    if(this.motion)this.time+=dt;
    this.environment.update(dt,this.time,this.world.quaternion,this.detail,this.motion);
    for(const b of this.bodies){
      if(!this.detail&&this.motion)b.object.rotation.y+=dt*.045;
      if(this.detail){const sphere=b.object.userData.sphere;sphere.quaternion.copy(this.world.quaternion).invert();sphere.rotateY(this.time*.035);}
      b.object.traverse(n=>{if(n.material?.uniforms?.time)n.material.uniforms.time.value=this.time;});
    }
    this.renderer.render(this.scene,this.camera);
    for(const b of this.bodies){
      const wp=b.object.getWorldPosition(new THREE.Vector3()),p=wp.clone().project(this.camera);
      const scale=this.height/(2*Math.tan(THREE.MathUtils.degToRad(this.camera.fov/2))*(this.camera.position.z-wp.z));
      b.screen={x:(p.x*.5+.5)*this.width,y:(-.5*p.y+.5)*this.height,r:scale*(this.detail?1.3:2.3),visible:p.z<1&&Math.abs(p.x)<1.5&&Math.abs(p.y)<1.5,depth:wp.z};
    }
    this.onFrame(this.bodies);this.frame=requestAnimationFrame(t=>this.tick(t));
  }
  hit(x,y) {let best=-1,depth=-Infinity;this.bodies.forEach((b,i)=>{const p=b.screen;if(p.visible&&Math.hypot(x-p.x,y-p.y)<Math.max(p.r,36)&&p.depth>depth){best=i;depth=p.depth;}});return best;}
}
