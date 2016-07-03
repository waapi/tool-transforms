
class CSSParser {
	static transform(string) {
		if(!string) return null;
		
		var number = '[+-]?(?:\\d+\\.\\d+|\\.?\\d+)(?:e\\d+)?';
		
		var length = `${number}(px|em|ex|rem|vw|vh|vmin|vmax|in|cm|mm|pt|pc)`;
		var percent = `${number}(%)`;
		var dimension = `${number}(%|px|em|ex|rem|vw|vh|vmin|vmax|in|cm|mm|pt|pc)`;
		var angle = `${number}(deg|rad|turn)`;
		
		var translate = new RegExp(`\\s*(${dimension}|0)\\s*(?:,\\s*(${dimension}|0)\\s*)?`);
		var translateXYZ = new RegExp(`\\s*(${dimension}|0)\\s*`);
		var translate3d = new RegExp(`\\s*(${dimension}|0)\\s*,\\s*(${dimension}|0)\\s*,\\s*(${dimension}|0)\\s*`);
		
		var rotate = new RegExp(`\\s*(${angle}|0)\\s*`);
		var rotate3d = new RegExp(`\\s*${number}\\s*,\\s*${number}\\s*,\\s*${number}\\s*,\\s*(${angle}|0)\\s*`);
		
		var skew = new RegExp(`\\s*(${angle}|0)\\s*(?:,\\s*(${angle}|0)\\s*)?`);
		var skewXY = new RegExp(`\\s*(${angle}|0)\\s*`);
		
		var perspective = new RegExp(`\\s*(${length}|0)\\s*`);
		
		var functions = /\b((?:matrix|translate|scale|rotate|skew|perspective)(?:X|Y|Z|3d)?)\((.*?)\)/g;
		
		var results = [];
		var result;
		while(result = functions.exec(string))
		{
			var name = result[1];
			var args = result[2];
			var values;
			switch(name) {
				case 'matrix': values = args.split(','); if(values.length !== 6) return null; break;
				case 'matrix3d': values = args.split(','); if(values.length !== 16) return null; break;
				case 'translate': values = args.match(translate); break;
				case 'translateX':
				case 'translateY':
				case 'translateZ': values = args.match(translateXYZ); break;
				case 'translate3d': values = args.match(translate3d); break;
				case 'scale':
				case 'scaleX':
				case 'scaleY':
				case 'scaleZ':
				case 'scale3d': values = args.split(','); break;
				case 'rotate':
				case 'rotateX':
				case 'rotateY':
				case 'rotateZ': values = args.match(rotate); break;
				case 'rotate3d': values = args.match(rotate3d); break;
				case 'skew': values = args.match(skew); break;
				case 'skewX':
				case 'skewY': values = args.match(skewXY); break;
				case 'perspective': values = args.match(perspective); break;
				default: return null; // An invalid or unimplemented transform function? (E.g. skewZ, perspectiveX)
			}
			
			// Parse values into floats
			if(/^(matrix|scale)/.test(name)) // unit-less
			{
				values = values.map(value => parseFloat(value));
			}
			
			else // Some functions have tuples of [value, unit]
			{
				values = (values => {
					var temp = [];
					for(var iter = 0, total = values.length; iter < total; iter += 2)
					{
						var value = values[iter];
						var unit = values[iter + 1];
						if(typeof value === 'string')
						{
							var pair = [parseFloat(value), unit];
							temp.push(pair);
						}
						else return temp;
					}
					return temp;
				})(values.slice(1));
				
				switch(name) {
					case 'translate':
						values[0].push('width');
						if(values[1]) values[1].push('height');
					break;
					case 'translateX': values[0].push('width'); break;
					case 'translateY': values[0].push('height'); break;
					case 'translate3d':
						values[0].push('width');
						values[1].push('height');
					break;
				}
			}
			
			results.push({
				name,
				values
			});
		}
		
		return results;
	}
	
	static value(input) {
		if(!input || !input.length) return null;
		var cardinal = input[2] || 'width';
		
		if(typeof input === 'string')
		{
			input = input.match(/([+-]?\d+?(?:\.\d+)?)(px|em|rem|ex|%|vw|vh|vmin|vmax|in|cm|mm|pt|pc|deg|rad|turn)?/);
			var value = parseFloat(input[1]);
			var unit = input[2];
		}
		
		else
		{
			var [value, unit] = input;
		}
		
		switch (unit) {
			case 'em': return value * CSSParser.base.fontSize;
			case 'rem': return value * parseFloat(getComputedStyle(document.documentElement).fontSize);
			case 'ch': return value * CSSParser.base.fontSize * 0.5;
			case 'ex': return value * CSSParser.base.fontSize * 0.45;
			case '%': return value * CSSParser.base[cardinal] / 100;
			case 'vw': return value * window.innerWidth / 100;
			case 'vh': return value * window.innerHeight / 100;
			case 'vmin': return value * Math.min(window.innerWidth, window.innerHeight) / 100;
			case 'vmax': return value * Math.max(window.innerWidth, window.innerHeight) / 100;
			case 'in': return value * 72;
			case 'cm': return value / 2.54 * 96;
			case 'mm': return value / 2.54 * 96 / 10;
			case 'pt': return value * 96 / 72;
			case 'pc': return value * CSSParser.base[cardinal];
			case 'deg': return value * 0.017453292519943295;
			case 'rad': return value;
			case 'turn': return value * 6.283185307179586;
			default: return value;
		}
	}
}

CSSParser.base = { width: 1, height: 1, fontSize: 16 };

export default CSSParser;
