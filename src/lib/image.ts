/**
 * Client-side image preparation for uploads.
 *
 * In demo mode every image is stored inline as a data URL inside the works
 * record. A phone photo is 3–6 MB, which fills the browser storage quota after
 * only a handful of works, so the next save throws and edits look "lost".
 * Downscaling to a sane web size first keeps each image small enough that a
 * portfolio can hold many works without hitting the quota.
 */

/** Longest edge, in pixels, that an uploaded image is reduced to. */
const MAX_EDGE = 1600
/** JPEG quality used when re-encoding. */
const QUALITY = 0.82
/** Images already at or below this size are left untouched. */
const SKIP_BELOW_BYTES = 400 * 1024

const isRasterImage = (file: File) => /^image\/(jpeg|png|webp|bmp)$/.test(file.type)

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read image'))
    }
    img.src = url
  })
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not encode image'))),
      'image/jpeg',
      QUALITY,
    )
  })
}

/**
 * Returns a web-sized JPEG of the given file. Non-raster images (SVG, GIF) and
 * already-small files are returned unchanged, and any failure falls back to the
 * original so an upload never breaks because of optimisation.
 */
export async function prepareImage(file: File): Promise<File> {
  if (!isRasterImage(file) || file.size <= SKIP_BELOW_BYTES) return file
  try {
    const img = await loadImage(file)
    const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height))
    const width = Math.max(1, Math.round(img.width * scale))
    const height = Math.max(1, Math.round(img.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(img, 0, 0, width, height)
    const blob = await canvasToBlob(canvas)
    if (blob.size >= file.size) return file
    const name = file.name.replace(/\.[^.]+$/, '') + '.jpg'
    return new File([blob], name, { type: 'image/jpeg' })
  } catch {
    return file
  }
}
