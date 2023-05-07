
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'





const characterUrl = new URL('../assets/robot.fbx', import.meta.url);


const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});


renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setPixelRatio(window.devicePixelRatio);


const gameSceneDiv = document.getElementById('gameScene');
gameSceneDiv.appendChild(renderer.domElement);

const newDiv = document.createElement('div');
newDiv.className = 'progress';
gameSceneDiv.appendChild(newDiv);

const mainBlock = document.getElementById('title');




const { offsetHeight: height, offsetWidth: width } = gameSceneDiv;
let aspectRatio = width / height;

const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000 );


renderer.setSize(width, height);



const clock = new THREE.Clock();

let mixer





const cubeSide = 12;

const geometry = new THREE.BoxGeometry(cubeSide, cubeSide, cubeSide);
const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
const cube = new THREE.Mesh(geometry, material);


scene.add(cube);

cube.rotation.x = - 0.5 * Math.PI;
cube.position.y = - cubeSide / 2;
cube.castShadow = true;
cube.receiveShadow = true;





const controls = new OrbitControls(camera, renderer.domElement);



camera.position.set(25.80, 5.39, -7.75);
controls.update();



scene.fog = new THREE.FogExp2(0xffffff, 0.01);





const loader = new FBXLoader();

let character = null;


let walking = null;
let dancing = null;
let jogBackwards = null;

let jogTiming = 0;
let jogDuration = 0;

const JOG_PAUSE = 0.37;
const JOG_ENDING_PHASE = 0.4;


const ACTION = {
    WALKING: 'WALKING',
    DANCING: 'DANCING',
    JOG_BACKWARDS: 'JOG_BACKWARDS'
};


let currentAction = ACTION.DANCING;



loader.load(characterUrl.href, (object) => {

    object.scale.setScalar(0.01);

    object.traverse(child => {

        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });


    const animations = object.animations;

    try {

        walking = THREE.AnimationClip.findByName(animations, 'Armature.001|Walk');
        jogBackwards = THREE.AnimationClip.findByName(animations, 'Armature.001|Jog Backwards');
        jogDuration = jogBackwards.duration;

        dancing = THREE.AnimationClip.findByName(animations, 'Armature.001|Idle');

    } catch (error) {

        console.error('🚀 ~ file: game.js:132 ~ loader.load ~ error:', error);
    }


    mixer = new THREE.AnimationMixer(object);

    const action = mixer.clipAction(dancing);
    action.play();


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
let jogForward = false;


const CHARACTER_SPEED = 0.3;
const CHARACTER_ANGLE = 0.04;



window.addEventListener('keydown', function(event) {

    if (event.code == "Space") {

        character.position.z = 0;
        character.position.x = 0;

    } else {

        switch (event.key) {

            case 'w':

                characterSpeed = CHARACTER_SPEED;
                moveForward = true;

                break;

            case 'a':

                characterAngle = CHARACTER_ANGLE;

                break;

            case 'd':

                characterAngle = - CHARACTER_ANGLE;

                break;

            case 's':

                characterSpeed = - CHARACTER_SPEED;
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

        characterSpeed = CHARACTER_SPEED;

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
            jogTiming = 0;
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

    const delta = clock.getDelta();


    if (character) {

        character.rotation.y += characterSpeed ? characterAngle : 0.01;

        const angle = character.rotation.y;
        let dZ = Math.cos(angle) * characterSpeed;
        let dX = Math.sin(angle) * characterSpeed;

        if (currentAction == ACTION.JOG_BACKWARDS) {

            const condition = (jogTiming < JOG_PAUSE)
                || (jogTiming >= jogDuration - JOG_ENDING_PHASE);

            if (condition) {

                dZ = 0;
                dX = 0;
            }

            jogTiming += delta;

            if (jogTiming >= jogDuration) {

                jogTiming = 0;
            }
        }

        character.position.z += dZ;
        character.position.x += dX;

        if (cube) {
            cube.position.z = character.position.z;
            cube.position.x = character.position.x;
        }
    }

    if (mixer) {
        mixer.update(delta);
    }


	renderer.render(scene, camera);
}

animate();


window.addEventListener('resize', function() {

    const { offsetHeight: height, offsetWidth: width } = gameSceneDiv;

    aspectRatio = width / height;

    camera.aspect = aspectRatio;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
});


const cameraInitPositionZ = camera.position.z;
const cameraInitPositionX = camera.position.x;

const blockInitWidth = mainBlock.offsetWidth;


window.addEventListener('scroll', function (event) {

    const position = window.scrollY;

    camera.position.z = cameraInitPositionZ + position / 80;
    camera.position.x = cameraInitPositionX - position / 80;

    const width = blockInitWidth - position / 4;

    mainBlock.style = `width: ${Math.round(width)}px; top: ${Math.round(position / 30)}px;`;


    controls.update();
});
