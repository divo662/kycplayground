/**
 * Lightweight image quality analysis using node "sharp" when available.
 * Computes:
 *  - blur score via Laplacian variance approximation
 *  - brightness/contrast estimates
 *  - crop/border detection via edge density near borders
 */

import sharp from 'sharp'

export interface ImageQualityResult {
  blurScore?: number
  blurLikely: boolean
  brightness?: number
  contrast?: number
  cropLikely: boolean
}

export async function analyzeImageQualityBuffer(buffer: Buffer): Promise<ImageQualityResult> {
  // Defaults
  const result: ImageQualityResult = {
    blurLikely: false,
    cropLikely: false
  }

  const img = sharp(buffer).greyscale()
  const { width, height } = await img.metadata()
  if (!width || !height) return result

  // Get raw pixels
  const raw = await img.raw().toBuffer({ resolveWithObject: true })
  const pixels = raw.data

  // Laplacian variance approximation
  const lapVar = laplacianVariance(pixels, width, height)
  result.blurScore = lapVar
  result.blurLikely = (lapVar !== undefined && lapVar < 50) // heuristic threshold

  // Brightness and contrast (normalized 0..1)
  const { brightness, contrast } = estimateBrightnessContrast(pixels)
  result.brightness = brightness
  result.contrast = contrast

  // Border edge density
  result.cropLikely = detectBorderCrop(pixels, width, height)

  return result
}

function laplacianVariance(pixels: Buffer, width: number, height: number): number {
  // 3x3 Laplacian kernel approximation
  const k = [
    0,  1, 0,
    1, -4, 1,
    0,  1, 0
  ]
  let sum = 0
  let sumSq = 0
  let count = 0
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let v = 0
      let idx = 0
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const px = pixels[(y + ky) * width + (x + kx)]
          v += px * k[idx++]
        }
      }
      sum += v
      sumSq += v * v
      count++
    }
  }
  const mean = sum / Math.max(1, count)
  const variance = sumSq / Math.max(1, count) - mean * mean
  return variance
}

function estimateBrightnessContrast(pixels: Buffer): { brightness: number; contrast: number } {
  const n = pixels.length
  if (!n) return { brightness: 0.5, contrast: 0.5 }
  let sum = 0
  for (let i = 0; i < n; i++) sum += pixels[i]
  const mean = sum / n
  let varSum = 0
  for (let i = 0; i < n; i++) {
    const d = pixels[i] - mean
    varSum += d * d
  }
  const variance = varSum / n
  // Normalize
  const brightness = Math.min(1, Math.max(0, mean / 255))
  const contrast = Math.min(1, Math.max(0, Math.sqrt(variance) / 128))
  return { brightness, contrast }
}

function detectBorderCrop(pixels: Buffer, width: number, height: number): boolean {
  // Compute simple edge density near image borders using finite differences
  const edge = (x: number, y: number) => {
    const idx = y * width + x
    const center = pixels[idx]
    const right = pixels[idx + 1] || center
    const down = pixels[idx + width] || center
    return Math.abs(center - right) + Math.abs(center - down)
  }
  const margin = Math.floor(Math.min(width, height) * 0.05)
  let borderSum = 0
  let borderCount = 0
  for (let x = 0; x < width; x++) {
    for (let y of [0, 1, 2, margin, height - 1, height - 2, height - 3]) {
      if (y >= 0 && y < height) { borderSum += edge(x, y); borderCount++ }
    }
  }
  for (let y = 0; y < height; y++) {
    for (let x of [0, 1, 2, margin, width - 1, width - 2, width - 3]) {
      if (x >= 0 && x < width) { borderSum += edge(x, y); borderCount++ }
    }
  }
  const avgEdge = borderSum / Math.max(1, borderCount)
  // If very low edge activity near borders, likely heavy crop or background fill
  return avgEdge < 10
}


