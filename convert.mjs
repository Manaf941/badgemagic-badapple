import Canvas from "canvas"
import { readdir, writeFile } from "fs/promises"
import { join } from "path"

const dir = join("bad_apple")
const images = await readdir(dir)
images.sort((file1, file2) => {
    const [num1, num2] = [file1, file2].map(f => +f.split(".")[0])
    return num1 - num2
})

const parts = 8
const size = [48, 11]
const frames = 15
let i = 0
const fps = 15

for (let p = 0; p < parts; p++) {
    const canvas = Canvas.createCanvas(size[0] * frames, size[1])
    const ctx = canvas.getContext("2d")
    
    for (let f = 0; f < frames; f++, i += 30 / fps) {
        const image = await Canvas.loadImage(
            join(
                dir,
                images[Math.round(i)]
            )
        )
    
        ctx.drawImage(
            image,
            
            0,
            120,
            image.width,
            120,
    
            size[0] * f,
            0,
            ...size
        )
    }
    
    // fix pixels color
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height)
    for(let x = 0; x < canvas.width; x++) {
        for(let y = 0; y < canvas.height; y++) {
            const i = 4 * (y * canvas.width + x)
            const [r, g, b, a] = [
                pixels.data[i+0],
                pixels.data[i+1],
                pixels.data[i+2],
                pixels.data[i+3],
            ]
            
            const average = (r + g + b) / 3
            const value = average > 128 ? 0xff : 0
            pixels.data[i+0] = value
            pixels.data[i+1] = value
            pixels.data[i+2] = value
            pixels.data[i+3] = 0xff
        }
    }
    
    ctx.putImageData(pixels, 0, 0)
    
    await writeFile(
        `animation${p}.png`,
        canvas.toBuffer()
    )
}