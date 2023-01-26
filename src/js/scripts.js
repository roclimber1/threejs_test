
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'


import dat from 'dat.gui'

import nebula from '../images/nebula.jpg'
import stars from '../images/stars.jpg'



const dinosaurUrl = new URL('../assets/dinosaur.glb', import.meta.url);

// mixamo.com
const characterUrl = new URL('../assets/Ch20_nonPBR.fbx', import.meta.url);
const danceUrl = new URL('../assets/Bboy Hip Hop Move.fbx', import.meta.url);

const walkingUrl = new URL('../assets/Walking.fbx', import.meta.url);
const jogBackwardsUrl = new URL('../assets/Slow Jog Backwards.fbx', import.meta.url)



const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

renderer.shadowMap.enabled = true;



const clock = new THREE.Clock();

let mixer


const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
cube.position.y = 3;
cube.position.x = 8;
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
sphere.position.set(10, 10, 0);
sphere.castShadow = true;
const sphereId = sphere.id;


const controls = new OrbitControls(camera, renderer.domElement);


camera.position.set(-10, 30, 30);
controls.update();



scene.fog = new THREE.FogExp2(0xffffff, 0.01);



const textureLoader = new THREE.TextureLoader();

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
const box2Material = new THREE.MeshBasicMaterial({});
const box2 = new THREE.Mesh(box2Geometry, box2MultiMaterial);
scene.add(box2);
box2.position.set(0, 15, 10);

box2.name = 'theBox';


const plane2Geometry = new THREE.PlaneGeometry(10, 10, 10, 10);
const plane2Material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true
});
const plane2 = new THREE.Mesh(plane2Geometry, plane2Material);
scene.add(plane2);
plane2.position.set(10, 10, 15);



const sphere2Geometry = new THREE.SphereGeometry(4);
const sphere2Material = new THREE.ShaderMaterial({
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent
});
const sphere2 = new THREE.Mesh(sphere2Geometry, sphere2Material);
scene.add(sphere2);
sphere2.position.set(-5, 10, 10);



const assetsLoader = new GLTFLoader();

// let mixer;
assetsLoader.load(
    dinosaurUrl.href,
    function(gltf) {
        const model = gltf.scene;
        scene.add(model);

        model.position.set(-12, 0, 10);

        // mixer = new THREE.AnimationMixer(model);
        // const clips = gltf.animations;
    },
    function(event) {
        console.debug('progressEvent', event);
    },
    function(error) {
        console.error(error);
    });


const loader = new FBXLoader();
let character = null;

let walking = null;
let dancing = null;
let jogBackwards = null;

const ACTION = {
    WALKING: 'WALKING',
    DANCING: 'DANCING',
    JOG_BACKWARDS: 'JOG_BACKWARDS'
};

let currentAction = ACTION.DANCING;


loader.load(characterUrl.href, (object) => {

    object.scale.setScalar(0.05);

    object.traverse(child => {

        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    const animation = new FBXLoader();


    animation.load(walkingUrl.href, (anim) => {

        walking = anim.animations[0];
    });

    animation.load(jogBackwardsUrl.href, (anim) => {

        jogBackwards = anim.animations[0];
    });

    animation.load(danceUrl.href, (anim) => {

        dancing = anim.animations[0];

        mixer = new THREE.AnimationMixer(object);

        const action = mixer.clipAction(dancing);
        action.play();
    });

    scene.add(object);

    character = object;
});



const spotLight = new THREE.SpotLight(0xffffff);
scene.add(spotLight);
spotLight.position.set(-100, 100, 0);
spotLight.castShadow = true;
spotLight.angle = 0.07;


const gridHelper = new THREE.GridHelper(30);
scene.add(gridHelper);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);


const sLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(sLightHelper);



const gui = new dat.GUI();

const options = {
    sphereColor: '#ffea00',
    wireframe: false,
    speed: 0.01,
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

gui.add(options, 'angle', 0, 1);
gui.add(options, 'penumbra', 0, 1);
gui.add(options, 'intensity', 0, 1);


let step = 0;

const mousePosition = new THREE.Vector2();

window.addEventListener('mousemove', function(event) {
    mousePosition.x = (event.clientX / this.window.innerWidth) * 2 - 1;
    mousePosition.y = - (event.clientY / this.window.innerHeight) * 2 + 1;
});


let characterSpeed = 0;
let characterAngle = 0;
let moveForward = false;
let moveBackward = false;


window.addEventListener('keydown', function(event) {

    if (event.code == "Space") {

        character.position.z = 0;
        character.position.x = 0;

    } else {

        switch (event.key) {
            case 'w':
                characterSpeed = 0.08;
                moveForward = true;
                break;
            case 'a':
                characterAngle = 0.04;
                break;
            case 'd':
                characterAngle = -0.04;
                break;
            case 's':
                characterSpeed = -0.08;
                moveBackward = true;
                break;
        }
    }


    if (moveForward) {

        if (currentAction != ACTION.WALKING) {

            mixer = new THREE.AnimationMixer(character);

            const action = mixer.clipAction(walking);
            action.play();

            currentAction = ACTION.WALKING;
        }
    } else if (moveBackward) {

        if (currentAction != ACTION.JOG_BACKWARDS) {

            mixer = new THREE.AnimationMixer(character);

            const action = mixer.clipAction(jogBackwards);
            action.play();

            currentAction = ACTION.JOG_BACKWARDS;
        }
    } else if (characterAngle) {

        characterSpeed = 0.08;

        if (currentAction != ACTION.WALKING) {

            mixer = new THREE.AnimationMixer(character);

            const action = mixer.clipAction(walking);
            action.play();

            currentAction = ACTION.WALKING;
        }
    }

});


window.addEventListener('keyup', function(event) {


    if ((event.key == 'a') || (event.key == 'd')) {

        characterAngle = 0;

        if (!moveForward) {

            characterSpeed = 0;
        }
    } else {

        if (event.key == 'w') {

            moveForward = false;
        }

        if (event.key == 's') {

            moveBackward = false;
        }

        characterSpeed = 0;
    }


    if (!moveForward && !characterAngle && !moveBackward) {

        if (currentAction != ACTION.DANCING) {

            mixer = new THREE.AnimationMixer(character);

            const action = mixer.clipAction(dancing);
            action.play();

            currentAction = ACTION.DANCING;
        }
    }
});


const rayCaster = new THREE.Raycaster();


function animate() {
	requestAnimationFrame(animate);

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    step += options.speed;
    sphere.position.y = 10 * Math.abs(Math.sin(step)) + sphereRadius;


    spotLight.angle = options.angle;
    spotLight.penumbra = options.penumbra;
    spotLight.intensity = options.intensity;
    sLightHelper.update();

    rayCaster.setFromCamera(mousePosition, camera);
    const intersects = rayCaster.intersectObjects(scene.children);

    for (const item of intersects) {

        if (item.object.id == sphereId) {

            item.object.material.color.set(0xff0000);
        }

        if (item.object.name == 'theBox') {

            item.object.rotation.x += 0.01;
            item.object.rotation.y += 0.01;
        }
    }

    if (character) {

        character.rotation.y += characterSpeed ? characterAngle : 0.01;

        const angle = character.rotation.y;

        character.position.z += Math.cos(angle) * characterSpeed;
        character.position.x += Math.sin(angle) * characterSpeed;
    }

    const delta = clock.getDelta();

    if (mixer) {
        mixer.update(delta);
    }


	renderer.render(scene, camera);
}

animate();


window.addEventListener('resize', function() {

    const { innerWidth, innerHeight } = window;

    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(innerWidth, innerHeight);
});
