class Camera {
    constructor() {
        this.fov = 60;
        this.eye = new Vector3([0, 0.2, 1]);
        this.at = new Vector3([0, 0, -1]);
        this.up = new Vector3([0, 1, 0]);
        this.viewMatrix = new Matrix4();
        this.projectionMatrix = new Matrix4();

        // Rotation tracking
        this.angle_x = 0;
        this.angle_y = 0;
        this.QERotationSpeed = 0.06;
        this.mouseRotationSpeed = 0.2;

        this._direction = new Vector3();
        this._right = new Vector3();
        this._tempVector = new Vector3();
        this._rotationMatrix = new Matrix4();
        
        this._forward = new Vector3();
        this._side = new Vector3();
        
        this._viewNeedsUpdate = true;
        this._projectionNeedsUpdate = true;

        this.updateViewMatrix();
        this.updateProjectionMatrix();
    }

    updateViewMatrix() {
        if (!this._viewNeedsUpdate) return;
        
        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
        
        this._viewNeedsUpdate = false;
    }

    updateProjectionMatrix() {
        if (!this._projectionNeedsUpdate) return;
        
        this.projectionMatrix.setPerspective(this.fov, canvas.width/canvas.height, 0.1, 1000);
        this._projectionNeedsUpdate = false;
    }

    moveForward(speed = 0.1) {
        this.subtractVectors(this._forward, this.at, this.eye);
        this.normalizeVector(this._forward);
        this.scaleVector(this._forward, speed);
        
        this.addVectors(this.eye, this.eye, this._forward);
        this.addVectors(this.at, this.at, this._forward);
        
        this._viewNeedsUpdate = true;
    }

    moveBackward(speed = 0.1) {
        this.moveForward(-speed);
    }

    moveLeft(speed = 0.1) {
        //reuse
        this.subtractVectors(this._forward, this.at, this.eye);
        this.crossProduct(this._side, this.up, this._forward);
        this.normalizeVector(this._side);//
        this.scaleVector(this._side, speed);
        
        this.addVectors(this.eye, this.eye, this._side);
        this.addVectors(this.at, this.at, this._side);
        
        this._viewNeedsUpdate = true;
    }

    moveRight(speed = 0.1) {
        this.moveLeft(-speed);
    }

    panLeft(alpha = 5) {
        this.subtractVectors(this._forward, this.at, this.eye);
        
        this._rotationMatrix.setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);////
        let rotated = this._rotationMatrix.multiplyVector3(this._forward);
        
        this.addVectors(this.at, this.eye, rotated);
        
        this._viewNeedsUpdate = true;
    }

    panRight(alpha = 5) {
        this.panLeft(-alpha);
    }

    rotate(xAng, yAng) {
        // Only update if angles actually changed
        if (xAng === this.angle_x && yAng === this.angle_y) return;
        
        let delta_ang_y = yAng - this.angle_y;
        this.angle_y = yAng;
        let delta_ang_x = xAng - this.angle_x;
        this.angle_x = xAng;

        // Reuse
        this.subtractVectors(this._direction, this.at, this.eye);

        this._rotationMatrix.setRotate(delta_ang_y, 0, 1, 0);
        this._direction = this._rotationMatrix.multiplyVector3(this._direction);

        this.crossProduct(this._right, this._direction, this.up);
        this.normalizeVector(this._right);
        
        this._rotationMatrix.setRotate(delta_ang_x, 
            this._right.elements[0], ///
            this._right.elements[1], /////
            this._right.elements[2]
        );
        this._direction = this._rotationMatrix.multiplyVector3(this._direction);///
        
        this.addVectors(this.at, this.eye, this._direction);
        
        this._viewNeedsUpdate = true;
    }

    // improve the vector operations
    subtractVectors(result, v1, v2) {
        const e = result.elements;
        const e1 = v1.elements;
        const e2 = v2.elements;
        e[0] = e1[0] - e2[0];
        e[1] = e1[1] - e2[1];
        e[2] = e1[2] - e2[2];
    }

    normalizeVector(v) {
        const e = v.elements;
        const length = Math.sqrt(e[0] * e[0] + e[1] * e[1] + e[2] * e[2]);
        if (length > 0.00001) {
            const invLength = 1 / length;
            e[0] *= invLength;
            e[1] *= invLength;
            e[2] *= invLength;
        }
    }

    scaleVector(v, s) {
        const e = v.elements;
        e[0] *= s;
        e[1] *= s;
        e[2] *= s;
    }

    addVectors(result, v1, v2) {
        const e = result.elements;
        const e1 = v1.elements;
        const e2 = v2.elements;
        e[0] = e1[0] + e2[0];
        e[1] = e1[1] + e2[1];
        e[2] = e1[2] + e2[2];
    }

    crossProduct(result, v1, v2) {
        const e = result.elements;
        const e1 = v1.elements;
        const e2 = v2.elements;
        e[0] = e1[1] * e2[2] - e1[2] * e2[1];
        e[1] = e1[2] * e2[0] - e1[0] * e2[2];
        e[2] = e1[0] * e2[1] - e1[1] * e2[0];
    }

    getRayFromCamera(distance = 2) {
        let dir = new Vector3();
        this.subtractVectors(dir, this.at, this.eye);
        this.normalizeVector(dir);
        
        // Scale direction vector 
        this.scaleVector(dir, distance);
        
        // Get target point
        let target = new Vector3();
        this.addVectors(target, this.eye, dir);
        
        return target;
    }
}