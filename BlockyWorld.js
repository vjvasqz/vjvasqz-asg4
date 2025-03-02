// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix *u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    //v_Normal = a_Normal;
    v_Normal = normalize(mat3(u_ModelMatrix) * a_Normal);
    v_VertPos = u_ModelMatrix * a_Position;
    
  }`

//Fragment shader program
var FSHADER_SOURCE =`
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform int u_WhichTexture;
  uniform vec3 u_lightPos;
  uniform vec3 u_cameraPos;

  uniform vec3 u_lightColor;
  varying vec4 v_VertPos;
  uniform bool u_lightOn;
  uniform bool u_isWall;

  // Spotlight uniforms
  uniform bool u_spotlightOn;
  uniform vec3 u_spotlightPos;
  uniform vec3 u_spotlightDir;
  uniform float u_spotlightCutoff;
  uniform vec3 u_spotlightColor;

  //uniform float u_texColorWeight;

  void main() {
    //vec4 texColor;
    if (u_WhichTexture == -3) {
        gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0);
    } else if (u_WhichTexture == -2){
        gl_FragColor = u_FragColor;
    } else if (u_WhichTexture == -1) {
        gl_FragColor = vec4(v_UV, 1.0, 1.0);
    } else if (u_WhichTexture == 0) {
        gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if (u_WhichTexture == 1) {
        gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else if (u_WhichTexture == 2) {
        gl_FragColor = texture2D(u_Sampler2, v_UV);
    } else if (u_WhichTexture == 3) {
        gl_FragColor = texture2D(u_Sampler3, v_UV);
    } else {
        gl_FragColor = vec4(1, 0.0, 0.0, 1);
    }
 
    //Point Light calculations
    vec3 lightVector = u_lightPos - vec3(v_VertPos);
    float r = length(lightVector);
    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N,L), 0.0);
    //Refelection
    vec3 R = reflect(-L,N);
    //eye
    vec3 E = normalize(u_cameraPos - vec3(v_VertPos));
    //Spectular
    float specular = pow(max(dot(E,R), 0.0), 64.0)* 0.8;
    vec3 specularColor = u_lightColor * specular;
    vec3 diffuse = u_lightColor * vec3(gl_FragColor) * nDotL * 0.7;
    vec3 ambient = vec3(gl_FragColor) * 0.28;


    // spotlight calculations
    vec3 spotlightVector = u_spotlightPos - vec3(v_VertPos);
    vec3 spotL = normalize(spotlightVector);
    float spotlightDot = dot(-spotL, normalize(u_spotlightDir));
    
    vec3 spotSpecular = vec3(0.0);
    vec3 spotDiffuse = vec3(0.0);
    
    // calculate spotlight only if its within the spotlight cone
    if (spotlightDot > u_spotlightCutoff && u_spotlightOn) {
        // intensity based on angle 
        float spotIntensity = (spotlightDot - u_spotlightCutoff) / (1.0 - u_spotlightCutoff);
        spotIntensity = pow(spotIntensity, 2.0);
        
        float spotNDotL = max(dot(N, spotL), 0.0);
        vec3 spotR = reflect(-spotL, N);
        float spotSpecularFactor = pow(max(dot(E, spotR), 0.0), 64.0) * 0.8;
    
        spotSpecular = u_spotlightColor * spotSpecularFactor * spotIntensity;
        spotDiffuse = u_spotlightColor * vec3(gl_FragColor) * spotNDotL * 0.7 * spotIntensity;
    }

    // light not on walls
    if(u_isWall){
      diffuse *= 0.2;
      ambient *= 1.5;
      specularColor *= 0.0;
      spotDiffuse *= 0.2;
      spotSpecular *= 0.0;
    }

    if (u_lightOn) {
      gl_FragColor = vec4(specularColor + diffuse + spotSpecular + spotDiffuse + ambient, 1.0);
    } else {
      gl_FragColor = gl_FragColor;
    }
}`


//==================== Global Variables ========================//
//WebGL context and canvas
let canvas;
let gl;

//Attribute and uniform locations
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_texColorWeight;
let u_NormalMatrix;

//Texture samplers
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_WhichTexture;

//Scene Objects
let g_penguins = [];
let g_worldObjects = [];

//Lighting and shading
let g_normalOn = false;
let u_lightPos;
let g_lightPos = [0, 1, 0];
let u_cameraPos;
let u_lightOn;

let u_isWall;
let u_lightColor;
let g_lightColor = [1.0,1.0,1.0];

let u_spotlightOn;
let u_spotlightPos;
let u_spotlightDir;
let u_spotlightCutoff;
let u_spotlightColor;

let g_spotlightOn = false;
let g_spotlightPos = [0, 0.5, 0]; 
let g_spotlightDir = [0, -1, 0];
let g_spotlightCutoff = 0.9; 
let g_spotlightColor = [0.0, 0.5, 1.0];

//let globalNormalBuffer; 

//Camera and interaction
let camera;
let pre_mouse_pos = null;
let global_angle_x = 0;
let global_angle_y = 0;

//Animation timing
var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0-g_startTime;

//Constarts for draw
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

//UI related variables
let g_selectedColor = [1.0,1.0,1.0,1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
var g_shapesList = [];

//World map data
let g_worldMap = [];
let g_box1 = null;
let g_box2 = null;


//lighting:
let u_lightingEnabled;
let g_lightingEnabled = true;

//==================== WEBGL Setup ========================//

function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
}

// Connect shader to js variables
function connectVariablesToGLSL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Then get uniform locations
  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) {
    console.log('Failed to get the storage location of u_lightPos');
    return;
  }

  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (!u_cameraPos) {
    console.log('Failed to get the storage location of u_lightPos');
    return;
  }

  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) {
    console.log('Failed to get the storage location of u_lightOn');
    return;
  }

  u_isWall = gl.getUniformLocation(gl.program, 'u_isWall');
  if (!u_isWall) {
    console.log('Failed to get the storage location of u_isWall');
    return;
  }

  u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor');
  if (!u_lightColor) {
    console.log('Failed to get the storage location of u_lightColor');
    return;
  }

  // Spotlight uniform locations
  u_spotlightOn = gl.getUniformLocation(gl.program, 'u_spotlightOn');
  if (!u_spotlightOn) {
    console.log('Failed to get the storage location of u_spotlightOn');
    return;
  }
  
  u_spotlightPos = gl.getUniformLocation(gl.program, 'u_spotlightPos');
  if (!u_spotlightPos) {
    console.log('Failed to get the storage location of u_spotlightPos');
    return;
  }
  
  u_spotlightDir = gl.getUniformLocation(gl.program, 'u_spotlightDir');
  if (!u_spotlightDir) {
    console.log('Failed to get the storage location of u_spotlightDir');
    return;
  }
  
  u_spotlightCutoff = gl.getUniformLocation(gl.program, 'u_spotlightCutoff');
  if (!u_spotlightCutoff) {
    console.log('Failed to get the storage location of u_spotlightCutoff');
    return;
  }
  
  u_spotlightColor = gl.getUniformLocation(gl.program, 'u_spotlightColor');
  if (!u_spotlightColor) {
    console.log('Failed to get the storage location of u_spotlightColor');
    return;
  }



  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }
  // // Get the storage location of a_Position
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0){
    console.log('Failed to get the storage location of a_Normal');
    return ;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  //Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  //Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  //Get the storage location of u_GlobalRotateMatrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  //Get the storage location of u_GlobalRotateMatrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  // Texture samplers
  //Get the storage location of u_Sampler0
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return;
  }

  // In connectVariablesToGLSL(), add:
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return;
  }

  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler2');
    return;
  }

  u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  if (!u_Sampler3) {
    console.log('Failed to get the storage location of u_Sampler3');
    return;
  }

  u_WhichTexture = gl.getUniformLocation(gl.program, 'u_WhichTexture');
  if (!u_WhichTexture) {
    console.log('Failed to get the storage location of u_WhichTexture');
    return;
  }

  u_texColorWeight = gl.getUniformLocation(gl.program, 'u_texColorWeight');
  if (!u_texColorWeight) {
    //console.log('Failed to get the storage location of u_texColorWeight');
    return;
  }


  //Set an initial value for this matrix to identify
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}

//==================== Texture Loading ========================//
function initTextures () {
    var image0 = new Image(); //Create the image object
    if(!image0) {
      console.log('Failed to create the image object');
      return false;
    }
    //register the event handler to be called on loading an image
    image0.onload = function(){ sendImageToTEXTURE0(image0);};
    image0.src = 'snow-block1.png';
    return true;
}

function initTextures1 () {
    //var texture0 = gl.createTexture();
    var image1 = new Image();
    if(!image1) {
      console.log('Failed to create the image object');
      return false;
    }
    //register the event handler to be called on loading an image
    image1.onload = function(){ sendImageToTEXTURE1(image1);};
    image1.src = 'ice-block1.png';
    return true;
}

function initTextures2 () {
    //var texture0 = gl.createTexture();
    var image2 = new Image();
    if(!image2) {
      console.log('Failed to create the image object');
      return false;
    }
    //register the event handler to be called on loading an image
    image2.onload = function(){ sendImageToTEXTURE2(image2);};
    image2.src = 'snow-floor1.png';
    return true;
}

function initTextures3 () {
    //var texture0 = gl.createTexture();
    var image3 = new Image();
    if(!image3) {
      console.log('Failed to create the image object');
      return false;
    }
    //register the event handler to be called on loading an image
    image3.onload = function(){ sendImageToTEXTURE3(image3);};
    image3.src = 'fish1.png';
    return true;
}

function sendImageToTEXTURE0(image0) {
    var texture = gl.createTexture();
    if (!texture){
        console.log('Failed to create the texture object');
        return false;
    }
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); //flip image's y axis
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image0);

    gl.uniform1i(u_Sampler0, 0);
    return true;
}

function sendImageToTEXTURE1(image1) {
    var texture1 = gl.createTexture(); 
    if (!texture1) {
        console.log('Failed to create the texture object');
        return false;
    }
    
    gl.activeTexture(gl.TEXTURE1); 
    gl.bindTexture(gl.TEXTURE_2D, texture1);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image1);
    
    gl.uniform1i(u_Sampler1, 1);  
    return true;
}

function sendImageToTEXTURE2(image2) {
    var texture2 = gl.createTexture(); 
    if (!texture2) {
        console.log('Failed to create the texture object');
        return false;
    }
    
    gl.activeTexture(gl.TEXTURE2); 
    gl.bindTexture(gl.TEXTURE_2D, texture2);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image2);
    
    gl.uniform1i(u_Sampler2, 2);  
    return true;
}


function sendImageToTEXTURE3(image3) {
    var texture3 = gl.createTexture(); 
    if (!texture3) {
        console.log('Failed to create the texture object');
        return false;
    }
    
    gl.activeTexture(gl.TEXTURE3); 
    gl.bindTexture(gl.TEXTURE_2D, texture3);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image3);
    
    gl.uniform1i(u_Sampler3, 3);  
    return true;
}

//==================== MAIN FUNCTION and Event Handle ========================//

function main() {
    //Setup WebGl and connect variables
    setupWebGL();
    connectVariablesToGLSL();
    initializeBuffers();
    
    //Load textures
    initTextures();
    initTextures1();
    initTextures2();
    initTextures3();

    // initialize camera
    camera = new Camera();
    //camera.eye = [0, 1, 3]; // Position a bit back and up to see the scene
    //camera.at = [0, 0, 0];  // Look at the center
    camera.updateViewMatrix();

    //mouse movement handling
    canvas.onmousemove = function(ev) { 
        if (ev.buttons == 1) { 
            click(ev); 
        } else { 
            pre_mouse_pos = null;
        } 
    };

    // Keyboard controls
    document.onkeydown = function(ev) {
        switch(ev.code) {
            case "KeyW": camera.moveForward(); break;
            case "KeyS": camera.moveBackward(); break;
            case "KeyA": camera.moveLeft(); break;
            case "KeyD": camera.moveRight(); break;
            case "KeyQ": camera.panLeft(); break;
            case "KeyE": camera.panRight(); break;
        }
        renderScene();
    };
    //Setup HTML UI controls
    addActionsForHtmlUI();


    //Setup Gl state
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.8, 0.8, 1.0, 1.0);

    g_lightingEnabled = true; // Start with lighting enabled
    console.log("Lighting enabled:", g_lightingEnabled);
    
    //start aminaltion loop
    requestAnimationFrame(tick);
    return true;
}

//==================== Set up UI controls ========================//
function addActionsForHtmlUI(){
  document.getElementById('normalOn').onclick = function() {
    g_normalOn = true;
    renderScene();
  };

  document.getElementById('normalOff').onclick = function() {
    g_normalOn = false;
    renderScene();
  };


  document.getElementById('lightSlideX').addEventListener('mousemove', function(ev) { 
    if(ev.buttons == 1) {
      g_lightPos[0] = this.value/100; 
      renderScene(); 
    }
  });

  document.getElementById('lightSlideY').addEventListener('mousemove', function(ev) { 
    if(ev.buttons == 1) {
      g_lightPos[1] = this.value/100; 
      renderScene();
    }
  });

  document.getElementById('lightSlideZ').addEventListener('mousemove', function(ev) { 
    if(ev.buttons == 1) {
      g_lightPos[2] = this.value/100; 
      renderScene(); 
    }
  });

  document.getElementById('lightingOn').onclick = function() { g_lightingEnabled = true; renderScene(); };
  document.getElementById('lightingOff').onclick = function() { g_lightingEnabled = false; renderScene(); };

  
  document.getElementById('lightColorR').addEventListener('mousemove', function(ev) { 
    if(ev.buttons == 1) {
      g_lightColor[0] = this.value/100; 
      renderScene(); 
    }
  });

  document.getElementById('lightColorG').addEventListener('mousemove', function(ev) { 
    if(ev.buttons == 1) {
      g_lightColor[1] = this.value/100; 
      renderScene(); 
    }
  });

  document.getElementById('lightColorB').addEventListener('mousemove', function(ev) { 
    if(ev.buttons == 1) {
      g_lightColor[2] = this.value/100; 
      renderScene(); 
    }
  });

  // Spotlight Controls
  document.getElementById('spotlightOn').onclick = function() { 
    g_spotlightOn = true; 
    renderScene(); 
  };
  
  document.getElementById('spotlightOff').onclick = function() { 
    g_spotlightOn = false; 
    renderScene(); 
  };

  // potlight position sliders
  document.getElementById('spotlightPosX').addEventListener('mousemove', function(ev) { 
    if(ev.buttons == 1) {
      g_spotlightPos[0] = this.value/100; 
      renderScene(); 
    }
  });
  
  document.getElementById('spotlightPosY').addEventListener('mousemove', function(ev) { 
    if(ev.buttons == 1) {
      g_spotlightPos[1] = this.value/100; 
      renderScene(); 
    }
  });
  
  document.getElementById('spotlightPosZ').addEventListener('mousemove', function(ev) { 
    if(ev.buttons == 1) {
      g_spotlightPos[2] = this.value/100; 
      renderScene(); 
    }
  });

  // spotlight direction Sliders
  document.getElementById('spotlightDirX').addEventListener('mousemove', function(ev) { 
    if(ev.buttons == 1) {
      g_spotlightDir[0] = this.value/100; 
      renderScene(); 
    }
  });
  
  document.getElementById('spotlightDirY').addEventListener('mousemove', function(ev) { 
    if(ev.buttons == 1) {
      g_spotlightDir[1] = this.value/100; 
      renderScene(); 
    }
  });
  
  document.getElementById('spotlightDirZ').addEventListener('mousemove', function(ev) { 
    if(ev.buttons == 1) {
      g_spotlightDir[2] = this.value/100; 
      renderScene(); 
    }
  });

  // Spotlight cutoff slider
  document.getElementById('spotlightCutoff').addEventListener('mousemove', function(ev) { 
    if(ev.buttons == 1) {
      // Convert degrees to cosine value
      const degrees = this.value;
      g_spotlightCutoff = Math.cos(degrees * Math.PI / 180); 
      renderScene(); 
    }
  });

  // Spotlight color sliders
  document.getElementById('spotlightColorR').addEventListener('mousemove', function(ev) { 
    if(ev.buttons == 1) {
      g_spotlightColor[0] = this.value/100; 
      renderScene(); 
    }
  });
  
  document.getElementById('spotlightColorG').addEventListener('mousemove', function(ev) { 
    if(ev.buttons == 1) {
      g_spotlightColor[1] = this.value/100; 
      renderScene(); 
    }
  });
  
  document.getElementById('spotlightColorB').addEventListener('mousemove', function(ev) { 
    if(ev.buttons == 1) {
      g_spotlightColor[2] = this.value/100; 
      renderScene(); 
    }
  });


}

//==================== Create visible 3D objects in the world ========================//
//==================== Render the scene ========================//
function renderScene() {
  // Set up matrices and clear buffer
  var globalRotMat = new Matrix4();
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, camera.projectionMatrix.elements);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  // Update camera matrices if needed
  if (camera._viewNeedsUpdate) {
    camera.updateViewMatrix();
    gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);
  }
  if (camera._projectionNeedsUpdate) {
    camera.updateProjectionMatrix();
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, camera.projectionMatrix.elements);
  }

  //spotlight uniforms
  gl.uniform1i(u_spotlightOn, g_spotlightOn ? 1 : 0);
  gl.uniform3fv(u_spotlightPos, g_spotlightPos);
  
  //normalize the Spotlight direction
  let dirLength = Math.sqrt(
    g_spotlightDir[0] * g_spotlightDir[0] + 
    g_spotlightDir[1] * g_spotlightDir[1] + 
    g_spotlightDir[2] * g_spotlightDir[2]
  );
  
  if (dirLength > 0) {
    gl.uniform3f(
      u_spotlightDir, 
      g_spotlightDir[0] / dirLength,
      g_spotlightDir[1] / dirLength,
      g_spotlightDir[2] / dirLength
    );
  } else {
    gl.uniform3f(u_spotlightDir, 0, -1, 0);
  }
  
  gl.uniform1f(u_spotlightCutoff, g_spotlightCutoff);
  gl.uniform3fv(u_spotlightColor, g_spotlightColor);


    
  g_worldObjects = [];
  gl.uniform1i(u_isWall, 0);

  //ground
  const ground = new Cube(-2);
  ground.color = [0.55, 0.35, 0.2, 1.0];
  const groundMatrix = new Matrix4();
  groundMatrix.setTranslate(-1.25, -0.7, -1.25);
  groundMatrix.scale(2.5, 0.1, 2.5);
  ground.matrix = groundMatrix;
  ground.isWall = false;
  g_worldObjects.push(ground);

  //Ssky box
  const sky = new Cube(-2);
  sky.color = [0.6, 0.8, 1.0, 1.0];
  const skyMatrix = new Matrix4();
  skyMatrix.translate(-1.25, -0.7, -1.25);
  skyMatrix.scale(2.5 , 2.5, 2.5);
  sky.matrix = skyMatrix;
  sky.isWall = true;
  g_worldObjects.push(sky);


  //box
  const rightWall = new Cube(0);
  const rightWallMatrix = new Matrix4();
  rightWallMatrix.setTranslate(0.3, -0.56, -1);
  rightWallMatrix.scale(0.25, 0.25, 0.25);
  rightWall.matrix = rightWallMatrix;
  rightWall.isWall = false;
  g_worldObjects.push(rightWall);

  // Sphere
  const sphere = new Sphere(0.2, 5, 5);  // radius, widthSegments, heightSegments
  const sphereMatrix = new Matrix4();
  sphereMatrix.setTranslate(-0.3, 0.1, -1); 
  sphere.matrix = sphereMatrix;
  sphere.isWall = false;
  g_worldObjects.push(sphere);

  //==== PENGUIN ====//
  //g_penguins.push(new Penguin(0, -0.2, -0.8));
  //g_penguins[0].rotation[1] = 180;// Rotate
  //g_penguins[0].scale = [0.25, 0.25, 0.25];

  // Add all penguins to world objects
  //g_penguins.forEach(penguin => g_worldObjects.push(penguin));
  const penguin = new Penguin(0, -0.4, -0.7);
  penguin.rotation[1] = 180; // Rotate
  penguin.scale = [0.25, 0.25, 0.25];
  penguin.isWall = false;
  g_worldObjects.push(penguin);

  gl.uniform1i(u_lightOn, g_lightingEnabled ? 1 : 0);
  gl.uniform3fv(u_lightPos, g_lightPos);
  gl.uniform3f(u_cameraPos, camera.eye.elements[0], camera.eye.elements[1], camera.eye.elements[2]);
  gl.uniform3fv(u_lightColor, g_lightColor);

  // Render all objects EXCEPT the light marker first
  // for(let obj of g_worldObjects) {
  //   obj.render();
  // }

  for(let obj of g_worldObjects) {
    // Set the isWall flag before rendering
    gl.uniform1i(u_isWall, obj.isWall ? 1 : 0);
    
    if (g_normalOn && obj.textureNum !== undefined) {
      const originalTexture = obj.textureNum;
      obj.textureNum = -3;
      obj.render();
      obj.textureNum = originalTexture;
    } else {
      obj.render();
    }
  }

  gl.uniform1i(u_isWall, 0);

  
  // Draw light marker last so it's always visible
  const light = new Cube(-2);
  light.color = [1.0, 1.0, 0.0, 1.0]; // Bright yellow
  const lightMatrix = new Matrix4();
  lightMatrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  lightMatrix.scale(0.05, 0.05, 0.05); // Make it smaller for better visual cue
  lightMatrix.translate(0.1, 0.1, 0.1);
  light.matrix = lightMatrix;
  light.render();


  if (g_spotlightOn) {
    // Spotlight marker
    const spotlightMarker = new Cube(-2);
    spotlightMarker.color = g_spotlightColor.concat(1.0);
    const markerMatrix = new Matrix4();
    markerMatrix.translate(g_spotlightPos[0], g_spotlightPos[1], g_spotlightPos[2]);
    markerMatrix.scale(0.05, 0.05, 0.05);
    markerMatrix.translate(0.1, 0.1, 0.1);
    spotlightMarker.matrix = markerMatrix;
    spotlightMarker.render();
    
    //draw line to show the spotlight direction
    const dirIndicator = new Cube(-2);
    dirIndicator.color = g_spotlightColor.concat(1.0);
    const dirMatrix = new Matrix4();
    dirMatrix.translate(g_spotlightPos[0], g_spotlightPos[1], g_spotlightPos[2]);
    
    //Rotation matrix so it can align with spotlight direction
    const up = [0, 1, 0];
    const dir = [g_spotlightDir[0], g_spotlightDir[1], g_spotlightDir[2]];
    
    //normalized direction
    if (dirLength > 0) {
      dirMatrix.translate(
        0.1 * dir[0] / dirLength,
        0.1 * dir[1] / dirLength,
        0.1 * dir[2] / dirLength
      );
    }
    
    dirMatrix.scale(0.01, 0.2, 0.01);
    dirIndicator.matrix = dirMatrix;
    dirIndicator.render();
  }


  // Calculate FPS
  var duration = performance.now() - startTime;
  sendTextToHTML("ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numd");
  startTime = performance.now();
}



//==================== Animation tick ========================//
function tick(){
  g_seconds = performance.now()/1000.0-g_startTime;
  updateAnimationAngles();
  
  //Update and render scene
  renderScene();
  requestAnimationFrame(tick);
}

function updateAnimationAngles(){
  // Make light move in a circular path in the XZ plane
  g_lightPos[0] = Math.cos(g_seconds *0.5);
  //g_lightPos[2] = Math.sin(g_seconds *0.5);

}

//==================== Mouse click and drag handler for camera rotation ========================//
function click(ev) {
  let curent_mouse_pos = [ev.clientX, ev.clientY];

  if (pre_mouse_pos != null) {
      let movement_x = (curent_mouse_pos[0] - pre_mouse_pos[0]);
      let movement_y = (curent_mouse_pos[1] - pre_mouse_pos[1]) / 2;

      global_angle_y = Math.max(-85, Math.min(85, global_angle_y - movement_y));
      global_angle_x -= movement_x;
      
      camera.rotate(global_angle_y, global_angle_x);
  }

  if (ev.buttons == 1) {
      pre_mouse_pos = curent_mouse_pos;
  } else {
      pre_mouse_pos = null;
  }
  
  renderScene();
}

//==================== Convert mouse coordinates to WebGL coordinate system ========================//
//Take out the event click and return it in WebGL coordinates
function convertCoordinatesEventToGL(ev){
  var x = ev.clientX; // x coordinate mouse pointer
  var y = ev.clientY; // y coordinate mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  return([x,y]);
}

//==================== Display text in an HTML element ========================//
let startTime = performance.now();
function sendTextToHTML(text, htmlID){
  var htmlElm = document.getElementById(htmlID);
  if(!htmlElm){
    console.log("Failed to get" + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}
