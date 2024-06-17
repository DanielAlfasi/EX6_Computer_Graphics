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
        this.isOrbitEnabled = true;
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
        this.collectedCards = 0;

        this.controls.update();

        document.addEventListener('keydown', this.toggleOrbit.bind(this));
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
		const t = ((Date.now() / 4000) % 1); // Slower increment rate
		const curve = this.curves[this.currentCurveIndex];  // Use the current curve
		const point = curve.getPoint(t);
	
		// Calculate the new camera position with an offset, only modifying the Z-coordinate
		const cameraMatrix = new THREE.Matrix4();
		const fixedY = 30;  // Maintain a constant Y offset
		const fixedX = 0;   // Maintain a constant X position
		const zOffset = 150;  // Distance behind the ball on the Z-axis
	
		cameraMatrix.makeTranslation(fixedX, fixedY, point.z + zOffset);
		this.camera.matrix = cameraMatrix;
		this.camera.matrixAutoUpdate = false;
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

    initBall() {
        const ballMatrix = new THREE.Matrix4();
        ballMatrix.makeTranslation(0, 0, 100);
        const ballTexture = new THREE.TextureLoader().load('src/textures/soccer_ball.jpg');
        const ballGeometry = new THREE.SphereGeometry(3, 32, 32);
        const ballMaterial = new THREE.MeshPhongMaterial({ map: ballTexture });
        this.ball = new THREE.Mesh(ballGeometry, ballMaterial);
        this.ball.applyMatrix4(ballMatrix);
        this.scene.add(this.ball);
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

	initCurves1() {
		this.curves = [];
	
		// Right Winger Route
		const curve1 = new THREE.QuadraticBezierCurve3(
			new THREE.Vector3(0, 0, 100),
			new THREE.Vector3(50, 0, 50),
			new THREE.Vector3(0, 0, 0)
		);
	
		// Center Forward Route
		const curve2 = new THREE.QuadraticBezierCurve3(
			new THREE.Vector3(0, 0, 100),
			new THREE.Vector3(0, 50, 50),
			new THREE.Vector3(0, 0, 0)
		);
	
		// Left Winger Route
		const curve3 = new THREE.QuadraticBezierCurve3(
			new THREE.Vector3(0, 0, 100),
			new THREE.Vector3(-50, 0, 50),
			new THREE.Vector3(0, 0, 0)
		);
	
		this.curves.push(curve1, curve2, curve3);
		this.currentCurveIndex = 0;  // Start with the first curve
	}

	initCurves() {
		this.curves = [];
	
		// Right Winger Route (Adjusted for longer path)
		const curve1 = new THREE.QuadraticBezierCurve3(
			new THREE.Vector3(0, 0, 300), // Start further back
			new THREE.Vector3(150, 0, 150), // Control point further out
			new THREE.Vector3(0, 0, 0) // End at the goal
		);
	
		// Center Forward Route (Adjusted for longer path)
		const curve2 = new THREE.QuadraticBezierCurve3(
			new THREE.Vector3(0, 0, 300), // Start further back
			new THREE.Vector3(0, 150, 150), // Control point further out
			new THREE.Vector3(0, 0, 0) // End at the goal
		);
	
		// Left Winger Route (Adjusted for longer path)
		const curve3 = new THREE.QuadraticBezierCurve3(
			new THREE.Vector3(0, 0, 300), // Start further back
			new THREE.Vector3(-150, 0, 150), // Control point further out
			new THREE.Vector3(0, 0, 0) // End at the goal
		);
	
		this.curves.push(curve1, curve2, curve3);
		this.currentCurveIndex = 0; // Start with the first curve
	}
	
	
	

    initCards() {
        this.cards = [];

        for (let i = 0; i < 6; i++) {
            const cardTexture = new THREE.TextureLoader().load('src/textures/yellow_card.jpg');
            const cardGeometry = new THREE.BoxGeometry(4, 6, 0.1);
            const cardMaterial = new THREE.MeshPhongMaterial({ map: cardTexture, transparent: true, opacity: 0.8 });
            const card = new THREE.Mesh(cardGeometry, cardMaterial);

            const t = i * 0.1 + 0.2; // Distribute cards along the curve
            const point = this.curves[0].getPoint(t);
            const cardMatrix = new THREE.Matrix4();
            cardMatrix.makeTranslation(point.x, point.y, point.z);
            card.applyMatrix4(cardMatrix);

            this.cards.push({ curve: this.curves[0], t: t, object: card });
            this.scene.add(card);
        }
    }

	initCard() {
		const cardTexture = new THREE.TextureLoader().load('src/textures/yellow_card.jpg');
		const cardGeometry = new THREE.BoxGeometry(4, 6, 0.1);
		const cardMaterial = new THREE.MeshPhongMaterial({ map: cardTexture, transparent: true, opacity: 0.8 });
		this.card = new THREE.Mesh(cardGeometry, cardMaterial);
	
		this.positionCardOnCurve(0.5); // Position the card halfway along the current curve
		this.scene.add(this.card);
	}

	initMultipleCards() {
		this.cards = [];
		const cardPositions = [0.2, 0.4, 0.6, 0.8]; // Positions along the curve as t values
	
		for (let t of cardPositions) {
			const cardTexture = new THREE.TextureLoader().load('src/textures/yellow_card.jpg');
			const cardGeometry = new THREE.BoxGeometry(4, 6, 0.1);
			const cardMaterial = new THREE.MeshPhongMaterial({ map: cardTexture, transparent: true, opacity: 0.8 });
			const card = new THREE.Mesh(cardGeometry, cardMaterial);
			this.positionCardOnCurve(t, card);
			this.scene.add(card);
			this.cards.push(card);
		}
	}
	
	positionCardOnCurve(t, card) {
		const point = this.curves[this.currentCurveIndex].getPoint(t);
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

    toggleOrbit(event) {
        if (event.key === 'o') {
            this.isOrbitEnabled = !this.isOrbitEnabled;
        }
    }

    handleKeyPress(event) {
        switch (event.key) {
            case 'w':
                this.toggleWireframe();
                break;
            case '+':
            case 'ArrowUp':
                this.speedFactor *= 1.1;
                break;
            case '-':
            case 'ArrowDown':
                this.speedFactor *= 0.9;
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
		this.animateBall();
		this.updateCamera();
		this.renderer.render(this.scene, this.camera);
	}

	animateBall() {
		const t = ((Date.now() / 4000) % 1); // Slower increment rate
		const point = this.curves[this.currentCurveIndex].getPoint(t);
		const ballMatrix = new THREE.Matrix4();
		ballMatrix.makeTranslation(point.x, point.y, point.z);
		this.ball.matrix = ballMatrix;
		this.ball.matrixAutoUpdate = false;
	
		// Check collision for each card
		this.cards.forEach((card, index) => {
			const cardPosition = new THREE.Vector3().setFromMatrixPosition(card.matrix);
			if (cardPosition.distanceTo(point) < 5) {
				console.log('Card collected at position:', index);
				this.scene.remove(card);
				this.cards.splice(index, 1); // Remove card from the array
			}
		});
	}
	

    checkCollision() {
        this.cards.forEach(card => {
            if (card.object.visible) {
                const distance = this.ball.position.distanceTo(card.object.position);
                if (distance < 3) {
                    card.object.visible = false;
                    this.collectedCards++;
                }
            }
        });

        const t = (performance.now() % 10000) / 10000; // 0 <= t <= 1 over 10 seconds
        if (t > 0.99) {
            const fairPlay = 100 * Math.pow(2, -((this.collectedCards % 3) + 10 * Math.floor(this.collectedCards / 3)) / 10);
            //alert(`Fair Play score: ${fairPlay.toFixed(2)}`);
            this.collectedCards = 0;
        }
    }

    createRotationMatrix(axis, angle) {
        const rotationMatrix = new THREE.Matrix4();
        switch (axis) {
            case 'x':
                rotationMatrix.makeRotationX(this.degreesToRadians(angle));
                break;
            case 'y':
                rotationMatrix.makeRotationY(this.degreesToRadians(angle));
                break;
        }
        return rotationMatrix;
    }
}

new ThreeDScene();