Q3D.gui = {

  type: "dat-gui",

  parameters: {
    lyr: {},
    cp: {
      c: "#ffffff",
      d: 0,
      o: 1,
      l: false
    },
    cmd: {         // commands for touch screen devices
      rot: false,  // auto rotation
      wf: false    // wireframe mode
    },
    i: Q3D.application.showInfo
  },

  // initialize gui
  // - setupDefaultItems: default is true
  init: function (setupDefaultItems) {
    this.gui = new dat.GUI();
    this.gui.domElement.parentElement.style.zIndex = 1000;   // display the panel on the front of labels
    if (setupDefaultItems === undefined || setupDefaultItems == true) {
      this.customPlaneFolder = this.gui.addFolder('Parameters');
      this.addLayersFolder();
    }
  },

  addLayersFolder: function () {
    var mapLayers = Q3D.application.scene.mapLayers;
    var parameters = this.parameters;
    var visibleChanged = function (value) { mapLayers[this.object.i].visible = value; };
    var opacityChanged = function (value) { mapLayers[this.object.i].opacity = value; };
    var layer, layersFolder = this.customPlaneFolder;
    for (var layerId in mapLayers) {
      if (mapLayers[layerId].properties.name=="pop"){
          layer = mapLayers[layerId];
          parameters.lyr[layerId] = {i: layerId, v: layer.visible, o: layer.opacity};
          //var folder = layersFolder.addFolder(layer.properties.name);
          layersFolder.add(parameters.lyr[layerId], 'v').name('Population').onChange(visibleChanged);
          //folder.add(parameters.lyr[layerId], 'o').min(0).max(1).name('Opacity').onChange(opacityChanged);
        }
      }
  },

  initCustomPlaneFolder: function (zMin, zMax) {
    var app = Q3D.application,
        scene = app.scene,
        p = scene.userData;

    var customPlane;
    var parameters = this.parameters;

      //--------------------------------WATER----------------------------------//
        // Water
        var light = new THREE.DirectionalLight(0xffffff, 0.5);
        light.position.set(-600, 100, -1200);
        scene.add( light );

        // Add fog
        scene.fog = new THREE.FogExp2( 0x8a867e, 0.0011 );

        var waterGeometry = new THREE.PlaneBufferGeometry( 5000, 5000 );

        var water = new THREE.Water(
          waterGeometry,
          {
            textureWidth: 1024,
            textureHeight:1024,
            waterNormals: new THREE.TextureLoader().load( './threejs/waternormals.jpg', function ( texture ) {

              texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

            } ),
            alpha: 1.0,
            sunDirection: light.position.clone().normalize(),
            sunColor: 0x888888,
            waterColor: 0x001e0f,
            fog: true,
            distortionScale:4
          }
        );

        //water.rotation.x = - Math.PI / 2;
        water.position.z =-0.5;

        scene.add( water );

        animate();

        function animate() {
          requestAnimationFrame(animate);
          water.material.uniforms[ 'time' ].value += 1.0 / 250.0;
          app.renderer.render(app.scene, app.camera);
        }

        app.controls.maxPolarAngle = Math.PI/2.5;
        app.controls.minDistance = 100;
        app.controls.maxDistance = 300;

    parameters.cp.d = 0;

    // Plane altitude
    this.customPlaneFolder.add(parameters.cp, 'd').min(0).max(600).name('Water level').onChange(function (value) {
      if (water === undefined) addPlane(parameters.cp.c);
      water.position.z = (value*3 + p.zShift) * p.zScale;
      water.updateMatrixWorld();
      app.render();
    });
  },

  // add commands folder for touch screen devices
  addCommandsFolder: function () {
    var folder = this.gui.addFolder('Commands');
    folder.add(this.parameters.cmd, 'rot').name('Rotate Animation').onChange(Q3D.application.setRotateAnimationMode);
    folder.add(this.parameters.cmd, 'wf').name('Wireframe Mode').onChange(Q3D.application.setWireframeMode);
  },

  addHelpButton: function () {
    this.gui.add(this.parameters, 'i').name('Help');
  }
};
