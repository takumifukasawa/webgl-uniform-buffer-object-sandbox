import {createShader, createVertexArrayObjectWrapper} from "./js/webgl-utilities.js";

const canvas = document.createElement('canvas');

canvas.width = 512;
canvas.height = 512;
document.getElementById('js-wrapper').appendChild(canvas);

const gl = canvas.getContext('webgl2');
if (!gl) {
    console.error('WebGL2 is not supported in your browser');
}

const vertexShaderText = `#version 300 es

in vec3 position;
in vec3 color;

out vec3 vColor;

void main() {
    vColor = color;
    gl_Position = vec4(position, 1.0);
}
`;

const fragmentShaderText = `#version 300 es

precision mediump float;

in vec3 vColor;

out vec4 color;

void main() {
    color = vec4(vColor, 1.0);
}
`;

const shader = createShader(gl, vertexShaderText, fragmentShaderText);

const vaoWrapper = createVertexArrayObjectWrapper(gl,
    [
        // position
        {
            data: new Float32Array([
                -0.5, -0.5, 0.0,
                0.5, -0.5, 0.0,
                0.0, 0.5, 0.0
            ]),
            location: 0,
            size: 3,
            usage: gl.STATIC_DRAW
        },
        // color
        {
            data: new Float32Array([
                1.0, 0.0, 0.0,
                0.0, 1.0, 0.0,
                0.0, 0.0, 1.0
            ]),
            location: 1,
            size: 3,
            usage: gl.STATIC_DRAW
        }
    ]
);

gl.clearColor(0.0, 0.0, 0.0, 1.0);

gl.clear(gl.COLOR_BUFFER_BIT);

gl.useProgram(shader);

gl.bindVertexArray(vaoWrapper.vao);

gl.drawArrays(gl.TRIANGLES, 0, 3);

gl.bindVertexArray(null);

gl.useProgram(null);

console.log('done');
