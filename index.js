const regl = require('regl')('canvas')
const mat4 = require('gl-mat4')
const hsv2rgb = require('hsv2rgb')

const requestCSV = require('d3-request').text
const pad = require('pad')

const camera = require('regl-camera')(regl, {
  center: [0, 2.5, 0]
})
// s3 = ('xxx', frame)
// const url= `https://s3.amazonaws.com/3d-testing/velodyne_points/data/${frame}.txt`
// console.log(url)
// requestCSV(url, (err, data) => {
//   let rows = data.split(' ').map(parseFloat)
//   draw(rows)
// })

min = [-3.40282, -3.40282, -3.40282]
max = [3.40282, 3.40282, 3.40282]

withinBB = (point) => {
  return (
    point[0] > min[0] &&
    point[1] > min[1] &&
    point[2] > min[2] &&

    point[0] < max[0] &&
    point[1] < max[1] &&
      point[2] < max[2]
  )
}
let buildUrl = (n) => {
  let source = 'https://s3.amazonaws.com/3d-testing/data/xxx.bin'
  frame = pad(10, n, "0").replace('pad', '')
  return source.replace('xxx', frame)
}

let loadFrame = (n, cb) => {
  var oReq = new XMLHttpRequest();
  oReq.open("GET", buildUrl(n), true);
  oReq.responseType = "arraybuffer";
  var byteArray
  oReq.onload = function (oEvent) {
    var arrayBuffer = oReq.response;
    if (arrayBuffer) {
      byteArray = new Float32Array(arrayBuffer)
      cb(byteArray)
    }
  };
  oReq.send(null);
}

let drawImg = () =>  {
  let src = '/2011_09_28/2011_09_28_drive_0016_sync/image_00/data/'
  let img = document.querySelector('img')
  img.src = src + '0000000151.png'
  img.src = 'https://s3.amazonaws.com/3d-testing/image_01/data/0000000002.png'
}

drawImg()

const NUM_POINTS = 1.2e5
const VERT_SIZE = 4 * (4 + 3)

e = {}
draw = (byteArray) => {
  let transformByteArray = (byteArray) => {
    console.log(byteArray[0])
    return (Array(NUM_POINTS).fill().map(function (d, i) {
      const color = hsv2rgb(Math.random() * 360, 0.6, 1)
      // const w = byteArray[i*4+3]
      // e[w] = true
      return [
        byteArray[i*4],
        byteArray[i*4+1],
        byteArray[i*4+2],
        0,
        i / 1e5, color[1] / 255, color[2] / 255
      ]
    }).filter((d) => { return d }))
  }

  const buf = transformByteArray(byteArray)
  const pointBuffer = regl.buffer(buf);
  window.x = buf
  window.y = pointBuffer

  document.querySelector('input').addEventListener('change', (e) => {
    let n = + e.target.value
    console.log(n)
    let cb = (byteArray) => {
      pointBuffer(transformByteArray(byteArray))
      //drawParticles()

    }
    loadFrame(n, cb)
  })

  const drawParticles = regl({
    vert: `
  precision mediump float;
  attribute vec4 pos;
  attribute vec3 color;
  uniform float time;
  uniform mat4 view, projection;
  varying vec3 fragColor;
  void main() {
    vec3 position = pos.xyz;
    gl_PointSize = 5.0;
    gl_Position = projection * view * vec4(position, 1);
    fragColor = color;
  }`,

    frag: `
  precision lowp float;
  varying vec3 fragColor;
  void main() {
    if (length(gl_PointCoord.xy - 0.5) > 0.5) {
      discard;
    }
    gl_FragColor = vec4(fragColor, 1);
  }`,

    attributes: {
      pos: {
        buffer: pointBuffer,
        stride: VERT_SIZE,
        offset: 0
      }
      ,
      color: {
        buffer: pointBuffer,
        stride: VERT_SIZE,
        offset: 16
      }
    },

    uniforms: {
      // view: ({tick}) => {
      //   const t = 0.1 * tick
      //   return mat4.lookAt([],
      //                      [3 * Math.cos(t), 2.5, 3 * Math.sin(t)],
      //                      [0, 0, 0],
      //                      [0, 1, 0])
      // },
      // projection: ({viewportWidth, viewportHeight}) =>
      //   mat4.perspective([],
      //                    Math.PI / 2,
      //                    viewportWidth / viewportHeight,
      //                    0.01,
      //                    1000),
      time: ({tick}) => tick * 0.001
    },

    count: buf.length,

    primitive: 'points'
  })

  regl.frame(() => {
    camera((state) => {
      //if (!state.dirty) return;
      regl.clear({color: [0, 0, 0, 1]})
      drawParticles()
    })

  })

}

loadFrame(0, draw)
