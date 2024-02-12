// --------------------------------------------------------------------

/**
 *
 * @param gl
 * @param vertexShader
 * @param fragmentShader
 * @param transformFeedbackVaryings
 * @returns {WebGLProgram}
 */
export function createShaderWrapper(gl, vertexShader, fragmentShader, transformFeedbackVaryings) {
    const buildErrorInfo = (infoLog, shaderSource, header) => {
        return `${header}
            
---

${infoLog}

---
            
${shaderSource.split("\n").map((line, i) => {
            return `${i + 1}: ${line}`;
        }).join("\n")}       
`;
    };

    //
    // vertex shader
    //

    // create vertex shader  
    const vs = gl.createShader(gl.VERTEX_SHADER);
    // set shader source (string)
    gl.shaderSource(vs, vertexShader);
    // compile vertex shader
    gl.compileShader(vs);
    // check shader info log
    const vsInfo = gl.getShaderInfoLog(vs);
    if (vsInfo.length > 0) {
        const errorInfo = buildErrorInfo(vsInfo, vertexShader, "vertex shader has error");
        throw errorInfo;
    }

    //
    // fragment shader
    //

    // create fragment shader  
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    // set shader source (string)
    gl.shaderSource(fs, fragmentShader);
    // compile fragment shader
    gl.compileShader(fs);
    const fsInfo = gl.getShaderInfoLog(fs);
    // check shader info log
    if (fsInfo.length > 0) {
        const errorInfo = buildErrorInfo(fsInfo, fragmentShader, "fragment shader has error");
        throw errorInfo;
    }

    //
    // program object
    //

    const program = gl.createProgram();

    // attach shaders
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);

    if (transformFeedbackVaryings && transformFeedbackVaryings.length > 0) {
        gl.transformFeedbackVaryings(
            program,
            transformFeedbackVaryings,
            gl.SEPARATE_ATTRIBS // or INTERLEAVED_ATTRIBS
        );
    }

    // program link to gl context
    gl.linkProgram(program);

    // check program info log
    const programInfo = gl.getProgramInfoLog(program);
    if (programInfo.length > 0) {
        throw programInfo;
    }
    
    const bindProgram = () => {
        gl.useProgram(program);
    }
    
    const unbindProgram = () => {
        gl.useProgram(null);
    }

    return {
        program,
        bindProgram,
        unbindProgram
    }
}

/**
 *
 * @param gl
 * @param buffers
 * @returns {WebGLTransformFeedback}
 */
export function createTransformFeedback(gl, buffers) {
    const transformFeedback = gl.createTransformFeedback();
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transformFeedback);
    for (let i = 0; i < buffers.length; i++) {
        const buffer = buffers[i];
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, i, buffer);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

    return transformFeedback;
}

/**
 *
 * @param gl
 * @param attributes
 * @param indicesData
 * @returns {{indices: null, vao: WebGLVertexArrayObject, setBuffer: setBuffer, getBuffers: (function(): *[]), findBuffer: (function(*): WebGLBuffer | AudioBuffer)}}
 */
export function createVertexArrayObjectWrapper(gl, attributes, indicesData) {
    const vao = gl.createVertexArray();
    let ibo;
    let indices = null;

    // name,
    // vbo,
    // usage,
    // location,
    // size,
    // divisor
    const vertices = [];

    const bind = () => {
        gl.bindVertexArray(vao);
    }
    
    const unbind = () => {
        gl.bindVertexArray(null);
    }

    const getBuffers = () => {
        return vertices.map(({vbo}) => vbo);
    }

    const setBuffer = (name, newBuffer) => {
        const target = vertices.find(elem => elem.name === name);
        target.buffer = newBuffer;
        gl.bindVertexArray(vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, newBuffer);
        gl.enableVertexAttribArray(target.location);
        gl.vertexAttribPointer(target.location, target.size, gl.FLOAT, false, 0, 0);
        // divisorは必要ない
        // if (target.divisor) {
        //     gl.vertexAttribDivisor(target.location, target.divisor);
        // }
        gl.bindVertexArray(null);
    }

    const findBuffer = (name) => {
        return vertices.find(elem => elem.name === name).vbo;
    }

    // gl.bindVertexArray(vao);
    bind();

    attributes.forEach(attribute => {
        const {name, data, size, location, divisor, usage} = attribute;
        const vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, data, usage);
        gl.enableVertexAttribArray(location);
        // size ... 頂点ごとに埋める数
        // stride is always 0 because buffer is not interleaved.
        // ref:
        // - https://developer.mozilla.org/ja/docs/Web/API/WebGLRenderingContext/vertexAttribPointer
        // - https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/vertexAttribIPointer

        // 今回は頂点データはfloat32限定
        gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);

        if (divisor) {
            gl.vertexAttribDivisor(location, divisor);
        }

        vertices.push({
            name,
            vbo,
            usage,
            location,
            size,
            divisor
        });
    });

    if (indicesData) {
        ibo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indicesData), gl.STATIC_DRAW);
        indices = indicesData;
    }

    // unbind array buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // unbind vertex array to webgl context
    // gl.bindVertexArray(null);
    unbind();

    // unbind index buffer
    if (ibo) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

    return {
        vao,
        indices,
        bind,
        unbind,
        getBuffers,
        setBuffer,
        findBuffer
    }
}

export function createUniformBufferObjectWrapper(
    gl,
    // program,
    // blockName,
    // blockIndex,
    dataSize,
    // variableNames,
    bindingPoint
) {
    // console.log(`[createUniformBufferObjectWrapper] blockName: ${blockName}, variableNames: ${variableNames}`)
    
    const ubo = gl.createBuffer();

    // // シェーダー内の uniform buffer の index を取得
    // // 記述順によって決まる？
    // const blockIndex = gl.getUniformBlockIndex(
    //     program,
    //     blockName
    // );

    // // シェーダー内の uniform block の byte数を取得。指定した block を参照する
    // const blockSize = gl.getActiveUniformBlockParameter(
    //     program,
    //     blockIndex,
    //     gl.UNIFORM_BLOCK_DATA_SIZE
    // );

    // TODO: 第二引数は常にグローバルな位置になる？
    // gl.bindBufferBase(gl.UNIFORM_BUFFER, blockIndex, ubo);
    
    // console.log(`blockIndex: ${blockIndex}, blockSize: ${blockSize}`);

    // const variableIndices = gl.getUniformIndices(
    //     program,
    //     variableNames
    // );
    // 
    // console.log(`variableIndices: ${variableIndices}`);

    // // シェーダー内の uniform の offset(byte) を取得
    // // wip: 2つめの uniform buffer の最初の要素は 0?
    // // TODO: ずれるoffset量と型の関係が不明
    // const variableOffsets = gl.getActiveUniforms(
    //     program,
    //     variableIndices,
    //     gl.UNIFORM_OFFSET
    // );
    // 
    // console.log(`variableOffsets: ${variableOffsets}`);
    
    // const variableInfo = variableNames.map((name, i) => {
    //     const index = variableIndices[i];
    //     const offset = variableOffsets[i];
    //     console.log(`name: ${name}, index: ${index}, offset: ${offset}`);
    //     return {
    //         name,
    //         index: variableIndices[i],
    //         offset: variableOffsets[i]
    //     }
    // });

    // gl.uniformBlockBinding(
    //     program,
    //     blockIndex,
    //     bindingPoint // webgl context で管理する global な index
    // );
    
    const bind = () => {
        gl.bindBuffer(gl.UNIFORM_BUFFER, ubo);
    }

    const unbind = () => {
        gl.bindBuffer(gl.UNIFORM_BUFFER, null);
    }
    
    // const setData = (name, data) => {
    //     const info = variableInfo.find(info => info.name === name);
    //     if(!info) {
    //         console.error(`[createUniformBufferObjectWrapper] setData: not found variable name: ${name}`);
    //         return;
    //     }
    //     //gl.bufferSubData(gl.UNIFORM_BUFFER, info.offset, data);
    //     gl.bufferSubData(gl.UNIFORM_BUFFER, info.offset, data, 0);
    // }

    // const bindBufferBase = (index) => {
    //     gl.bindBufferBase(gl.UNIFORM_BUFFER, index, ubo);
    // }

    // const bindData = (uniform, index) => {
    //     const {data, usage} = uniform;
    //     gl.bufferData(gl.UNIFORM_BUFFER, data, usage);
    //     // gl.bindBufferBase(gl.UNIFORM_BUFFER, index, ubo);
    // }

    bind();

    // uniforms.forEach((uniform, index) => {
    //     const {data, usage} = uniform;
    //     // gl.bufferData(gl.UNIFORM_BUFFER, data, usage);
    //     gl.bufferData(gl.UNIFORM_BUFFER, data, usage);
    //     // gl.bindBufferBase(gl.UNIFORM_BUFFER, index, ubo);
    // });
   
    // 必要なbyte数を確保しておく 
    gl.bufferData(gl.UNIFORM_BUFFER, dataSize, gl.DYNAMIC_DRAW);
    
    unbind();

    // uboとbindingPointを関連付ける
    gl.bindBufferBase(gl.UNIFORM_BUFFER, bindingPoint, ubo);

    // if (blockIndex > -1) {
    //     // gl.bindBufferBase(gl.UNIFORM_BUFFER, blockIndex, ubo);
    //     bindBufferBase(blockIndex);
    // }

    return {
        ubo,
        bind,
        unbind,
        // setData,
        // blockIndex,
        // blockSize
        // bindBufferBase
    };
}
