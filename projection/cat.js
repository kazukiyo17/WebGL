"use strict";

var canvas;
var gl;
var program;
var normalsArray5=[];
var vTexCoord;
var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

//视角  ---透视投影视景体参数
var radius = 20;
var theta =-0.15;
var phi = 30.0;
var dr = 0.2 * Math.PI / 180.0;
var eye;
const at = vec3(0.0, 1.0, 6.0);
const up = vec3(0.0, 1.0, 0.0);
var fovy = 45.0; // Field-of-view in Y direction angle (in degrees)
var aspect; // Viewport aspect ratio
var near = 0.5;
var far = 50.0;


var dragging=false;//是否在拖动鼠标
var lastX=-1,lastY=-1;//上次点击时的光标位置
//视图矩阵---x和观察者有关
var viewMatrixLoc; // 视图矩阵的存储地址
var viewMatrix; // 当前视图矩阵
//投影矩阵
var projectionMatrixLoc; // 投影矩阵的存储地址
var projectionMatrix; // 当前投影矩阵
//模型视图矩阵---和世界坐标系有关
var modelViewMatrix;
var modelViewMatrixLoc;
//这里设置了新的法向量矩阵
var normalMatrix;
var normalMatrixLoc;

var flag = false;

//光源属性
//光源属性
var Tx_light=0;
var Ty_light=4;
var Tz_light=5;

var lightPosition = vec4(Tx_light, Ty_light, Tz_light, 1.0);
var lightAmbient = vec4(0.5, 0.5, 0.5, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);


//光源材质   材质属性  ----w因子表达透明度
var materialAmbient = vec4(1.0, 1.0, 1.0, 1.0); //环境光照下物体反射的颜色（物体本身颜色）
var materialDiffuse = vec4(1.0, 1.0, 1.0, 1.0); //漫反射下物体颜色（物体本身颜色）
var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0); //镜面光照颜色
var materialShininess = 2.0; //镜面高光散射半径

var ambientProduct, diffuseProduct, specularProduct;
//************************蝴蝶*********************************
var WingRotate = 0; //翅膀煽动方向
var WingAngleY = 0;
var Tx_bfly = 0,
	Ty_bfly = 0,
	Tz_bfly = 0; //蝴蝶平移量
var Angle_bfly = -45; //旋转角度
var scalePercent_bfly = 2; //放大参量
var direct_bfly = vec4(0.0, 0.0, 1.0, 1.0); //前进方向

var pointsArray_bfly = [];
var normalsArray_bfly = [];
var texCoordsArray_bfly = [];
var nBuffer_bfly = [];
var vNormal_bfly = [];
var vBuffer_bfly = [];
var vPosition_bfly = [];
var tBuffer_bfly = [];
var vTexCoord_bfly = [];

//蝴蝶左翅
var pointsArray_bflywing1 = [];
var normalsArray_bflywing1 = [];
var texCoordsArray_bflywing1 = [];
var nBuffer_bflywing1 = [];
var vNormal_bflywing1 = [];
var vBuffer_bflywing1 = [];
var vPosition_bflywing1 = [];
var tBuffer_bflywing1 = [];
var vTexCoord_bflywing1 = [];
//蝴蝶右翅
var pointsArray_bflywing2 = [];
var normalsArray_bflywing2 = [];
var texCoordsArray_bflywing2 = [];
var nBuffer_bflywing2 = [];
var vNormal_bflywing2 = [];
var vBuffer_bflywing2 = [];
var vPosition_bflywing2 = [];
var tBuffer_bflywing2 = [];
var vTexCoord_bflywing2 = [];


//************************猫猫*********************************
var HeadRotate = 0; //脑袋摇摆方向
var HeadAngleY = 0;
var Tx_cat = 0,
	Ty_cat = 0,
	Tz_cat = 0; //猫猫平移量
var Angle_cat = -90; //旋转角度
var CatAngleZ = 0; //跳跃旋转角度
var CatRotate = 0; //跳跃旋转方向
var scalePercent_cat = 2; //放大参量
var direct_cat = vec4(-1.0, 0.0, 0.0, 1.0); //前进方向

var pointsArray_cat = [];
var normalsArray_cat = [];
var texCoordsArray_cat = [];
var nBuffer_cat;
var vNormal_cat;
var vBuffer_cat;
var vPosition_cat;
var vTexCoord_cat;
var tBuffer_cat;

//这里的是猫猫的身体的信息,身体其实也就只是一个矩形
var pointsArray_catBody = [];
var normalsArray_catBody = [];
var texCoordsArray_catBody = [];
var nBuffer_catBody;
var vNormal_catBody;
var vBuffer_catBody;
var vPosition_catBody;
var vTexCoord_catBody;
var tBuffer_catBody;

var x_catBody = 0.7,
	y_catBody = 0.4,
	z_catBody = 0.4;
//给出了猫猫(除了腿)的所有坐标信息
var vertices_cat = [
	//整个头
	vec4(-1.0, (0.6 + 0.2), 1.0 * 0.8, 1.0),
	vec4(-1.0, (0.6 + 0.2), -1.0 * 0.8, 1.0),
	vec4(1.0, (0.6 + 0.2), -1.0 * 0.8, 1.0),
	vec4(1.0, (0.6 + 0.2), 1.0 * 0.8, 1.0),
	vec4(-1.0, (-1.0 + 0.2), 1.0 * 0.8, 1.0),
	vec4(-1.0, (-1.0 + 0.2), -1.0 * 0.8, 1.0),
	vec4(1.0, (-1.0 + 0.2), -1.0 * 0.8, 1.0),
	vec4(1.0, (-1.0 + 0.2), 1.0 * 0.8, 1.0), //7
	//脸下
	vec4(0.0, -0.3 + 0.2, 1.01 * 0.8, 1.0),
	vec4(-1.0, -0.6 + 0.2, 1.01 * 0.8, 1.0),
	vec4(0.0, -0.9 + 0.2, 1.01 * 0.8, 1.0),
	vec4(1.0, -0.6 + 0.2, 1.01 * 0.8, 1.0), //11
	//耳朵
	vec4(-1.0, 0.6 + 0.2, 1.0 * 0.8, 1.0),
	vec4(-0.5, 1.6 + 0.2, 0.4 * 0.8, 1.0),
	vec4(-0.5, 0.6 + 0.2, -1.0 * 0.8, 1.0),
	vec4(0.0, 0.6 + 0.2, 1.0 * 0.8, 1.0),
	vec4(1.0, 0.6 + 0.2, 1.0 * 0.8, 1.0),
	vec4(0.5, 1.6 + 0.2, 0.4 * 0.8, 1.0),
	vec4(0.5, 0.6 + 0.2, -1.0 * 0.8, 1.0), //18
	//眼珠
	vec4(0.4, 0.13 + 0.2, 1.03 * 0.8, 1.0),
	vec4(0.46, 0.0 + 0.2, 1.03 * 0.8, 1.0),
	vec4(0.34, 0.0 + 0.2, 1.03 * 0.8, 1.0),
	vec4(0.4, -0.13 + 0.2, 1.03 * 0.8, 1.0),
	vec4(-0.4, 0.13 + 0.2, 1.03 * 0.8, 1.0),
	vec4(-0.46, 0.0 + 0.2, 1.03 * 0.8, 1.0),
	vec4(-0.34, 0.0 + 0.2, 1.03 * 0.8, 1.0),
	vec4(-0.4, -0.13 + 0.2, 1.03 * 0.8, 1.0), //26
	//鼻子
	vec4(-0.17, -0.43 + 0.2, 1.02 * 0.8, 1.0),
	vec4(0.0, -0.5 + 0.2, 1.02 * 0.8, 1.0),
	vec4(-0.046, -0.53 + 0.2, 1.02 * 0.8, 1.0),
	vec4(0.17, -0.43 + 0.2, 1.02 * 0.8, 1.0),
	vec4(0.0, -0.5 + 0.2, 1.02 * 0.8, 1.0),
	vec4(0.046, -0.53 + 0.2, 1.02 * 0.8, 1.0),
	vec4(-0.046, -0.53 + 0.2, 1.02 * 0.8, 1.0),
	vec4(0.0, -0.5 + 0.2, 1.02 * 0.8, 1.0),
	vec4(0.046, -0.53 + 0.2, 1.02 * 0.8, 1.0),
	vec4(-0.046, -0.53 + 0.2, 1.02 * 0.8, 1.0),
	vec4(0.0, -0.7 + 0.2, 1.02 * 0.8, 1.0),
	vec4(0.046, -0.53 + 0.2, 1.02 * 0.8, 1.0), //38
	//身体
	vec4(-x_catBody, -y_catBody, z_catBody, 1.0),
	vec4(-x_catBody, y_catBody, z_catBody, 1.0),
	vec4(x_catBody, y_catBody, z_catBody, 1.0),
	vec4(x_catBody, -y_catBody, z_catBody, 1.0),
	vec4(-x_catBody, -y_catBody, -z_catBody, 1.0),
	vec4(-x_catBody, y_catBody, -z_catBody, 1.0),
	vec4(x_catBody, y_catBody, -z_catBody, 1.0),
	vec4(x_catBody, -y_catBody, -z_catBody, 1.0) //46
];
//这里的是猫猫的脚脚的信息
var pointsArray_catLeg = [[],[],[],[]];
var normalsArray_catLeg = [[],[],[],[]];
var texCoordsArray_catLeg = [[],[],[],[]];
var nBuffer_catLeg = new Array(4);
var vNormal_catLeg = new Array(4);
var vBuffer_catLeg = new Array(4);
var vPosition_catLeg = new Array(4);
var vTexCoord_catLeg = new Array(4);
var tBuffer_catLeg = new Array(4);
var vertices_catLeg = new Array(4);

var LegRotate = [0, 0, 0, 0];
var LegAngleX = new Array(4);

function Leg(x, y, z, AngleX, i) {
	var dx = 0.1;
	var dy = 0.1;
	var dz = 0.1;
	vertices_catLeg[i] = [
		[x - dx, y - dy, z + dz, 1.0],
		[x - dx, y + dy, z + dz, 1.0],
		[x + dx, y + dy, z + dz, 1.0],
		[x + dx, y - dy, z + dz, 1.0],
		[x - dx, y - dy, z - dz, 1.0],
		[x - dx, y + dy, z - dz, 1.0],
		[x + dx, y + dy, z - dz, 1.0],
		[x + dx, y - dy, z - dz, 1.0],
	];
	LegAngleX[i] = AngleX;
}
Leg(x_catBody - 0.1, -y_catBody, z_catBody, 5, 0);
Leg(-x_catBody, -y_catBody, z_catBody, -5, 1);
Leg(x_catBody - 0.1, -y_catBody, -z_catBody, -5, 2);
Leg(-x_catBody, -y_catBody, -z_catBody, 5, 3);

//************************草坪*********************************
var pointsArray_lawn = [];
var normalsArray_lawn = [];
var texCoordsArray_lawn = [];
var nBuffer_lawn;
var vNormal_lawn;
var vBuffer_lawn;
var vPosition_lawn;
var vTexCoord_lawn;
var tBuffer_lawn;
var vertices_lawn =[
	// vec4(10,-1,10,1),
	// vec4(-10,-1,10,1),
	// vec4(10,-1,-10,1),
	// vec4(-10,-1,-10,1)
	vec4(8.5,-1,8.5,1),
	vec4(-8.5,-1,8.5,1),
	vec4(8.5,-1,-8.5,1),
	vec4(-8.5,-1,-8.5,1),
	//树干
	vec4(-4,-1,3,1),
	vec4(-4, 0,3,1),
	vec4(-3, 0,3,1),
	vec4(-3,-1,3,1),
	
	vec4(-4,-1,2,1),
	vec4(-4, 0,2,1),
	vec4(-4, 0,3,1),
	vec4(-4,-1,3,1),
	
	vec4(-4,-1,2,1),
	vec4(-4, 0,2,1),
	vec4(-3, 0,2,1),
	vec4(-3,-1,2,1),
	
	vec4(-3,-1,3,1),
	vec4(-3, 0,3,1),
	vec4(-3, 0,2,1),
	vec4(-3,-1,2,1),
	//树冠
	vec4(-6,0,5,1),
	vec4(-6,0,0,1),
	vec4(-1,0,0,1),
	vec4(-1,0,5,1),
	
	vec4(-6,0,5,1),
	vec4(-3.5,7,2.5,1),
	vec4(-6,0,0,1),
	
	vec4(-6,0,0,1),
	vec4(-3.5,7,2.5,1),
	vec4(-1,0,0,1),
	
	vec4(-1,0,0,1),
	vec4(-3.5,7,2.5,1),
	vec4(-1,0,5,1),
	
	vec4(-1,0,5,1),
	vec4(-3.5,7,2.5,1),
	vec4(-6,0,5,1),
];
//************************太阳*********************************
var pointsArray_sun = [];
var normalsArray_sun = [];
var texCoordsArray_sun = [];
var nBuffer_sun=[];
var vNormal_sun=[];
var vBuffer_sun=[];
var vPosition_sun=[];
var vTexCoord_sun=[];
var tBuffer_sun=[];
var Angle_sun = 0; //旋转角度
var scalePercent_sun = 1; //放大参量
var direct_sun = vec4(1.0, 0.0, 0.0, 1.0); //前进方向

window.onload = function init() {
	canvas = document.getElementById("gl-canvas");

	var image1 = document.getElementById("texImage1");
	var image2 = document.getElementById("texImage2");
	var image3 = document.getElementById("texImage3");
	var image4 = document.getElementById("texImage4");//地面图片

	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) {
		alert("WebGL isn't available");
	}

	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
	
	aspect = canvas.width/canvas.height;

	//初始化着色器
	program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);
	
    
    //add
	// 设置材质
	ambientProduct = mult(lightAmbient, materialAmbient);
	diffuseProduct = mult(lightDiffuse, materialDiffuse);
	specularProduct = mult(lightSpecular, materialSpecular);
	gl.uniform4fv(gl.getUniformLocation(program,
		"lightPosition"), flatten(lightPosition));
	gl.uniform4fv(gl.getUniformLocation(program,
		"ambientProduct"), flatten(ambientProduct));
	gl.uniform4fv(gl.getUniformLocation(program,
		"diffuseProduct"), flatten(diffuseProduct));
	gl.uniform4fv(gl.getUniformLocation(program,
		"specularProduct"), flatten(specularProduct));
	gl.uniform1f(gl.getUniformLocation(program,
		"shininess"), materialShininess);


	viewMatrixLoc = gl.getUniformLocation(program, 'viewMatrix');
	modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
	projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
	normalMatrixLoc = gl.getUniformLocation(program, "normalMatrix");

  

	/***************草坪************/
    point_lawn();
    //草坪初始化-----创建顶点缓冲区
	nBuffer_lawn = gl.createBuffer();
	vNormal_lawn = gl.getAttribLocation(program, "vNormal");
	vBuffer_lawn = gl.createBuffer();
	vPosition_lawn = gl.getAttribLocation(program, "vPosition");
	tBuffer_lawn = gl.createBuffer();
	vTexCoord_lawn = gl.getAttribLocation(program, "vTexCoord");

	initBuffer1(nBuffer_lawn, normalsArray_lawn, vNormal_lawn, vBuffer_lawn, pointsArray_lawn, vPosition_lawn, tBuffer_lawn, vTexCoord_lawn, texCoordsArray_lawn);
	
	configureTexture4(image4); //草坪纹理贴图

	//***************************猫猫*********************************//

	point_cat(); //猫猫标点
	//猫猫头初始化-----创建顶点缓冲区
	nBuffer_cat = gl.createBuffer();
	vNormal_cat = gl.getAttribLocation(program, "vNormal");
	vBuffer_cat = gl.createBuffer();
	vPosition_cat = gl.getAttribLocation(program, "vPosition");
	tBuffer_cat = gl.createBuffer();
	vTexCoord_cat = gl.getAttribLocation(program, "vTexCoord");

	initBuffer1(nBuffer_cat, normalsArray_cat, vNormal_cat, vBuffer_cat, pointsArray_cat, vPosition_cat, tBuffer_cat, vTexCoord_cat, texCoordsArray_cat);

	//身体初始化
	nBuffer_catBody = gl.createBuffer();
	vNormal_catBody = gl.getAttribLocation(program, "vNormal");
	vBuffer_catBody = gl.createBuffer();
	vPosition_catBody = gl.getAttribLocation(program, "vPosition");
	vTexCoord_catBody = gl.getAttribLocation(program, "vTexCoord");
	tBuffer_catBody = gl.createBuffer();

	initBuffer1(nBuffer_catBody, normalsArray_catBody, vNormal_catBody, vBuffer_catBody, pointsArray_catBody, vPosition_catBody, tBuffer_catBody, vTexCoord_catBody, texCoordsArray_catBody);

	//脚脚初始化
	for (var i = 0; i < 4; i++) {
		nBuffer_catLeg[i] = gl.createBuffer();
		vNormal_catLeg[i] = gl.getAttribLocation(program, "vNormal");
		vBuffer_catLeg[i] = gl.createBuffer();
		vPosition_catLeg[i] = gl.getAttribLocation(program, "vPosition");
		vTexCoord_catLeg[i] = gl.getAttribLocation(program, "vTexCoord");
		tBuffer_catLeg[i] = gl.createBuffer();

		initBuffer1(nBuffer_catLeg[i], normalsArray_catLeg[i], vNormal_catLeg[i], vBuffer_catLeg[i], pointsArray_catLeg[i], vPosition_catLeg[i], tBuffer_catLeg[i], vTexCoord_catLeg[i], texCoordsArray_catLeg[i]);
		//configureTexture2(image2); //猫猫身纹理贴图
	}

	configureTexture1(image1); //猫猫纹理贴图

	//***************************蝴蝶*********************************//
	point_butterfly();
	//蝴蝶主体初始化-----创建顶点缓冲区
	for (var i = 0; i < pointsArray_bfly.length; i++) {
		nBuffer_bfly[i] = gl.createBuffer();
		vNormal_bfly[i] = gl.getAttribLocation(program, "vNormal");
		vBuffer_bfly[i] = gl.createBuffer();
		vPosition_bfly[i] = gl.getAttribLocation(program, "vPosition");
		tBuffer_bfly[i] = gl.createBuffer();
		vTexCoord_bfly[i] = gl.getAttribLocation(program, "vTexCoord");
	}

	initBuffer2(nBuffer_bfly, normalsArray_bfly, vNormal_bfly, vBuffer_bfly, pointsArray_bfly,
		vPosition_bfly, tBuffer_bfly, vTexCoord_bfly, texCoordsArray_bfly);
	
	configureTexture3(image3);
	
	//蝴蝶左翅初始化-----创建顶点缓冲区
	for (var i = 0; i < pointsArray_bflywing1.length; i++) {
		nBuffer_bflywing1[i] = gl.createBuffer();
		vNormal_bflywing1[i] = gl.getAttribLocation(program, "vNormal");
		vBuffer_bflywing1[i] = gl.createBuffer();
		vPosition_bflywing1[i] = gl.getAttribLocation(program, "vPosition");
		tBuffer_bflywing1[i] = gl.createBuffer();
		vTexCoord_bflywing1[i] = gl.getAttribLocation(program, "vTexCoord");
	}
	initBuffer2(nBuffer_bflywing1, normalsArray_bflywing1, vNormal_bflywing1, vBuffer_bflywing1, pointsArray_bflywing1, vPosition_bflywing1, tBuffer_bflywing1, vTexCoord_bflywing1, texCoordsArray_bflywing1);
	//蝴蝶右翅初始化-----创建顶点缓冲区
	for (var i = 0; i < pointsArray_bflywing2.length; i++) {
		nBuffer_bflywing2[i] = gl.createBuffer();
		vNormal_bflywing2[i] = gl.getAttribLocation(program, "vNormal");
		vBuffer_bflywing2[i] = gl.createBuffer();
		vPosition_bflywing2[i] = gl.getAttribLocation(program, "vPosition");
		tBuffer_bflywing2[i] = gl.createBuffer();
		vTexCoord_bflywing2[i] = gl.getAttribLocation(program, "vTexCoord");
	}
	initBuffer2(nBuffer_bflywing2, normalsArray_bflywing2, vNormal_bflywing2, vBuffer_bflywing2, pointsArray_bflywing2, vPosition_bflywing2, tBuffer_bflywing2, vTexCoord_bflywing2, texCoordsArray_bflywing2);
	
	configureTexture2(image2); //蝴蝶翅膀贴图

	/*****************************太阳*******************************/
	point_sun();
	//太阳初始化-----创建顶点缓冲区
	for (var i = 0; i < pointsArray_sun.length; i++) {
		nBuffer_sun[i] = gl.createBuffer();
		vNormal_sun[i] = gl.getAttribLocation(program, "vNormal");
		vBuffer_sun[i] = gl.createBuffer();
		vPosition_sun[i] = gl.getAttribLocation(program, "vPosition");
		tBuffer_sun[i] = gl.createBuffer();
		vTexCoord_sun[i] = gl.getAttribLocation(program, "vTexCoord");
	}

	initBuffer2(nBuffer_sun, normalsArray_sun, vNormal_sun, vBuffer_sun, pointsArray_sun,
		vPosition_sun, tBuffer_sun, vTexCoord_sun, texCoordsArray_sun);
	

	//*****************************按钮监听*******************************//
	document.getElementById("wander").onclick = function (){
		flag=true;
	};
	document.getElementById("stopwander").onclick = function (){
		flag=false;
	}
	document.getElementById("lightup").onclick = function () {
		Ty_light += 0.2;
	};
	document.getElementById("lightdown").onclick = function () {
		Ty_light -= 0.2;
	};
	document.getElementById("lightforward").onclick = function () {
		Tz_light += 0.2;
	};
	document.getElementById("lightbackward").onclick = function () {
		Tz_light -= 0.2;
	};
	document.getElementById("lightright").onclick = function () {
		Tx_light += 0.1;
	};
	document.getElementById("lightleft").onclick = function () {
		Tx_light-= 0.1;
	};
	document.getElementById("forwardCat").onclick=function()
	{
		Tx_cat+=0.1*direct_cat[0];
		Ty_cat+=0.1*direct_cat[1];
		Tz_cat+=0.1*direct_cat[2];
	}
	document.getElementById("backCat").onclick = function () {
		Tx_cat -= 0.1 * direct_cat[0];
		Ty_cat -= 0.1 * direct_cat[1];
		Tz_cat -= 0.1 * direct_cat[2];
	};
	document.getElementById("rotate1Cat").onclick = function () {
		Angle_cat-=5;
		if(Angle_cat<0){
			Angle_cat=Angle_cat+360;
		}
	};
	document.getElementById("rotate2Cat").onclick = function () {
		Angle_cat+= 5;
		if(Angle_cat>360){
			Angle_cat=Angle_cat-360;
		}
	};
	document.getElementById("biggerCat").onclick = function () {
		scalePercent_cat+=0.05;
	};
	document.getElementById("smallerCat").onclick = function () {
		scalePercent_cat -= 0.05;
	};


	document.getElementById("forwardBuf").onclick=function()
	{
		Tx_bfly+=0.1*direct_bfly[0];
		Ty_bfly+=0.1*direct_bfly[1];
		Tz_bfly+=0.1*direct_bfly[2];
	}
	document.getElementById("backBuf").onclick = function () {
		Tx_bfly-= 0.1 * direct_bfly[0];
		Ty_bfly-= 0.1 * direct_bfly[1];
		Tz_bfly -= 0.1 * direct_bfly[2];
	};
	document.getElementById("rotate1Buf").onclick = function () {
		Angle_bfly-=5;
		if(Angle_bfly<0){
			Angle_bfly=Angle_bfly+360;
		}
	};
	document.getElementById("rotate2Buf").onclick = function () {
		Angle_bfly+= 5;
		if(Angle_bfly>360){
			Angle_bfly=Angle_bfly-360;
		}
	};
	document.getElementById("biggerBuf").onclick = function () {
		scalePercent_bfly+=0.05;
	};
	document.getElementById("smallerBuf").onclick = function () {
		scalePercent_bfly -= 0.05;
	};
	//以下实现鼠标按压对视图的改变
	 canvas.onmousedown = function (ev) {
            var x = ev.clientX;
            var y = ev.clientY;
            // Start dragging if a moue is in <canvas>
            var rect = ev.target.getBoundingClientRect();
            if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
            lastX = x;
            lastY = y;
            dragging = true;
            }
        };
        //鼠标离开时
        canvas.onmouseleave = function (ev) {
            dragging = false;
        };
        //鼠标释放
        canvas.onmouseup = function (ev) {
            dragging = false;
        };
	//鼠标移动
    canvas.onmousemove = function (ev) {
            var x = ev.clientX;
            var y = ev.clientY;
            if (dragging) {
                var factor = 100 / canvas.height; // The rotation ratio
                var dx = factor * (x - lastX);
                var dy = factor * (y - lastY);
                if(flag)
                {
                    if(dx > 0)
                        rotationDirection = false;
                    else
                        rotationDirection = true;
                }
                else{
                    theta -= dx * Math.PI / 180;
                    phi += dy * Math.PI / 180;
                }
            }
            lastX = x, lastY = y;
        };

	render();
}

var render = function () {
	if(flag)
	{
		theta += dr;
		phi=0;
		eye = vec3( radius*Math.sin(theta)*Math.cos(phi), 
                    radius * Math.sin(theta)*Math.sin(phi),
                    radius*Math.cos(theta));
	}
	else{
	eye = vec3(radius * Math.sin(theta) * Math.cos(phi),
			radius * Math.sin(theta) * Math.sin(phi),
			radius * Math.cos(theta));
        }

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	//***************************视图*********************************//

	//	eye = vec3(radius * Math.sin(theta) * Math.cos(phi),
	//		radius * Math.sin(theta) * Math.sin(phi),
	//		radius * Math.cos(theta));
	//eye = vec3(0.0, 4.0, 20.0);
	// 设置视点、视线和上方向
	viewMatrix = lookAt(eye, at, up);
	// 将视图矩阵传递给viewMatrix变量
	gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));
	//***************************投影*********************************//

	projectionMatrix = perspective(fovy, aspect, near, far);
	gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

	//***************************光源*********************************//
	lightPosition = vec4(Tx_light, Ty_light, Tz_light, 1.0);

	gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));

    //add******************************草坪****************************//
	modelViewMatrix=translate(0, 0, 0);
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
	normalMatrix = modelViewMatrix;
	gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalMatrix));
	
	//设置纹理
	gl.uniform1i(gl.getUniformLocation(program, "bTexCoord"), 4);
	gl.activeTexture(gl.TEXTURE4);

	drawBuffer1(nBuffer_lawn, normalsArray_lawn, vNormal_lawn, vBuffer_lawn, pointsArray_lawn,
		vPosition_lawn, tBuffer_lawn, vTexCoord_lawn, texCoordsArray_lawn);
	//******************************猫猫身****************************//

	//变换
	var init = translate(0.0, 0.0, 0.0); // 初始变换矩阵，用于设置模型的初始位置
	var S = scalem(scalePercent_cat, scalePercent_cat, scalePercent_cat);
	var T = translate(Tx_cat, Ty_cat, Tz_cat);
	var R = mult(rotateY(Angle_cat), rotateZ(CatAngleZ));
	modelViewMatrix = mult(mult(mult(init, T), R), S);
	// 记录正面的方向
	direct_cat = vec4(-1.0, 0.0, 0.0, 1.0); // 初始化初始方向
	direct_cat = multMat4Vec4(rotateY(Angle_cat), direct_cat);
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

	normalMatrix = modelViewMatrix;
	gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalMatrix));

	//设置纹理
	gl.uniform1i(gl.getUniformLocation(program, "bTexCoord"), 1);
	gl.activeTexture(gl.TEXTURE1);

	drawBuffer1(nBuffer_catBody, normalsArray_catBody, vNormal_catBody, vBuffer_catBody, pointsArray_catBody, vPosition_catBody, tBuffer_catBody, vTexCoord_catBody, texCoordsArray_catBody);

	//******************************猫猫头****************************//
	var Sh = scalem(0.51, 0.51, 0.51);
	var Th = translate(-0.5, 0.25, 0);
	var Rh = rotateY(90 + HeadAngleY);

	modelViewMatrix = mult(mult(mult(mult(init, translate(Tx_cat, Ty_cat, Tz_cat)), S), R), mult(mult(Th, Sh), Rh));

	
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
	normalMatrix = modelViewMatrix;
	gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalMatrix));

	//设置纹理
	gl.uniform1i(gl.getUniformLocation(program, "bTexCoord"), 1);
	gl.activeTexture(gl.TEXTURE1);

	drawBuffer1(nBuffer_cat, normalsArray_cat, vNormal_cat, vBuffer_cat, pointsArray_cat,
		vPosition_cat, tBuffer_cat, vTexCoord_cat, texCoordsArray_cat);
	//******************************猫猫腿腿****************************//
	for (var i = 0; i < 4; i++) {
		if (LegRotate[i] == 0) {
			if (LegAngleX[i] < 5) {
				LegAngleX[i] += 0.1;
			} else {
				LegRotate[i] = 1;
			}
		} else {
			if (LegAngleX[i] > -5) {
				LegAngleX[i] -= 0.1;
			} else {
				LegRotate[i] = 0;
			}
		}
//		init = translate(2.0, 0.0, 0.0);
//		S = scalem(scalePercent_cat, scalePercent_cat, scalePercent_cat);
//		T = translate(Tx_cat, Ty_cat, Tz_cat);
//		R = mult(rotateY(Angle_cat), rotateZ(CatAngleZ));
		modelViewMatrix = mult(mult(mult(init, T), S), mult(R, rotateZ(LegAngleX[i])));

		gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
		normalMatrix = modelViewMatrix;
		gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalMatrix));

		//设置纹理
		gl.uniform1i(gl.getUniformLocation(program, "bTexCoord"), 1);
		gl.activeTexture(gl.TEXTURE1);

		drawBuffer1(nBuffer_catLeg[i], normalsArray_catLeg[i], vNormal_catLeg[i], vBuffer_catLeg[i], pointsArray_catLeg[i],
			vPosition_catLeg[i], tBuffer_catLeg[i], vTexCoord_catLeg[i], texCoordsArray_catLeg[i]);
	}
	
	//******************************蝴蝶****************************//
	
	Tx_bfly += 0.1 * direct_bfly[0];
	Ty_bfly += 0.1 * direct_bfly[1];
	Tz_bfly +=0.1 * direct_bfly[2];

	Angle_bfly = Angle_bfly + 1;
	if (Angle_bfly > 360)
		Angle_bfly = 0;
	//init = translate(0.0, 3.5, 4.0); // 初始变换矩阵，用于设置模型的初始位置
	init = translate(0.0, 4.0, 1.0);
	// S = scalem(scalePercent_bfly, scalePercent_bfly, scalePercent_bfly);
	// Tx_bfly = 1.14;
	// Tz_bfly=-0.4;
	// T = translate(Tx_bfly, Ty_bfly, Tz_bfly);
	// R = mult(rotateY(Angle_bfly),rotateX(0));


	S = scalem(scalePercent_bfly, scalePercent_bfly, scalePercent_bfly);
	T = translate(Tx_bfly, Ty_bfly, Tz_bfly);
	R = rotateY(Angle_bfly);
	modelViewMatrix = mult(mult(mult(init, T), R), S);

	// 记录正面的方向
	direct_bfly = vec4(0.0, 0.0, 1.0, 1.0); // 初始化初始方向
	direct_bfly = multMat4Vec4(rotateY(Angle_bfly),direct_bfly);

	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

	normalMatrix = modelViewMatrix;
	gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalMatrix));

	//设置纹理
	gl.uniform1i(gl.getUniformLocation(program, "bTexCoord"), 3);
	gl.activeTexture(gl.TEXTURE3);

	drawBuffer3(nBuffer_bfly, normalsArray_bfly, vNormal_bfly, vBuffer_bfly, pointsArray_bfly,
		vPosition_bfly, tBuffer_bfly, vTexCoord_bfly, texCoordsArray_bfly);
	//******************************蝴蝶左翅****************************//
	//变换
	if (WingRotate == 0) {
		if (WingAngleY < 40) {
			WingAngleY += 10;
		} else {
			WingRotate = 1;
		}
	} else {
		if (WingAngleY > -40) {
			WingAngleY -= 10;
		} else {
			WingRotate = 0;
		}
	}

	var Rh = mult(rotateX(-90),rotateY(-WingAngleY));

	modelViewMatrix = mult(mult(mult(mult(init, T), S), R), Rh);
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
	normalMatrix = modelViewMatrix;
	gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalMatrix));

	//设置纹理
	gl.uniform1i(gl.getUniformLocation(program, "bTexCoord"), 2);
	gl.activeTexture(gl.TEXTURE2);

	drawBuffer2(nBuffer_bflywing1, normalsArray_bflywing1, vNormal_bflywing1, vBuffer_bflywing1, pointsArray_bflywing1,
		vPosition_bflywing1, tBuffer_bflywing1, vTexCoord_bflywing1, texCoordsArray_bflywing1);
	//******************************蝴蝶右翅****************************//
	//变换
	var Rh = mult(rotateX(-90),rotateY(WingAngleY));

	modelViewMatrix = mult(mult(mult(mult(init, T), S), R), Rh);
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
	normalMatrix = modelViewMatrix;
	gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalMatrix));
	
	//设置纹理
	gl.uniform1i(gl.getUniformLocation(program, "bTexCoord"), 2);
	gl.activeTexture(gl.TEXTURE2);

	drawBuffer2(nBuffer_bflywing2, normalsArray_bflywing2, vNormal_bflywing2, vBuffer_bflywing2, pointsArray_bflywing2,
		vPosition_bflywing2, tBuffer_bflywing2, vTexCoord_bflywing2, texCoordsArray_bflywing2);


	//******************************太阳****************************//
	init = translate(0.0, 0.0, 0.0); // 初始变换矩阵，用于设置模型的初始位置
	S = scalem(scalePercent_sun, scalePercent_sun, scalePercent_sun);
	T = translate(Tx_light, Ty_light, Tz_light);
	R = rotateY(Angle_sun);

	modelViewMatrix = mult(mult(mult(init, T), R), S);

	// 记录正面的方向
	direct_sun = vec4(0.0, 0.0, 1.0, 1.0); // 初始化初始方向
	direct_sun = multMat4Vec4(rotateY(Angle_sun), direct_sun);

	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

	normalMatrix = modelViewMatrix;
	gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalMatrix));
	//设置纹理
	gl.uniform1i(gl.getUniformLocation(program, "bTexCoord"), 1);
	gl.activeTexture(gl.TEXTURE3);

	drawBuffer2(nBuffer_sun, normalsArray_sun, vNormal_sun, vBuffer_sun, pointsArray_sun,
		vPosition_sun, tBuffer_sun, vTexCoord_sun, texCoordsArray_sun);
	requestAnimFrame(render);
}



//草坪标点
function point_lawn(){
	var texCoordface = [
		//草坪
		vec2(1, 0.6),
		vec2(0.4, 0.6),
		vec2(0.4, 0),
		vec2(1, 0),
		//树干
		vec2(0.145, 0),
		vec2(0.145, 0.032),
		vec2(0.176, 0.032),
		vec2(0.176, 0),
		//树冠
		vec2(0.29, 0.043),
		vec2(0.15, 0.33),
		vec2(0.05, 0.043)
	];
	//草坪
	quad(0,2,3,1, pointsArray_lawn, normalsArray_lawn, vertices_lawn);
	texCoordsArray_lawn.push(texCoordface[0]);
	texCoordsArray_lawn.push(texCoordface[1]);
	texCoordsArray_lawn.push(texCoordface[2]);
	texCoordsArray_lawn.push(texCoordface[0]);
	texCoordsArray_lawn.push(texCoordface[2]);
	texCoordsArray_lawn.push(texCoordface[3]);
	//树干
	quad(4,5,6,7, pointsArray_lawn, normalsArray_lawn, vertices_lawn);
	quad(8,9,10,11, pointsArray_lawn, normalsArray_lawn, vertices_lawn);
	quad(12,13,14,15, pointsArray_lawn, normalsArray_lawn, vertices_lawn);
	quad(16,17,18,19, pointsArray_lawn, normalsArray_lawn, vertices_lawn);
	for(var i=0;i<4;i++){
		texCoordsArray_lawn.push(texCoordface[4]);
		texCoordsArray_lawn.push(texCoordface[5]);
		texCoordsArray_lawn.push(texCoordface[6]);
		texCoordsArray_lawn.push(texCoordface[4]);
		texCoordsArray_lawn.push(texCoordface[6]);
		texCoordsArray_lawn.push(texCoordface[7]);
	}
	//树冠
	quad(20,21,22,23, pointsArray_lawn, normalsArray_lawn, vertices_lawn);
	texCoordsArray_lawn.push(texCoordface[0]);
	texCoordsArray_lawn.push(texCoordface[1]);
	texCoordsArray_lawn.push(texCoordface[2]);
	texCoordsArray_lawn.push(texCoordface[0]);
	texCoordsArray_lawn.push(texCoordface[2]);
	texCoordsArray_lawn.push(texCoordface[3]);
	quad2(24,25,26, pointsArray_lawn, normalsArray_lawn, vertices_lawn);
	quad2(27,28,29, pointsArray_lawn, normalsArray_lawn, vertices_lawn);
	quad2(30,31,32, pointsArray_lawn, normalsArray_lawn, vertices_lawn);
	quad2(33,34,35, pointsArray_lawn, normalsArray_lawn, vertices_lawn);
	for(var i=0;i<4;i++){
		texCoordsArray_lawn.push(texCoordface[8]);
		texCoordsArray_lawn.push(texCoordface[9]);
		texCoordsArray_lawn.push(texCoordface[10]);
	}
} 

//猫猫标点
function point_cat() {
	//猫猫头
	quad(3, 0, 4, 7, pointsArray_cat, normalsArray_cat, vertices_cat);
	quad(6, 5, 1, 2, pointsArray_cat, normalsArray_cat, vertices_cat);
	quad(1, 0, 3, 2, pointsArray_cat, normalsArray_cat, vertices_cat);
	quad(2, 3, 7, 6, pointsArray_cat, normalsArray_cat, vertices_cat);
	quad(4, 5, 6, 7, pointsArray_cat, normalsArray_cat, vertices_cat);
	quad(5, 4, 0, 1, pointsArray_cat, normalsArray_cat, vertices_cat);
	var texCoordface = [
		vec2(0.5, 0.5),
		vec2(0.0, 0.5),
		vec2(0.0, 0.1),
		vec2(0.5, 0.1)
	];
	texCoordsArray_cat.push(texCoordface[0]);
	texCoordsArray_cat.push(texCoordface[1]);
	texCoordsArray_cat.push(texCoordface[2]);
	texCoordsArray_cat.push(texCoordface[0]);
	texCoordsArray_cat.push(texCoordface[2]);
	texCoordsArray_cat.push(texCoordface[3]);
	texCoordface = [
		vec2(0.5, 1.0),
		vec2(0.0, 1.0),
		vec2(0.0, 0.5),
		vec2(0.5, 0.5)
	];
	texCoordsArray_cat.push(texCoordface[0]);
	texCoordsArray_cat.push(texCoordface[1]);
	texCoordsArray_cat.push(texCoordface[2]);
	texCoordsArray_cat.push(texCoordface[0]);
	texCoordsArray_cat.push(texCoordface[2]);
	texCoordsArray_cat.push(texCoordface[3]);
	texCoordface = [
		vec2(1.0, 0.5),
		vec2(0.5, 0.5),
		vec2(0.5, 0.0),
		vec2(1.0, 0.0)
	];
	for (var i = 0; i < 4; i++) {
		texCoordsArray_cat.push(texCoordface[0]);
		texCoordsArray_cat.push(texCoordface[1]);
		texCoordsArray_cat.push(texCoordface[2]);
		texCoordsArray_cat.push(texCoordface[0]);
		texCoordsArray_cat.push(texCoordface[2]);
		texCoordsArray_cat.push(texCoordface[3]);
	}

	//猫猫耳
	quad2(12, 13, 14, pointsArray_cat, normalsArray_cat, vertices_cat); //耳背
	quad2(13, 14, 15, pointsArray_cat, normalsArray_cat, vertices_cat); //耳背
	quad2(12, 13, 15, pointsArray_cat, normalsArray_cat, vertices_cat); //耳朵
	quad2(16, 17, 18, pointsArray_cat, normalsArray_cat, vertices_cat); //耳背
	quad2(17, 18, 15, pointsArray_cat, normalsArray_cat, vertices_cat); //耳背
	quad2(16, 17, 15, pointsArray_cat, normalsArray_cat, vertices_cat); //耳朵

	texCoordface = [
		vec2(0.5, 0.0),
		vec2(0.5, 0.5),
		vec2(1.0, 0.0)
	];
	for (var i = 0; i < 6; i++) {
		texCoordsArray_cat.push(texCoordface[0]);
		texCoordsArray_cat.push(texCoordface[1]);
		texCoordsArray_cat.push(texCoordface[2]);
	}

	//身体
	quad(40, 44, 45, 41, pointsArray_catBody, normalsArray_catBody, vertices_cat);
	quad(40, 39, 42, 41, pointsArray_catBody, normalsArray_catBody, vertices_cat);
	quad(41, 42, 46, 45, pointsArray_catBody, normalsArray_catBody, vertices_cat);
	quad(42, 39, 43, 46, pointsArray_catBody, normalsArray_catBody, vertices_cat);
	quad(43, 44, 45, 46, pointsArray_catBody, normalsArray_catBody, vertices_cat);
	quad(39, 43, 44, 40, pointsArray_catBody, normalsArray_catBody, vertices_cat);

	texCoordface = [
		vec2(1.0, 1.0),
		vec2(0.5, 1.0),
		vec2(0.5, 0.5),
		vec2(1.0, 0.5)
	];
	texCoordsArray_catBody.push(texCoordface[0]);
		texCoordsArray_catBody.push(texCoordface[1]);
		texCoordsArray_catBody.push(texCoordface[2]);
		texCoordsArray_catBody.push(texCoordface[0]);
		texCoordsArray_catBody.push(texCoordface[2]);
		texCoordsArray_catBody.push(texCoordface[3]);
	
	texCoordface = [
		vec2(1.0, 0.5),
		vec2(0.5, 0.5),
		vec2(0.5, 0.0),
		vec2(1.0, 0.0)
	];
	for (var i = 0; i < 5; i++) {
		texCoordsArray_catBody.push(texCoordface[0]);
		texCoordsArray_catBody.push(texCoordface[1]);
		texCoordsArray_catBody.push(texCoordface[2]);
		texCoordsArray_catBody.push(texCoordface[0]);
		texCoordsArray_catBody.push(texCoordface[2]);
		texCoordsArray_catBody.push(texCoordface[3]);
	}
	//腿腿
	texCoordface = [
		vec2(1.0, 0.5),
		vec2(0.5, 0.5),
		vec2(0.5, 0.0),
		vec2(1.0, 0.0)
	];
	for (var i = 0; i < 4; i++) {
		quad(1, 0, 3, 2, pointsArray_catLeg[i], normalsArray_catLeg[i], vertices_catLeg[i]);
		quad(2, 3, 6, 7, pointsArray_catLeg[i], normalsArray_catLeg[i], vertices_catLeg[i]);
		quad(3, 0, 4, 7, pointsArray_catLeg[i], normalsArray_catLeg[i], vertices_catLeg[i]);
		quad(6, 5, 1, 2, pointsArray_catLeg[i], normalsArray_catLeg[i], vertices_catLeg[i]);
		quad(4, 5, 6, 7, pointsArray_catLeg[i], normalsArray_catLeg[i], vertices_catLeg[i]);
		quad(5, 4, 0, 1, pointsArray_catLeg[i], normalsArray_catLeg[i], vertices_catLeg[i]);
		for (var j = 0; j < 6; j++) {
			texCoordsArray_catLeg[i].push(texCoordface[0]);
			texCoordsArray_catLeg[i].push(texCoordface[1]);
			texCoordsArray_catLeg[i].push(texCoordface[2]);
			texCoordsArray_catLeg[i].push(texCoordface[0]);
			texCoordsArray_catLeg[i].push(texCoordface[2]);
			texCoordsArray_catLeg[i].push(texCoordface[3]);
		}
	}

}

//蝴蝶标点
function point_butterfly() {
	var m = 50;
	var texCoordface = [
		vec2(0.0, 0.1),
		vec2(0.0, 0.1),
		vec2(0.1, 0.1),
		vec2(0,1, 0.0)
	];
	quad4(-0.05, 0.025, 0.42, 0.18, pointsArray_bfly, normalsArray_bfly, texCoordsArray_bfly, texCoordface); //头
	texCoordface = [
		vec2(1.0, -0.08),
		vec2(0.0, -0.08),
		vec2(0.0, 1.2),
		vec2(1.0, 1.2)
	];
	quad5(-0.05, 0.0, 0.0, 0.28, 1.35, pointsArray_bfly, normalsArray_bfly, texCoordsArray_bfly, texCoordface); //身体
	texCoordface = [
		vec2(1.0, 1.0),
		vec2(1.0, 2.0),
		vec2(2.0, 2.0),
		vec2(2.0, 1.0)
	];
	quad3(-0.4, 0.1, 0.0, 0.30, pointsArray_bflywing1, normalsArray_bflywing1, texCoordsArray_bflywing1, texCoordface); //翅膀-左上
	quad3(0.4, 0.1, 0.0, 0.30, pointsArray_bflywing2, normalsArray_bflywing2, texCoordsArray_bflywing2, texCoordface); //翅膀-右上
	quad3(-0.25, -0.2, 0.0, 0.2, pointsArray_bflywing1, normalsArray_bflywing1, texCoordsArray_bflywing1, texCoordface); //翅膀-左上
	quad3(0.25, -0.2, 0.0, 0.2, pointsArray_bflywing2, normalsArray_bflywing2, texCoordsArray_bflywing2, texCoordface); //翅膀-右下

}


function point_sun(){
	var texCoordface = [
		vec2(0.0, 0.0),
		vec2(0, 1),
		vec2(1, 1),
		vec2(1, 0)
	];
	
	quad4(Tx_light, Ty_light, Tz_light, 0.2, pointsArray_sun, normalsArray_sun,texCoordsArray_sun,texCoordface); 
}

//四边形
function quad(a, b, c, d, pointArr, norArr, ver) {
	var t1 = subtract(ver[b], ver[a]);
	var t2 = subtract(ver[c], ver[b]);
	var normal = cross(t1, t2);
	var normal = vec3(normal);
	pointArr.push(ver[a]);
	norArr.push(normal);
	pointArr.push(ver[b]);
	norArr.push(normal);
	pointArr.push(ver[c]);
	norArr.push(normal);
	pointArr.push(ver[a]);
	norArr.push(normal);
	pointArr.push(ver[c]);
	norArr.push(normal);
	pointArr.push(ver[d]);
	norArr.push(normal);
}

//三角形
function quad2(a, b, c, pointArr, norArr, ver) {
	var tmpa = ver[a];
	var tmpb = ver[b];
	var tmpc = ver[c];
	pointArr.push(tmpa);
	norArr.push(vec4(tmpa[0], tmpa[1], tmpa[2], 0.0));
	pointArr.push(tmpb);
	norArr.push(vec4(tmpb[0], tmpb[1], tmpb[2], 0.0));
	pointArr.push(tmpc);
	norArr.push(vec4(tmpc[0], tmpc[1], tmpc[2], 0.0));
}
//圆
function quad3(x_cir, y_cir, z, r, pointArr, norArr, texArr, texCoord) {

	var vertices_cir = [];
	var normals_cir = [];
	var texs_cir = [];
	//texCoord包含一个正方形图片四个点坐标
	var w = texCoord[3][0] - texCoord[0][0]; //贴图宽
	var h = texCoord[2][1] - texCoord[0][1]; //贴图高
	var tr = 0;
	if (w > h)
		tr = h;
	else
		tr = w;
	var tw_cir = texCoord[0][0] + tr / 2;
	var th_cir = texCoord[0][1] + tr / 2;

	for (var i = 0; i < 50; ++i) {
		var theta = i * 2 * (Math.PI) / 50;
		var x = r * Math.sin(theta) + x_cir;
		var y = r * Math.cos(theta) + y_cir;
		//var z = 0.51;
		vertices_cir.push(vec4(x, y, z, 1.0));
		normals_cir.push(vec4(0, 0, z, 0.0));
		texs_cir.push(vec2(tr * Math.sin(theta) + tw_cir, tr * Math.cos(theta) + th_cir))
	}
	pointArr.push(vertices_cir);
	norArr.push(normals_cir);
	texArr.push(texs_cir);
}

//球
// 半径r 面数m 度数c (x,y,z)球心坐标
function quad4(x, y, z, r, pointArr, norArr, texArr, texCoord) { //一共m*m*4个点
	var m = 100;
	var c = 360;
	var points = [];
	var normals = [];
	var texs = [];
	var addAng = c / m;
	var zangle = 0; //YOZ平面的角度
	var angle = 0;
	var rr = 0; //各小圆的半径
	var zz = 0; //各小圆的z坐标

	//texCoord包含一个正方形图片四个点坐标
	var w = texCoord[3][0] - texCoord[0][0]; //贴图宽
	var h = texCoord[2][1] - texCoord[0][1]; //贴图高
	var ww = texCoord[0][0];
	var hh = texCoord[0][1];

	for (var i = 0; i < m; i++) { //经线
		rr = Math.sin(Math.PI / 180 * zangle) * r;
		zz = Math.cos(Math.PI / 180 * zangle) * r;
		var zangle1 = zangle + addAng * 2;
		var hh1 = hh + 2 * h / m;
		if (zangle == 360)
			break;
		var rr1 = Math.sin(Math.PI / 180 * zangle1) * r;
		var zz1 = Math.cos(Math.PI / 180 * zangle1) * r;
		for (var j = 0; j < m; j++) {
			var angle1 = angle + addAng * 2;
			var ww1 = ww + 2 * w / m;
			if (angle == 360) {
				angle1 = 0;
				ww1 = 0;
			}
			var cir_ver = [];
			cir_ver.push(vec4(x + Math.sin(Math.PI / 180 * angle) * rr, y + Math.cos(Math.PI / 180 * angle) * rr, z + zz, 1.0));
			cir_ver.push(vec4(x + Math.sin(Math.PI / 180 * angle1) * rr, y + Math.cos(Math.PI / 180 * angle1) * rr, z + zz, 1.0));
			cir_ver.push(vec4(x + Math.sin(Math.PI / 180 * angle) * rr1, y + Math.cos(Math.PI / 180 * angle) * rr1, z + zz1, 1.0));
			cir_ver.push(vec4(x + Math.sin(Math.PI / 180 * angle1) * rr1, y + Math.cos(Math.PI / 180 * angle1) * rr1, z + zz1, 1.0));
			quad(0, 1, 2, 3, points, normals, cir_ver);

			texs.push(vec2(ww, hh));
			texs.push(vec2(ww1, hh));
			texs.push(vec2(ww, hh1));
			texs.push(vec2(ww, hh));
			texs.push(vec2(ww, hh1));
			texs.push(vec2(ww1, hh1));

			angle = angle + addAng;
			ww = ww + w / m;
		}
		angle = 0;
		zangle = zangle + addAng;
		hh = hh + h / m;
	}
	texArr.push(texs);
	pointArr.push(points);
	norArr.push(normals);
}
// 椭球
// 半径r 面数m 度数c (x,y,z)球心坐标
function quad5(x, y, z, r, x_y, pointArr, norArr, texArr, texCoord) { //一共m*m*4个点
	var m = 100;
	var c = 360;
	var points = [];
	var normals = [];
	var texs = [];
	var addAng = c / m;
	var zangle = 0; //YOZ平面的角度
	var angle = 0;
	var rr = 0; //各小圆的半径
	var zz = 0; //各小圆的z坐标

	//texCoord包含一个正方形图片四个点坐标
	var w = texCoord[3][0] - texCoord[0][0]; //贴图宽
	var h = texCoord[2][1] - texCoord[0][1]; //贴图高
	var ww = texCoord[0][0];
	var hh = texCoord[0][1];

	for (var i = 0; i < m; i++) { //经线
		rr = Math.sin(Math.PI / 180 * zangle) * r;
		zz = Math.cos(Math.PI / 180 * zangle) * r*x_y;
		var zangle1 = zangle + addAng * 2;
		var hh1 = hh + 2 * h / m;
		if (zangle == 360)
			break;
		var rr1 = Math.sin(Math.PI / 180 * zangle1) * r;
		var zz1 = Math.cos(Math.PI / 180 * zangle1) * r*x_y;
		for (var j = 0; j < m; j++) {
			var angle1 = angle + addAng * 2;
			var ww1 = ww + 2 * w / m;
			if (angle == 360) {
				angle1 = 0;
				ww1 = 0;
			}
			var cir_ver = [];
			cir_ver.push(vec4(x + Math.sin(Math.PI / 180 * angle) * rr, (y + Math.cos(Math.PI / 180 * angle) * rr) , z + zz, 1.0));
			cir_ver.push(vec4(x + Math.sin(Math.PI / 180 * angle1) * rr, (y + Math.cos(Math.PI / 180 * angle1) * rr), z + zz, 1.0));
			cir_ver.push(vec4(x + Math.sin(Math.PI / 180 * angle) * rr1, (y + Math.cos(Math.PI / 180 * angle) * rr1), z + zz1, 1.0));
			cir_ver.push(vec4(x + Math.sin(Math.PI / 180 * angle1) * rr1, (y + Math.cos(Math.PI / 180 * angle1) * rr1), z + zz1, 1.0));
			quad(0, 1, 2, 3, points, normals, cir_ver);

			texs.push(vec2(ww, hh));
			texs.push(vec2(ww1, hh));
			texs.push(vec2(ww, hh1));
			texs.push(vec2(ww, hh));
			texs.push(vec2(ww, hh1));
			texs.push(vec2(ww1, hh1));

			angle = angle + addAng;
			ww = ww + w / m;
		}
		angle = 0;
		zangle = zangle + addAng;
		hh = hh + h / m;
	}
	texArr.push(texs);
	pointArr.push(points);
	norArr.push(normals);
}

function initBuffer1(nBuff, norArr, vNor, vBuff, pointArr, vPos, tBuff, vTex, texArr) {
	gl.bindBuffer(gl.ARRAY_BUFFER, nBuff);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(norArr), gl.STATIC_DRAW);

	gl.vertexAttribPointer(vNor, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vNor);

	gl.bindBuffer(gl.ARRAY_BUFFER, vBuff);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(pointArr), gl.STATIC_DRAW);

	gl.vertexAttribPointer(vPos, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPos);

	gl.bindBuffer(gl.ARRAY_BUFFER, tBuff);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(texArr), gl.STATIC_DRAW);

	gl.vertexAttribPointer(vTex, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vTex);

}

function initBuffer2(nBuff, norArr, vNor, vBuff, pointArr, vPos, tBuff, vTex, texArr) {
	for (var i = 0; i < pointArr.length; i++) {
		gl.bindBuffer(gl.ARRAY_BUFFER, nBuff[i]);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(norArr[i]), gl.STATIC_DRAW);

		gl.vertexAttribPointer(vNor[i], 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(vNor[i]);

		gl.bindBuffer(gl.ARRAY_BUFFER, vBuff[i]);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(pointArr[i]), gl.STATIC_DRAW);

		gl.vertexAttribPointer(vPos[i], 4, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(vPos[i]);

		gl.bindBuffer(gl.ARRAY_BUFFER, tBuff[i]);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(texArr[i]), gl.STATIC_DRAW);

		gl.vertexAttribPointer(vTex[i], 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(vTex[i]);
	}

}


function drawBuffer1(nBuff, norArr, vNor, vBuff, pointArr, vPos, tBuff, vTex, texArr) {
	//	gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
	//		flatten(ambientProduct));
	//	gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
	//		flatten(diffuseProduct));
	//	gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
	//		flatten(specularProduct));
	//	gl.uniform1f(gl.getUniformLocation(program,
	//		"shininess"), materialShininess);

	gl.bindBuffer(gl.ARRAY_BUFFER, nBuff);
	//gl.bufferData(gl.ARRAY_BUFFER, flatten(norArr), gl.STATIC_DRAW);

	gl.vertexAttribPointer(vNor, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vNor);

	gl.bindBuffer(gl.ARRAY_BUFFER, vBuff);
	//gl.bufferData(gl.ARRAY_BUFFER, flatten(pointArr), gl.STATIC_DRAW);

	gl.vertexAttribPointer(vPos, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPos);

	gl.bindBuffer(gl.ARRAY_BUFFER, tBuff);
	//gl.bufferData(gl.ARRAY_BUFFER, flatten(texArr), gl.STATIC_DRAW);

	gl.vertexAttribPointer(vTex, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vTex);

	gl.drawArrays(gl.TRIANGLES, 0, pointArr.length);
}

function drawBuffer2(nBuff, norArr, vNor, vBuff, pointArr, vPos, tBuff, vTex, texArr) {
	//	gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
	//		flatten(ambientProduct));
	//	gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
	//		flatten(diffuseProduct));
	//	gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
	//		flatten(specularProduct));
	//	gl.uniform1f(gl.getUniformLocation(program,
	//		"shininess"), materialShininess);

	for (var i = 0; i < pointArr.length; i++) {
		gl.bindBuffer(gl.ARRAY_BUFFER, nBuff[i]);
		//gl.bufferData(gl.ARRAY_BUFFER, flatten(norArr[i]), gl.STATIC_DRAW);

		gl.vertexAttribPointer(vNor[i], 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(vNor[i]);

		gl.bindBuffer(gl.ARRAY_BUFFER, vBuff[i]);
		//gl.bufferData(gl.ARRAY_BUFFER, flatten(pointArr[i]), gl.STATIC_DRAW);

		gl.vertexAttribPointer(vPos[i], 4, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(vPos[i]);

		gl.bindBuffer(gl.ARRAY_BUFFER, tBuff[i]);
		//gl.bufferData(gl.ARRAY_BUFFER, flatten(texArr[i]), gl.STATIC_DRAW);

		gl.vertexAttribPointer(vTex[i], 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(vTex[i]);

		gl.drawArrays(gl.TRIANGLE_FAN, 0, pointArr[i].length);
	}

}

function drawBuffer3(nBuff, norArr, vNor, vBuff, pointArr, vPos, tBuff, vTex, texArr) {
	//	gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
	//		flatten(ambientProduct));
	//	gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
	//		flatten(diffuseProduct));
	//	gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
	//		flatten(specularProduct));
	//	gl.uniform1f(gl.getUniformLocation(program,
	//		"shininess"), materialShininess);
	for (var i = 0; i < pointArr.length; i++) {
		gl.bindBuffer(gl.ARRAY_BUFFER, nBuff[i]);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(norArr[i]), gl.STATIC_DRAW);

		gl.vertexAttribPointer(vNor[i], 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(vNor[i]);

		gl.bindBuffer(gl.ARRAY_BUFFER, vBuff[i]);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(pointArr[i]), gl.STATIC_DRAW);

		gl.vertexAttribPointer(vPos[i], 4, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(vPos[i]);

		gl.bindBuffer(gl.ARRAY_BUFFER, tBuff[i]);
		//gl.bufferData(gl.ARRAY_BUFFER, flatten(texArr[i]), gl.STATIC_DRAW);

		gl.vertexAttribPointer(vTex[i], 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(vTex[i]);

		gl.drawArrays(gl.TRIANGLES, 0, pointArr[i].length);
	}

}

// 矩阵乘
function multMat4Vec4(mat4, vector) {
	var newVec = [];
	for (var i = 0; i < 4; i++) {
		newVec.push(mat4[i][0] * vector[0] +
			mat4[i][1] * vector[1] +
			mat4[i][2] * vector[2] +
			mat4[i][3] * vector[3]);
	}
	return newVec;
}

function configureTexture1(image) {
	var texture = gl.createTexture();
	gl.activeTexture(gl.TEXTURE1);

	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
		gl.RGB, gl.UNSIGNED_BYTE, image);
	gl.generateMipmap(gl.TEXTURE_2D);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
		gl.NEAREST_MIPMAP_LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

	gl.uniform1i(gl.getUniformLocation(program, "texture1"), 1);
}

function configureTexture2(image) {
	var texture = gl.createTexture();
	gl.activeTexture(gl.TEXTURE2);

	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
		gl.RGB, gl.UNSIGNED_BYTE, image);
	gl.generateMipmap(gl.TEXTURE_2D);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
		gl.NEAREST_MIPMAP_LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

	gl.uniform1i(gl.getUniformLocation(program, "texture2"), 2);
}

function configureTexture3(image) {
	var texture = gl.createTexture();
	gl.activeTexture(gl.TEXTURE3);

	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
		gl.RGB, gl.UNSIGNED_BYTE, image);
	gl.generateMipmap(gl.TEXTURE_2D);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
		gl.NEAREST_MIPMAP_LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

	gl.uniform1i(gl.getUniformLocation(program, "texture3"), 3);
}

function configureTexture4(image) {
	var texture = gl.createTexture();
	gl.activeTexture(gl.TEXTURE4);

	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
		gl.RGB, gl.UNSIGNED_BYTE, image);
	gl.generateMipmap(gl.TEXTURE_2D);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
		gl.NEAREST_MIPMAP_LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

	gl.uniform1i(gl.getUniformLocation(program, "texture4"), 4);
}
