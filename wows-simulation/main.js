import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Water } from 'three/addons/objects/Water.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { Ship } from './ship.js';
import { Shell } from './shell.js';
import { calculateLaunchVelocity } from './ballistics.js';

let container;
let camera, scene, renderer;
let controls, water, sun;
let targetShip, playerShip;
let shells = [];
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

init();
animate();

function init() {
    container = document.body;

    // SCENE
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;
    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
    camera.position.set(30, 30, 100);

    // SUN
    sun = new THREE.Vector3();

    // WATER
    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

    water = new Water(
        waterGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load('https://unpkg.com/three@0.160.0/examples/textures/water/waternormals.jpg', function (texture) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            }),
            sunDirection: new THREE.Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7,
            fog: scene.fog !== undefined
        }
    );

    water.rotation.x = - Math.PI / 2;
    scene.add(water);

    // SKY
    const sky = new Sky();
    sky.scale.setScalar(10000);
    scene.add(sky);

    const skyUniforms = sky.material.uniforms;

    skyUniforms['turbidity'].value = 10;
    skyUniforms['rayleigh'].value = 2;
    skyUniforms['mieCoefficient'].value = 0.005;
    skyUniforms['mieDirectionalG'].value = 0.8;

    const parameters = {
        elevation: 2,
        azimuth: 180
    };

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const sceneEnv = new THREE.Scene();

    let renderTarget;

    function updateSun() {

        const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
        const theta = THREE.MathUtils.degToRad(parameters.azimuth);

        sun.setFromSphericalCoords(1, phi, theta);

        sky.material.uniforms['sunPosition'].value.copy(sun);
        water.material.uniforms['sunDirection'].value.copy(sun);

        if (renderTarget) renderTarget.dispose();

        sceneEnv.add(sky);
        renderTarget = pmremGenerator.fromScene(sceneEnv);
        scene.add(sky);

        scene.environment = renderTarget.texture;

    }

    updateSun();

    // CONTROLS
    controls = new OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.target.set(0, 10, 0);
    controls.minDistance = 40.0;
    controls.maxDistance = 200.0;
    controls.update();

    // TARGET SHIP (Generic Red Enemy)
    targetShip = new Ship(0x882222, 1);
    targetShip.position.set(0, 0, 0);
    targetShip.rotation.y = Math.PI / 4; // Angled
    scene.add(targetShip);

    // PLAYER SHIP (Generic Blue Ally - Background)
    playerShip = new Ship(0x224488, 1);
    playerShip.position.set(-200, 0, 200);
    scene.add(playerShip);

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('click', onMouseClick);
    window.addEventListener('keydown', onKeyDown);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// GAMEPLAY STATES
let isBinocular = false;
const hudElement = document.getElementById('hud');

function onKeyDown(event) {
    if (event.key === 'Shift') {
        toggleBinocularMode();
    }
}

function toggleBinocularMode() {
    isBinocular = !isBinocular;

    if (isBinocular) {
        // ENTER BINOCULAR
        hudElement.style.display = 'block';

        // Move camera to "Bridge" view (relative to Player Ship)
        // Ideally we attach camera to ship, but for now just move it above water
        const playerPos = playerShip.position.clone();
        playerPos.y += 30; // Bridge height

        controls.enabled = false; // Disable orbit

        // Look at current orbit target or forward
        const lookDir = new THREE.Vector3();
        camera.getWorldDirection(lookDir);

        camera.position.copy(playerPos);
        camera.fov = 15; // Zoom in!
        camera.updateProjectionMatrix();

        // Rotate camera to look towards target? Or keep current heading?
        // Let's look towards the red ship by default for ease for now
        camera.lookAt(targetShip.position);

    } else {
        // EXIT BINOCULAR
        hudElement.style.display = 'none';

        controls.enabled = true;
        camera.fov = 55; // Normal FOV
        camera.updateProjectionMatrix();

        // Reset camera positions handled by OrbitControls mostly, 
        // but we might need to reset manually if it got weird.
        // OrbitControls usually remembers its state.
        camera.position.set(30, 30, 100); // Reset for simplicity
        controls.target.set(0, 10, 0);
        controls.update();
    }
}

function onMouseClick(event) {
    if (!playerShip) return;

    // In Binocular mode, we fire at center of screen
    let targetPoint;

    if (isBinocular) {
        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera); // Center
    } else {
        // Normal Mouse Aim
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
    }

    const intersects = raycaster.intersectObject(water);

    if (intersects.length > 0) {
        targetPoint = intersects[0].point;
        fireGuns(targetPoint);
    }
}

function fireGuns(targetPoint) {
    // Fire from all turrets
    playerShip.turrets.forEach(turret => {
        // Calculate Global Position of turret
        const startPos = new THREE.Vector3();
        turret.getWorldPosition(startPos);
        startPos.y += 2; // Barrel height

        const speed = 150; // Shell velocity m/s (scaled for view)
        const velocity = calculateLaunchVelocity(startPos, targetPoint, speed);

        const shell = new Shell(startPos, velocity);
        scene.add(shell);
        shells.push(shell);
    });
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    const time = performance.now() * 0.001;
    const dt = 1 / 60; // fixed timestep for visuals

    water.material.uniforms['time'].value += 1.0 / 60.0;

    if (targetShip) targetShip.update(time);
    if (playerShip) playerShip.update(time);

    // Update Shells
    const targetBox = new THREE.Box3().setFromObject(targetShip);

    for (let i = shells.length - 1; i >= 0; i--) {
        shells[i].update(dt);

        // Check Collision with Target
        if (targetBox.containsPoint(shells[i].position)) {
            console.log("HIT!");
            // Visual feedback: Flash ship
            flashShip(targetShip);

            // Remove shell
            scene.remove(shells[i]);
            shells.splice(i, 1);
            continue;
        }

        if (!shells[i].active) {
            scene.remove(shells[i]);
            shells.splice(i, 1);
        }
    }

    renderer.render(scene, camera);
}

function flashShip(ship) {
    // Simple flash effect
    ship.traverse((child) => {
        if (child.isMesh) {
            const originalColor = child.material.color.getHex();
            child.material.color.setHex(0xffffff); // White flash
            setTimeout(() => {
                child.material.color.setHex(originalColor);
            }, 100);
        }
    });
}
