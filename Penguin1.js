class Penguin {
    constructor(x = 0, y = 0, z = 0) {
        // Position and animation state
        this.position = [x, y, z];
        this.rotation = [0, 0, 0];
        this.scale = [1, 1, 1];
        
        // Animation timing and state
        this.startTime = performance.now()/1000.0;
        
        // Store colors as properties for easy modification
        this.bodyColor = [0.15, 0.15, 0.15, 1.0];
        this.bellyColor = [1.0, 0.96, 0.93, 1.0];
        this.beakColor = [1, 0.7, 0.3, 1.0];
        this.bottomBeakColor = [0.851, 0.639, 0.3, 1.0];
        this.eyeColor = [0, 0, 0, 1];
        this.feetColor = [1, 0.7, 0.3, 1.0];
    }

    updateAnimation() {
        const seconds = performance.now()/1000.0 - this.startTime;
        return seconds;
    }

    render(globalRotationMatrix) {
        const seconds = this.updateAnimation();
        
        // Base matrix incorporating position, rotation, and scale
        var baseMatrix = new Matrix4(globalRotationMatrix);
        baseMatrix.translate(this.position[0], this.position[1], this.position[2])
                 .rotate(this.rotation[1], 0, 1, 0)
                 .scale(this.scale[0], this.scale[1], this.scale[2]);

        // Draw the body cube (parent)
        var body = new Cube();
        body.color = this.bodyColor;
        var bodyMatrixBeforeScale = new Matrix4(baseMatrix);

        bodyMatrixBeforeScale.translate(-0.25,-0.65, 0.0);
        bodyMatrixBeforeScale.translate(0.2, 0.5, 0.0); 
        bodyMatrixBeforeScale.rotate(3*Math.sin(seconds*2), 0, 0, 1);  
        bodyMatrixBeforeScale.translate(-0.25, -0.5, 0.0);
        
        var bodyMatrix = new Matrix4(bodyMatrixBeforeScale);
        bodyMatrix.scale(0.5,1.0,0.35);
        body.matrix = bodyMatrix;
        body.render();

        // Body details (white parts)
        this.renderBellyParts(bodyMatrixBeforeScale);
        this.renderHead(bodyMatrixBeforeScale, seconds);
        this.renderArms(bodyMatrixBeforeScale, seconds);
        this.renderLegs(bodyMatrixBeforeScale, seconds);
    }

    renderBellyParts(bodyMatrix) {
        const bellyParts = [
            {translate: [0.032, 0.25, -0.01], scale: [0.44, 0.75, 0.02]},
            {translate: [-0.002, 0.0, -0.04], scale: [0.51, 0.75, 0.22]},
            {translate: [-0.024, -0.001, -0.07], scale: [0.55, 0.50, 0.35]}
        ];

        bellyParts.forEach(part => {
            var belly = new Cube();
            belly.color = this.bellyColor;
            var bellyMatrix = new Matrix4(bodyMatrix);
            bellyMatrix.translate(...part.translate);
            bellyMatrix.scale(...part.scale);
            belly.matrix = bellyMatrix;
            belly.render();
        });
    }

    renderHead(bodyMatrix, seconds) {
        var head = new Cube();
        head.color = this.bodyColor;
        var headMatrixBeforeScale = new Matrix4(bodyMatrix);
        headMatrixBeforeScale.translate(0.01, 0.95, 0.0);
        headMatrixBeforeScale.translate(0.24, 0.0, 0.0);
        headMatrixBeforeScale.rotate(7*Math.sin(seconds*2), 0, 0, 1);
        headMatrixBeforeScale.translate(-0.24, 0.0, 0.0);

        var headMatrix = new Matrix4(headMatrixBeforeScale);
        headMatrix.scale(0.48, 0.4, 0.35);
        head.matrix = headMatrix;
        head.render();

        // Beak and eyes
        this.renderBeakAndEyes(headMatrixBeforeScale);
    }

    renderBeakAndEyes(headMatrix) {
        // Top beak
        var topBeak = new Cube();
        topBeak.color = this.beakColor;
        var topBeakMatrix = new Matrix4(headMatrix);
        topBeakMatrix.translate(0.14, 0.09, -0.08);
        topBeakMatrix.scale(0.2, 0.07, 0.1);
        topBeak.matrix = topBeakMatrix;
        topBeak.render();

        // Bottom beak
        var bottomBeak = new Cube();
        bottomBeak.color = this.bottomBeakColor;
        var bottomBeakMatrix = new Matrix4(headMatrix);
        bottomBeakMatrix.translate(0.14, 0.06, -0.04);
        bottomBeakMatrix.scale(0.2, 0.03, 0.1);
        bottomBeak.matrix = bottomBeakMatrix;
        bottomBeak.render();

        // Eyes
        const eyePositions = [[0.07, 0.135], [0.34, 0.135]];
        eyePositions.forEach(pos => {
            var eye = new Cube();
            eye.color = this.eyeColor;
            var eyeMatrix = new Matrix4(headMatrix);
            eyeMatrix.translate(pos[0], pos[1], 0.0);
            eyeMatrix.scale(0.07, 0.07, -0.01);
            eye.matrix = eyeMatrix;
            eye.render();
        });
    }

    renderArms(bodyMatrix, seconds) {
        // Right arm
        var rightArm = new Cube();
        rightArm.color = this.bodyColor;
        var rightArmMatrix = new Matrix4(bodyMatrix);
        rightArmMatrix.translate(0.55, 0.95, 0.0);
        rightArmMatrix.rotate(10*Math.sin(seconds * 2), 0, 0, 1);
        rightArmMatrix.rotate(185, 0, 0, 1);
        rightArmMatrix.scale(0.06, 0.50, 0.25);
        rightArm.matrix = rightArmMatrix;
        rightArm.render();

        // Left arm
        var leftArm = new Cube();
        leftArm.color = this.bodyColor;
        var leftArmMatrix = new Matrix4(bodyMatrix);
        leftArmMatrix.translate(0.01, 0.93, 0.0);
        leftArmMatrix.rotate(-10*Math.sin(seconds * 2), 0, 0, 1);
        leftArmMatrix.rotate(-185, 0, 0, 1);
        leftArmMatrix.scale(0.06, 0.50, 0.25);
        leftArm.matrix = leftArmMatrix;
        leftArm.render();

        // Hands
        //this.renderHands(rightArmMatrix, leftArmMatrix);
    }

    renderLegs(bodyMatrix, seconds) {
        // Right leg
        var rightLeg = new Cube();
        rightLeg.color = this.bodyColor;
        var rightLegMatrix = new Matrix4(bodyMatrix);
        rightLegMatrix.translate(0.30, -0.15, 0.05);
        rightLegMatrix.translate(0.0725, 0.0, 0.0);
        rightLegMatrix.rotate(15*Math.sin(seconds * 2), 1, 0, 0);
        rightLegMatrix.translate(-0.0725, 0.0, 0.0);
        rightLegMatrix.scale(0.145, 0.3, 0.20);
        rightLeg.matrix = rightLegMatrix;
        rightLeg.render();

        // Left leg
        var leftLeg = new Cube();
        leftLeg.color = this.bodyColor;
        var leftLegMatrix = new Matrix4(bodyMatrix);
        leftLegMatrix.translate(0.05, -0.15, 0.05);
        leftLegMatrix.translate(0.0725, 0.0, 0.0);
        leftLegMatrix.rotate(-15*Math.sin(seconds * 2), 1, 0, 0);
        leftLegMatrix.translate(-0.0725, 0.0, 0.0);
        leftLegMatrix.scale(0.145, 0.3, 0.20);
        leftLeg.matrix = leftLegMatrix;
        leftLeg.render();

        // Feet
        this.renderFeet(rightLegMatrix, leftLegMatrix);
    }

    renderFeet(rightLegMatrix, leftLegMatrix) {
        // Right foot
        var rightFoot = new Cube();
        rightFoot.color = this.feetColor;
        var rightFootMatrix = new Matrix4(rightLegMatrix);
        rightFootMatrix.translate(-0.01, -0.001, -0.05);
        rightFootMatrix.scale(1.03, 0.03, 1.07);
        rightFoot.matrix = rightFootMatrix;
        rightFoot.render();

        // Left foot
        var leftFoot = new Cube();
        leftFoot.color = this.feetColor;
        var leftFootMatrix = new Matrix4(leftLegMatrix);
        leftFootMatrix.translate(-0.01, -0.001, -0.05);
        leftFootMatrix.scale(1.03, 0.03, 1.07);
        leftFoot.matrix = leftFootMatrix;
        leftFoot.render();
    }
}
