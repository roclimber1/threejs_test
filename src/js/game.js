
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'




// sketchfab
// mixamo.com
const characterUrl = new URL('../assets/Ch20_nonPBR.fbx', import.meta.url);
const danceUrl = new URL('../assets/Bboy Hip Hop Move.fbx', import.meta.url);

const walkingUrl = new URL('../assets/Walking.fbx', import.meta.url);
const jogBackwardsUrl = new URL('../assets/Slow Jog Backwards.fbx', import.meta.url)




const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});


renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setPixelRatio(window.devicePixelRatio);


const gameSceneDiv = document.getElementById('gameScene');
gameSceneDiv.appendChild(renderer.domElement);

const newDiv = document.createElement('div');
newDiv.className = 'progress';
gameSceneDiv.appendChild(newDiv);

const mainBlock = document.getElementById('title');




const { offsetHeight: height, offsetWidth: width } = gameSceneDiv;
const camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );


renderer.setSize(width, height);



const clock = new THREE.Clock();

let mixer




const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
plane.rotation.x = -0.5 * Math.PI;
plane.receiveShadow = true;



const controls = new OrbitControls(camera, renderer.domElement);



camera.position.set(25.80, 5.39, -7.75);
controls.update();



scene.fog = new THREE.FogExp2(0xffffff, 0.01);





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

    newDiv.className = 'hidden';
},
(data) => {

    const { loaded, total } = data || {};
    const percentage = Math.round(loaded / total * 100);

    newDiv.innerText = `${percentage}% loaded`;
});



const spotLight = new THREE.SpotLight(0xffffff);
scene.add(spotLight);
spotLight.position.set(-100, 100, 0);
spotLight.castShadow = true;
spotLight.angle = 0.07;
spotLight.penumbra = 0.9;
spotLight.intensity = 0.8;



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



function animate() {

	requestAnimationFrame(animate);


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

    const { offsetHeight: height, offsetWidth: width } = gameSceneDiv;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
});


const cameraInitPositionZ = camera.position.z;
const cameraInitPositionX = camera.position.x;
const blockInitSize = mainBlock.offsetWidth;

window.addEventListener('scroll', function (event) {

    const position = window.scrollY;

    camera.position.z = cameraInitPositionZ + position / 80;
    camera.position.x = cameraInitPositionX - position / 80;

    mainBlock.style = `width: ${Math.round(blockInitSize - position / 4)}px; top: ${Math.round(position / 30)}px;`;

    controls.update();
});
