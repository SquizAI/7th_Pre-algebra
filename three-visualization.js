// Three.js 3D Balance Visualization
// Interactive visual representation of equation solving

class ThreeVisualization {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Container not found:', containerId);
            return;
        }

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.balance = null;
        this.leftObjects = [];
        this.rightObjects = [];
        this.animationEnabled = true;
        this.currentEquation = null;

        this.init();
    }

    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f4f8);
        this.scene.fog = new THREE.Fog(0xf0f4f8, 10, 50);

        // Create camera
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 0, 0);

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // Add lights
        this.addLights();

        // Create balance
        this.createBalance();

        // Add ground
        this.addGround();

        // Start animation
        this.animate();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Setup controls
        this.setupControls();
    }

    addLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -10;
        directionalLight.shadow.camera.right = 10;
        directionalLight.shadow.camera.top = 10;
        directionalLight.shadow.camera.bottom = -10;
        this.scene.add(directionalLight);

        // Point light for dramatic effect
        const pointLight = new THREE.PointLight(0x6b7ee8, 0.5);
        pointLight.position.set(0, 5, 0);
        this.scene.add(pointLight);
    }

    createBalance() {
        this.balance = new THREE.Group();

        // Central pole (stand)
        const poleGeometry = new THREE.CylinderGeometry(0.1, 0.2, 4, 16);
        const poleMaterial = new THREE.MeshStandardMaterial({
            color: 0x555555,
            metalness: 0.7,
            roughness: 0.3
        });
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.castShadow = true;
        pole.receiveShadow = true;
        this.balance.add(pole);

        // Beam (the horizontal balance bar)
        const beamGeometry = new THREE.BoxGeometry(8, 0.2, 0.3);
        const beamMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b7355,
            metalness: 0.3,
            roughness: 0.7
        });
        this.beam = new THREE.Mesh(beamGeometry, beamMaterial);
        this.beam.position.y = 2;
        this.beam.castShadow = true;
        this.beam.receiveShadow = true;
        this.balance.add(this.beam);

        // Left plate
        const plateGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.2, 32);
        const plateMaterial = new THREE.MeshStandardMaterial({
            color: 0x667eea,
            metalness: 0.5,
            roughness: 0.5,
            opacity: 0.9,
            transparent: true
        });

        this.leftPlate = new THREE.Mesh(plateGeometry, plateMaterial);
        this.leftPlate.position.set(-3, 2, 0);
        this.leftPlate.castShadow = true;
        this.leftPlate.receiveShadow = true;
        this.balance.add(this.leftPlate);

        // Right plate
        this.rightPlate = new THREE.Mesh(plateGeometry, plateMaterial.clone());
        this.rightPlate.position.set(3, 2, 0);
        this.rightPlate.castShadow = true;
        this.rightPlate.receiveShadow = true;
        this.balance.add(this.rightPlate);

        // Chains for plates
        this.createChains();

        this.scene.add(this.balance);
    }

    createChains() {
        const chainMaterial = new THREE.MeshStandardMaterial({
            color: 0x444444,
            metalness: 0.8,
            roughness: 0.2
        });

        // Left chains
        [-0.8, 0.8].forEach(xOffset => {
            const chainGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
            const chain = new THREE.Mesh(chainGeometry, chainMaterial);
            chain.position.set(-3 + xOffset, 2.5, 0);
            this.balance.add(chain);
        });

        // Right chains
        [-0.8, 0.8].forEach(xOffset => {
            const chainGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
            const chain = new THREE.Mesh(chainGeometry, chainMaterial);
            chain.position.set(3 + xOffset, 2.5, 0);
            this.balance.add(chain);
        });
    }

    addGround() {
        const groundGeometry = new THREE.PlaneGeometry(50, 50);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0xc3cfe2,
            roughness: 0.8,
            metalness: 0.2
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -2;
        ground.receiveShadow = true;
        this.scene.add(ground);
    }

    updateEquation(equation) {
        this.currentEquation = equation;

        // Clear existing objects
        this.clearObjects();

        // Parse equation and create objects
        this.visualizeEquation(equation);
    }

    clearObjects() {
        // Remove all objects from plates
        this.leftObjects.forEach(obj => {
            this.scene.remove(obj);
            obj.geometry?.dispose();
            obj.material?.dispose();
        });
        this.rightObjects.forEach(obj => {
            this.scene.remove(obj);
            obj.geometry?.dispose();
            obj.material?.dispose();
        });

        this.leftObjects = [];
        this.rightObjects = [];
    }

    visualizeEquation(equation) {
        // Parse the equation (simple parsing for visualization)
        const parts = equation.equation.split('=');
        if (parts.length !== 2) return;

        const leftSide = parts[0].trim();
        const rightSide = parts[1].trim();

        // Create visual representation
        this.createSideObjects(leftSide, 'left');
        this.createSideObjects(rightSide, 'right');

        // Animate balance tilt
        this.animateBalance();
    }

    createSideObjects(expression, side) {
        const objects = side === 'left' ? this.leftObjects : this.rightObjects;
        const plate = side === 'left' ? this.leftPlate : this.rightPlate;

        // Count x terms and constants (simplified)
        const xMatches = expression.match(/(\d+)x/g) || [];
        const xCount = xMatches.reduce((sum, match) => {
            return sum + parseInt(match);
        }, 0) || (expression.includes('x') ? 1 : 0);

        const constantMatches = expression.match(/[+-]?\s*\d+(?!x)/g) || [];
        const constantSum = constantMatches.reduce((sum, match) => {
            return sum + parseInt(match.replace(/\s/g, ''));
        }, 0);

        // Create cubes for x variables (blue/purple)
        for (let i = 0; i < Math.min(xCount, 5); i++) {
            const geometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
            const material = new THREE.MeshStandardMaterial({
                color: 0x764ba2,
                metalness: 0.3,
                roughness: 0.7
            });
            const cube = new THREE.Mesh(geometry, material);

            const angle = (i / Math.max(xCount, 1)) * Math.PI * 2;
            const radius = 0.8;
            cube.position.set(
                plate.position.x + Math.cos(angle) * radius,
                plate.position.y + 0.4 + (i * 0.05),
                plate.position.z + Math.sin(angle) * radius
            );

            cube.castShadow = true;
            cube.receiveShadow = true;

            // Add "x" label
            this.addLabel(cube, 'x');

            this.scene.add(cube);
            objects.push(cube);
        }

        // Create spheres for constants (gold)
        const sphereCount = Math.min(Math.abs(constantSum), 8);
        for (let i = 0; i < sphereCount; i++) {
            const geometry = new THREE.SphereGeometry(0.25, 16, 16);
            const material = new THREE.MeshStandardMaterial({
                color: 0xffd700,
                metalness: 0.6,
                roughness: 0.4
            });
            const sphere = new THREE.Mesh(geometry, material);

            const angle = (i / Math.max(sphereCount, 1)) * Math.PI * 2;
            const radius = 0.5;
            sphere.position.set(
                plate.position.x + Math.cos(angle) * radius,
                plate.position.y + 0.3,
                plate.position.z + Math.sin(angle) * radius
            );

            sphere.castShadow = true;
            sphere.receiveShadow = true;

            // Add number label
            const valuePerSphere = Math.ceil(Math.abs(constantSum) / sphereCount);
            this.addLabel(sphere, valuePerSphere.toString());

            this.scene.add(sphere);
            objects.push(sphere);
        }
    }

    addLabel(object, text) {
        // Store label data for potential future use
        object.userData.label = text;
    }

    animateBalance() {
        if (!this.animationEnabled) return;

        // Calculate tilt based on equation balance
        const leftCount = this.leftObjects.length;
        const rightCount = this.rightObjects.length;
        const tiltAngle = ((leftCount - rightCount) / Math.max(leftCount + rightCount, 1)) * 0.3;

        // Animate beam tilt
        this.animateBeamTilt(tiltAngle);
    }

    animateBeamTilt(targetAngle) {
        const startAngle = this.beam.rotation.z;
        const duration = 1000; // 1 second
        const startTime = Date.now();

        const animate = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);

            // Easing function
            const easeProgress = progress < 0.5 ?
                2 * progress * progress :
                -1 + (4 - 2 * progress) * progress;

            this.beam.rotation.z = startAngle + (targetAngle - startAngle) * easeProgress;

            // Update plate positions
            this.leftPlate.position.y = 2 - Math.sin(this.beam.rotation.z) * 3;
            this.rightPlate.position.y = 2 + Math.sin(this.beam.rotation.z) * 3;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    setupControls() {
        // Simple mouse drag to rotate camera
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };

        this.renderer.domElement.addEventListener('mousedown', (e) => {
            isDragging = true;
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        this.renderer.domElement.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;

            this.camera.position.x += deltaX * 0.01;
            this.camera.position.y -= deltaY * 0.01;
            this.camera.lookAt(0, 0, 0);

            previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        this.renderer.domElement.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Buttons
        document.getElementById('resetVizBtn')?.addEventListener('click', () => {
            this.resetCamera();
        });

        document.getElementById('toggleVizBtn')?.addEventListener('click', () => {
            this.animationEnabled = !this.animationEnabled;
        });
    }

    resetCamera() {
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 0, 0);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Gentle rotation of objects
        if (this.animationEnabled) {
            this.leftObjects.forEach((obj, i) => {
                obj.rotation.y += 0.01;
                obj.position.y += Math.sin(Date.now() * 0.001 + i) * 0.001;
            });

            this.rightObjects.forEach((obj, i) => {
                obj.rotation.y += 0.01;
                obj.position.y += Math.sin(Date.now() * 0.001 + i) * 0.001;
            });
        }

        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
    }
}

// Initialize when explicitly requested (not on page load)
// This prevents errors when container doesn't exist yet
window.initThreeVisualization = function() {
    if (!window.threeVisualization) {
        const container = document.getElementById('threeContainer');
        if (container && container.offsetParent !== null) {
            // Container exists and is visible
            window.threeVisualization = new ThreeVisualization('threeContainer');
            console.log('3D visualization initialized');
        } else {
            console.warn('3D container not ready yet');
        }
    }
};

// Auto-initialize when game screen becomes active
window.addEventListener('DOMContentLoaded', () => {
    // Observer to watch for game screen becoming visible
    const gameScreen = document.getElementById('gameScreen');
    if (gameScreen) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target.classList.contains('active')) {
                    // Game screen is now visible, initialize viz
                    setTimeout(() => window.initThreeVisualization(), 100);
                }
            });
        });

        observer.observe(gameScreen, {
            attributes: true,
            attributeFilter: ['class']
        });
    }
});
