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

const vertexShaderTextTriangle1 = `#version 300 es

in vec3 position;
in vec3 color;

out vec3 vColor;

// layout (std140) uniform Data {
//     float time;
// } uData;

layout (std140) uniform Engine {
    float uTime;
    vec3 uTranslate;
    vec3 uScale;
};

layout (std140) uniform Surface {
    vec3 uColor;
};

void main() {
    vColor = color;
    vec3 p = position;
    // p.xy *= (.8 + sin(Data.time * 4.) * .2);
    p.xy *= uScale.xy;
    p.xy *= (.8 + sin(uTime * 2.) * .2);
    p.xy += uTranslate.xy;
    p.x -= .25;
    gl_Position = vec4(p, 1.0);
}
`;

const fragmentShaderTextTriangle1 = `#version 300 es

precision highp float;

in vec3 vColor;

out vec4 color;

layout (std140) uniform Surface {
    vec3 uColor;
};

void main() {
    color = vec4(vColor, 1.0);
    // color = vec4(uColor, 1.0);
}
`;


const vertexShaderTextTriangle2 = `#version 300 es

in vec3 position;
in vec3 color;

out vec3 vColor;

// layout (std140) uniform Data {
//     float time;
// } uData;

// NOTE: あえて surface, engine の順にしてみる
// layout (std140) uniform Surface {
//     vec3 uColor;
// };

// layout (std140) uniform Engine {
//     float uTime;
//     vec3 uTranslate;
//     vec3 uScale;
// };


void main() {
    vColor = color;
    vec3 p = position;
    // // p.xy *= (.8 + sin(Data.time * 4.) * .2);
    // p.xy *= uScale.xy;
    // p.xy *= (.8 + sin(uTime * 2.) * .2);
    // p.xy += uTranslate.xy;
    p.x += .25;
    gl_Position = vec4(p, 1.0);
}
`;

const fragmentShaderTextTriangle2 = `#version 300 es

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

const shaderWrapperTriangle1 = createShaderWrapper(gl, vertexShaderTextTriangle1, fragmentShaderTextTriangle1);

const vaoWrapperTriangle1 = createVertexArrayObjectWrapper(gl,
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

const shaderWrapperTriangle2 = createShaderWrapper(gl, vertexShaderTextTriangle2, fragmentShaderTextTriangle2);

const vaoWrapperTriangle2 = createVertexArrayObjectWrapper(gl,
    [
        // position
        {
            data: new Float32Array([
                -0.5, 0.5, 0.0,
                0.5, 0.5, 0.0,
                0.0, -0.5, 0.0
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

const blockNameEngine = "Engine";
const blockNameSurface = "Surface";

const bindingPointEngine = 0;
const bindingPointSurface = 1;

// シェーダー内の uniform buffer の index を取得
// 記述順によって決まる？
const blockIndexEngineWithTriangle1 = gl.getUniformBlockIndex(
    shaderWrapperTriangle1.program,
    blockNameEngine
);

// シェーダー内の uniform block の byte数を取得。指定した block を参照する
const blockSizeEngineWithTriangle1 = gl.getActiveUniformBlockParameter(
    shaderWrapperTriangle1.program,
    blockIndexEngineWithTriangle1,
    gl.UNIFORM_BLOCK_DATA_SIZE
);

// シェーダー内の uniform buffer の index を取得
// 記述順によって決まる？
const blockIndexSurfaceWithTriangle1 = gl.getUniformBlockIndex(
    shaderWrapperTriangle1.program,
    blockNameSurface
);

// シェーダー内の uniform block の byte数を取得。指定した block を参照する
const blockSizeSurfaceWithTriangle1 = gl.getActiveUniformBlockParameter(
    shaderWrapperTriangle1.program,
    blockIndexSurfaceWithTriangle1,
    gl.UNIFORM_BLOCK_DATA_SIZE
);

console.log(`blockIndexEngineWithTriangle1: ${blockIndexEngineWithTriangle1}`);
console.log(`blockSizeEngineWithTriangle1: ${blockSizeEngineWithTriangle1}`);
console.log(`blockIndexSurfaceWithTriangle1: ${blockIndexSurfaceWithTriangle1}`);
console.log(`blockSizeSurfaceWithTriangle1: ${blockSizeSurfaceWithTriangle1}`);

// // シェーダー内の uniform buffer の index を取得
// // 記述順によって決まる？
// const blockIndexEngineWithTriangle2 = gl.getUniformBlockIndex(
//     shaderWrapperTriangle2.program,
//     blockNameEngine
// );

// シェーダー内の uniform buffer の index を取得
// 記述順によって決まる？
const blockIndexSurfaceWithTriangle2 = gl.getUniformBlockIndex(
    shaderWrapperTriangle2.program,
    blockNameSurface
);

// // シェーダー内の uniform block の byte数を取得。指定した block を参照する
// const blockSizeEngineWithTriangle2 = gl.getActiveUniformBlockParameter(
//     shaderWrapperTriangle2.program,
//     blockIndexEngineWithTriangle2,
//     gl.UNIFORM_BLOCK_DATA_SIZE
// );

// シェーダー内の uniform block の byte数を取得。指定した block を参照する
const blockSizeSurfaceWithTriangle2 = gl.getActiveUniformBlockParameter(
    shaderWrapperTriangle2.program,
    blockIndexSurfaceWithTriangle2,
    gl.UNIFORM_BLOCK_DATA_SIZE
);

// console.log(`blockIndexEngineWithTriangle2: ${blockIndexEngineWithTriangle2}`);
console.log(`blockIndexSurfaceWithTriangle2: ${blockIndexSurfaceWithTriangle2}`);
// console.log(`blockSizeEngineWithTriangle2: ${blockSizeEngineWithTriangle2}`);
console.log(`blockSizeSurfaceWithTriangle2: ${blockSizeSurfaceWithTriangle2}`);

const uboWrapperEngine = createUniformBufferObjectWrapper(
    gl,
    blockSizeEngineWithTriangle1, // 1つ目のシェーダーをもとにblocksizeを渡す
    bindingPointEngine // 1つ目のシェーダーをもとにbindingPointを渡す
);

const uboWrapperSurface = createUniformBufferObjectWrapper(
    gl,
    blockSizeSurfaceWithTriangle1, // 1つ目のシェーダーをもとにblocksizeを渡す
    bindingPointSurface // 1つ目のシェーダーをもとにbindingPointを渡す
);

const variableNamesEngine = ["uTime", "uTranslate", "uScale"];
const variableNamesSurface = ["uColor"];

// シェーダー内の uniform: engine の index を取得
// 1個目のシェーダーを元にする
const uboIndicesEngine = gl.getUniformIndices(
    shaderWrapperTriangle1.program,
    variableNamesEngine
);

// シェーダー内の uniform: surface の index を取得
// 1個目のシェーダーを元にする
const uboVariableIndicesSurface = gl.getUniformIndices(
    shaderWrapperTriangle1.program,
    variableNamesSurface
);

console.log(`uboIndicesEngine: ${uboIndicesEngine}`);
console.log(`uboVariableIndicesSurface: ${uboVariableIndicesSurface}`);

// シェーダー内の uniform: engine の offset(byte) を取得
// 1個目のシェーダーを元にする
const uboOffsetsEngine = gl.getActiveUniforms(
    shaderWrapperTriangle1.program,
    uboIndicesEngine,
    gl.UNIFORM_OFFSET
);

// シェーダー内の uniform: surface の offset(byte) を取得
// 1個目のシェーダーを元にする
const uboOffsetsSurface = gl.getActiveUniforms(
    shaderWrapperTriangle1.program,
    uboVariableIndicesSurface,
    gl.UNIFORM_OFFSET
);

console.log(`uboOffsetsEngine: ${uboOffsetsEngine}`);
console.log(`uboOffsetsSurface: ${uboOffsetsSurface}`);

const uboVariableInfoEngine = variableNamesEngine.map((name, i) => {
    const index = uboIndicesEngine[i];
    const offset = uboOffsetsEngine[i];
    console.log(`uboVariableInfoEngine - name: ${name}, index: ${index}, offset: ${offset}`);
    return {
        name,
        offset: uboOffsetsEngine[i]
    }
});

const uboVariableInfoSurface = variableNamesSurface.map((name, i) => {
    const index = uboVariableIndicesSurface[i];
    const offset = uboOffsetsSurface[i];
    console.log(`uboVariableInfoSurface - name: ${name}, index: ${index}, offset: ${offset}`);
    return {
        name,
        offset: uboOffsetsSurface[i]
    }
});
// 
// const variableInfoEngineWithTriangle2 = variableNamesEngine.map((name, i) => {
//     const index = variableIndicesEngineWithTriangle2[i];
//     const offset = variableOffsetsEngineWithTriangle2[i];
//     console.log(`variableInfoEngineWithTriangle2 - name: ${name}, index: ${index}, offset: ${offset}`);
//     return {
//         name,
//         // index: variableIndicesEngineWithTriangle2[i],
//         offset: variableOffsetsEngineWithTriangle2[i]
//     }
// });
// 
// const variableInfoSurfaceWithTriangle2 = variableNamesSurface.map((name, i) => {
//     const index = variableIndicesSurfaceWithTriangle2[i];
//     const offset = variableOffsetsSurfaceWithTriangle2[i];
//     console.log(`variableInfoSurfaceWithTriangle2 - name: ${name}, index: ${index}, offset: ${offset}`);
//     return {
//         name,
//         // index: variableIndicesSurfaceWithTriangle2[i],
//         offset: variableOffsetsSurfaceWithTriangle2[i]
//     }
// });

// shaderとuboを紐づけ. binding point, block index を元にする
gl.uniformBlockBinding(
    shaderWrapperTriangle1.program,
    blockIndexEngineWithTriangle1,
    bindingPointEngine
);

gl.uniformBlockBinding(
    shaderWrapperTriangle1.program,
    blockIndexSurfaceWithTriangle1,
    bindingPointSurface
);

// gl.uniformBlockBinding(
//     shaderWrapperTriangle2.program,
//     blockIndexEngineWithTriangle2,
//     bindingPointEngine
// );

gl.uniformBlockBinding(
    shaderWrapperTriangle2.program,
    blockIndexSurfaceWithTriangle2,
    bindingPointSurface
);

const tick = (time) => {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.viewport(0, 0, width, height);

    //
    // uniform
    //

    uboWrapperEngine.bind();
    gl.bufferSubData(
        gl.UNIFORM_BUFFER,
        // 0,
        uboVariableInfoEngine.find(info => info.name === "uTime").offset,
        new Float32Array([time / 1000]),
        0
    );
    gl.bufferSubData(
        gl.UNIFORM_BUFFER,
        // 16,
        uboVariableInfoEngine.find(info => info.name === "uTranslate").offset,
        new Float32Array([
            0,
            Math.sin(time / 1000) * .4,
            0
        ]),
        0
    );
    gl.bufferSubData(
        gl.UNIFORM_BUFFER,
        // 32,
        uboVariableInfoEngine.find(info => info.name === "uScale").offset,
        new Float32Array([
            .5,
            .5,
            .5
        ]),
        0
    );
    uboWrapperEngine.unbind();

    uboWrapperSurface.bind();
    gl.bufferSubData(
        gl.UNIFORM_BUFFER,
        // 0,
        uboVariableInfoSurface.find(info => info.name === "uColor").offset,
        new Float32Array([
            // .6 + Math.sin(time * 1.2) * .4,
            // .6 + Math.cos(time * 1.3) * .4,
            // .6 + Math.sin(time * 1.4) * .4
            0,
            1,
            0
        ]),
        0
    );
    uboWrapperSurface.unbind();

    //
    // triangle1
    //

    shaderWrapperTriangle1.bindProgram();

    vaoWrapperTriangle1.bind();

    // gl.bindBufferRange(
    //     gl.UNIFORM_BUFFER,
    //     bindingPointEngine,
    //     uboWrapperEngine.ubo,
    //     0,
    //     blockSizeEngineWithTriangle1
    // )
    // gl.bindBufferRange(
    //     gl.UNIFORM_BUFFER,
    //     bindingPointSurface,
    //     uboWrapperSurface.ubo,
    //     0,
    //     blockSizeSurfaceWithTriangle1
    // )

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    vaoWrapperTriangle1.unbind();

    shaderWrapperTriangle1.unbindProgram();

    //
    // triangle2
    //

    shaderWrapperTriangle2.bindProgram();

    vaoWrapperTriangle2.bind();

    // // gl.bindBufferRange(
    // //     gl.UNIFORM_BUFFER,
    // //     blockIndexEngineWithTriangle2,
    // //     uboWrapperEngine.ubo,
    // //     0,
    // //     blockSizeEngineWithTriangle2
    // // )
    // gl.bindBufferRange(
    //     gl.UNIFORM_BUFFER,
    //     bindingPointSurface,
    //     uboWrapperSurface.ubo,
    //     0,
    //     blockSizeSurfaceWithTriangle2
    // )

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    vaoWrapperTriangle2.unbind();

    shaderWrapperTriangle2.unbindProgram();

    //
    // loop
    //

    window.requestAnimationFrame(tick);
}
window.requestAnimationFrame(tick);
