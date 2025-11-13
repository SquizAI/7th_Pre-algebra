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

    updateEquation(equation, wordProblem = null) {
        this.currentEquation = equation;
        this.currentWordProblem = wordProblem;

        // Clear existing objects
        this.clearObjects();

        // Parse equation and create objects
        this.visualizeEquation(equation);

        // Display word problem context if available
        if (wordProblem) {
            this.displayWordProblemContext(wordProblem);
        }
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

        // Clear overlays
        if (this.contextTextElement) {
            this.contextTextElement.remove();
            this.contextTextElement = null;
        }
        if (this.legendElement) {
            this.legendElement.remove();
            this.legendElement = null;
        }
    }

    visualizeEquation(equation) {
        // Parse the equation properly
        const parts = equation.equation.split('=');
        if (parts.length !== 2) return;

        const leftSide = parts[0].trim();
        const rightSide = parts[1].trim();

        console.log(`🎨 Visualizing: ${leftSide} = ${rightSide}`);

        // Parse and create visual representation
        this.createSideObjects(leftSide, 'left');
        this.createSideObjects(rightSide, 'right');

        // Animate balance tilt
        this.animateBalance();
    }

    parseExpression(expression) {
        // Parse algebraic expression into terms
        const terms = {
            xCoefficient: 0,
            constant: 0,
            isDivision: false,
            divisor: 1
        };

        // Check for division format: x/a or x / a
        const divMatch = expression.match(/x\s*\/\s*(\d+)/);
        if (divMatch) {
            terms.isDivision = true;
            terms.divisor = parseInt(divMatch[1]);
            terms.xCoefficient = 1; // x/a means 1x divided by a

            // Get any constants after the division
            const remaining = expression.replace(/x\s*\/\s*\d+/, '').trim();
            if (remaining) {
                const constMatch = remaining.match(/([+-]?\s*\d+)/);
                if (constMatch) {
                    terms.constant = parseInt(constMatch[1].replace(/\s/g, ''));
                }
            }

            console.log(`  Division detected: x/${terms.divisor} with constant ${terms.constant}`);
            return terms;
        }

        // Parse x coefficient (handles 3x, -5x, x, -x)
        const xMatch = expression.match(/([+-]?\s*\d*)\s*x/);
        if (xMatch) {
            let coef = xMatch[1].replace(/\s/g, '');
            if (coef === '' || coef === '+') {
                terms.xCoefficient = 1;
            } else if (coef === '-') {
                terms.xCoefficient = -1;
            } else {
                terms.xCoefficient = parseInt(coef);
            }
        }

        // Parse constant (any number not followed by x)
        // Match all numbers not followed by x, considering their signs
        const constantMatches = expression.match(/([+-]?\s*\d+)(?!\s*x)/g);
        if (constantMatches) {
            terms.constant = constantMatches.reduce((sum, match) => {
                return sum + parseInt(match.replace(/\s/g, ''));
            }, 0);
        }

        console.log(`  Parsed: ${terms.xCoefficient}x ${terms.constant >= 0 ? '+' : ''} ${terms.constant}`);
        return terms;
    }

    createSideObjects(expression, side) {
        const objects = side === 'left' ? this.leftObjects : this.rightObjects;
        const plate = side === 'left' ? this.leftPlate : this.rightPlate;

        // Parse the expression
        const terms = this.parseExpression(expression);

        let objectIndex = 0;

        // Create cubes for x terms
        if (terms.xCoefficient !== 0) {
            const absCoef = Math.abs(terms.xCoefficient);
            const isPositive = terms.xCoefficient > 0;
            const displayCount = terms.isDivision ? 1 : Math.min(absCoef, 6); // Show fewer for large coefficients

            for (let i = 0; i < displayCount; i++) {
                const geometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
                const material = new THREE.MeshStandardMaterial({
                    color: isPositive ? 0x667eea : 0xff6b6b, // Purple for positive, red for negative
                    metalness: 0.3,
                    roughness: 0.7,
                    opacity: terms.isDivision ? 0.6 : 1.0, // Semi-transparent for division
                    transparent: terms.isDivision
                });
                const cube = new THREE.Mesh(geometry, material);

                // Scale for division
                if (terms.isDivision) {
                    cube.scale.set(0.7, 0.7, 0.7);
                }

                const angle = (objectIndex / 10) * Math.PI * 2;
                const radius = 0.8;
                cube.position.set(
                    plate.position.x + Math.cos(angle) * radius,
                    plate.position.y + 0.4 + (objectIndex * 0.05),
                    plate.position.z + Math.sin(angle) * radius
                );

                cube.castShadow = true;
                cube.receiveShadow = true;

                // Label
                const label = terms.isDivision ? `x/${terms.divisor}` :
                             (absCoef > displayCount ? `${absCoef}x` : 'x');
                this.addLabel(cube, label);

                this.scene.add(cube);
                objects.push(cube);
                objectIndex++;
            }
        }

        // Create spheres for constants
        if (terms.constant !== 0) {
            const absConst = Math.abs(terms.constant);
            const isPositive = terms.constant > 0;
            const sphereCount = Math.min(absConst, 8); // Cap at 8 for visibility

            for (let i = 0; i < sphereCount; i++) {
                const geometry = new THREE.SphereGeometry(0.25, 16, 16);
                const material = new THREE.MeshStandardMaterial({
                    color: isPositive ? 0xffd700 : 0xff4444, // Gold for positive, red for negative
                    metalness: 0.6,
                    roughness: 0.4
                });
                const sphere = new THREE.Mesh(geometry, material);

                const angle = (objectIndex / 10) * Math.PI * 2;
                const radius = 0.6;
                sphere.position.set(
                    plate.position.x + Math.cos(angle) * radius,
                    plate.position.y + 0.3 + (objectIndex * 0.04),
                    plate.position.z + Math.sin(angle) * radius
                );

                sphere.castShadow = true;
                sphere.receiveShadow = true;

                // Label showing value per sphere
                const valuePerSphere = Math.ceil(absConst / sphereCount);
                this.addLabel(sphere, `${isPositive ? '+' : '-'}${valuePerSphere}`);

                this.scene.add(sphere);
                objects.push(sphere);
                objectIndex++;
            }
        }

        // If side is empty (like 0), show nothing
        if (terms.xCoefficient === 0 && terms.constant === 0) {
            console.log(`  ${side} side is empty`);
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

    displayWordProblemContext(wordProblem) {
        // Remove existing context display if present
        if (this.contextTextElement) {
            this.contextTextElement.remove();
        }

        // Create HTML overlay for word problem context
        const contextDiv = document.createElement('div');
        contextDiv.className = 'viz-word-problem-context';
        contextDiv.style.cssText = `
            position: absolute;
            top: 10px;
            left: 10px;
            right: 10px;
            background: rgba(102, 126, 234, 0.95);
            color: white;
            padding: 12px 16px;
            border-radius: 10px;
            font-size: 0.9rem;
            line-height: 1.5;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            z-index: 10;
            pointer-events: none;
        `;

        // Extract key information from word problem for display
        const shortContext = this.extractKeyContext(wordProblem);
        contextDiv.innerHTML = `<strong>📖 Context:</strong> ${shortContext}`;

        // Add to visualization container
        this.container.style.position = 'relative';
        this.container.appendChild(contextDiv);
        this.contextTextElement = contextDiv;

        // Add visual legend
        this.addVisualLegend();

        console.log('🎨 Word problem context displayed in visualization');
    }

    addVisualLegend() {
        // Remove existing legend if present
        if (this.legendElement) {
            this.legendElement.remove();
        }

        const legendDiv = document.createElement('div');
        legendDiv.className = 'viz-legend';
        legendDiv.style.cssText = `
            position: absolute;
            bottom: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 14px;
            border-radius: 8px;
            font-size: 0.75rem;
            line-height: 1.6;
            z-index: 10;
            pointer-events: none;
        `;

        legendDiv.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 4px;">Visual Guide:</div>
            <div>🟣 Purple cube = positive x term</div>
            <div>🔴 Red cube = negative x term</div>
            <div>🟡 Gold sphere = positive number</div>
            <div>🔴 Red sphere = negative number</div>
            <div style="font-size: 0.7rem; margin-top: 4px; opacity: 0.8;">Semi-transparent = division</div>
        `;

        this.container.appendChild(legendDiv);
        this.legendElement = legendDiv;
    }

    extractKeyContext(wordProblem) {
        // Extract the most relevant part of the word problem
        // Keep it short for visualization overlay
        const sentences = wordProblem.split(/[.!?]+/);
        const firstSentence = sentences[0].trim();

        // If first sentence is too long, truncate
        if (firstSentence.length > 80) {
            return firstSentence.substring(0, 77) + '...';
        }

        return firstSentence;
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
