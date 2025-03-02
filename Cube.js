class Cube {
    constructor(textureNum = -2, texWeight = 1.0, shininess = 0.0) {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = textureNum;
        this.texWeight = texWeight;
        this.shininess = shininess;
    }

    render() {
        var rgba = this.color;
        // Pass the texture number
        gl.uniform1i(u_WhichTexture, this.textureNum);
        //gl.uniform1f(u_Shininess, this.shininess);
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniform1f(u_texColorWeight, this.texWeight);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        if (this.textureNum === 0) { //snow-block texture
            // Back
            drawTriangle3DUVNormal(
                [0, 0, 0, 1, 1, 0, 1, 0, 0], 
                [0.5, 0, 0, 0.5, 0, 0],
                [0, 0, 1, 0, 0, 1, 0, 0, 1]  // Back face normals
            );
            drawTriangle3DUVNormal(
                [0, 0, 0, 0, 1, 0, 1, 1, 0], 
                [0.5, 0, 0.5, 0.5, 0, 0.5],
                [0, 0, 1, 0, 0, 1, 0, 0, 1]  // Back face normals
            );

            // Top
            drawTriangle3DUVNormal(
                [0, 1, 0, 0, 1, 1, 1, 1, 1], 
                [0, 1, 0.48, 1, 0.5, 0.48],
                [0, 1, 0, 0, 1, 0, 0, 1, 0]  // Top face normals
            );
            drawTriangle3DUVNormal(
                [0, 1, 0, 1, 1, 1, 1, 1, 0], 
                [0, 1, 0.5, 0.5, 0, 0.5],
                [0, 1, 0, 0, 1, 0, 0, 1, 0]  // Top face normals
            );

            // Right
            drawTriangle3DUVNormal(
                [1, 0, 0, 1, 1, 1, 1, 1, 0], 
                [0.5, 0.5, 1, 1, 0.5, 1],
                [1, 0, 0, 1, 0, 0, 1, 0, 0]  // Right face normals
            );
            drawTriangle3DUVNormal(
                [1, 0, 0, 1, 0, 1, 1, 1, 1], 
                [0.5, 0.5, 1, 0.5, 1, 1],
                [1, 0, 0, 1, 0, 0, 1, 0, 0]  // Right face normals
            );

            // Left
            drawTriangle3DUVNormal(
                [0, 0, 0, 0, 1, 1, 0, 1, 0], 
                [0.5, 0.5, 1, 1, 0.5, 1],
                [-1, 0, 0, -1, 0, 0, -1, 0, 0]  // Left face normals
            );
            drawTriangle3DUVNormal(
                [0, 0, 0, 0, 0, 1, 0, 1, 1], 
                [0.5, 0.5, 1, 0.5, 1, 1],
                [-1, 0, 0, -1, 0, 0, -1, 0, 0]  // Left face normals
            );

            // Front
            drawTriangle3DUVNormal(
                [0, 0, 1, 1, 1, 1, 1, 0, 1], 
                [0.5, 0, 0, 0.5, 0, 0],
                [0, 0, -1, 0, 0, -1, 0, 0, -1]  // Front face normals
            );
            drawTriangle3DUVNormal(
                [0, 0, 1, 0, 1, 1, 1, 1, 1], 
                [0.5, 0, 0.5, 0.5, 0, 0.5],
                [0, 0, -1, 0, 0, -1, 0, 0, -1]  // Front face normals
            );

            // Bottom
            drawTriangle3DUVNormal(
                [0, 0, 0, 1, 0, 1, 1, 0, 0], 
                [0.5, 0.5, 1, 0, 1, 0.5],
                [0, -1, 0, 0, -1, 0, 0, -1, 0]  // Bottom face normals
            );
            drawTriangle3DUVNormal(
                [0, 0, 0, 0, 0, 1, 1, 0, 1], 
                [0.5, 0.5, 0.5, 0, 1, 0],
                [0, -1, 0, 0, -1, 0, 0, -1, 0]  // Bottom face normals
            );

        } else { //ice-block or any other texture
            // Front
            drawTriangle3DUVNormal(
                [0, 0, 0, 1, 1, 0, 1, 0, 0], 
                [0, 0, 1, 1, 1, 0],
                [0, 0, -1, 0, 0, -1, 0, 0, -1]  // Front face normals
            );
            drawTriangle3DUVNormal(
                [0, 0, 0, 0, 1, 0, 1, 1, 0], 
                [0, 0, 0, 1, 1, 1],
                [0, 0, -1, 0, 0, -1, 0, 0, -1]  // Front face normals
            );

            // Top
            drawTriangle3DUVNormal(
                [0, 1, 0, 0, 1, 1, 1, 1, 1], 
                [0, 0, 0, 1, 1, 1],
                [0, 1, 0, 0, 1, 0, 0, 1, 0]  // Top face normals
            );
            drawTriangle3DUVNormal(
                [0, 1, 0, 1, 1, 1, 1, 1, 0], 
                [0, 0, 1, 1, 1, 0],
                [0, 1, 0, 0, 1, 0, 0, 1, 0]  // Top face normals
            );

            // Right
            drawTriangle3DUVNormal(
                [1, 0, 0, 1, 1, 1, 1, 1, 0], 
                [0, 0, 1, 1, 0, 1],
                [1, 0, 0, 1, 0, 0, 1, 0, 0]  // Right face normals
            );
            drawTriangle3DUVNormal(
                [1, 0, 0, 1, 0, 1, 1, 1, 1], 
                [0, 0, 1, 0, 1, 1],
                [1, 0, 0, 1, 0, 0, 1, 0, 0]  // Right face normals
            );

            // Left
            drawTriangle3DUVNormal(
                [0, 0, 0, 0, 1, 1, 0, 1, 0], 
                [1, 0, 0, 1, 0, 0],
                [-1, 0, 0, -1, 0, 0, -1, 0, 0]  // Left face normals
            );
            drawTriangle3DUVNormal(
                [0, 0, 0, 0, 0, 1, 0, 1, 1], 
                [1, 0, 1, 1, 0, 1],
                [-1, 0, 0, -1, 0, 0, -1, 0, 0]  // Left face normals
            );

            // Back
            drawTriangle3DUVNormal(
                [0, 0, 1, 1, 1, 1, 1, 0, 1], 
                [1, 0, 0, 1, 0, 0],
                [0, 0, 1, 0, 0, 1, 0, 0, 1]  // Back face normals
            );
            drawTriangle3DUVNormal(
                [0, 0, 1, 0, 1, 1, 1, 1, 1], 
                [1, 0, 1, 1, 0, 1],
                [0, 0, 1, 0, 0, 1, 0, 0, 1]  // Back face normals
            );

            // Bottom
            drawTriangle3DUVNormal(
                [0, 0, 0, 1, 0, 1, 1, 0, 0], 
                [0, 0, 1, 1, 1, 0],
                [0, -1, 0, 0, -1, 0, 0, -1, 0]  // Bottom face normals
            );
            drawTriangle3DUVNormal(
                [0, 0, 0, 0, 0, 1, 1, 0, 1], 
                [0, 0, 0, 1, 1, 1],
                [0, -1, 0, 0, -1, 0, 0, -1, 0]  // Bottom face normals
            );
        }
    }
}




// OLD Cube but needed to be more efficient

// class Cube{
//     constructor(textureNum = -2, texWeight = 1.0){
//       this.type = 'cube';
//       this.color = [1.0,1.0,1.0,1.0];
//       this.matrix = new Matrix4();
//       this.textureNum = textureNum;
//       this.texWeight = texWeight;
//     }

//     render(){
//       var rgba = this.color;
//       // Pass the texture number
//       gl.uniform1i(u_WhichTexture, this.textureNum);
//       // Pass the color of a point to u_FragColor variable
//       gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
//       gl.uniform1f(u_texColorWeight, this.texWeight);
//       gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    

//       if (this.textureNum === 0){ //snow-block texture
//         // Back
//         drawTriangle3DUV([0,0,0, 1,1,0, 1,0,0], [0.5,0, 0,0.5, 0,0]);
//         drawTriangle3DUV([0,0,0, 0,1,0, 1,1,0], [0.5,0, 0.5,0.5, 0,0.5]);

//         // Top
//         drawTriangle3DUV([0,1,0, 0,1,1, 1,1,1], [0,1, 0.48,1, 0.5,0.48]);//[0,1, 0.5,1, 0.5,0.5]
//         drawTriangle3DUV([0,1,0, 1,1,1, 1,1,0], [0,1, 0.5,0.5, 0,0.5]);//[0,1, 0.5,0.5, 0.5,1]

//         // Right
//         drawTriangle3DUV([1,0,0, 1,1,1, 1,1,0], [0.5,0.5, 1,1, 0.5,1]);//
//         drawTriangle3DUV([1,0,0, 1,0,1, 1,1,1], [0.5,0.5, 1,0.5, 1,1]);

//         // Left
//         drawTriangle3DUV([0,0,0, 0,1,1, 0,1,0], [0.5,0.5, 1,1, 0.5,1]);// [1,0.5, 0.5,1, 1,1]
//         drawTriangle3DUV([0,0,0, 0,0,1, 0,1,1], [0.5,0.5, 1,0.5, 1,1]);

//         // Front
//         drawTriangle3DUV([0,0,1, 1,1,1, 1,0,1], [0.5,0, 0,0.5, 0,0]);
//         drawTriangle3DUV([0,0,1, 0,1,1, 1,1,1], [0.5,0, 0.5,0.5, 0,0.5]);

//         // Bottom
//         drawTriangle3DUV([0,0,0, 1,0,1, 1,0,0], [0.5,0.5, 1,0, 1,0.5]);
//         drawTriangle3DUV([0,0,0, 0,0,1, 1,0,1], [0.5,0.5, 0.5,0, 1,0]);
//         // drawTriangle3DUV([0,0,0, 1,0,1, 1,0,0], [0.5,0.5, 1,0, 1,0.5]);
//         // drawTriangle3DUV([0,0,0, 0,0,1, 1,0,1], [0.5,0.5, 0.5,0, 1,0]);

//       } else { //ice-block or any other texture
//         // Front
//         drawTriangle3DUV([0,0,0, 1,1,0, 1,0,0], [0,0, 1,1, 1,0]);
//         drawTriangle3DUV([0,0,0, 0,1,0, 1,1,0], [0,0, 0,1, 1,1]);

//         // Top
//         drawTriangle3DUV([0,1,0, 0,1,1, 1,1,1], [0,0, 0,1, 1,1]);
//         drawTriangle3DUV([0,1,0, 1,1,1, 1,1,0], [0,0, 1,1, 1,0]);

//         // Right
//         drawTriangle3DUV([1,0,0, 1,1,1, 1,1,0], [0,0, 1,1, 0,1]);
//         drawTriangle3DUV([1,0,0, 1,0,1, 1,1,1], [0,0, 1,0, 1,1]);

//         // Left
//         drawTriangle3DUV([0,0,0, 0,1,1, 0,1,0], [1,0, 0,1, 0,0]);
//         drawTriangle3DUV([0,0,0, 0,0,1, 0,1,1], [1,0, 1,1, 0,1]);

//         // Back
//         drawTriangle3DUV([0,0,1, 1,1,1, 1,0,1], [1,0, 0,1, 0,0]);
//         drawTriangle3DUV([0,0,1, 0,1,1, 1,1,1], [1,0, 1,1, 0,1]);

//         // Bottom
//         drawTriangle3DUV([0,0,0, 1,0,1, 1,0,0], [0,0, 1,1, 1,0]);
//         drawTriangle3DUV([0,0,0, 0,0,1, 1,0,1], [0,0, 0,1, 1,1]);

//       }
//     }


//     render(){
//       var rgba = this.color;
//       // Pass the texture number
//       gl.uniform1i(u_WhichTexture, this.textureNum);
//       // Pass the color of a point to u_FragColor variable
//       gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
//       gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);


//       // Front
//       drawTriangle3DUV([0,0,0, 1,1,0, 1,0,0], [0,0, 1,1, 1,0]);
//       drawTriangle3DUV([0,0,0, 0,1,0, 1,1,0], [0,0, 0,1, 1,1]);

//       // Top
//       drawTriangle3DUV([0,1,0, 0,1,1, 1,1,1], [0,0, 0,1, 1,1]);
//       drawTriangle3DUV([0,1,0, 1,1,1, 1,1,0], [0,0, 1,1, 1,0]);

//       // Right
//       drawTriangle3DUV([1,0,0, 1,1,1, 1,1,0], [0,0, 1,1, 0,1]);
//       drawTriangle3DUV([1,0,0, 1,0,1, 1,1,1], [0,0, 1,0, 1,1]);

//       // Left
//       drawTriangle3DUV([0,0,0, 0,1,1, 0,1,0], [1,0, 0,1, 0,0]);
//       drawTriangle3DUV([0,0,0, 0,0,1, 0,1,1], [1,0, 1,1, 0,1]);

//       // Back
//       drawTriangle3DUV([0,0,1, 1,1,1, 1,0,1], [1,0, 0,1, 0,0]);
//       drawTriangle3DUV([0,0,1, 0,1,1, 1,1,1], [1,0, 1,1, 0,1]);

//       // Bottom
//       drawTriangle3DUV([0,0,0, 1,0,1, 1,0,0], [0,0, 1,1, 1,0]);
//       drawTriangle3DUV([0,0,0, 0,0,1, 1,0,1], [0,0, 0,1, 1,1]);


//       //drawCube(this.matrix);
//     }
// }