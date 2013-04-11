# Raphaël-ZP

A plugin for [Raphaël](http://raphaeljs.com/) version 2.1.0 and above to allow
click and drag panning as well as mouse wheel zooming.

## Acknowledgements

Forked from [Raphaël-VEMap](https://github.com/christocracy/raphael-vemap).

## Usage

Calling ZP on a paper object will enable panning and zooming for that paper:

```javascript
var paper = new Raphael(el, width, height);

paper.ZP();
```

A configuration object may be passed to the ZP function with the following
options (the values in this snippet are the defaults):

```javascript
var paper = new Raphael(el, width, height);

paper.ZP({
  zoom: true,
  pan: true,
  // If true, panning stops when the mouse leaves the area of the svg canvas
  stopPanOnMouseOut: false
});
```

To remove zooming and panning behavior from a paper object:

```javascript
// Removes zooming and panning behavior
paper.unZP();
```

## License

Please take a moment to review the license as specified in the `LICENSE` file.
