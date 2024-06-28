import { OrbitControls } from './OrbitControls.js';
//import * as THREE from 'three';


class ThreeDScene {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
            'src/pitch/right.jpg',
            'src/pitch/left.jpg',
            'src/pitch/top.jpg',
            'src/pitch/bottom.jpg',
            'src/pitch/front.jpg',
            'src/pitch/back.jpg',
        ]);
        this.scene.background = texture;

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.isOrbitEnabled = false;
        this.animationXEnabled = false;
        this.animationYEnabled = false;
        this.speedFactor = 1;

        this.goalObject = new THREE.Object3D();
        this.initGoal();
        this.initBall();
        this.initCameraPosition();
        this.initLighting();
		this.initCurves();
        this.initMultipleCards();

        this.currentCurveIndex = 0; 

        this.controls.update();

        document.addEventListener('keydown', this.handleKeyPress.bind(this));

        this.animate();
    }

    degreesToRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    initCameraPosition() {
        const cameraMatrix = new THREE.Matrix4();
        cameraMatrix.makeTranslation(0, 30, 150);
        this.camera.applyMatrix4(cameraMatrix);
    }

	updateCamera() {
		const t = ((Date.now() / 8000) % 1);
		const curve = this.curves[this.currentCurveIndex];  // Use the current curve
		const point = curve.getPoint(t);

        if (true) {
        // Calculate the new camera position with an offset, only modifying the Z-coordinate
        const cameraMatrix = new THREE.Matrix4();
        const fixedY = 30;  // Maintain a constant Y offset
        const fixedX = 0;   // Maintain a constant X position
        const zOffset = 150;  // Distance behind the ball on the Z-axis
        cameraMatrix.makeTranslation(fixedX, fixedY, point.z + zOffset);
        this.camera.matrix = cameraMatrix;
        }

        if (this.isOrbitEnabled) {
            this.camera.matrixAutoUpdate = true;
        }
        else
        {
            this.camera.matrixAutoUpdate = false;
        }

		this.camera.lookAt(new THREE.Vector3(point.x, point.y, point.z));
	}
	
	

    initGoal() {
        const scaleMatrix = new THREE.Matrix4();
        scaleMatrix.makeScale(0.95, 0.95, 0.95);
        this.shrinkMatrix = scaleMatrix;

        const createPost = (translationX) => {
            const postMatrix = new THREE.Matrix4();
            postMatrix.makeTranslation(translationX, 0, 0);
            const postGeometry = new THREE.CylinderGeometry(1, 1, 40, 15);
            const postMaterial = new THREE.MeshBasicMaterial({ color: 'white' });
            const post = new THREE.Mesh(postGeometry, postMaterial);
            post.applyMatrix4(postMatrix);
            return post;
        };

        const createBackSupport = (translationX) => {
            const supportMatrix = new THREE.Matrix4();
            const rotationMatrix = new THREE.Matrix4();
            rotationMatrix.makeRotationX(this.degreesToRadians(30));
            supportMatrix.makeTranslation(translationX, 0, -11.5);
            supportMatrix.multiply(rotationMatrix);
            const supportGeometry = new THREE.CylinderGeometry(1, 1, 46.2, 15);
            const supportMaterial = new THREE.MeshBasicMaterial({ color: 'white' });
            const support = new THREE.Mesh(supportGeometry, supportMaterial);
            support.applyMatrix4(supportMatrix);
            return support;
        };

        const createCrossbar = () => {
            const crossbarMatrix = new THREE.Matrix4();
            const rotationMatrix = new THREE.Matrix4();
            rotationMatrix.makeRotationZ(this.degreesToRadians(90));
            crossbarMatrix.makeTranslation(0, 19.5, 0);
            crossbarMatrix.multiply(rotationMatrix);
            const crossbarGeometry = new THREE.CylinderGeometry(1, 1, 120, 15);
            const crossbarMaterial = new THREE.MeshBasicMaterial({ color: 'white' });
            const crossbar = new THREE.Mesh(crossbarGeometry, crossbarMaterial);
            crossbar.applyMatrix4(crossbarMatrix);
            return crossbar;
        };

        const createBackNet = () => {
            const backNetMatrix = new THREE.Matrix4();
            const rotationMatrix = new THREE.Matrix4();
            rotationMatrix.makeRotationX(this.degreesToRadians(30));
            backNetMatrix.makeTranslation(0, 0, -11.5);
            backNetMatrix.multiply(rotationMatrix);
            const backNetGeometry = new THREE.PlaneGeometry(120, 46.2);
			const backNetMaterial = new THREE.MeshPhongMaterial({ color: 'lightgrey', side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
            const backNet = new THREE.Mesh(backNetGeometry, backNetMaterial);
            backNet.applyMatrix4(backNetMatrix);
            return backNet;
        };

        const createTriangleNet = (translationX) => {
            const triangleShape = new THREE.Shape();
            triangleShape.moveTo(0, 0);
            triangleShape.lineTo(0, 40);
            triangleShape.lineTo(23.1, 0);
            triangleShape.lineTo(0, 0);

            const rotationMatrix = new THREE.Matrix4();
            rotationMatrix.makeRotationY(this.degreesToRadians(90));

            const triangleMatrix = new THREE.Matrix4();
            triangleMatrix.makeTranslation(translationX, -20, 0);
            triangleMatrix.multiply(rotationMatrix);

            const triangleGeometry = new THREE.ShapeGeometry(triangleShape);
			const triangleMaterial = new THREE.MeshPhongMaterial({ color: 'lightgrey', side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
            const triangle = new THREE.Mesh(triangleGeometry, triangleMaterial);
            triangle.applyMatrix4(triangleMatrix);
            return triangle;
        };

        const createRing = (rotationX, translationY, target) => {
            const ringMatrix = new THREE.Matrix4();
            const rotationMatrix = new THREE.Matrix4();
            rotationMatrix.makeRotationX(this.degreesToRadians(rotationX));
            ringMatrix.makeTranslation(0, translationY, 0);
            ringMatrix.multiply(rotationMatrix);

            const ringGeometry = new THREE.TorusGeometry(1, 1, 15, 40);
            const ringMaterial = new THREE.MeshBasicMaterial({ color: 'white', side: THREE.DoubleSide });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.applyMatrix4(ringMatrix);
            target.add(ring);
        };

        const post1 = createPost(60);
        const post2 = createPost(-60);
        const crossbar = createCrossbar();
        const backSupport1 = createBackSupport(60);
        const backSupport2 = createBackSupport(-60);
        const backNet = createBackNet();
        const triangleNet1 = createTriangleNet(-60);
        const triangleNet2 = createTriangleNet(60);

        this.goalObject.add(post1);
        this.goalObject.add(post2);
        this.goalObject.add(crossbar);
        this.goalObject.add(backSupport1);
        this.goalObject.add(backSupport2);
        this.goalObject.add(backNet);
        this.goalObject.add(triangleNet1);
        this.goalObject.add(triangleNet2);

        createRing(90, -20, post1);
        createRing(90, -20, post2);
        createRing(60, -23.1, backSupport1);
        createRing(60, -23.1, backSupport2);

        this.scene.add(this.goalObject);
    }

    initBall1() {
        const ballMatrix = new THREE.Matrix4();
        ballMatrix.makeTranslation(0, 0, 100);
        const ballTexture = new THREE.TextureLoader().load('src/textures/soccer_ball.jpg');
        const ballGeometry = new THREE.SphereGeometry(3, 32, 32);
        const ballMaterial = new THREE.MeshPhongMaterial({ map: ballTexture });
        this.ball = new THREE.Mesh(ballGeometry, ballMaterial);
        this.ball.applyMatrix4(ballMatrix);
        this.scene.add(this.ball);
    }

	initBall() {
		const ballTexture = new THREE.TextureLoader().load('src/textures/soccer_ball.jpg');
		const ballGeometry = new THREE.SphereGeometry(3, 32, 32);  // Sphere centered at origin
		const ballMaterial = new THREE.MeshPhongMaterial({ map: ballTexture });
		this.ball = new THREE.Mesh(ballGeometry, ballMaterial);
		this.scene.add(this.ball);  // Initially add the ball to the scene without setting its position
	}
	

    initLighting() {
        const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
        const directionalLight1Matrix = new THREE.Matrix4();
        directionalLight1Matrix.makeTranslation(0, 100, 100);
        directionalLight1.applyMatrix4(directionalLight1Matrix);
        this.scene.add(directionalLight1);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
        const directionalLight2Matrix = new THREE.Matrix4();
        directionalLight2Matrix.makeTranslation(0, 100, 0);
        directionalLight2.applyMatrix4(directionalLight2Matrix);
        this.scene.add(directionalLight2);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
    }

    initBezierCurves() {
        this.curves = [
            new THREE.QuadraticBezierCurve3(
                new THREE.Vector3(0, 0, 100),
                new THREE.Vector3(-50, 0, 50),
                new THREE.Vector3(0, 0, 0)
            ),
            new THREE.QuadraticBezierCurve3(
                new THREE.Vector3(0, 0, 100),
                new THREE.Vector3(0, 50, 50),
                new THREE.Vector3(0, 0, 0)
            ),
            new THREE.QuadraticBezierCurve3(
                new THREE.Vector3(0, 0, 100),
                new THREE.Vector3(50, 0, 50),
                new THREE.Vector3(0, 0, 0)
            )
        ];
    }

	initCurves() {
		this.curves = [];
	
		// Right Winger Route 
		const curve1 = new THREE.QuadraticBezierCurve3(
			new THREE.Vector3(0, 0, 1000), // Start further back
			new THREE.Vector3(150, 0, 150), // Control point further out
			new THREE.Vector3(0, 0, 0) // End at the goal
		);
	
		// Center Forward Route 
		const curve2 = new THREE.QuadraticBezierCurve3(
			new THREE.Vector3(0, 0, 1000), // Start further back
			new THREE.Vector3(0, 150, 150), // Control point further out
			new THREE.Vector3(0, 0, 0) // End at the goal
		);
	
		// Left Winger Route 
		const curve3 = new THREE.QuadraticBezierCurve3(
			new THREE.Vector3(0, 0, 1000), // Start further back
			new THREE.Vector3(-150, 0, 150), // Control point further out
			new THREE.Vector3(0, 0, 0) // End at the goal
		);
	
		this.curves.push(curve1, curve2, curve3);
		this.currentCurveIndex = 0; // Start with the first curve
	}

	initMultipleCards() {
		this.numYellowCards = 0;
		this.numRedCards = 0;
		this.cards = [];
		const yellowCardTexture = new THREE.TextureLoader().load('src/textures/yellow_card.jpg');
		const redCardTexture = new THREE.TextureLoader().load('src/textures/red_card.jpg');
	
		for (let i = 0; i < this.curves.length; i++) {
			for (let j = 0; j < 4; j++) {
				const t = Math.random() * (0.98 - 0.2) + 0.2;
				const cardTexture = Math.random() > 0.5 ? yellowCardTexture : redCardTexture;
				const cardGeometry = new THREE.BoxGeometry(4, 6, 0.1);
				const cardMaterial = new THREE.MeshPhongMaterial({
					map: cardTexture,
					transparent: true,
					opacity: 0.8
				});
				const card = new THREE.Mesh(cardGeometry, cardMaterial);
				this.positionCardOnCurve(t, card, i);
				this.scene.add(card);
				this.cards.push({
					mesh: card,
					curveIndex: i,
					t: t,
					type: cardTexture === yellowCardTexture ? 'yellow' : 'red'
				});
			}
		}
	}
	
	
	positionCardOnCurve(t, card, curveIndex) {
		const curve = this.curves[curveIndex];  // Select the curve based on the index
		const point = curve.getPoint(t);
		const cardMatrix = new THREE.Matrix4();
		cardMatrix.makeTranslation(point.x, point.y, point.z);
		card.matrix = cardMatrix;
		card.matrixAutoUpdate = false;
	}
	

    toggleWireframe() {
        this.goalObject.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.material.wireframe = !child.material.wireframe;
            }
        });
        this.ball.material.wireframe = !this.ball.material.wireframe;
    }

	resetBallPosition() {
		this.currentCurveIndex = 0; 
		const startPoint = this.curves[this.currentCurveIndex].getPoint(0);
		const ballMatrix = new THREE.Matrix4();
		ballMatrix.makeTranslation(startPoint.x, startPoint.y, startPoint.z);
		this.ball.matrix = ballMatrix;
	}	

    handleKeyPress(event) {
        switch (event.key) {
            case 'o':
                this.isOrbitEnabled = !this.isOrbitEnabled;
                break;
            case 'w':
                this.toggleWireframe();
                break;
			case 'ArrowRight':
				this.currentCurveIndex = (this.currentCurveIndex + this.curves.length - 1) % this.curves.length;
				break;
			case 'ArrowLeft':
				this.currentCurveIndex = (this.currentCurveIndex + 1) % this.curves.length;
				break;
        }
    }

	animate() {
		requestAnimationFrame(this.animate.bind(this));
		this.controls.enabled = this.isOrbitEnabled;
		this.controls.update();
		//console.log(this.controls.enabled);
		this.animateBall();
		this.updateCamera();
		this.renderer.render(this.scene, this.camera);
	}

	checkCollisions(point) {
		// Check collision for cards on the current curve
		this.cards.forEach((cardObj, index) => {
			if (cardObj.curveIndex === this.currentCurveIndex) {
				const cardPosition = new THREE.Vector3().setFromMatrixPosition(cardObj.mesh.matrix);
				if (cardPosition.distanceTo(point) < 5) {
					this.scene.remove(cardObj.mesh);
					this.cards.splice(index, 1); // Remove card from the array
					this.cardsCollected++;
					this.updateScore(cardObj.type); // Assuming type property exists
				}
			}
		});
	}

	checkCompletion(t) {
		if (t >= 0.99) {  // Close to the end of the curve
			this.displayScorePrompt();
			this.resetBallPosition();  // Reset the ball to the start of the current curve
			this.clearAndReloadCards();
		}
	}

	animateBall() {
		const t = ((Date.now() / 8000) % 1); // Use a modulo to loop the t value
		const curve = this.curves[this.currentCurveIndex];
		const point = curve.getPoint(t);
	
		// Translation to follow the curve
		const ballMatrix = new THREE.Matrix4();
		ballMatrix.makeTranslation(point.x, point.y, point.z);
		
		// Rotation for spinning effect
		const rotationMatrix = new THREE.Matrix4();
		const rotationSpeed = 0.001; 
		rotationMatrix.makeRotationY((Date.now() * rotationSpeed) % (Math.PI * 2));
		ballMatrix.multiply(rotationMatrix);
	
		this.ball.matrix = ballMatrix;
		this.ball.matrixAutoUpdate = false;
	
		this.checkCollisions(point); // Handle collisions in a separate method
		this.checkCompletion(t);
	}

	clearAndReloadCards() {
		// Remove all cards from the scene
		this.cards.forEach(cardObj => {
			this.scene.remove(cardObj.mesh);
		});
		this.cards = [];  // Clear the cards array
	
		// Reset card counters
		this.numYellowCards = 0;
		this.numRedCards = 0;
	
		// Reload new cards
		this.initMultipleCards(); 
	}
	
	updateScore(cardType) {
		if (cardType === 'yellow') {
			this.numYellowCards++; 
		} else if (cardType === 'red') {
			this.numRedCards++;   
		}
	}
	
	calculateFairPlayScore() {
		// Fair Play Score Calculation
		return 100 * Math.pow(2, (-this.numYellowCards + 10 * this.numRedCards) / 10);
	}
	
	displayScorePrompt() {
		const fairPlayScore = this.calculateFairPlayScore();
		alert(`Curve completed. Fair Play score: ${fairPlayScore.toFixed(2)}. Yellow cards collected: ${this.numYellowCards}, Red cards collected: ${this.numRedCards}`);

		// Reset counts for the next run
		this.numYellowCards = 0;
		this.numRedCards = 0;
	}
}

new ThreeDScene();