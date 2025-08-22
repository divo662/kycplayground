/**
 * Basic video liveness heuristic using HTML5 in-memory decoding is not feasible in Node.
 * This module expects a short WebM/MP4 URL; when available, it attempts to fetch and analyze.
 * For now, provide a stubbed heuristic: if file size > threshold, assume minimal motion present.
 * TODO: Replace with ffmpeg + frame-diff pipeline for real motion scoring when ffmpeg is available.
 */

export interface VideoLivenessResult {
  motionLikely: boolean
  motionScore?: number
}

export async function analyzeVideoLivenessByHeuristic(fileUrl: string): Promise<VideoLivenessResult> {
  try {
    if (!fileUrl) return { motionLikely: false }
    const res = await fetch(fileUrl, { method: 'HEAD' })
    if (!res.ok) return { motionLikely: false }
    const sizeStr = res.headers.get('content-length')
    const size = sizeStr ? parseInt(sizeStr, 10) : 0
    // Heuristic: videos larger than ~100KB likely contain motion (very rough)
    const motionLikely = size > 100 * 1024
    return { motionLikely, motionScore: motionLikely ? 0.7 : 0.2 }
  } catch {
    return { motionLikely: false }
  }
}


