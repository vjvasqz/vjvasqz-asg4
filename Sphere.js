class Sphere {
    constructor(radius = 1, widthSegments = 10, heightSegments = 10, textureNum = -2) {
        this.type = 'sphere';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = radius;
        this.matrix = new Matrix4();
        this.textureNum = textureNum;
    }
    
    render() {
        var rgba = this.color;
        
        // Check if normal visualization is on
        let currentTexture = g_normalOn ? -3 : this.textureNum;
        
        // Pass the color to the fragment shader
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniform1i(u_WhichTexture, currentTexture);
        
        // Pass the model matrix
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
        var d = Math.PI/10;
        var dd = Math.PI/10;
        
        // Define sin and cos functions
        const sin = Math.sin;
        const cos = Math.cos;
        
        for (var t = 0; t < Math.PI; t += d) {
            for (var r = 0; r < (2 * Math.PI); r += d) {
                // Scale the points by the radius
                var p1 = [this.size * sin(t) * cos(r), this.size * sin(t) * sin(r), this.size * cos(t)];
                var p2 = [this.size * sin(t+dd) * cos(r), this.size * sin(t+dd) * sin(r), this.size * cos(t+dd)];
                var p3 = [this.size * sin(t) * cos(r+dd), this.size * sin(t) * sin(r+dd), this.size * cos(t)];
                var p4 = [this.size * sin(t+dd) * cos(r+dd), this.size * sin(t+dd) * sin(r+dd), this.size * cos(t+dd)];
                
                // Calculate normals - for a sphere, normals are just normalized vertex positions
                var n1 = [sin(t) * cos(r), sin(t) * sin(r), cos(t)];
                var n2 = [sin(t+dd) * cos(r), sin(t+dd) * sin(r), cos(t+dd)];
                var n3 = [sin(t) * cos(r+dd), sin(t) * sin(r+dd), cos(t)];
                var n4 = [sin(t+dd) * cos(r+dd), sin(t+dd) * sin(r+dd), cos(t+dd)];
                
                var v = [];
                var uv = [];
                var normals = [];
                
                // First triangle
                v = v.concat(p1); uv = uv.concat([0,0]); normals = normals.concat(n1);
                v = v.concat(p2); uv = uv.concat([0,0]); normals = normals.concat(n2);
                v = v.concat(p4); uv = uv.concat([0,0]); normals = normals.concat(n4);
                
                // Don't set fragment color here - let the shader handle it
                drawTriangle3DUVNormal(v, uv, normals);
                
                // Second triangle
                v = [];
                uv = [];
                normals = [];
                
                v = v.concat(p1); uv = uv.concat([0,0]); normals = normals.concat(n1);
                v = v.concat(p4); uv = uv.concat([0,0]); normals = normals.concat(n4);
                v = v.concat(p3); uv = uv.concat([0,0]); normals = normals.concat(n3);
                
                // Don't set fragment color here - let the shader handle it
                drawTriangle3DUVNormal(v, uv, normals);
            }
        }
    }
}