// 顶点着色器源码
var vertexShaderSrc = `
attribute vec4 a_Position;
attribute float a_Time;
attribute float a_PointSize;

varying vec4 v_Color;

void main(){

    // gl_Position = a_Position;
    gl_PointSize = a_PointSize * a_Time;

    float angle = length(a_Position) * a_Time;
    // y轴旋转
    mat4 RM = mat4(
                    vec4(cos(angle)         , 0.0 , sin(angle)  ,0.0),
                    vec4(0.0                , 1.0 , 0.0         ,0.0),
                    vec4(-1.0 * sin(angle)  , 0.0 , cos(angle)  ,0.0),
                    vec4(0.0                , 0.0 , 0.0         ,1.0)
                );
    gl_Position = RM * a_Position;//更新顶点位置

    float master = abs(sin(a_Time*length(a_Position)));
    float red = abs(cos(a_Time*length(a_Position)));
    if (a_Position.x == 0.0) {
      v_Color = vec4(red,master,0.0,1.0);
    }else if (a_Position.x == -0.6) {
      v_Color = vec4(red,0.0,master,1.0);
    }
    else {
      v_Color = vec4(master,0.0,0.0,1.0);
    }

}`;

// 片段着色器源码
var fragmentShaderSrc = `
precision mediump float;//片元着色需要指定精度
varying vec4 v_Color;

void main(){
    //刷新片元颜色
    gl_FragColor = v_Color;//vec4(1.0, 1.0, 0.0, 1.0);

}`;

function initBuffers(gl,shaderProgram) {
    var vertices = new Float32Array([
        0.0, 0.5, -0.6, -0.6, 0.7, -0.7
    ]);
    var n = 3;//点的个数
    //创建缓冲区对象
    var vertexBuffer = gl.createBuffer();
    if(!vertexBuffer){
        console.log("Failed to create the butter object");
        return -1;
    }
     //将缓冲区对象绑定到目标
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
    //向缓冲区写入数据
    gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);
    //获取坐标点
    var a_Position = gl.getAttribLocation(shaderProgram, 'a_Position');
    //将缓冲区对象分配给a_Position变量
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    //连接a_Position变量与分配给它的缓冲区对象
    gl.enableVertexAttribArray(a_Position);
    return n;

}

// 初始化使用的shader
function initShader(gl) {
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);// 创建顶点着色器
    gl.shaderSource(vertexShader, vertexShaderSrc);// 绑定顶点着色器源码
    gl.compileShader(vertexShader);// 编译定点着色器

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);// 创建片段着色器
    gl.shaderSource(fragmentShader, fragmentShaderSrc);// 绑定片段着色器源码
    gl.compileShader(fragmentShader);// 编译片段着色器

    var shaderProgram = gl.createProgram();// 创建着色器程序
    gl.attachShader(shaderProgram, vertexShader);// 指定顶点着色器
    gl.attachShader(shaderProgram, fragmentShader);// 指定片段着色色器
    gl.linkProgram(shaderProgram);// 链接程序
    gl.useProgram(shaderProgram);//使用着色器
    return shaderProgram;
}

function main() {
    var canvas = document.getElementById("container");
    var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    var shaderProgram = initShader(gl);// 初始化着色器
    var n = initBuffers(gl,shaderProgram);

    if(n < 0){
        console.log('Failed to set the positions');
        return;
    }

    var a_PointSize = gl.getAttribLocation(shaderProgram, "a_PointSize");// 获取shader中的a_PointSize变量
    gl.vertexAttrib1f(a_PointSize, 1.0);// a_PointSize

    var a_time = gl.getAttribLocation(shaderProgram, "a_Time");// 获取shader中的a_PointSize变量

    var wwStep = 0.01;
    var ww = 0.0;
    var update = function(){
      gl.clearColor(0.0, 0.0, 0.0, 1.0);// 指定清空canvas的颜色
      gl.clear(gl.COLOR_BUFFER_BIT);// 清空canvas


      gl.vertexAttrib1f(a_time, ww);
      ww = ww + wwStep;
      if(ww >= 360){
        ww = 0.0;
      }

      gl.drawArrays(gl.TRIANGLES, 0, n);
      setTimeout(update,13);
    };
    setTimeout(update,13);

}
