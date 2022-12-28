const log = console.log;
const raf = window.requestAnimationFrame 
         || window.mozRequestAnimationFrame 
         || window.webkitRequestAnimationFrame 
         || window.msRequestAnimationFrame;

const conf = { bg: "#212121", fg: "#660" };

// init
const canvas = z("canvas");
const ctx = canvas.getContext("2d");

// viewport, offset, offset adjustment
let vw = 100;
let vh = 100;
let off = 0;
let offAdjust = 0.03;
let offExtra = 0;
let time = new Date().getTime();

// precalc triangles
const triangles = generateTriangles(5);

// start + handle resize
updateCanvasSize();
window.onresize = updateCanvasSize;

function updateCanvasSize() {
    canvas.width = canvas.getBoundingClientRect().width;
    canvas.height = canvas.getBoundingClientRect().height;
    ctx.fillStyle = conf.bg;
    ctx.strokeStyle = conf.fg;

    run();
}

function run() {

    let now = new Date().getTime();
    if(now - time > 40) {
        time = now;

        // clear
        ctx.fillStyle = "#212121";
        ctx.fillRect(0,0,canvas.width,canvas.height);

        // draw triangles relative to current offset and viewport
        drawTriangles(triangles, off, off, vw-off, vh-off);

        // adjusting offset and viewport,
        // repeat triangles in lower right quadrant a couple of times
        drawTriangles(triangles, off + (vw-off)/2, off + (vh-off)/2, 
                                (vw-off)/2, (vh-off)/2);

        drawTriangles(triangles, off + (vw-off)/4*3, off + (vh-off)/4*3, 
                                (vw-off)/4, (vh-off)/4);

        drawTriangles(triangles, off + (vw-off)/8*7, off + (vh-off)/8*7, 
                                (vw-off)/8, (vh-off)/8);

        drawTriangles(triangles, off + (vw-off)/16*15, off + (vh-off)/16*15, 
                                (vw-off)/16, (vh-off)/16);

        drawTriangles(triangles, off + (vw-off)/32*31, off + (vh-off)/32*31, 
                                (vw-off)/32, (vh-off)/32);

        // move offset + add a magic little number for smooth overlapping
        off = off - 1 - offExtra;
        offExtra += offAdjust;

        if(off <= -100) {
            // reached a full cycle
            // repeat, adjusting for possible extra offset
            off = (off + 100) / 2;
            offExtra = 0;
        }
    }

    raf(run);
}

/*
    drawTriangles
*/
function drawTriangles(triangles, ox=0, oy=0, vw=100, vh=100) {
    for (const tri of triangles) {
        // all props are percentages of viewport size
        drawLine({ ax:tri.ax, ay:tri.ay, bx:tri.bx, by:tri.by, ox:ox, oy:oy, vw:vw, vh:vh });
        drawLine({ ax:tri.ax, ay:tri.ay, bx:tri.cx, by:tri.cy, ox:ox, oy:oy, vw:vw, vh:vh });
        drawLine({ ax:tri.cx, ay:tri.cy, bx:tri.bx, by:tri.by, ox:ox, oy:oy, vw:vw, vh:vh });
    }
}

/*
    drawLine
*/
function drawLine(line) {
    // all props are percentages of viewport size
    const ax = (line.ax / 100 * line.vw + line.ox)/100*canvas.width;
    const ay = (line.ay / 100 * line.vh + line.oy)/100*canvas.height;
    const bx = (line.bx / 100 * line.vw + line.ox)/100*canvas.width;
    const by = (line.by / 100 * line.vh + line.oy)/100*canvas.height;

    ctx.beginPath();
    ctx.moveTo(ax,ay);
    ctx.lineTo(bx,by);
    ctx.stroke();
}

/*
    generateTriangles
*/
function generateTriangles(depth = 3, ignoreBottomRight = false) {
    // create triangle grid with the given depth

    // add start triangle
    const triangles = [ { ax:50, ay:0, bx:0, by:100, cx:100, cy:100, level: 1 }];

    for(const tri of triangles) {

        if(tri.level >= depth) {
            break;
        }

        /*
            split triangle ABC into 3 triangles: Adf, dBe, feC

                    A
                   / \
                  /   \
                 /     \
                d-------f
               / \     / \
              /   \   /   \
             /     \ /     \
            B-------e-------C

        */

        // determine x & y offset, center of line
        let ddx = Math.abs(tri.ax-tri.bx) / 2;
        let ddy = Math.abs(tri.ay-tri.by) / 2;
        let edx = Math.abs(tri.bx-tri.cx) / 2;
        let edy = Math.abs(tri.by-tri.cy) / 2;
        let fdx = Math.abs(tri.cx-tri.ax) / 2;
        let fdy = Math.abs(tri.cy-tri.ay) / 2;

        // calculate x & y coordinate to points d e f
        let dx = tri.bx < tri.ax ? tri.bx + ddx : tri.bx - ddx;
        let dy = tri.by < tri.ay ? tri.by + ddy : tri.by - ddy;
        let ex = tri.bx < tri.cx ? tri.bx + edx : tri.bx - edx;
        let ey = tri.by < tri.cy ? tri.by + edy : tri.by - edy;
        let fx = tri.cx < tri.ax ? tri.cx + fdx : tri.cx - fdx;
        let fy = tri.cy < tri.ay ? tri.cy + fdy : tri.cy - fdy;

        if(ignoreBottomRight) {
            // ignore bottom right quadrant
            if( !(tri.ax >= 50 && tri.ay >= 50 && dx >= 50 && dy >= 50 && fx >= 50 && fy >= 50)) {
                triangles.push( { ax:tri.ax, ay:tri.ay, bx:dx, by:dy, cx:fx, cy:fy, level: tri.level+1 } );
            }
            if( !(dx >= 50 && dy >= 50 && tri.bx >= 50 && tri.by >= 50 && ex >= 50 && ey >= 50)) {
                triangles.push( { ax:dx, ay:dy, bx:tri.bx, by:tri.by, cx:ex, cy:ey, level: tri.level+1 } );
            }
            if( !(fx >= 50 && fy >= 50 && ex >= 50 && ey >= 50 && tri.cx >= 50 && tri.cy >= 50)) {
                triangles.push( { ax:fx, ay:fy, bx:ex, by:ey, cx:tri.cx, cy:tri.cy, level: tri.level+1 } );
            }
        } else {
            triangles.push( { ax:tri.ax, ay:tri.ay, bx:dx, by:dy, cx:fx, cy:fy, level: tri.level+1 } );
            triangles.push( { ax:dx, ay:dy, bx:tri.bx, by:tri.by, cx:ex, cy:ey, level: tri.level+1 } );
            triangles.push( { ax:fx, ay:fy, bx:ex, by:ey, cx:tri.cx, cy:tri.cy, level: tri.level+1 } );
        }
    }

    if(ignoreBottomRight) {
        // remove start triangle
        triangles.shift();
    }

    return triangles;
}



/*
    z
    convenience DOM selector
*/
function z(sel) {
    const el = document.querySelectorAll(sel);
    if (el.length == 1) {
        return el[0];
    } else if (el.length == 0) {
        return false;
    } else {
        return el;
    }
}
