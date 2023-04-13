import './style.css'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import gsap from 'gsap'
import {CustomEase} from "gsap/CustomEase";


gsap.registerPlugin(CustomEase);


/**
 * Base
 */
// Debug
const gui = new dat.GUI()
const debugObject = {}
// Canvas
const canvasWrapperOne = document.querySelector('.canvas-w-one')
const canvasOne = document.querySelector('canvas.webgl-one')

// Scene
const scene = new THREE.Scene()

/**
 * variables
 */
let load
let model
const colors = {
    color1: 0xffffff,
    color2: 0xffffff,
    color3: 0xffffff,
}
/**
 * Light
 */
const hemiLight = new THREE.PointLight(colors.color1, 5);
hemiLight.position.set(0, 10, -30);

const dirLight = new THREE.DirectionalLight(colors.color2);
dirLight.intensity = 2
dirLight.position.set(0, 50, 30);
dirLight.shadow.normalBias = 0.05

const dirLight2 = new THREE.DirectionalLight(colors.color3);
dirLight2.intensity = 3
dirLight2.position.set(-10, -50, 50);
dirLight2.shadow.normalBias = 0.015

scene.add(hemiLight, dirLight, dirLight2);


const folder1 = gui.addFolder('Light-1');
folder1.add(dirLight.position, 'x', - 100, 100, 0.01).name('position X')
folder1.add(dirLight.position, 'y', - 100, 100, 0.01).name('position y')
folder1.add(dirLight.position, 'z', - 100, 100, 0.01).name('position z')
folder1.add(dirLight, 'intensity', - 100, 100, 0.01).name('intensity')

const folder2 = gui.addFolder('Light-2');
folder2.add(dirLight2.position, 'x', - 100, 100, 0.01).name('position X')
folder2.add(dirLight2.position, 'y', - 100, 100, 0.01).name('position y')
folder2.add(dirLight2.position, 'z', - 100, 100, 0.01).name('position z')
folder2.add(dirLight2, 'intensity', - 100, 100, 0.01).name('intensity')

const folder3 = gui.addFolder('Light-3');
folder3.add(hemiLight.position, 'x', - 100, 100, 0.01).name('position X')
folder3.add(hemiLight.position, 'y', - 100, 100, 0.01).name('position y')
folder3.add(hemiLight.position, 'z', - 100, 100, 0.01).name('position z')
folder3.add(hemiLight, 'intensity', - 100, 100, 0.01).name('intensity')
/**
 * loaders
 */
const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://unpkg.com/three@0.125.2/examples/js/libs/draco/');
loader.setDRACOLoader(dracoLoader);


/**
 * Models
 */
loader.load(
    'spin.gltf',
    (gltf) => {
        model = gltf.scene
        model.scale.set(1, 1, 1)
        model.position.set(0, -1, 0)
        scene.add(model);
        updateAllMaterials()

        // gui.add(model.rotation, 'y', - 10, 10, 0.01)


    },
    (xhr) => {
        load = (xhr.loaded / xhr.total * 100);
        if (load === 100) {
            console.log(`${load}% loaded`);
        }
    },
    (error) => {
        console.error('An error happened', error);
    },
);
const updateAllMaterials = () => {
    scene.traverse((child) => {
        if (child instanceof THREE.Mesh
            &&
            child.material instanceof THREE.MeshStandardMaterial) {
            const parameters = {
                color: 0xffffff
            }
            child.material.metalness = 1
            child.material.roughness = 0.35
            child.material.color.set(parameters.color)
            const folder4 = gui.addFolder('Object');

            folder4.addColor(parameters, 'color')
                .onChange(() =>
                {
                    child.material.color.set(parameters.color)
                })
            folder4.add(child.material, 'metalness').min(0).max(1).step(0.0001)
            folder4.add(child.material, 'roughness').min(0).max(1).step(0.0001)





        }
    })
}
/**
 * Sizes
 */
const sizes = {
    width: canvasWrapperOne.clientWidth,
    height: canvasWrapperOne.clientHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = canvasWrapperOne.clientWidth
    sizes.height = canvasWrapperOne.clientHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const aspectRatio = sizes.width / sizes.height
const camera = new THREE.PerspectiveCamera(45, aspectRatio, 0.1, 1000)
camera.position.x = -3
camera.position.y = 0
camera.position.z = 10
scene.add(camera)

// Controls
// const controls = new OrbitControls(camera, canvasOne)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvasOne,
    alpha: true,
    antialias: true,
})
renderer.physicallyCorrectLights = true
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
// renderer.setClearColor(0xFFFFFF);

/**
 * Animate
 */
const vector = new THREE.Vector3()
vector.x = 0
vector.y = 0
vector.z = 0

const curveRoad = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -20, 0),
    new THREE.Vector3(0, -20, -0.01),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 20, 0.01),
    new THREE.Vector3(0, 20, 0),
]);

const points = curveRoad.getPoints(100);
let vectorsRotate = vector
let rectangle = canvasOne.getBoundingClientRect();
const point = (x = 0, y = 0) => ({x, y});
window.addEventListener('mousemove', document_mouseMoveHandler);
const frameCount = points.length;

function document_mouseMoveHandler({clientX, clientY}) {
    let mouse = point(clientX, clientY);
    let mouseFraction = ((mouse.x * 100) / rectangle.width)
    const frameIndex = Math.min(frameCount, Math.ceil(mouseFraction));
    if (model) {
        gsap.to(
            vectorsRotate,
            {
                duration: 4,
                ease: "power3.out",
                x: points[frameIndex].x,
                y: points[frameIndex].y,
                z: points[frameIndex].z,
            }
        )
    }
}

const tick = () => {

    if (model) {

        model.rotation.set(...vectorsRotate)
        dirLight.target = model
        dirLight2.target = model
        hemiLight.target = model
    }

    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}

tick()
