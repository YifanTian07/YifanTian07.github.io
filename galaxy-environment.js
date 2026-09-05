import * as THREE from './assets/vendor/three/three.module.min.js';

// Persistent scenery behind the interactive worlds. No labels or hit targets.
export class GalaxyEnvironment {
  constructor(scene, points, glowTexture) {
    this.seed=9157;this.layers=[];this.animatedPoints=[];this.detailMix=0;
    this.tint=new THREE.Color('#ffffff');this.targetTint=this.tint.clone();
    this.starTint=new THREE.Color('#a3bdff');this.targetStars=this.starTint.clone();
    this.far=this.layer(scene,-65,.12);
    this.middle=this.layer(scene,-39,.25);
    this.near=this.layer(scene,-20,.4);
    this.makeStars(points);
    this.makeNebula();
    this.makeWorlds(glowTexture);
  }
  random(){this.seed=this.seed*16807%2147483647;return(this.seed-1)/2147483646;}
  layer(scene,z,response){const group=new THREE.Group();group.position.z=z;scene.add(group);this.layers.push({group,response});return group;}
  makeStars(points) {
    for(const [layer,count,span,color,size] of [[this.far,1800,150,'#b7d2e8',.13],[this.middle,1100,110,'#8fbfcf',.17]]){
      const p=[],s=[],f=[];
      for(let i=0;i<count;i++){p.push((this.random()-.5)*span,(this.random()-.5)*span*.72,(this.random()-.5)*18);s.push(.035+this.random()*size);f.push(this.random()*6.28);}
      const stars=points(p,s,f,color,.8);layer.add(stars);this.animatedPoints.push(stars);
    }
    // An oblique, uneven stellar river rather than an evenly filled backdrop.
    const p=[],s=[],f=[];
    for(let i=0;i<2300;i++){
      const x=(this.random()-.5)*120,spread=(this.random()+this.random()+this.random()-1.5)*9;
      p.push(x,x*.43+Math.sin(x*.075)*4+spread-4,(this.random()-.5)*8-5);
      s.push(.045+Math.pow(this.random(),3)*.22);f.push(this.random()*6.28);
    }
    this.dust=points(p,s,f,'#a3bdff',.45);this.middle.add(this.dust);this.animatedPoints.push(this.dust);
  }
  nebulaTexture() {
    const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=768;
    const ctx=canvas.getContext('2d');
    const cloud=(x,y,r,color,alpha,stretch=1)=>{
      ctx.save();ctx.translate(x,y);ctx.scale(1,stretch);
      const g=ctx.createRadialGradient(0,0,0,0,0,r);g.addColorStop(0,`rgba(${color},${alpha})`);g.addColorStop(.42,`rgba(${color},${alpha*.4})`);g.addColorStop(1,`rgba(${color},0)`);ctx.fillStyle=g;ctx.fillRect(-r,-r,2*r,2*r);ctx.restore();
    };
    ctx.globalCompositeOperation='lighter';
    for(let i=0;i<140;i++){
      const x=this.random()*1736-100,t=x/1536,y=610-t*470+Math.sin(t*9)*35+(this.random()-.5)*110;
      const color=i%3===0?'106,95,170':i%3===1?'48,119,139':'71,101,160';
      cloud(x,y,70+this.random()*130,color,.025+this.random()*.045,.5+this.random()*.4);
    }
    // Broken pockets of dust give the band relief without adding drawn lines.
    ctx.globalCompositeOperation='destination-out';
    for(let i=0;i<34;i++){
      const x=i/33*1536,y=610-x/1536*470+Math.sin(x/1536*9)*35;
      cloud(x,y,30+this.random()*48,'0,0,0',.3,.5);
    }
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
  }
  makeNebula() {
    this.nebula=new THREE.Mesh(new THREE.PlaneGeometry(175,92),new THREE.MeshBasicMaterial({map:this.nebulaTexture(),transparent:true,opacity:.85,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));
    this.nebula.position.set(0,0,-9);this.far.add(this.nebula);
    // A larger, softer cloud provides depth under the sharper stellar dust.
    this.haze=new THREE.Mesh(new THREE.PlaneGeometry(155,82),new THREE.MeshBasicMaterial({map:this.nebula.material.map,transparent:true,opacity:.2,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));
    this.haze.position.set(8,-6,-7);this.haze.rotation.z=.17;this.middle.add(this.haze);
  }
  worldTexture(colorA,colorB,rocky=false) {
    const c=document.createElement('canvas');c.width=512;c.height=256;const ctx=c.getContext('2d');
    const gradient=ctx.createLinearGradient(0,0,0,256);gradient.addColorStop(0,colorA);gradient.addColorStop(.5,colorB);gradient.addColorStop(1,colorA);ctx.fillStyle=gradient;ctx.fillRect(0,0,512,256);
    if(rocky){
      for(let i=0;i<90;i++){const x=this.random()*512,y=this.random()*256,r=2+this.random()*12;const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(0,0,0,.16)');g.addColorStop(.6,'rgba(0,0,0,.24)');g.addColorStop(1,'rgba(160,185,205,.04)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,2*r,2*r);}
    }else{
      for(let i=0;i<40;i++){ctx.strokeStyle=`rgba(174,199,211,${.025+this.random()*.07})`;ctx.lineWidth=2+this.random()*9;ctx.beginPath();for(let x=0;x<=512;x+=4){const y=i*7+Math.sin(x/512*Math.PI*4+i)*3;x?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();}
    }
    const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;return texture;
  }
  makeWorlds(glowTexture) {
    const material=(map)=>new THREE.MeshStandardMaterial({map,roughness:1,metalness:0,color:'#52657b',transparent:true,opacity:.65});
    this.ringWorld=new THREE.Group();this.ringWorld.position.set(-18,-9,-4);this.near.add(this.ringWorld);
    this.gas=new THREE.Mesh(new THREE.SphereGeometry(3.6,48,32),material(this.worldTexture('#131d2a','#294857')));this.gas.rotation.z=.23;this.ringWorld.add(this.gas);
    const ringMaterial=new THREE.MeshBasicMaterial({color:'#577481',transparent:true,opacity:.15,side:THREE.DoubleSide,depthWrite:false});
    for(const [inner,outer] of [[4.6,5.05],[5.18,6.3],[6.44,6.54]]){const ring=new THREE.Mesh(new THREE.RingGeometry(inner,outer,100),ringMaterial);ring.rotation.set(1.18,-.3,.12);this.ringWorld.add(ring);}
    this.moonPivot=new THREE.Group();this.ringWorld.add(this.moonPivot);
    this.moon=new THREE.Mesh(new THREE.SphereGeometry(.42,24,16),material(this.worldTexture('#192233','#425369',true)));this.moon.position.set(7.5,.7,0);this.moonPivot.add(this.moon);
    this.remoteWorld=new THREE.Mesh(new THREE.SphereGeometry(2.4,40,28),material(this.worldTexture('#151c32','#343048',true)));this.remoteWorld.position.set(19,9,-12);this.middle.add(this.remoteWorld);
    this.remoteGlow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture,color:'#7763a3',transparent:true,opacity:.09,depthWrite:false,blending:THREE.AdditiveBlending}));this.remoteGlow.scale.set(12,12,1);this.remoteGlow.position.copy(this.remoteWorld.position);this.middle.add(this.remoteGlow);
  }
  resize(aspect) {
    const spread=THREE.MathUtils.clamp(aspect/1.6,.43,1.5);
    this.ringWorld.position.x=-18*spread;this.remoteWorld.position.x=19*spread;this.remoteGlow.position.x=this.remoteWorld.position.x;
  }
  setTheme(palette) {
    this.targetTint.set(palette?palette.color:'#ffffff');
    this.targetStars.set(palette?palette.color:'#a3bdff');
  }
  update(dt,time,orientation,detail,motion) {
    const ease=motion?1-Math.exp(-dt*3):1;
    this.detailMix+=((detail?1:0)-this.detailMix)*ease;
    this.layers.forEach(({group,response},i)=>{
      group.quaternion.identity().slerp(orientation,response);
      group.rotateZ(Math.sin(time*.013+i)*.025);
    });
    this.tint.lerp(this.targetTint,ease);this.starTint.lerp(this.targetStars,ease);
    this.animatedPoints.forEach(points=>{points.material.uniforms.time.value=time;points.material.uniforms.color.value.copy(this.starTint);});
    this.nebula.material.color.copy(this.tint);this.haze.material.color.copy(this.tint);
    this.remoteGlow.material.color.copy(this.starTint);
    this.gas.material.color.copy(this.tint).multiplyScalar(.5);
    this.remoteWorld.material.color.copy(this.tint).multiplyScalar(.42);
    this.ringWorld.children.forEach(node=>{if(node.geometry?.type==='RingGeometry')node.material.color.copy(this.starTint).multiplyScalar(.55);});
    this.nebula.material.opacity=.85-this.detailMix*.15;
    this.haze.material.opacity=.2-this.detailMix*.035;
    this.gas.rotation.y=time*.014;this.remoteWorld.rotation.y=time*.009;
    this.moonPivot.rotation.y=time*.055;
    this.ringWorld.position.y=-9+Math.sin(time*.035)*.55;
    this.remoteWorld.position.y=9+Math.sin(time*.025+1)*.35;this.remoteGlow.position.y=this.remoteWorld.position.y;
  }
}
