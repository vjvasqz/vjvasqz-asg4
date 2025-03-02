// Global buffer variables
let globalVertexBuffer;
let globalUVBuffer;
let globalNormalBuffer;

//function to initialize buffers
function initializeBuffers() {
  //create the buffer for positions if it doesnt exist
  if (!globalVertexBuffer) {
      globalVertexBuffer = gl.createBuffer();
      if (!globalVertexBuffer) {
          console.log('Failed to create the vertex buffer object');
          return -1;
      }
  }
  
  // Create the buffer for UVs if it doesn't exist
  if (!globalUVBuffer) {
      globalUVBuffer = gl.createBuffer();
      if (!globalUVBuffer) {
          console.log('Failed to create the UV buffer object');
          return -1;
      }
  }

  // Create the buffer for normals if it doesn't exist
  if (!globalNormalBuffer) {
    globalNormalBuffer = gl.createBuffer();
    if (!globalNormalBuffer) {
      console.log('Failed to craete the normal Buffer object');
      return -1;
    }
  }

  // Enable the assignment to a_Position variable
  gl.bindBuffer(gl.ARRAY_BUFFER, globalVertexBuffer);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  // Enable the assignment to a_UV variable
  gl.bindBuffer(gl.ARRAY_BUFFER, globalUVBuffer);
  gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_UV);

  // Enable the assignment to a_Normal variable
  gl.bindBuffer(gl.ARRAY_BUFFER, globalNormalBuffer);
  gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Normal);

}

class Triangle{
    constructor(){
      this.type = 'triangle';
      this.position = [0.0, 0.0, 0.0];
      this.color = [1.0,1.0,1.0,1.0];
      this.size = 5.0;
    }
  
    render(){
      var xy = this.position;
      var rgba = this.color;
      var size = this.size;

      // Pass the color of a point to u_FragColor variable
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      //Pass the color of a point to u_FragColor variable
      gl.uniform1f(u_Size, size);
      // Draw
      //gl.drawArrays(gl.POINTS, 0, 1);
      var d = this.size/200.0; //delta
      //drawTriangle( [xy[0], xy[1], xy[0]+d, xy[1], xy[0], xy[1]+d] );
      
      // Want to have a equalateral triangle: calculate height
      var h = (Math.sqrt(3) / 2) * d; 

      // Three vertices relative to the center (xy[0], xy[1])
      var vertices = [
        xy[0], xy[1] + h / 2,                  // Top vertex
        xy[0] - d / 2, xy[1] - h / 2,         // Bottom left vertex
        xy[0] + d / 2, xy[1] - h / 2          // Bottom right vertex
      ];

      drawTriangle(vertices);
    }
}

function drawTriangle(vertices){
    var n = 3;// The number of vertices

    //Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to creaye the buffer object');
        return -1;
    }

    //Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    //Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    //Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    // Enable the asssigment to a_position variable
    gl.enableVertexAttribArray(a_Position);
    gl.drawArrays(gl.TRIANGLES, 0, n);
    //retun n;

}


function drawTriangle3D(vertices){

  //var n = 3;// The number of vertices
  var n = vertices.length / 3;  // instead of var n = 3;

  //Bind the buffer object to target
  //gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bindBuffer(gl.ARRAY_BUFFER, globalVertexBuffer);

  //Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  //Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  // Enable the asssigment to a_position variable
  gl.enableVertexAttribArray(a_Position);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  //retun n;

}


function drawTriangle3DUV(vertices, uv, normals){
  var n = vertices.length / 3;
  
  // Bind vertex buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, globalVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  // Bind UV buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, globalUVBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.STATIC_DRAW);
  gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_UV);

  // Add normal buffer handling - use globalNormalBuffer
  if (normals && a_Normal >= 0) {
    gl.bindBuffer(gl.ARRAY_BUFFER, globalNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Normal);
  }

  gl.drawArrays(gl.TRIANGLES, 0, n);
}


function drawTriangle3DUVNormal(vertices, uv, normals) {
  var n = vertices.length / 3;
  
  // Bind vertex buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, globalVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);
  
  // Bind UV buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, globalUVBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.STATIC_DRAW);
  gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_UV);
  
  // Bind normal buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, globalNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Normal);
  
  gl.drawArrays(gl.TRIANGLES, 0, n);
}
