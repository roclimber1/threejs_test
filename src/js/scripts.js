
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import dat from 'dat.gui'

import nebula from '../images/nebula.jpg'
import stars from '../images/stars.jpg'


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

renderer.shadowMap.enabled = true;


const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
cube.position.y = 3;
cube.castShadow = true;


const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
plane.rotation.x = -0.5 * Math.PI;
plane.receiveShadow = true;


const sphereRadius = 4;
const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 20, 20);
const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0x0000ff,
    wireframe: false
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);
sphere.position.x = 6;
sphere.position.set(-10, 10, 0);
sphere.castShadow = true;
const sphereId = sphere.id;


const controls = new OrbitControls(camera, renderer.domElement);


camera.position.set(-10, 30, 30);
controls.update();


// scene.fog = new THREE.Fog(0xffffff, 0, 200);
scene.fog = new THREE.FogExp2(0xffffff, 0.01);

// renderer.setClearColor(0xffea00);

const textureLoader = new THREE.TextureLoader();
// scene.background = textureLoader.load(stars);
const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load([
    nebula,
    nebula,
    stars,
    stars,
    stars,
    stars
]);

const box2MultiMaterial = [
    new THREE.MeshBasicMaterial({ map: textureLoader.load(stars) }),
    new THREE.MeshBasicMaterial({ map: textureLoader.load(stars) }),
    new THREE.MeshBasicMaterial({ map: textureLoader.load(nebula) }),
    new THREE.MeshBasicMaterial({ map: textureLoader.load(stars) }),
    new THREE.MeshBasicMaterial({ map: textureLoader.load(nebula) }),
    new THREE.MeshBasicMaterial({ map: textureLoader.load(stars) })
];
const box2Geometry = new THREE.BoxGeometry(4, 4, 4);
const box2Material = new THREE.MeshBasicMaterial({
    // color: 0x00ff00,
    // map: textureLoader.load(nebula)
});
const box2 = new THREE.Mesh(box2Geometry, box2MultiMaterial);
scene.add(box2);
box2.position.set(0, 15, 10);
// box2.material.map = textureLoader.load(nebula);


// const ambientLight = new THREE.AmbientLight(0x333333);
// scene.add(ambientLight);


// const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
// scene.add(directionalLight);
// directionalLight.position.set(-30, 50, 0);
// directionalLight.castShadow = true;
// directionalLight.shadow.camera.top = 15;

const spotLight = new THREE.SpotLight(0xffffff);
scene.add(spotLight);
spotLight.position.set(-100, 100, 0);
spotLight.castShadow = true;
spotLight.angle = 0.07;


const gridHelper = new THREE.GridHelper(30);
scene.add(gridHelper);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// const dLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
// scene.add(dLightHelper);

// const dLightShedowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
// scene.add(dLightShedowHelper);

const sLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(sLightHelper);



const gui = new dat.GUI();

const options = {
    sphereColor: '#ffea00',
    wireframe: false,
    speed: 0.01,
    light: 1,
    sphereRadius: 4,
    angle: 0.096,
    penumbra: 1,
    intensity: 1
};

gui.addColor(options, 'sphereColor').onChange(function(event) {
    sphere.material.color.set(event);
});

gui.add(options, 'wireframe').onChange(function(event) {
    sphere.material.wireframe = event;
});

gui.add(options, 'speed', 0, 0.1);

gui.add(options, 'light', 0, 10).onChange(function(event) {
    ambientLight.intensity = event;
});

gui.add(options, 'sphereRadius', 0.1, 15);

gui.add(options, 'angle', 0, 1);
gui.add(options, 'penumbra', 0, 1);
gui.add(options, 'intensity', 0, 1);


let step = 0;

const mousePosition = new THREE.Vector2();

window.addEventListener('mousemove', function(event) {
    mousePosition.x = (event.clientX / this.window.innerWidth) * 2 - 1;
    mousePosition.y = - (event.clientY / this.window.innerHeight) * 2 + 1;
});

const rayCaster = new THREE.Raycaster();


function animate() {
	requestAnimationFrame(animate);

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    step += options.speed;
    sphere.geometry.parameters.radius = options.sphereRadius;
    sphere.position.y = 10 * Math.abs(Math.sin(step)) + options.sphereRadius;

    spotLight.angle = options.angle;
    spotLight.penumbra = options.penumbra;
    spotLight.intensity = options.intensity;
    sLightHelper.update();

    rayCaster.setFromCamera(mousePosition, camera);
    const intersects = rayCaster.intersectObjects(scene.children);
    // console.debug(intersects);

    for (const item of intersects) {

        if (item.object.id == sphereId) {

            item.object.material.color.set(0xff0000);
        }
    }

	renderer.render(scene, camera);
}

animate();
