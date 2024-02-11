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

uniform Engine {
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
    p.x -= .25;
    gl_Position = vec4(p, 1.0);
}
`;

const fragmentShaderTextTriangle1 = `#version 300 es

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


const vertexShaderTextTriangle2 = `#version 300 es

in vec3 position;
in vec3 color;

out vec3 vColor;

// layout (std140) uniform Data {
//     float time;
// } uData;

uniform Surface {
    vec3 uColor;
};


uniform Engine {
    float uTime;
    vec2 uOffset;
};


void main() {
    vColor = color;
    vec3 p = position;
    // p.xy *= (.8 + sin(Data.time * 4.) * .2);
    p.xy *= (.8 + sin(uTime * 2.) * .2);
    p.xy += uOffset.xy;
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
    // color = vec4(vColor, 1.0);
    color = vec4(uColor, 1.0);
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

// シェーダー内の uniform buffer の index を取得
// 記述順によって決まる？
const blockIndexSurfaceWithTriangle1 = gl.getUniformBlockIndex(
    shaderWrapperTriangle1.program,
    blockNameSurface
);


// シェーダー内の uniform block の byte数を取得。指定した block を参照する
const blockSizeEngineWithTriangle1 = gl.getActiveUniformBlockParameter(
    shaderWrapperTriangle1.program,
    blockIndexEngineWithTriangle1,
    gl.UNIFORM_BLOCK_DATA_SIZE
);

// シェーダー内の uniform block の byte数を取得。指定した block を参照する
const blockSizeSurfaceWithTriangle1 = gl.getActiveUniformBlockParameter(
    shaderWrapperTriangle1.program,
    blockIndexSurfaceWithTriangle1,
    gl.UNIFORM_BLOCK_DATA_SIZE
);

console.log(`blockIndexEngineWithTriangle1: ${blockIndexEngineWithTriangle1}`);
console.log(`blockIndexSurfaceWithTriangle1: ${blockIndexSurfaceWithTriangle1}`);
console.log(`blockSizeEngineWithTriangle1: ${blockSizeEngineWithTriangle1}`);
console.log(`blockSizeSurfaceWithTriangle1: ${blockSizeSurfaceWithTriangle1}`);

// シェーダー内の uniform buffer の index を取得
// 記述順によって決まる？
const blockIndexEngineWithTriangle2 = gl.getUniformBlockIndex(
    shaderWrapperTriangle2.program,
    blockNameEngine
);


// シェーダー内の uniform buffer の index を取得
// 記述順によって決まる？
const blockIndexSurfaceWithTriangle2 = gl.getUniformBlockIndex(
    shaderWrapperTriangle2.program,
    blockNameSurface
);


// シェーダー内の uniform block の byte数を取得。指定した block を参照する
const blockSizeEngineWithTriangle2 = gl.getActiveUniformBlockParameter(
    shaderWrapperTriangle2.program,
    blockIndexEngineWithTriangle2,
    gl.UNIFORM_BLOCK_DATA_SIZE
);

// シェーダー内の uniform block の byte数を取得。指定した block を参照する
const blockSizeSurfaceWithTriangle2 = gl.getActiveUniformBlockParameter(
    shaderWrapperTriangle2.program,
    blockIndexSurfaceWithTriangle2,
    gl.UNIFORM_BLOCK_DATA_SIZE
);

console.log(`blockIndexEngineWithTriangle2: ${blockIndexEngineWithTriangle2}`);
console.log(`blockIndexSurfaceWithTriangle2: ${blockIndexSurfaceWithTriangle2}`);
console.log(`blockSizeEngineWithTriangle2: ${blockSizeEngineWithTriangle2}`);
console.log(`blockSizeSurfaceWithTriangle2: ${blockSizeSurfaceWithTriangle2}`);

const uboWrapperEngine = createUniformBufferObjectWrapper(
    gl,
    // blockIndexEngineWithTriangle1,
    // blockSizeEngineWithTriangle1
    // shaderWrapperTriangle1.program,
    // "Engine",
    // ["uTime", "uOffset"],
    // 0
);
uboWrapperEngine.bind();
gl.bufferData(gl.UNIFORM_BUFFER, new Float32Array(4 * (1 + 4)), gl.DYNAMIC_DRAW);
gl.bindBufferBase(gl.UNIFORM_BUFFER, bindingPointEngine, uboWrapperEngine.ubo);
uboWrapperEngine.unbind();

const uboWrapperSurface = createUniformBufferObjectWrapper(
    gl,
    // blockIndexSurfaceWithTriangle1,
    // blockSizeSurfaceWithTriangle1
    // shaderWrapperTriangle1.program,
    // "Surface",
    // ["uColor"],
    // 1
);
uboWrapperSurface.bind();
gl.bufferData(gl.UNIFORM_BUFFER, new Float32Array(4 * 1), gl.DYNAMIC_DRAW);
gl.bindBufferBase(gl.UNIFORM_BUFFER, bindingPointSurface, uboWrapperSurface.ubo);
uboWrapperSurface.unbind();

// const variableNamesEngine = ["uTime", "uOffset"];
// const variableNamesSurface = ["uColor"];
// 
// const variableIndicesEngineWithTriangle1 = gl.getUniformIndices(
//     shaderWrapperTriangle1.program,
//     variableNamesEngine
// );
// 
// const variableIndicesSurfaceWithTriangle1 = gl.getUniformIndices(
//     shaderWrapperTriangle1.program,
//     variableNamesSurface
// );
// 
// const variableIndicesEngineWithTriangle2 = gl.getUniformIndices(
//     shaderWrapperTriangle2.program,
//     variableNamesEngine
// );
// 
// const variableIndicesSurfaceWithTriangle2 = gl.getUniformIndices(
//     shaderWrapperTriangle2.program,
//     variableNamesSurface
// );
// 
// console.log(`variableIndicesEngineWithTriangle1: ${variableIndicesEngineWithTriangle1}`);
// console.log(`variableIndicesSurfaceWithTriangle1: ${variableIndicesSurfaceWithTriangle1}`);
// console.log(`variableIndicesEngineWithTriangle2: ${variableIndicesEngineWithTriangle2}`);
// console.log(`variableIndicesSurfaceWithTriangle2: ${variableIndicesSurfaceWithTriangle2}`);

// // シェーダー内の uniform の offset(byte) を取得
// // wip: 2つめの uniform buffer の最初の要素は 0?
// // TODO: ずれるoffset量と型の関係が不明
// const variableOffsetsEngineWithTriangle1 = gl.getActiveUniforms(
//     shaderWrapperTriangle1.program,
//     variableIndicesEngineWithTriangle1,
//     gl.UNIFORM_OFFSET
// );

// // シェーダー内の uniform の offset(byte) を取得
// // wip: 2つめの uniform buffer の最初の要素は 0?
// // TODO: ずれるoffset量と型の関係が不明
// const variableOffsetsSurfaceWithTriangle1 = gl.getActiveUniforms(
//     shaderWrapperTriangle1.program,
//     variableIndicesSurfaceWithTriangle1,
//     gl.UNIFORM_OFFSET
// );
// 
// const variableOffsetsEngineWithTriangle2 = gl.getActiveUniforms(
//     shaderWrapperTriangle2.program,
//     variableIndicesEngineWithTriangle2,
//     gl.UNIFORM_OFFSET
// );
// 
// const variableOffsetsSurfaceWithTriangle2 = gl.getActiveUniforms(
//     shaderWrapperTriangle2.program,
//     variableIndicesSurfaceWithTriangle2,
//     gl.UNIFORM_OFFSET
// );

// console.log(`variableOffsetsEngineWithTriangle1: ${variableOffsetsEngineWithTriangle1}`);
// console.log(`variableOffsetsSurfaceWithTriangle1: ${variableOffsetsSurfaceWithTriangle1}`);
// console.log(`variableOffsetsEngineWithTriangle2: ${variableOffsetsEngineWithTriangle2}`);
// console.log(`variableOffsetsSurfaceWithTriangle2: ${variableOffsetsSurfaceWithTriangle2}`);

// const variableInfoEngineWithTriangle1 = variableNamesEngine.map((name, i) => {
//     const index = variableIndicesEngineWithTriangle1[i];
//     const offset = variableOffsetsEngineWithTriangle1[i];
//     console.log(`variableInfoEngineWithTriangle1 - name: ${name}, index: ${index}, offset: ${offset}`);
//     return {
//         name,
//         // index: variableIndicesEngineWithTriangle1[i],
//         offset: variableOffsetsEngineWithTriangle1[i]
//     }
// });
// 
// const variableInfoSurfaceWithTriangle1 = variableNamesSurface.map((name, i) => {
//     const index = variableIndicesSurfaceWithTriangle1[i];
//     const offset = variableOffsetsSurfaceWithTriangle1[i];
//     console.log(`variableInfoSurfaceWithTriangle1 - name: ${name}, index: ${index}, offset: ${offset}`);
//     return {
//         name,
//         // index: variableIndicesSurfaceWithTriangle1[i],
//         offset: variableOffsetsSurfaceWithTriangle1[i]
//     }
// });
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

gl.uniformBlockBinding(
    shaderWrapperTriangle2.program,
    blockIndexEngineWithTriangle2,
    bindingPointSurface
);

gl.uniformBlockBinding(
    shaderWrapperTriangle2.program,
    blockIndexSurfaceWithTriangle2,
    bindingPointEngine
);

const SIZE_OF_FLOAT = 4;
const SIZE_OF_VEC4 = 16;
const SIZE_OF_MAT4 = 64;

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
        0,
        // variableInfoEngineWithTriangle1.find(info => info.name === "uTime").offset,
        new Float32Array([time / 1000])
    );
    gl.bufferSubData(
        gl.UNIFORM_BUFFER,
        SIZE_OF_FLOAT * 2, // TODO: なんで x2?
        // variableInfoEngineWithTriangle1.find(info => info.name === "uOffset").offset,
        new Float32Array([
            0,
            Math.sin(time / 1000) * .4
        ])
    );
    uboWrapperEngine.unbind();
    
    uboWrapperSurface.bind();
    gl.bufferSubData(
        gl.UNIFORM_BUFFER,
        0,
        // variableInfoSurfaceWithTriangle1.find(info => info.name === "uColor").offset,
        new Float32Array([
            // .6 + Math.sin(time * 1.2) * .4,
            // .6 + Math.cos(time * 1.3) * .4,
            // .6 + Math.sin(time * 1.4) * .4
            0,
            1,
            0
        ])
    );
    uboWrapperSurface.unbind();


    //
    // triangle1
    //

    shaderWrapperTriangle1.bindProgram();

    vaoWrapperTriangle1.bind();


    // uboWrapperEngine.bind();
    // gl.bufferSubData(
    //     gl.UNIFORM_BUFFER,
    //     variableInfoEngineWithTriangle1.find(info => info.name === "uTime").offset,
    //     new Float32Array([time / 1000])
    // );
    // gl.bufferSubData(
    //     gl.UNIFORM_BUFFER,
    //     variableInfoEngineWithTriangle1.find(info => info.name === "uOffset").offset,
    //     new Float32Array([
    //         -0.25,
    //         Math.sin(time / 1000) * .4
    //     ])
    // );
    // uboWrapperEngine.unbind();

    // uboWrapperSurface.bind();
    // gl.bufferSubData(
    //     gl.UNIFORM_BUFFER,
    //     variableInfoSurfaceWithTriangle1.find(info => info.name === "uColor").offset,
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
        gl.UNIFORM_BUFFER,
        blockIndexEngineWithTriangle1,
        uboWrapperEngine.ubo,
        0,
        blockSizeEngineWithTriangle1
    )
    gl.bindBufferRange(
        gl.UNIFORM_BUFFER,
        blockIndexSurfaceWithTriangle1,
        uboWrapperSurface.ubo,
        0,
        blockSizeSurfaceWithTriangle1
    )

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    vaoWrapperTriangle1.unbind();

    shaderWrapperTriangle1.unbindProgram();

    //
    // triangle2
    //

    shaderWrapperTriangle2.bindProgram();

    vaoWrapperTriangle2.bind();

    // uboWrapperEngine.bind();
    // gl.bufferSubData(
    //     gl.UNIFORM_BUFFER,
    //     variableInfoEngineWithTriangle2.find(info => info.name === "uTime").offset,
    //     new Float32Array([time / 1000])
    // );
    // gl.bufferSubData(
    //     gl.UNIFORM_BUFFER,
    //     variableInfoEngineWithTriangle2.find(info => info.name === "uOffset").offset,
    //     new Float32Array([
    //         0.25,
    //         Math.cos(time / 1000) * .4
    //     ])
    // );
    // uboWrapperEngine.unbind();

    // uboWrapperSurface.bind();
    // gl.bufferSubData(
    //     gl.UNIFORM_BUFFER,
    //     variableInfoSurfaceWithTriangle2.find(info => info.name === "uColor").offset,
    //     new Float32Array([
    //         // .6 + Math.sin(time * 1.2) * .4,
    //         // .6 + Math.cos(time * 1.3) * .4,
    //         // .6 + Math.sin(time * 1.4) * .4
    //         1,
    //         0,
    //         0
    //     ])
    // );
    // uboWrapperSurface.unbind();

    gl.bindBufferRange(
        gl.UNIFORM_BUFFER,
        blockIndexEngineWithTriangle2,
        uboWrapperEngine.ubo,
        0,
        blockSizeEngineWithTriangle2
    )
    gl.bindBufferRange(
        gl.UNIFORM_BUFFER,
        blockIndexSurfaceWithTriangle2,
        uboWrapperSurface.ubo,
        0,
        blockSizeSurfaceWithTriangle2
    )

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    vaoWrapperTriangle2.unbind();

    shaderWrapperTriangle2.unbindProgram();

    //
    // loop
    //

    window.requestAnimationFrame(tick);
}
window.requestAnimationFrame(tick);
