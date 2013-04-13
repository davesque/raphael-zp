/*global Raphael: true, _:true*/

/**
 * Raphaël-ZP: A zoom/pan plugin for Raphaël.
 * ==========================================
 *
 * This code is licensed under the following BSD license:
 *
 * Copyright 2013-present David Sanders <davesque@gmail.com> (Slimming of functionality and updates to work with v2.1.0).  All rights reserved.
 * Copyright 2010 Chris Scott <christocracy@gmail.com> (Raphaël-ZPD integration with VEMap).  All rights reserved
 * Copyright 2010 Daniel Assange <somnidea@lemma.org> (Raphaël integration and extensions). All rights reserved.
 * Copyright 2009-2010 Andrea Leofreddi <a.leofreddi@itcharm.com> (original author). All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *   1. Redistributions of source code must retain the above copyright notice,
 *      this list of conditions and the following disclaimer.
 *
 *   2. Redistributions in binary form must reproduce the above copyright
 *      notice, this list of conditions and the following disclaimer in the
 *      documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES,
 * INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL Andrea
 * Leofreddi OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
 * OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * The views and conclusions contained in the software and documentation are
 * those of the authors and should not be interpreted as representing official
 * policies, either expressed or implied.
 */

/**
 * Dependencies:
 * jQuery -- http://jquery.com/
 * Underscore.js -- http://underscorejs.org/
 * jQuery Mousewheel -- https://github.com/brandonaaron/jquery-mousewheel
 */

;(function(Raphael) {

  var defaults = {
    zoom: true,
    pan: true,
    stopPanOnMouseOut: false,
    scaleStrokeWidth: true
  };

  function init(paper, opts) {
    var state, stateOrigin;
    var viewBox, origViewBox;

    /**
     * Registers event handlers.
     */
    function setupHandlers(el) {
      var $el = $(el);

      if ( opts.pan ) {
        $el.bind("mousedown", handleMouseDown);
        $el.bind("mousemove", handleMouseMove);
        $el.bind("mouseup", handleMouseUp);
        if ( opts.stopPanOnMouseOut ) $el.bind("mouseout", handleMouseUp);
      }

      if ( opts.zoom ) $el.bind("mousewheel", handleMouseWheel);
    }

    /**
     * Un-registers event handlers.
     */
    function removeHandlers(el) {
      var $el = $(el);

      if ( opts.pan ) {
        $el.unbind("mousedown", handleMouseDown);
        $el.unbind("mousemove", handleMouseMove);
        $el.unbind("mouseup", handleMouseUp);
        if ( opts.stopPanOnMouseOut ) $el.unbind("mouseout", handleMouseUp);
      }

      if ( opts.zoom ) $el.unbind("mousewheel", handleMouseWheel);
    }

    /**
     * Gets an SVGPoint object for the given paper and event objects.
     */
    function getEventPoint(e) {
      var p = paper.canvas.createSVGPoint();
      p.x = e.clientX;
      p.y = e.clientY;
      return p;
    }

    /**
     * Gets the delta (relative to the paper's viewbox size) between the x and
     * y coordinates for two event points.
     */
    function getPointDelta(a, b) {
      return {
        dx: (b.x - a.x) * paper._vbSize,
        dy: (b.y - a.y) * paper._vbSize
      };
    }

    /**
     * Scales (zooms) the paper view box.
     */
    function handleMouseWheel(e) {
      var wheelDelta, aspectRatio, strokeScale;

      if ( e.preventDefault ) e.preventDefault();
      e.returnValue = false;

      // Chrome/Safari
      if ( e.wheelDelta ) wheelDelta = e.wheelDelta / 360;
      // Mozilla
      else wheelDelta = e.detail / -9;

      aspectRatio = paper.width / paper.height;
      wheelDelta *= 200;

      // Update viewbox x and y offset
      viewBox[0] += wheelDelta * e.offsetX / paper.height;
      viewBox[1] += wheelDelta * e.offsetY / paper.height;

      // Update viewbox width.  Calculate width change ratio.  And yes, height
      // is purposefully being left alone.
      strokeScale = 1 - wheelDelta * aspectRatio / viewBox[2];
      viewBox[2] -= wheelDelta * aspectRatio;

      if ( opts.scaleStrokeWidth ) {
        paper.forEach(function(el) {
          var sw = parseFloat(el.attr("stroke-width"));
          el.attr("stroke-width", sw / strokeScale);
        });
      }

      paper.setViewBox(viewBox[0], viewBox[1], viewBox[2], viewBox[3]);
    }

    /**
     * Modifies the paper view box if current state is "pan".
     */
    function handleMouseMove(e) {
      if ( e.preventDefault ) e.preventDefault();
      e.returnValue = false;

      if ( state == "pan" ) {
        var p = getEventPoint(e);
        var d = getPointDelta(stateOrigin, p);
        paper.setViewBox(viewBox[0] - d.dx, viewBox[1] - d.dy, viewBox[2], viewBox[3]);
      }
    }

    /**
     * Sets "pan" state and records event origin.
     */
    function handleMouseDown(e) {
      if ( e.preventDefault ) e.preventDefault();
      e.returnValue = false;

      state = "pan";
      stateOrigin = getEventPoint(e);
    }

    /**
     * Resets state on mouse button up event.
     */
    function handleMouseUp(e) {
      if ( e.preventDefault ) e.preventDefault();
      e.returnValue = false;

      var p = getEventPoint(e);
      var d = getPointDelta(stateOrigin, p);
      viewBox[0] -= d.dx;
      viewBox[1] -= d.dy;

      state = stateOrigin = null;
    }

    if ( paper._zpInitialized ) return paper;

    state = stateOrigin = null;

    // Force view box if none specified
    if ( !paper._vbSize ) paper.setViewBox(0, 0, paper.width, 1);

    paper._zpResetViewBox = _.clone(paper._viewBox);
    viewBox = _.clone(paper._viewBox);

    setupHandlers(paper.canvas);

    paper.unZP = function() {
      removeHandlers(paper.canvas);
      delete paper._zpResetViewBox;
      delete paper._zpInitialized;
      delete paper.unZP;
    };

    paper._zpInitialized = true;

    return paper;
  }

  /**
   * Activates zoom and pan functionality on a paper object.
   */
  Raphael.fn.ZP = function(opts) {
    return init(this, _.defaults(opts || {}, defaults));
  };

})(Raphael);
