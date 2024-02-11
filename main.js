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
    // color = vec4(vColor, 1.0);
    color = vec4(uColor, 1.0);
}
`;

const shaderWrapper1 = createShaderWrapper(gl, vertexShaderText, fragmentShaderText);

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

const uboWrapperSettings = createUniformBufferObjectWrapper(
    gl,
    shaderWrapper1.program,
    "Settings",
    ["uTime", "uOffset"],
    0
);

const uboWrapperSurface = createUniformBufferObjectWrapper(
    gl,
    shaderWrapper1.program,
    "Surface",
    ["uColor"],
    1
);

const tick = (time) => {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    gl.viewport(0, 0, width, height);

    shaderWrapper1.bindProgram();

    vaoWrapper.bind();

    uboWrapperSettings.bind();
    uboWrapperSettings.setData(
        "uTime",
        new Float32Array([time / 1000])
    );
    uboWrapperSettings.setData(
        "uOffset",
        new Float32Array([
            Math.cos(time / 1000) * .4,
            Math.sin(time / 1000) * .4
        ])
    );
    uboWrapperSettings.unbind();

    uboWrapperSurface.bind();
    uboWrapperSurface.setData(
        "uColor",
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


    gl.bindBufferRange(
        gl.UNIFORM_BUFFER,
        uboWrapperSettings.blockIndex,
        uboWrapperSettings.ubo,
        0,
        uboWrapperSettings.blockSize
    )
    gl.bindBufferRange(
        gl.UNIFORM_BUFFER,
        uboWrapperSurface.blockIndex,
        uboWrapperSurface.ubo,
        0,
        uboWrapperSurface.blockSize
    )
    
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    vaoWrapper.unbind();

    shaderWrapper1.unbindProgram();

    window.requestAnimationFrame(tick);
}
window.requestAnimationFrame(tick);
