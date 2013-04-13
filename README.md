# Raphaël-ZP

A plugin for [Raphaël](http://raphaeljs.com/) version 2.1.0 and above to allow
click and drag panning and mouse wheel zooming.

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
  // Pan options
  pan: true,
  // If true, panning stops when the mouse leaves the area of the svg canvas
  stopPanOnMouseOut: false,

  // Zoom options
  zoom: true,
  // Set this to 0.5 if you want wheel zooming to be half as sensitive.  Set it
  // to 2 if you want it to be twice as sensitive.  Etc.
  mouseWheelSensitivity: 1,
  // If true, zooming affects the stroke width of elements in the paper.  Set
  // to false to disable this.
  scaleStrokeWidth: true
});
```

To remove zooming and panning behavior from a paper object:

```javascript
// Removes zooming and panning behavior
paper.unZP();
```

## License

Please take a moment to review the license as specified in the `LICENSE` file.
