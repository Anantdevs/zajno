import LocomotiveScroll from 'locomotive-scroll';
import * as THREE from 'three';
import vertexShader from './shaders/vertexShader.glsl'; 
import fragmentShader from './shaders/fragmentShader.glsl'; 
import gsap from 'gsap';
const locomotiveScroll = new LocomotiveScroll();

// Check if device is mobile
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

if (!isMobile) {
  // Create scene
  const scene = new THREE.Scene();
  const distance=20;
  const fov=2*Math.atan((window.innerHeight/2)/distance)*(180/Math.PI);

  // Create camera
  const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = distance;

  // Create renderer
  const renderer = new THREE.WebGLRenderer({canvas:document.getElementById('canvas'),alpha:true});

  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Create raycaster
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const images=document.querySelectorAll('img');
  const planes=[];
  images.forEach(image=>{
    const imgBounds=image.getBoundingClientRect();
    const texture = new THREE.TextureLoader().load(image.src);
    const material=new THREE.ShaderMaterial({
      uniforms: {
        uTexture:{
          value: texture,
        },
        uMouse:{
          value: new THREE.Vector2(0.5,0.5),
        },
        uHover:{
          value:0.0,
        }
      },
      vertexShader,
      fragmentShader,    
    });
    const geometry = new THREE.PlaneGeometry(imgBounds.width, imgBounds.height);
    const plane=new THREE.Mesh(geometry, material);
    plane.position.set(imgBounds.left-window.innerWidth/2+imgBounds.width/2,-imgBounds.top+window.innerHeight/2-imgBounds.height/2,0);

    planes.push(plane);
    scene.add(plane);
  })

  function updatePlanePosition(){
    planes.forEach((plane,index)=>{
      const image=images[index];
      const imgBounds=image.getBoundingClientRect();
      // Update geometry to match new image bounds
      plane.geometry.dispose();
      plane.geometry = new THREE.PlaneGeometry(imgBounds.width, imgBounds.height);
      plane.position.set(imgBounds.left-window.innerWidth/2+imgBounds.width/2,-imgBounds.top+window.innerHeight/2-imgBounds.height/2,0);
    })
  }

  // Handle mouse move
  window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    planes.forEach(plane => {
      const intersects = raycaster.intersectObject(plane);
      if(intersects.length > 0) {
        const intersect = intersects[0];
        plane.material.uniforms.uMouse.value = intersect.uv;
        plane.material.uniforms.uHover.value = 1;
      } else {
        gsap.to(plane.material.uniforms.uHover, {
          value: 0,
          duration: 0.5,
          ease: "power2.out"
        });
      }
    });
  });

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    updatePlanePosition(); 
    renderer.render(scene, camera);
  }
  animate();

  // Handle window resize
  window.addEventListener('resize', () => {
    // Update camera
    const fov = 2 * Math.atan((window.innerHeight/2)/distance) * (180/Math.PI);
    camera.fov = fov;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    // Update renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    updatePlanePosition(); 
  });
} else {
  // Remove canvas if it exists
  const canvas = document.getElementById('canvas');
  if (canvas) {
    canvas.remove();
  }
}
