//
// ref:
// https://gist.github.com/jialiang/2880d4cc3364df117320e8cb324c2880
// https://wgld.org/d/webgl2/w009.html 
//

import {
    createShaderWrapper,
    createVertexArrayObjectWrapper,
    createUniformBufferObjectWrapper
} from "./js/webgl-utilities.js";

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

// layout (std140) uniform Data {
//     float time;
// } uData;

uniform Settings {
    float uTime;
    vec2 uOffset;
};

uniform Data {
    float uData;
};

uniform float uHoge;

void main() {
    vColor = color;
    vec3 p = position;
    // p.xy *= (.8 + sin(Data.time * 4.) * .2);
    p.xy *= (.8 + sin(uTime * 2.) * .2);
    p.xy += uOffset.xy;
    gl_Position = vec4(p, 1.0);
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

const shaderWrapper = createShaderWrapper(gl, vertexShaderText, fragmentShaderText);

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

const blockName = "Settings";

// シェーダー内の uniform buffer の index を取得
// 記述順によって決まることに注意
const blockIndex = gl.getUniformBlockIndex(
    shaderWrapper.program,
    blockName
);

// シェーダー内の uniform block の byte数を取得。指定した block を参照する
const blockSize = gl.getActiveUniformBlockParameter(
    shaderWrapper.program,
    blockIndex,
    gl.UNIFORM_BLOCK_DATA_SIZE
);

console.log(`[blockIndex] ${blockIndex}, [blockSize] ${blockSize}`);

// const uboWrapper = createUniformBufferObjectWrapper(gl, [
//     {
//         data: blockSize,
//         // data: new Float32Array([0]),
//         usage: gl.DYNAMIC_DRAW
//     }
// ]);

const uboWrapper = createUniformBufferObjectWrapper(gl, blockSize);

gl.bindBufferBase(gl.UNIFORM_BUFFER, blockIndex, uboWrapper.ubo);

const uboVariableNames = ["uTime", "uOffset"];

console.log(`[uboVariableNames] ${uboVariableNames}`);

const uboVariableIndices = gl.getUniformIndices(
    shaderWrapper.program,
    uboVariableNames
);

console.log(`[uboVariableIndices] ${uboVariableIndices}`);

const uniformCount = gl.getProgramParameter(shaderWrapper.program, gl.ACTIVE_UNIFORMS);
console.log(`[uniformCount] ${uniformCount}`);

// シェーダー内の uniform の offset(byte) を取得
// wip: 2つめの uniform buffer の最初の要素は 0?
// また、floatなら必ず16byte分（vec4分）offsetがずれる？
const uboVariableOffsets = gl.getActiveUniforms(
    shaderWrapper.program,
    uboVariableIndices,
    gl.UNIFORM_OFFSET
);

console.log(`[uboVariableOffsets] ${uboVariableOffsets}`);

const uboVariableInfo = [];

uboVariableNames.forEach((name, index) => {
    uboVariableInfo.push({
        name,
        index: uboVariableIndices[index],
        offset: uboVariableOffsets[index]
    });
});

uboVariableInfo.forEach((info) => {
    console.log(`[uboVariableInfo] name: ${info.name}, index: ${info.index}, offset: ${info.offset}`);
});

// uboWrapper.bindBufferBase(0);
// gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, uboWrapper.ubo);

gl.uniformBlockBinding(
    shaderWrapper.program,
    // gl.getUniformBlockIndex(shaderWrapper.program, blockName),
    blockIndex,
    0
);

const tick = (time) => {

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.clear(gl.COLOR_BUFFER_BIT);

    shaderWrapper.bindProgram();

    vaoWrapper.bind();

    uboWrapper.bind();

    gl.bufferSubData(
        gl.UNIFORM_BUFFER,
        uboVariableInfo[0].offset,
        new Float32Array([time / 1000])
    );
    gl.bufferSubData(
        gl.UNIFORM_BUFFER,
        uboVariableInfo[1].offset,
        new Float32Array([
            Math.cos(time / 1000) * .4,
            Math.sin(time / 1000) * .4
        ])
    );
    // gl.bufferData(gl.UNIFORM_BUFFER, new Float32Array([time / 1000]), gl.DYNAMIC_DRAW);
    uboWrapper.unbind();

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    vaoWrapper.unbind();

    shaderWrapper.unbindProgram();

    window.requestAnimationFrame(tick);
}
window.requestAnimationFrame(tick);
