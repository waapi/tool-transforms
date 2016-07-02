CanvasRenderingContext2D.prototype.dashedLine = function (x0, y0, x1, y1, dash, gap) {
    if(dash == undefined) dash = 2;
	if(gap == undefined) gap = 2;
	var dashgap = dash + gap;
	
	var dx = x1 - x0;
    var dy = y1 - y0;
	var dist = Math.sqrt(dx * dx + dy * dy);
	var nx = dx / dist;
	var ny = dy / dist;
	var dashX = nx * dash;
	var dashY = ny * dash;
	var gapX = nx * gap;
	var gapY = ny * gap;
	
	var approx = dist / dashgap;
	var total = Math.floor(approx);
	var expose = approx - total;
	
	x0 += nx * dashgap * expose * 0.5;
	y0 += ny * dashgap * expose * 0.5;
	
	x0 -= gapX * 0.5;
	y0 -= gapY * 0.5;
	
    while (total-->0)
	{
        x0 += gapX;
		y0 += gapY;
		this.moveTo(x0, y0);
		x0 += dashX;
		y0 += dashY;
		this.lineTo(x0, y0);
    }
};

CanvasRenderingContext2D.prototype.roundedRect = function (x, y, w, h, r) {
	this.moveTo(x + r, y);
	this.arcTo(x + w, y, x + w, y + r, r);
	this.arcTo(x + w, y + h, x + w - r, y + h, r);
	this.arcTo(x, y + h, x, y + h - r, r);
	this.arcTo(x, y, x + r, y, r);
};
