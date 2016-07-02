// import { glMatrix, mat2, mat2d, mat3, mat4, quat, vec2, vec3, vec4 } from 'polyfills/gl-matrix.js';
import mat4 from 'gl-mat4';
import decompose from 'mat4-decompose';
mat4.decompose = decompose;
import quat from 'gl-quat';
import vec3 from 'gl-vec3';

import 'polyfills/canvas.js';
import Vector from 'polyfills/vector.js';
import CSSParser from 'polyfills/css-parser.js';
import React from 'react';

/*
	[ 0, 1, 2, 3,  [m00,m10,m20,m30,  [sx,   ,   ,  
	  4, 5, 6, 7,   m01,m11,m21,m31,     , sy,   ,  
	  8, 9,10,11,   m02,m12,m22,m32,     ,   , sz,-1/perspective
	 12,13,14,15]   m03,m13,m23,m33]   tx, ty, tz,  ]
*/


mat4.getCSSMatrix2d = function(out, mat) {
	out[0] = mat[0];
	out[1] = mat[1];
	out[2] = mat[4];
	out[3] = mat[5];
	out[4] = mat[12];
	out[5] = mat[13];
	return out;
};

mat4.getScaling = function(out, mat) {
	out[0] = mat[0];
	out[1] = mat[5];
	out[2] = mat[10];
};

quat.getEuler = function(out, q) {
	var sx = 2 * (q[0] * q[3] - q[1] * q[2]);
	var sy = 2 * (q[1] * q[3] + q[0] * q[2]);
	var ys = q[3] * q[3] - q[1] * q[1];
	var xz = q[0] * q[0] - q[2] * q[2];
	var cx = ys - xz;
	var cy = Math.sqrt(sx * sx + cx * cx);
	
	if (cy > 0.00034906584331009674)
	{
		out[0] = Math.atan2(sx, cx);
		out[1] = Math.atan2(sy, cy);
		out[2] = Math.atan2(2 * (q[2] * q[3] - q[0] * q[1]), ys + xz);
	}
	
	else
	{
		out[0] = 0;
		if (sy > 0)
		{
			out[1] = Math.PI/2;
			out[2] = 2 * Math.atan2(q[2] + q[0], q[3] + q[1]);
		}
		else
		{
			out[1] = -Math.PI/2;
			out[2] = 2 * Math.atan2(q[2] - q[0], q[3] - q[1]);
		}
	}
};




export default class Transforms extends React.Component {
	constructor(props) {
		super(props);
		
		var transform = null;
		if(props.transform) transform = CSSParser.transform(props.transform);
		
		this.state = {
			transform
		};
		
		window.addEventListener('resize', ::this.handleResize);
	}
	
	componentWillMount() {}
	
	componentDidMount() {
		this.layout();
		this.paint();
	}
	
	componentWillUnmount() {}
	
	componentWillReceiveProps(nextProps) {
		var state = {};
		if(this.props.transform !== nextProps.transform)
		{
			state.transform = nextProps.transform? CSSParser.transform(nextProps.transform) : null;
		}
		
		if(this.props.reference !== nextProps.reference)
		{
			state.reference = nextProps.reference || null;
		}
		
		this.setState(state);
	}
	
	componentWillUpdate(nextProps, nextState) {
		
	}
	
	componentDidUpdate(prevProps, prevState) {
		this.paint();
	}
	
	handleResize() {
		this.layout();
		this.paint();
	}
	
	layout() {
		var rect = this.canvas.getBoundingClientRect();
		this.canvas.width = rect.width * window.devicePixelRatio;
		this.canvas.height = rect.height * window.devicePixelRatio;
		this.context = this.canvas.getContext('2d');
	}
	
	// sandwich(stack) {
	// 	return stack.reduceRight((b, a) => mat4.multiply(b, a, b), mat4.create());
		
		/*return stack.reduce((m, op) => {
			switch(op[0])
			{
				case 'translate': mat4.translate(m, m, op[1]); break;
				case 'scale': mat4.scale(m, m, op[1]); break;
				case 'rotate': mat4.rotate(m, m, op[2], op[1]); break;
			}
			return m;
		}, mat4.create());*/
	// }
	
	paint() {
		var origin = this.canvas.getBoundingClientRect();
		var reference = this.state.reference;
		var ctx = this.context;
		
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		
		if(!reference || !this.state.transform) return;
		
		var styles = getComputedStyle(reference);
		CSSParser.base = {
			width: parseFloat(styles.width),
			height: parseFloat(styles.height),
			fontSize: parseFloat(styles.fontSize)
		};
		
		var base = {
			top: reference.offsetTop,
			left: reference.offsetLeft,
			width: parseFloat(styles.width),
			height: parseFloat(styles.height)
		};
		
		
		ctx.save();
		
		if(window.devicePixelRatio !== 1) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
		
		// var stack = [];
		var matrix = mat4.create();
		var pos = vec3.create();
		var scl = vec3.fromValues(1, 1, 1);
		var skew = vec3.create();
		var perspective = null; // vec4.create();
		var rot = quat.create();
		var euler = vec3.create();
		
		
		// Origin of DOM layout
		var boxModelOrigin = vec3.fromValues(base.left - origin.left, base.top - origin.top, 0);
		// stack.push(mat4.fromTranslation(mat4.create(), boxModelOrigin)); // ['translate', boxModelOrigin]);
		mat4.translate(matrix, matrix, boxModelOrigin);
		
		
		// Origin of transform
		var transformOrigin = vec3.fromValues(base.width * 0.5, base.height * 0.5, 0); // assuming default for now, which is center
		// stack.push(mat4.fromTranslation(mat4.create(), transformOrigin)); // ['translate', transformOrigin]);
		mat4.translate(matrix, matrix, transformOrigin);
		
		
		// Export components
		// matrix = this.sandwich(stack);
		// mat4.getTranslation(pos, matrix);
		// mat4.getScaling(scl, matrix);
		// mat4.getRotation(rot, matrix);
		mat4.decompose(matrix, pos, scl, skew, perspective, rot);
		quat.getEuler(euler, rot);
		
		
		/// Style defaults
		ctx.lineWidth = 1;
		ctx.fillStyle = 'hsl(215, 100%, 50%)';
		ctx.strokeStyle = 'hsl(215, 100%, 50%)';
		
		/// Origin widget
		ctx.beginPath();
		ctx.arc(pos[0], pos[1], 5, 0, Math.PI*2);
		ctx.closePath();
		ctx.stroke();
		
		
		/// Draw pre-transform box
		var radius = CSSParser.value(styles.borderRadius);
		ctx.save();
		ctx.beginPath();
		ctx.translate(pos[0], pos[1]);
		ctx.roundedRect(base.width * -.5, base.height * -.5, base.width, base.height, radius);
		ctx.closePath();
		ctx.strokeStyle = 'hsla(215, 100%, 50%, 0.1)';
		ctx.stroke();
		ctx.restore();
		
		
		
		this.state.transform.map(fn => {
			switch(fn.name) {
				case 'matrix':
					return { name, type: 'matrix', m: fn.values };
				
				case 'matrix3d':
					return { name, type: 'matrix', m: fn.values };
				
				case 'translate':
					var x = CSSParser.value(fn.values[0]);
					var y = fn.values[1]? CSSParser.value(fn.values[1]) : 0;
					return { name, type: 'translate', x, y };
				
				case 'translateX':
					var x = CSSParser.value(fn.values[0]);
					return { name, type: 'translate', x, y: 0 };
				
				case 'translateY':
					var y = CSSParser.value(fn.values[0]);
					return { name, type: 'translate', x: 0, y };
				
				case 'translateZ':
					var z = CSSParser.value(fn.values[0]);
					return { name, type: 'translate', x: 0, y: 0, z };
				
				case 'translate3d':
					var x = CSSParser.value(fn.values[0]);
					var y = CSSParser.value(fn.values[1]);
					var z = CSSParser.value(fn.values[2]);
					return { name, type: 'translate', x, y, z };
				
				case 'scale':
					if(fn.values[1] === undefined)
					{
						var scale = fn.values[0];
						return { name, type: 'scale', x: scale, y: scale };
					}
					else
					{
						var x = fn.values[0];
						var y = fn.values[1];
						return { name, type: 'scale', x, y };
					}
				case 'scaleX':
					var x = fn.values[0];
					var y = 1;
					return { name, type: 'scale', x, y };
				
				case 'scaleY':
					var x = 1;
					var y = fn.values[0];
					return { name, type: 'scale', x, y };
				
				case 'scaleZ':
					var x = 1;
					var y = 1;
					var z = fn.values[0];
					return { name, type: 'scale', x, y, z };
				
				case 'scale3d':
					var x = fn.values[0];
					var y = fn.values[1];
					var z = fn.values[2];
					return { name, type: 'scale', x, y, z };
				
				case 'rotate':
				case 'rotateZ':
					var a = CSSParser.value(fn.values[0]);
					return { name, type: 'rotate', x: 0, y: 0, z: 1, a };
				
				case 'rotateX':
					var a = CSSParser.value(fn.values[0]);
					return { name, type: 'rotate', x: 1, y: 0, z: 0, a };
				
				case 'rotateY':
					var a = CSSParser.value(fn.values[0]);
					return { name, type: 'rotate', x: 0, y: 1, z: 0, a };
				
				case 'rotate3d':
					var x = CSSParser.value(fn.values[0]);
					var y = CSSParser.value(fn.values[1]);
					var z = CSSParser.value(fn.values[2]);
					var a = CSSParser.value(fn.values[3]);
					return { name, type: 'rotate', x, y, z, a };
				
				case 'skew':
					var x = CSSParser.value(fn.values[0]);
					var y = fn.values[1]? CSSParser.value(fn.values[1]) : 0;
					return { name, type: 'skew', x, y };
				
				case 'skewX':
					var x = CSSParser.value(fn.values[0]);
					return { name, type: 'skew', x, y: 0 };
				
				case 'skewY':
					var y = CSSParser.value(fn.values[0]);
					return { name, type: 'skew', x: 0, y };
				
				case 'perspective':
					var v = CSSParser.value(fn.values[0]);
					return { name, type: 'perspective', v };
				
				default: return null; // Invalid fn
			}
			
			return null;
		}).forEach(fn => {
			if(!fn) return;
			
			ctx.save();
			
			switch(fn.type) {
				case 'translate':
					var a = vec3.clone(pos);
					var v = vec3.fromValues(fn.x, fn.y, 0);
					vec3.multiply(v, v, scl);
					vec3.transformQuat(v, v, rot);
					var b = vec3.add(vec3.create(), pos, v);
					var delta = vec3.subtract(vec3.create(), b, a);
					var dir = vec3.normalize(vec3.create(), delta);
					
					/*var a = new Vector(pos[0], pos[1]).clone;
					var v = new Vector(fn.x, fn.y).scl(scl).rot(rot);
					var b = pos.clone.add(v);
					var delta = b.clone.sub(a);
					var dist = delta.mag;
					var dir = delta.clone.div(dist);
					var angle = delta.angle;*/
					
					ctx.save();
					ctx.beginPath();
					
					ctx.translate(b[0], b[1]);
					ctx.rotate(euler[2]);
					ctx.rect(-3, -3, 6, 6);
					ctx.closePath();
					ctx.fill();
					ctx.restore();
					
					var offset = vec3.scale(vec3.create(), dir, 6);
					vec3.add(a, a, offset);
					vec3.subtract(b, b, offset);
					
					// var offset = dir.clone.scl(6);
					// a.add(offset);
					// b.sub(offset);
					
					ctx.beginPath();
					
					ctx.dashedLine(
						Math.round(a[0]) - .5, Math.round(a[1]) - .5,
						Math.round(b[0]) - .5, Math.round(b[1]) - .5,
						5, 10
					);
					
					ctx.closePath();
					
					ctx.stroke();
					
				break;
				case 'scale':
					ctx.save();
					ctx.beginPath();
					
					ctx.translate(pos[0], pos[1]);
					ctx.rotate(euler[2]);
					
					if(fn.x !== 1)
					{
						// ctx.moveTo(-18, 4);
						// ctx.lineTo(-18, -4);
						// 
						// ctx.moveTo(18, 4);
						// ctx.lineTo(18, -4);
						
						ctx.clearRect(-18, -3, 14, 6);
						ctx.clearRect(4, -3, 14, 6);
						
						if(fn.x > 1)
						{
							ctx.moveTo(-6, 0);
							ctx.lineTo(-12, 0);
							
							ctx.moveTo(-13, 2);
							ctx.lineTo(-16, 0);
							ctx.lineTo(-13, -2);
							
							ctx.moveTo(6, 0);
							ctx.lineTo(12, 0);
							
							ctx.moveTo(13, 2);
							ctx.lineTo(16, 0);
							ctx.lineTo(13, -2);
						}
						else
						{
							ctx.moveTo(-10, 0);
							ctx.lineTo(-16, 0);
							
							ctx.moveTo(-9, 2);
							ctx.lineTo(-6, 0);
							ctx.lineTo(-9, -2);
							
							ctx.moveTo(10, 0);
							ctx.lineTo(16, 0);
							
							ctx.moveTo(9, 2);
							ctx.lineTo(6, 0);
							ctx.lineTo(9, -2);
						}
					}
					
					if(fn.y !== 1)
					{
						// ctx.moveTo(4, -18);
						// ctx.lineTo(-4, -18);
						// 
						// ctx.moveTo(4, 18);
						// ctx.lineTo(-4, 18);
						
						ctx.clearRect(-3, -18, 6, 14);
						ctx.clearRect(-3, 4, 6, 14);
						
						if(fn.y > 1)
						{
							ctx.moveTo(0, -6);
							ctx.lineTo(0, -12);
							
							ctx.moveTo(2, -13);
							ctx.lineTo(0, -16);
							ctx.lineTo(-2, -13);
							
							ctx.moveTo(0, 6);
							ctx.lineTo(0, 12);
							
							ctx.moveTo(2, 13);
							ctx.lineTo(0, 16);
							ctx.lineTo(-2, 13);
							
						}
						else
						{
							ctx.moveTo(0, -10);
							ctx.lineTo(0, -16);
							
							ctx.moveTo(2, -9);
							ctx.lineTo(0, -6);
							ctx.lineTo(-2, -9);
							
							ctx.moveTo(0, 10);
							ctx.lineTo(0, 16);
							
							ctx.moveTo(2, 9);
							ctx.lineTo(0, 6);
							ctx.lineTo(-2, 9);
						}
					}
					
					ctx.stroke();
					ctx.restore();
					
					
					// ctx.beginPath();
					// ctx.arc(pos[0], pos[1], 1, 0, Math.PI*2);
					// ctx.closePath();
					// ctx.fill();
				break;
				case 'rotate':
					ctx.save();
					ctx.beginPath();
					ctx.translate(pos[0], pos[1]);
					ctx.rotate(euler[2]);
					
					if(Math.abs(fn.a) < (Math.PI/180 * 15))
					{
						var start = Math.PI/2;
						var end = Math.PI/2 + fn.a;
						
						ctx.arc(0, 0, 40, start, end, fn.a < 0);
					}
					
					else
					{
						ctx.clearRect(-1, 33, 3, 47 - 33);
						ctx.moveTo(0, 35);
						ctx.lineTo(0, 45);
						
						ctx.moveTo(fn.a > 0? -2 : 2, 40);
						var start = Math.PI/2 + (Math.PI/180 * (fn.a > 0? 3 : -3));
						var end = Math.PI/2 + (fn.a + (Math.PI/180 * (fn.a > 0? -5 : 5)));
						
						ctx.arc(0, 0, 40, start, end, fn.a < 0);
						
						ctx.rotate(fn.a);
						
						
						if(fn.a > 0)
						{
							ctx.moveTo(5, 35);
							ctx.lineTo(0, 40);
							ctx.lineTo(5, 45);
						}
						else if(fn.a < 0)
						{
							ctx.moveTo(-5, 35);
							ctx.lineTo(0, 40);
							ctx.lineTo(-5, 45);
						}
					}
					
					// for(var iter = 2; iter < 96; iter += iter)
					// {
					// 	ctx.rotate(fn.a/iter);
					// 	ctx.moveTo(0, 37);
					// 	ctx.lineTo(0, 38);
					// 	ctx.moveTo(0, 42);
					// 	ctx.lineTo(0, 43);
					// }
					
					// ctx.rotate(fn.a/2);
					// 
					// ctx.moveTo(0, 37);
					// ctx.lineTo(0, 38);
					// ctx.moveTo(0, 42);
					// ctx.lineTo(0, 43);
					
					ctx.stroke();
					ctx.restore();
				break;
				case 'skew': break;
				case 'matrix': break;
				case 'perspective': break;
			}
			
			ctx.restore();
			
			switch(fn.type) {
				case 'translate':
					// Apply transform
					var t = vec3.fromValues(fn.x, fn.y, 0);
					// stack.push(mat4.fromTranslation(mat4.create(), t)); // ['translate', t]);
					mat4.translate(matrix, matrix, vec3.fromValues(fn.x, fn.y, 0));
					
					// Export components
					// matrix = this.sandwich(stack);
					// mat4.getTranslation(pos, matrix);
					// mat4.getScaling(scl, matrix);
					// mat4.getRotation(rot, matrix);
					mat4.decompose(matrix, pos, scl, skew, perspective, rot);
					quat.getEuler(euler, rot);
					
					
					// var v = new Vector(fn.x, fn.y).scl(scl).rot(rot);
					// pos.add(v);
				break;
				case 'scale':
					// Apply transform
					var s = vec3.fromValues(fn.x, fn.y, fn.z || 1);
					// stack.push(mat4.fromScaling(mat4.create(), s)); // ['scale', s]);
					mat4.scale(matrix, matrix, s);
					
					// Export components
					// matrix = this.sandwich(stack);
					// mat4.getTranslation(pos, matrix);
					// mat4.getScaling(scl, matrix);
					// mat4.getRotation(rot, matrix);
					mat4.decompose(matrix, pos, scl, skew, perspective, rot);
					quat.getEuler(euler, rot);
					
					// scl.scl(fn.x, fn.y);
				break;
				case 'rotate':
					// Apply transform
					var axis = vec3.fromValues(fn.x, fn.y, fn.z);
					var angle = fn.a;
					// stack.push(mat4.fromRotation(mat4.create(), angle, axis)); // ['rotate', axis, angle]);
					mat4.rotate(matrix, matrix, angle, axis);
					
					// Export components
					// matrix = this.sandwich(stack);
					// mat4.getTranslation(pos, matrix);
					// mat4.getScaling(scl, matrix);
					// mat4.getRotation(rot, matrix);
					mat4.decompose(matrix, pos, scl, skew, perspective, rot);
					quat.getEuler(euler, rot);
					
					
					// if(fn.z === 1) rot += fn.a;
				break;
				case 'skew':
					// ctx.transform(1, Math.tan(fn.y), Math.tan(fn.x), 1, 0, 0);
				break;
				case 'matrix':
					// if(fn.m.length === 6) ctx.transform.apply(ctx, fn.m);
					// else ctx.transform.apply(ctx, fn.m.filter((c, i) => i < 12 && i%4 < 2))
				break;
				case 'perspective':
					// ctx.transform() is only a transform matrix, need to figure out how to apply a projection matrix
				break;
			}
		});
		
		if(reference instanceof HTMLElement)
		{
			var radius = CSSParser.value(styles.borderRadius);
			
			ctx.save();
			// ctx.translate(pos[0], pos[1]);
			// ctx.rotate(euler[2]);
			ctx.resetTransform();
			var cssMatrix = mat4.getCSSMatrix2d([], matrix);
			ctx.setTransform.apply(ctx, cssMatrix);
			// ctx.setTransform(cssMatrix[0], cssMatrix[1], cssMatrix[4], cssMatrix[5], cssMatrix[12], cssMatrix[13]);
			
			var w = base.width;
			var h = base.height;
			
			ctx.beginPath();
			ctx.roundedRect(w * -.5, h * -.5, w, h, radius);
			ctx.closePath();
			ctx.stroke();
			
			// ctx.beginPath();
			// ctx.arc(w * .5, h * .5, 3, 0, Math.PI*2);
			// ctx.closePath();
			// ctx.stroke();
			// 
			// ctx.beginPath();
			// ctx.arc(w * -.5, h * .5, 3, 0, Math.PI*2);
			// ctx.closePath();
			// ctx.stroke();
			// 
			// ctx.beginPath();
			// ctx.arc(w * -.5, h * -.5, 3, 0, Math.PI*2);
			// ctx.closePath();
			// ctx.stroke();
			// 
			// ctx.beginPath();
			// ctx.arc(w * .5, h * -.5, 3, 0, Math.PI*2);
			// ctx.closePath();
			// ctx.stroke();
			
			ctx.restore();
		}
		
		else
		{
			ctx.beginPath();
			ctx.rect(0, 0, base.width, base.height);
			ctx.closePath();
			ctx.stroke();
		}
		
		
		ctx.restore();
	}
	
	render() {
		return (
			<canvas
				ref={c => this.canvas = c}
				className="overlay"
			/>
		);
	}
}
