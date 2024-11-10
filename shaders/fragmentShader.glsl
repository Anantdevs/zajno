varying vec2 vUv;
uniform sampler2D uTexture;
uniform vec2 uMouse;
uniform float uHover;



void main() {
    float blocks=20.0;
    vec2 blockUv=floor(vUv*blocks)/blocks;
    // vec2 mouse=vec2(0.5,0.5);
    float distance=length(blockUv-uMouse);
    float effect=smoothstep(0.4,0.1,distance);
    vec2 distortion=vec2(0.03)*effect;
    vec4 color=texture2D(uTexture,vUv+(distortion*uHover));
    gl_FragColor = color;
}