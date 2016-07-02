
export default class Vector {
	constructor(a, b) {
		if(a instanceof Vector) { this.x = a.x; this.y = a.y }
		else { this.x = a || 0; this.y = b || 0 }
	}
	
	add(a, b) {
		if(a instanceof Vector) { this.x += a.x; this.y += a.y }
		else { this.x += a; this.y += b }
		return this;
	}
	
	sub(a, b) {
		if(a instanceof Vector) { this.x -= a.x; this.y -= a.y }
		else { this.x -= a; this.y -= b }
		return this;
	}
	
	scl(a, b) {
		if(a instanceof Vector) { this.x *= a.x; this.y *= a.y }
		else if(typeof a === 'number' && typeof b === 'number') { this.x *= a; this.y *= b }
		else { this.x *= a; this.y *= a }
		return this;
	}
	
	div(a, b) {
		if(a instanceof Vector) { this.x /= a.x; this.y /= a.y }
		else if(typeof a === 'number' && typeof b === 'number') { this.x /= a; this.y /= b }
		else { this.x /= a; this.y /= a }
		return this;
	}
	
	rot(a) {
		var sin = Math.sin(a), cos = Math.cos(a);
		var x = this.x * cos - this.y * sin;
		var y = this.x * sin + this.y * cos;
		this.x = x; this.y = y;
		return this;
	}
	
	get mag() { return Math.sqrt(this.x * this.x + this.y * this.y) }
	get clone() { return new Vector(this) }
	get perp() { return new Vector(this.y, this.x) }
	get angle() { return Math.atan2(this.y, this.x) }
}
