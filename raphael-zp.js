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

(function(Raphael) {

  var initialized = false;
  var defaults = {
    zoom: true,
    pan: true,
    stopPanOnMouseOut: false
  };

  function init(paper, opts) {
    var state, stateOrigin;
    var viewBox, origViewBox;

    /**
     * Registers event handlers.
     */
    function setupHandlers(root) {
      if ( opts.pan ) {
        root.onmousedown = handleMouseDown;
        root.onmousemove = handleMouseMove;
        root.onmouseup = handleMouseUp;
        if ( opts.stopPanOnMouseOut ) root.onmouseout = handleMouseUp;
      }

      if ( opts.zoom ) {
        if ( navigator.userAgent.toLowerCase().indexOf('webkit') >= 0 )
          document.addEventListener('mousewheel', handleMouseWheel, false); // Chrome/Safari
        else
          document.addEventListener('DOMMouseScroll', handleMouseWheel, false); // Others
      }
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
      var delta, ratio;

      if ( e.preventDefault ) e.preventDefault();
      e.returnValue = false;

      // Chrome/Safari
      if ( e.wheelDelta ) delta = e.wheelDelta / 360;
      // Mozilla
      else delta = e.detail / -9;

      ratio = paper.width / paper.height;
      delta *= 100;

      viewBox[0] += ratio * delta;
      viewBox[1] += delta;
      viewBox[2] -= 2 * ratio * delta;
      //viewBox[3] -= 2 * delta;

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

    state = stateOrigin = null;

    // Force view box if none specified
    if ( !paper._vbSize ) paper.setViewBox(0, 0, paper.width, 1);

    paper._zpResetViewBox = _.clone(paper._viewBox);
    viewBox = _.clone(paper._viewBox);

    setupHandlers(paper.canvas);
    initialized = true;
  }

  /**
   * Activates zoom and pan functionality on a paper object.
   */
  Raphael.fn.ZP = function(opts) {
    opts = _.defaults(opts || {}, defaults);
    if ( !initialized ) init(this, opts);
    return this;
  };

})(Raphael);
