import * as THREE from 'three';

export class Ship extends THREE.Group {
    constructor(color = 0x888888, size = 1) {
        super();
        this.color = color;
        this.size = size;

        this.turrets = [];

        this.init();
    }

    init() {
        // Hull
        const hullGeo = new THREE.BoxGeometry(20 * this.size, 8 * this.size, 100 * this.size);
        const hullMat = new THREE.MeshStandardMaterial({ color: this.color, roughness: 0.6 });
        const hull = new THREE.Mesh(hullGeo, hullMat);
        hull.position.y = 4 * this.size;
        this.add(hull);

        // Deck (slightly wider/longer thin layer on top)
        const deckGeo = new THREE.BoxGeometry(22 * this.size, 1 * this.size, 102 * this.size);
        const deckMat = new THREE.MeshStandardMaterial({ color: 0x664422, roughness: 0.8 }); // Wood-ish
        const deck = new THREE.Mesh(deckGeo, deckMat);
        deck.position.y = 8.5 * this.size;
        this.add(deck);

        // Superstructure
        const superGeo = new THREE.BoxGeometry(12 * this.size, 10 * this.size, 30 * this.size);
        const superMat = new THREE.MeshStandardMaterial({ color: this.color, roughness: 0.6 });
        const superstructure = new THREE.Mesh(superGeo, superMat);
        superstructure.position.y = 14 * this.size;
        this.add(superstructure);

        // Bridge/Mast
        const mastGeo = new THREE.CylinderGeometry(1 * this.size, 2 * this.size, 15 * this.size, 8);
        const mast = new THREE.Mesh(mastGeo, superMat);
        mast.position.y = 25 * this.size;
        mast.position.z = 5 * this.size;
        this.add(mast);

        // Funnel
        const funnelGeo = new THREE.CylinderGeometry(2 * this.size, 2 * this.size, 8 * this.size, 16);
        const funnelMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
        const funnel = new THREE.Mesh(funnelGeo, funnelMat);
        funnel.position.y = 22 * this.size;
        funnel.position.z = -5 * this.size;
        funnel.rotation.x = -0.2; // Tilted back
        this.add(funnel);

        // Turrets
        this.createTurret(0, 9 * this.size, 35 * this.size); // Front
        this.createTurret(0, 11 * this.size, 25 * this.size); // Front Superfiring
        this.createTurret(0, 9 * this.size, -35 * this.size, true); // Rear
    }

    createTurret(x, y, z, isRear = false) {
        const turretGroup = new THREE.Group();
        turretGroup.position.set(x, y, z);

        // Turret House
        const houseGeo = new THREE.BoxGeometry(6 * this.size, 3 * this.size, 8 * this.size);
        const houseMat = new THREE.MeshStandardMaterial({ color: this.color });
        const house = new THREE.Mesh(houseGeo, houseMat);
        turretGroup.add(house);

        // Barrels
        const barrelGeo = new THREE.CylinderGeometry(0.4 * this.size, 0.4 * this.size, 12 * this.size);
        const barrelMat = new THREE.MeshStandardMaterial({ color: 0x333333 });

        // Barrel 1
        const b1 = new THREE.Mesh(barrelGeo, barrelMat);
        b1.rotation.x = -Math.PI / 2;
        b1.position.z = 4 * this.size; // Stick out front
        b1.position.x = -1.5 * this.size;
        turretGroup.add(b1);

        // Barrel 2
        const b2 = new THREE.Mesh(barrelGeo, barrelMat);
        b2.rotation.x = -Math.PI / 2;
        b2.position.z = 4 * this.size;
        b2.position.x = 1.5 * this.size;
        turretGroup.add(b2);

        // Default rotation
        if (isRear) turretGroup.rotation.y = Math.PI;

        this.add(turretGroup);
        this.turrets.push(turretGroup);
    }

    update(dt) {
        // Here we could animate radars, or gently rock the ship
        this.rotation.z = Math.sin(Date.now() * 0.001) * 0.02; // Gentle roll
        this.rotation.x = Math.cos(Date.now() * 0.0008) * 0.01; // Gentle pitch
    }
}
