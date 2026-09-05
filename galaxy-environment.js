import * as THREE from './assets/vendor/three/three.module.min.js';

// Persistent scenery behind the interactive worlds. No labels or hit targets.
export class GalaxyEnvironment {
  constructor(scene, points, glowTexture) {
    this.seed=9157;this.animatedPoints=[];this.detailMix=0;
    this.root=new THREE.Group();scene.add(this.root);
    this.previousOrientation=new THREE.Quaternion();this.delta=new THREE.Quaternion();
    this.bandNormal=new THREE.Vector3(-.56,.825,.072).normalize();
    this.bandRotation=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),this.bandNormal);
    this.tint=new THREE.Color('#ffffff');this.targetTint=this.tint.clone();
    this.starTint=new THREE.Color('#a3bdff');this.targetStars=this.starTint.clone();
    this.far=this.layer();this.middle=this.layer();this.near=this.layer();
    this.makeStars(points);
    this.makeNebula();
    this.makeWorlds(glowTexture);
  }
  random(){this.seed=this.seed*16807%2147483647;return(this.seed-1)/2147483646;}
  layer(){const group=new THREE.Group();this.root.add(group);return group;}
  direction(radius){const y=this.random()*2-1,angle=this.random()*Math.PI*2,r=Math.sqrt(1-y*y);return [radius*r*Math.cos(angle),radius*y,radius*r*Math.sin(angle)];}
  rebaseOrientation(orientation){this.previousOrientation.copy(orientation);}
  makeStars(points) {
    for(const [layer,count,radius,color,size] of [[this.far,22000,138,'#c5dcf5',1.1],[this.middle,18000,95,'#c2d4ff',.95]]){
      const p=[],s=[],f=[];
      for(let i=0;i<count;i++){p.push(...this.direction(radius+(this.random()-.5)*12));s.push(.32+this.random()*size);f.push(this.random()*6.28);}
      const stars=points(p,s,f,color,1);layer.add(stars);this.animatedPoints.push(stars);
    }
    // A closed great-circle river, populated over all longitudes.
    const p=[],s=[],f=[];
    for(let i=0;i<28000;i++){
      const longitude=this.random()*Math.PI*2,latitude=(this.random()+this.random()+this.random()-1.5)*.19;
      const direction=new THREE.Vector3().setFromSphericalCoords(121+this.random()*8,Math.PI/2+latitude,longitude).applyQuaternion(this.bandRotation);
      p.push(direction.x,direction.y,direction.z);
      s.push(.28+Math.pow(this.random(),3)*1.45);f.push(this.random()*6.28);
    }
    this.dust=points(p,s,f,'#d0d8ff',1);this.middle.add(this.dust);this.animatedPoints.push(this.dust);
    const brightPositions=[],brightSizes=[],brightPhases=[];
    for(let i=0;i<1800;i++){
      brightPositions.push(...this.direction(88+this.random()*20));brightSizes.push(1.1+Math.pow(this.random(),2)*3.2);brightPhases.push(this.random()*6.28);
    }
    this.brightStars=points(brightPositions,brightSizes,brightPhases,'#e1efff',.95);
    this.brightStars.material.fragmentShader=`uniform vec3 color; uniform float time; uniform float opacity; varying float vPhase;
      void main(){vec2 p=(gl_PointCoord-.5)*2.;float r=length(p);if(r>1.)discard;
      float halo=exp(-r*r*5.)*.3;float core=exp(-r*r*85.);
      float rays=(exp(-abs(p.x)*40.)+exp(-abs(p.y)*40.))*pow(max(1.-r,0.),3.)*.14;
      float pulse=.84+.16*sin(time*.65+vPhase);
      gl_FragColor=vec4(color*1.6,(halo+core+rays)*pulse*opacity);}`;
    this.middle.add(this.brightStars);this.animatedPoints.push(this.brightStars);
    this.white=new THREE.Color('#eef5ff');
  }
  makeNebula() {
    const material=new THREE.ShaderMaterial({
      uniforms:{color:{value:new THREE.Color('#dce6ff')},bandNormal:{value:this.bandNormal},time:{value:0},opacity:{value:1}},
      vertexShader:`varying vec3 vDirection;void main(){vDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader:`uniform vec3 color;uniform vec3 bandNormal;uniform float time;uniform float opacity;varying vec3 vDirection;
        float noise(vec3 p){vec3 w=sin(p.yzx*.83+sin(p.zxy*.61));vec3 s=sin(p+w);return .5+dot(s,vec3(.21,.17,.12));}
        float fbm(vec3 p){return noise(p)*.57+noise(p*2.03+13.)*.28+noise(p*4.07+29.)*.15;}
        void main(){vec3 d=normalize(vDirection);vec3 p=d*8.+vec3(time*.004,0.,0.);
          float cloud=fbm(p);float latitude=dot(d,bandNormal)+(cloud-.5)*.15;
          float band=exp(-latitude*latitude*33.);float core=exp(-latitude*latitude*180.);
          float gaps=smoothstep(.23,.66,cloud);float density=band*(.17+gaps*.65)+core*gaps*.22;
          vec3 tint=mix(vec3(.22,.32,.62),color*.9,.7);vec3 light=mix(tint,vec3(.76,.83,1.),core*gaps*.5);
          gl_FragColor=vec4(light,density*opacity);}`,
      transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.BackSide
    });
    this.nebula=new THREE.Mesh(new THREE.SphereGeometry(180,64,40),material);
    this.nebula.renderOrder=-100;this.far.add(this.nebula);
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
    this.ringWorld=new THREE.Group();this.ringWorld.position.set(-34,-20,-34);this.near.add(this.ringWorld);
    this.gas=new THREE.Mesh(new THREE.SphereGeometry(3.6,48,32),material(this.worldTexture('#131d2a','#294857')));this.gas.rotation.z=.23;this.ringWorld.add(this.gas);
    const ringMaterial=new THREE.MeshBasicMaterial({color:'#577481',transparent:true,opacity:.15,side:THREE.DoubleSide,depthWrite:false});
    for(const [inner,outer] of [[4.6,5.05],[5.18,6.3],[6.44,6.54]]){const ring=new THREE.Mesh(new THREE.RingGeometry(inner,outer,100),ringMaterial);ring.rotation.set(1.18,-.3,.12);this.ringWorld.add(ring);}
    this.moonPivot=new THREE.Group();this.ringWorld.add(this.moonPivot);
    this.moon=new THREE.Mesh(new THREE.SphereGeometry(.42,24,16),material(this.worldTexture('#192233','#425369',true)));this.moon.position.set(7.5,.7,0);this.moonPivot.add(this.moon);
    this.remoteWorld=new THREE.Mesh(new THREE.SphereGeometry(2.4,40,28),material(this.worldTexture('#151c32','#343048',true)));this.remoteWorld.position.set(30,21,-45);this.middle.add(this.remoteWorld);
    this.remoteGlow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture,color:'#7763a3',transparent:true,opacity:.09,depthWrite:false,blending:THREE.AdditiveBlending}));this.remoteGlow.scale.set(12,12,1);this.remoteGlow.position.copy(this.remoteWorld.position);this.middle.add(this.remoteGlow);
  }
  resize(aspect) {
    const spread=THREE.MathUtils.clamp(aspect/1.6,.43,1.5);
    this.ringWorld.position.x=-34*spread;this.remoteWorld.position.x=30*spread;this.remoteGlow.position.x=this.remoteWorld.position.x;
  }
  setTheme(palette) {
    this.targetTint.set(palette?palette.color:'#ffffff');
    this.targetStars.set(palette?palette.color:'#a3bdff');
  }
  update(dt,time,orientation,detail,motion) {
    const ease=motion?1-Math.exp(-dt*3):1;
    this.detailMix+=((detail?1:0)-this.detailMix)*ease;
    // Integrate complete frame deltas. Fractional identity->orientation slerps
    // reverse at 180 degrees; incremental quaternions are continuous at all angles.
    this.delta.copy(this.previousOrientation).invert().premultiply(orientation);
    this.root.quaternion.premultiply(this.delta).normalize();this.previousOrientation.copy(orientation);
    this.tint.lerp(this.targetTint,ease);this.starTint.lerp(this.targetStars,ease);
    this.animatedPoints.forEach(points=>{points.material.uniforms.time.value=time;points.material.uniforms.color.value.copy(this.starTint).lerp(this.white,.38);});
    this.brightStars.material.uniforms.color.value.lerp(this.white,.68);
    this.nebula.material.uniforms.color.value.copy(this.tint);
    this.nebula.material.uniforms.time.value=time;
    this.remoteGlow.material.color.copy(this.starTint);
    this.gas.material.color.copy(this.tint).multiplyScalar(.5);
    this.remoteWorld.material.color.copy(this.tint).multiplyScalar(.42);
    this.ringWorld.children.forEach(node=>{if(node.geometry?.type==='RingGeometry')node.material.color.copy(this.starTint).multiplyScalar(.55);});
    this.nebula.material.uniforms.opacity.value=1.-this.detailMix*.12;
    this.gas.rotation.y=time*.014;this.remoteWorld.rotation.y=time*.009;
    this.moonPivot.rotation.y=time*.055;
    this.ringWorld.position.y=-20+Math.sin(time*.035)*.55;
    this.remoteWorld.position.y=21+Math.sin(time*.025+1)*.35;this.remoteGlow.position.y=this.remoteWorld.position.y;
  }
}
