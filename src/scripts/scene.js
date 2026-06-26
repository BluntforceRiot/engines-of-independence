import * as THREE from 'three';
import { BUILDINGS, GRID_SIZE } from './data.js';

const TILE_SIZE = 1;
const LAND_COLOR = 0x39452d;
const WATER_COLOR = 0x244f6a;

export class BoardScene {
  constructor(container, onTileClick, onTileHover) {
    this.container = container;
    this.onTileClick = onTileClick;
    this.onTileHover = onTileHover;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.tileMeshes = [];
    this.hoverMesh = null;
    this.pan = new THREE.Vector3(0, 0, 0);
    this.zoom = 1;
    this.dragging = false;
    this.lastPointer = { x: 0, y: 0 };

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x10151b);
    this.camera = new THREE.OrthographicCamera(-10, 10, 7, -7, 0.1, 100);
    this.camera.position.set(14, 16, 18);
    this.camera.lookAt(8, 0, 8);

    this.boardGroup = new THREE.Group();
    this.scene.add(this.boardGroup);

    this.setupLights();
    this.setupHandlers();
    this.resize();
    this.animate();
  }

  setupLights() {
    const sun = new THREE.DirectionalLight(0xfff0d2, 2.2);
    sun.position.set(-12, 20, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    this.scene.add(sun);
    this.scene.add(new THREE.AmbientLight(0x9fb3c7, 1.0));

    const rim = new THREE.DirectionalLight(0x6fb5ff, 0.75);
    rim.position.set(12, 10, -8);
    this.scene.add(rim);
  }

  setupHandlers() {
    window.addEventListener('resize', () => this.resize());
    this.renderer.domElement.addEventListener('contextmenu', (event) => event.preventDefault());
    this.renderer.domElement.addEventListener('pointerdown', (event) => {
      if (event.button === 0) {
        const tile = this.pickTile(event);
        if (tile) {
          this.onTileClick(tile.x, tile.y);
        }
      } else {
        this.dragging = true;
        this.lastPointer = { x: event.clientX, y: event.clientY };
      }
    });
    window.addEventListener('pointerup', () => {
      this.dragging = false;
    });
    window.addEventListener('pointermove', (event) => {
      if (this.dragging) {
        const dx = event.clientX - this.lastPointer.x;
        const dy = event.clientY - this.lastPointer.y;
        this.lastPointer = { x: event.clientX, y: event.clientY };
        this.pan.x -= dx * 0.012 * this.zoom;
        this.pan.z -= dy * 0.012 * this.zoom;
        this.updateCamera();
        return;
      }
      const tile = this.pickTile(event);
      this.setHover(tile);
      if (tile) {
        this.onTileHover(tile.x, tile.y);
      }
    });
    this.renderer.domElement.addEventListener('wheel', (event) => {
      event.preventDefault();
      this.zoom = Math.min(1.8, Math.max(0.62, this.zoom + Math.sign(event.deltaY) * 0.08));
      this.updateCamera();
    }, { passive: false });
  }

  resize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.renderer.setSize(width, height);
    const aspect = width / Math.max(1, height);
    const frustum = 12 * this.zoom;
    this.camera.left = -frustum * aspect;
    this.camera.right = frustum * aspect;
    this.camera.top = frustum;
    this.camera.bottom = -frustum;
    this.camera.updateProjectionMatrix();
    this.updateCamera();
  }

  updateCamera() {
    this.camera.position.set(14 + this.pan.x, 16, 18 + this.pan.z);
    this.camera.lookAt(8 + this.pan.x, 0, 8 + this.pan.z);
    this.resizeProjectionOnly();
  }

  resetView() {
    this.pan.set(0, 0, 0);
    this.zoom = 1;
    this.updateCamera();
  }

  resizeProjectionOnly() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    const aspect = width / Math.max(1, height);
    const frustum = 12 * this.zoom;
    this.camera.left = -frustum * aspect;
    this.camera.right = frustum * aspect;
    this.camera.top = frustum;
    this.camera.bottom = -frustum;
    this.camera.updateProjectionMatrix();
  }

  renderState(state) {
    this.clearBoard();
    this.tileMeshes = [];

    const base = new THREE.Mesh(
      new THREE.BoxGeometry(GRID_SIZE + 0.8, 0.08, GRID_SIZE + 0.8),
      new THREE.MeshStandardMaterial({ color: 0x22281f, roughness: 0.92 })
    );
    base.position.set(GRID_SIZE / 2 - 0.5, -0.12, GRID_SIZE / 2 - 0.5);
    base.receiveShadow = true;
    this.boardGroup.add(base);

    for (let y = 0; y < GRID_SIZE; y += 1) {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        const cell = state.grid[y][x];
        const tile = this.createTile(cell, x, y);
        this.boardGroup.add(tile);
        this.tileMeshes.push(tile);

        if (cell.buildingId) {
          const building = this.createBuilding(cell.buildingId, x, y);
          this.boardGroup.add(building);
        }
      }
    }

    this.addRailAndRoadAccents(state);
  }

  clearBoard() {
    while (this.boardGroup.children.length) {
      const child = this.boardGroup.children.pop();
      child.traverse?.((object) => {
        object.geometry?.dispose?.();
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose?.());
        } else {
          object.material?.dispose?.();
        }
      });
    }
  }

  createTile(cell, x, y) {
    const material = new THREE.MeshStandardMaterial({
      color: cell.terrain === 'water' ? WATER_COLOR : LAND_COLOR,
      roughness: 0.85,
      metalness: 0.02
    });
    const tile = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.08, 0.96), material);
    tile.position.set(x, 0, y);
    tile.receiveShadow = true;
    tile.userData = { x, y, isTile: true };
    return tile;
  }

  createBuilding(buildingId, x, y) {
    const building = BUILDINGS[buildingId];
    const group = new THREE.Group();
    group.position.set(x, 0.08, y);

    if (buildingId === 'road') {
      const road = new THREE.Mesh(
        new THREE.BoxGeometry(0.92, 0.04, 0.92),
        new THREE.MeshStandardMaterial({ color: 0x4f4a42, roughness: 0.9 })
      );
      road.position.y = 0.03;
      group.add(road);
      return group;
    }

    if (buildingId === 'rail') {
      const bed = new THREE.Mesh(
        new THREE.BoxGeometry(0.92, 0.05, 0.42),
        new THREE.MeshStandardMaterial({ color: 0x34312b, roughness: 0.8 })
      );
      bed.position.y = 0.04;
      group.add(bed);
      for (const offset of [-0.14, 0.14]) {
        const rail = new THREE.Mesh(
          new THREE.BoxGeometry(0.92, 0.04, 0.035),
          new THREE.MeshStandardMaterial({ color: 0xb3aaa0, metalness: 0.45, roughness: 0.4 })
        );
        rail.position.set(0, 0.08, offset);
        group.add(rail);
      }
      return group;
    }

    if (buildingId === 'farm' || buildingId === 'park') {
      const field = new THREE.Mesh(
        new THREE.BoxGeometry(0.86, building.height, 0.86),
        new THREE.MeshStandardMaterial({ color: building.color, roughness: 0.95 })
      );
      field.position.y = building.height / 2;
      field.castShadow = true;
      group.add(field);
      if (buildingId === 'farm') {
        for (let i = -2; i <= 2; i += 1) {
          const row = new THREE.Mesh(
            new THREE.BoxGeometry(0.05, 0.05, 0.78),
            new THREE.MeshStandardMaterial({ color: 0xc8b16b, roughness: 1 })
          );
          row.position.set(i * 0.15, building.height + 0.02, 0);
          group.add(row);
        }
      }
      return group;
    }

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, building.height, 0.62),
      new THREE.MeshStandardMaterial({ color: building.color, roughness: 0.72, metalness: 0.04 })
    );
    body.position.y = building.height / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    this.addWindows(group, building.height, buildingId);

    if (['coalPlant', 'factory', 'dcPlant', 'acPlant', 'machineShop'].includes(buildingId)) {
      const stackColor = buildingId === 'acPlant' ? 0x74d5ff : buildingId === 'dcPlant' ? 0xf0c35a : 0x2d2a27;
      const stack = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.12, building.height * 1.15, 10),
        new THREE.MeshStandardMaterial({ color: stackColor, roughness: 0.55, metalness: 0.08 })
      );
      stack.position.set(0.29, building.height * 0.68, -0.22);
      stack.castShadow = true;
      group.add(stack);

      if (buildingId === 'coalPlant' || buildingId === 'factory') {
        for (let i = 0; i < 3; i += 1) {
          const smoke = new THREE.Mesh(
            new THREE.SphereGeometry(0.08 + i * 0.025, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0x6f6c65, transparent: true, opacity: 0.42, roughness: 1 })
          );
          smoke.position.set(0.32 + i * 0.05, building.height + 0.32 + i * 0.16, -0.22 - i * 0.03);
          group.add(smoke);
        }
      }
    }

    if (['townHall', 'school', 'library', 'clinic', 'bank', 'courthouse', 'insuranceOffice', 'settlementHouse'].includes(buildingId)) {
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(0.46, 0.28, 4),
        new THREE.MeshStandardMaterial({ color: 0x5d3f2d, roughness: 0.75 })
      );
      roof.rotation.y = Math.PI / 4;
      roof.position.y = building.height + 0.13;
      roof.castShadow = true;
      group.add(roof);
    }

    if (buildingId === 'courthouse' || buildingId === 'bank' || buildingId === 'insuranceOffice') {
      for (const offset of [-0.22, 0, 0.22]) {
        const column = new THREE.Mesh(
          new THREE.CylinderGeometry(0.035, 0.035, building.height * 0.68, 8),
          new THREE.MeshStandardMaterial({ color: 0xf1e7ce, roughness: 0.55 })
        );
        column.position.set(offset, building.height * 0.35, -0.34);
        group.add(column);
      }
    }

    if (buildingId === 'hydroPlant' || buildingId === 'waterPump') {
      const wheel = new THREE.Mesh(
        new THREE.TorusGeometry(0.23, 0.035, 8, 16),
        new THREE.MeshStandardMaterial({ color: 0x99d7ef, metalness: 0.2, roughness: 0.35 })
      );
      wheel.position.set(0.34, 0.36, 0);
      wheel.rotation.y = Math.PI / 2;
      group.add(wheel);
    }

    if (buildingId === 'gasolineDepot' || buildingId === 'dieselDepot') {
      const tank = new THREE.Mesh(
        new THREE.CylinderGeometry(0.19, 0.19, 0.44, 16),
        new THREE.MeshStandardMaterial({ color: buildingId === 'gasolineDepot' ? 0xde6a38 : 0x496f45, metalness: 0.18, roughness: 0.45 })
      );
      tank.rotation.z = Math.PI / 2;
      tank.position.set(0.04, 0.28, 0.34);
      group.add(tank);
    }

    if (buildingId === 'grainElevator') {
      for (const offset of [-0.16, 0.16]) {
        const silo = new THREE.Mesh(
          new THREE.CylinderGeometry(0.13, 0.13, building.height * 1.05, 12),
          new THREE.MeshStandardMaterial({ color: 0xd8c28a, roughness: 0.7 })
        );
        silo.position.set(offset, building.height * 0.52, 0.18);
        silo.castShadow = true;
        group.add(silo);
      }
    }

    if (buildingId === 'sewerWorks') {
      const tank = new THREE.Mesh(
        new THREE.CylinderGeometry(0.26, 0.26, 0.28, 18),
        new THREE.MeshStandardMaterial({ color: 0x6f8588, metalness: 0.08, roughness: 0.48 })
      );
      tank.position.set(0.2, 0.22, 0.22);
      tank.rotation.x = Math.PI / 2;
      group.add(tank);
      const pipe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.74, 10),
        new THREE.MeshStandardMaterial({ color: 0x4c595b, roughness: 0.5 })
      );
      pipe.position.set(-0.1, 0.16, -0.22);
      pipe.rotation.z = Math.PI / 2;
      group.add(pipe);
    }

    if (buildingId === 'batteryHouse') {
      for (let i = 0; i < 3; i += 1) {
        const cell = new THREE.Mesh(
          new THREE.BoxGeometry(0.16, 0.3, 0.18),
          new THREE.MeshStandardMaterial({ color: 0x91cce0, emissive: 0x12384a, emissiveIntensity: 0.28, roughness: 0.35 })
        );
        cell.position.set(-0.18 + i * 0.18, 0.28, 0.2);
        group.add(cell);
      }
    }

    if (buildingId === 'saloon' || buildingId === 'speakeasy' || buildingId === 'newspaper') {
      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.12, 0.04),
        new THREE.MeshStandardMaterial({ color: buildingId === 'speakeasy' ? 0xd5a7ff : 0xf1d18a, roughness: 0.5 })
      );
      sign.position.set(0, building.height * 0.65, -0.33);
      group.add(sign);
    }

    if (buildingId === 'substation' || buildingId === 'powerLine' || buildingId === 'streetcar' || buildingId === 'telegraphOffice' || buildingId === 'radioStation') {
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.045, 0.7, 8),
        new THREE.MeshStandardMaterial({ color: 0xd9e5e8, roughness: 0.45 })
      );
      pole.position.set(-0.28, 0.38, -0.28);
      group.add(pole);
      const line = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.035, 0.035),
        new THREE.MeshStandardMaterial({ color: 0x93cff2, emissive: 0x123a52, emissiveIntensity: 0.35 })
      );
      line.position.set(-0.08, 0.68, -0.28);
      group.add(line);

      if (buildingId === 'radioStation') {
        const mast = new THREE.Mesh(
          new THREE.CylinderGeometry(0.025, 0.035, 1.15, 8),
          new THREE.MeshStandardMaterial({ color: 0xcbd9df, metalness: 0.22, roughness: 0.35 })
        );
        mast.position.set(0.28, 0.78, 0.26);
        group.add(mast);
        const beacon = new THREE.Mesh(
          new THREE.SphereGeometry(0.055, 10, 10),
          new THREE.MeshStandardMaterial({ color: 0xffd56b, emissive: 0x8c5a12, emissiveIntensity: 0.6 })
        );
        beacon.position.set(0.28, 1.38, 0.26);
        group.add(beacon);
      }
    }

    return group;
  }

  addWindows(group, height, buildingId) {
    if (height < 0.55 || ['coalPlant', 'substation', 'powerLine', 'batteryHouse', 'sewerWorks'].includes(buildingId)) {
      return;
    }
    const color = buildingId === 'speakeasy' ? 0xc79dff : buildingId === 'acPlant' ? 0x9be2ff : 0xf2d28a;
    for (const offset of [-0.16, 0.16]) {
      const window = new THREE.Mesh(
        new THREE.BoxGeometry(0.09, 0.12, 0.025),
        new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.12, roughness: 0.5 })
      );
      window.position.set(offset, Math.min(height * 0.68, height - 0.18), -0.323);
      group.add(window);
    }
  }

  addRailAndRoadAccents(state) {
    for (let y = 0; y < GRID_SIZE; y += 1) {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        const cell = state.grid[y][x];
        if (cell.buildingId === 'road') {
          this.addPathConnections(state, x, y, 'road');
        } else if (cell.buildingId === 'rail') {
          this.addPathConnections(state, x, y, 'rail');
        }
      }
    }
  }

  addPathConnections(state, x, y, type) {
    const isRoad = type === 'road';
    const color = isRoad ? 0xbfae86 : 0xb3aaa0;
    const material = new THREE.MeshStandardMaterial({ color, metalness: isRoad ? 0 : 0.35, roughness: isRoad ? 0.9 : 0.45 });
    const center = new THREE.Mesh(new THREE.BoxGeometry(isRoad ? 0.12 : 0.18, 0.035, isRoad ? 0.12 : 0.05), material);
    center.position.set(x, 0.16, y);
    this.boardGroup.add(center);

    const directions = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1]
    ];
    for (const [dx, dy] of directions) {
      const neighbor = state.grid[y + dy]?.[x + dx]?.buildingId;
      const connects = isRoad ? ['road', 'mainStreet', 'railStation'].includes(neighbor) : neighbor === 'rail' || neighbor === 'railStation';
      if (!connects) {
        continue;
      }
      const horizontal = dx !== 0;
      const segment = new THREE.Mesh(
        new THREE.BoxGeometry(horizontal ? 0.48 : isRoad ? 0.1 : 0.16, 0.03, horizontal ? isRoad ? 0.1 : 0.05 : 0.48),
        material
      );
      segment.position.set(x + dx * 0.24, 0.17, y + dy * 0.24);
      this.boardGroup.add(segment);
    }
  }

  pickTile(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.tileMeshes, false);
    return hits[0]?.object.userData ?? null;
  }

  setHover(tile) {
    if (!this.hoverMesh) {
      this.hoverMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1.02, 0.035, 1.02),
        new THREE.MeshBasicMaterial({ color: 0xffd96b, transparent: true, opacity: 0.32 })
      );
      this.scene.add(this.hoverMesh);
    }
    if (!tile) {
      this.hoverMesh.visible = false;
      return;
    }
    this.hoverMesh.visible = true;
    this.hoverMesh.position.set(tile.x, 0.22, tile.y);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
  }
}
