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

const width = 512;
const height = 512;

canvas.width = width;
canvas.height = height;

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

uniform Surface {
    vec3 uColor;
};

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

precision highp float;

in vec3 vColor;

out vec4 color;

uniform Surface {
    vec3 uColor;
};

void main() {
    color = vec4(vColor, 1.0);
    // color = vec4(uColor, 1.0);
}
`;

const triangleShaderWrapper = createShaderWrapper(gl, vertexShaderText, fragmentShaderText);

const triangleVaoWrapper = createVertexArrayObjectWrapper(gl,
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

const blockName1 = "Settings";
const blockName2 = "Surface";

// シェーダー内の uniform buffer の index を取得
// 記述順によって決まる？
const blockIndex1 = gl.getUniformBlockIndex(
    triangleShaderWrapper.program,
    blockName1
);


// シェーダー内の uniform buffer の index を取得
// 記述順によって決まる？
const blockIndex2 = gl.getUniformBlockIndex(
    triangleShaderWrapper.program,
    blockName2
);


// シェーダー内の uniform block の byte数を取得。指定した block を参照する
const blockSize1 = gl.getActiveUniformBlockParameter(
    triangleShaderWrapper.program,
    blockIndex1,
    gl.UNIFORM_BLOCK_DATA_SIZE
);

// シェーダー内の uniform block の byte数を取得。指定した block を参照する
const blockSize2 = gl.getActiveUniformBlockParameter(
    triangleShaderWrapper.program,
    blockIndex2,
    gl.UNIFORM_BLOCK_DATA_SIZE
);

const uboWrapperSettings = createUniformBufferObjectWrapper(
    gl,
    blockIndex1,
    blockSize1
    // triangleShaderWrapper.program,
    // "Settings",
    // ["uTime", "uOffset"],
    // 0
);

const uboWrapperSurface = createUniformBufferObjectWrapper(
    gl,
    blockIndex2,
    blockSize2
    // triangleShaderWrapper.program,
    // "Surface",
    // ["uColor"],
    // 1
);


// TODO: 第二引数は常にグローバルな位置になる？
gl.bindBufferBase(gl.UNIFORM_BUFFER, blockIndex1, uboWrapperSettings.ubo);
// TODO: 第二引数は常にグローバルな位置になる？
gl.bindBufferBase(gl.UNIFORM_BUFFER, blockIndex2, uboWrapperSurface.ubo);


const variableNames1 = ["uTime", "uOffset"];
const variableNames2 = ["uColor"];

const variableIndices1 = gl.getUniformIndices(
    triangleShaderWrapper.program,
    variableNames1
);

const variableIndices2 = gl.getUniformIndices(
    triangleShaderWrapper.program,
    variableNames2
);


// シェーダー内の uniform の offset(byte) を取得
// wip: 2つめの uniform buffer の最初の要素は 0?
// TODO: ずれるoffset量と型の関係が不明
const variableOffsets1 = gl.getActiveUniforms(
    triangleShaderWrapper.program,
    variableIndices1,
    gl.UNIFORM_OFFSET
);

// シェーダー内の uniform の offset(byte) を取得
// wip: 2つめの uniform buffer の最初の要素は 0?
// TODO: ずれるoffset量と型の関係が不明
const variableOffsets2 = gl.getActiveUniforms(
    triangleShaderWrapper.program,
    variableIndices2,
    gl.UNIFORM_OFFSET
);

const variableInfo1 = variableNames1.map((name, i) => {
    const index = variableIndices1[i];
    const offset = variableOffsets1[i];
    console.log(`name: ${name}, index: ${index}, offset: ${offset}`);
    return {
        name,
        index: variableIndices1[i],
        offset: variableOffsets1[i]
    }
});

const variableInfo2 = variableNames2.map((name, i) => {
    const index = variableIndices2[i];
    const offset = variableOffsets2[i];
    console.log(`name: ${name}, index: ${index}, offset: ${offset}`);
    return {
        name,
        index: variableIndices2[i],
        offset: variableOffsets2[i]
    }
});

gl.uniformBlockBinding(
    triangleShaderWrapper.program,
    blockIndex1,
    0 // webgl context で管理する global な index
);

gl.uniformBlockBinding(
    triangleShaderWrapper.program,
    blockIndex2,
    1 // webgl context で管理する global な index
);


const tick = (time) => {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    gl.viewport(0, 0, width, height);

    triangleShaderWrapper.bindProgram();

    triangleVaoWrapper.bind();

    uboWrapperSettings.bind();
    gl.bufferSubData(
        gl.UNIFORM_BUFFER,
        variableInfo1.find(info => info.name === "uTime").offset,
        new Float32Array([time / 1000])
    );
    // uboWrapperSettings.setData(
    //     "uTime",
    //     new Float32Array([time / 1000])
    // );
    gl.bufferSubData(
        gl.UNIFORM_BUFFER,
        variableInfo1.find(info => info.name === "uOffset").offset, 
        new Float32Array([
            Math.cos(time / 1000) * .4,
            Math.sin(time / 1000) * .4
        ])
    );
    // uboWrapperSettings.setData(
    //     "uOffset",
    //     new Float32Array([
    //         Math.cos(time / 1000) * .4,
    //         Math.sin(time / 1000) * .4
    //     ])
    // );
    uboWrapperSettings.unbind();

    // uboWrapperSurface.bind();
    // uboWrapperSurface.setData(
    //     "uColor",
    //     new Float32Array([
    //         // .6 + Math.sin(time * 1.2) * .4,
    //         // .6 + Math.cos(time * 1.3) * .4,
    //         // .6 + Math.sin(time * 1.4) * .4
    //         0,
    //         1,
    //         0
    //     ])
    // );
    // uboWrapperSurface.unbind();


    gl.bindBufferRange(
        // gl.UNIFORM_BUFFER,
        // uboWrapperSettings.blockIndex,
        // uboWrapperSettings.ubo,
        // 0,
        // uboWrapperSettings.blockSize
        gl.UNIFORM_BUFFER,
        blockIndex1,
        uboWrapperSettings.ubo,
        0,
        blockSize1
    )
    gl.bindBufferRange(
        gl.UNIFORM_BUFFER,
        blockIndex2,
        uboWrapperSurface.ubo,
        0,
        blockSize2
    )
    
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    triangleVaoWrapper.unbind();

    triangleShaderWrapper.unbindProgram();

    window.requestAnimationFrame(tick);
}
window.requestAnimationFrame(tick);
