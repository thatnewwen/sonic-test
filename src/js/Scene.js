import glslify from 'glslify'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import 'glsl-noise/simplex/2d.glsl'
import vertexShader from './vertexShader.glsl'
import fragmentShader from './fragmentShader.glsl'

export default class Scene {
  canvas
  renderer
  scene
  camera
  controls
  width
  height

  constructor(el) {
    this.canvas = el

    this.setScene()
    this.setRender()
    this.setCamera()
    this.setControls()
    this.setSphere()

    this.handleResize()

    // start RAF
    this.events()
  }

  /**
   * This is our scene, we'll add any object
   * https://threejs.org/docs/?q=scene#api/en/scenes/Scene
   */
  setScene() {
    this.scene = new THREE.Scene()
    this.scene.background = null
  }

  /**
   * Our Webgl renderer, an object that will draw everything in our canvas
   * https://threejs.org/docs/?q=rend#api/en/renderers/WebGLRenderer
   */
  setRender() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    })
  }

  /**
   * Our Perspective camera, this is the point of view that we'll have
   * of our scene.
   * A perscpective camera is mimicing the human eyes so something far we'll
   * look smaller than something close
   * https://threejs.org/docs/?q=pers#api/en/cameras/PerspectiveCamera
   */
  setCamera() {
    const aspectRatio = this.width / this.height
    const fieldOfView = 50
    const nearPlane = 0.1
    const farPlane = 10000

    this.camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane)
    this.camera.position.set(2.5, 50, 50)

    this.scene.add(this.camera)
  }

  /**
   * Threejs controls to have controls on our scene
   * https://threejs.org/docs/?q=orbi#examples/en/controls/OrbitControls
   */
  setControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.autoRotate = true
  }

  /**
   * Let's add our mesh with his sphere geometry and basic material
   * https://threejs.org/docs/?q=sphere#api/en/geometries/SphereGeometry
   */
  setSphere() {
    const geometry = new THREE.TorusGeometry(10, 3, 16, 100)

    this.uniforms = {
      uColor: {
        value: new THREE.Color(0x7b8bff),
      },
      uLightPos: {
        value: new THREE.Vector3(0, 5, 3), // array of vec3
      },
      uLightColor: {
        value: new THREE.Color(0xffffff),
      },
      uLightIntensity: {
        value: 0.8,
      },
      uNoiseCoef: {
        value: 5,
      },
      uNoiseMin: {
        value: 0.5,
      },
      uNoiseMax: {
        value: 200.0,
      },
      uNoiseScale: {
        value: 0.8,
      },
    }

    const material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: glslify(fragmentShader),
      uniforms: this.uniforms,
    })

    const mesh = new THREE.Mesh(geometry, material)
    this.scene.add(mesh)
  }

  /**
   * List of events
   */
  events() {
    window.addEventListener('resize', this.handleResize, { passive: true })
    this.draw(0)
  }

  // EVENTS

  /**
   * Request animation frame function
   * This function is called 60/time per seconds with no performance issue
   * Everything that happens in the scene is drawed here
   * @param {Number} now
   */
  draw = now => {
    // now: time in ms
    // if (this.controls) this.controls.update() // for damping
    this.renderer.render(this.scene, this.camera)

    this.raf = window.requestAnimationFrame(this.draw)
  }

  /**
   * On resize, we need to adapt our camera based
   * on the new window width and height and the renderer
   */
  handleResize = () => {
    this.width = this.canvas.parentNode.offsetWidth
    this.height = this.canvas.parentNode.offsetHeight + 100

    // Update camera
    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()

    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(this.width, this.height)
  }
}
