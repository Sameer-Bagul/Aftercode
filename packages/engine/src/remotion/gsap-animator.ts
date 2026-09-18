import gsap from 'gsap';

/**
 * GsapRemotionAnimator
 * Frame-accurate animation helper bridging GSAP timelines with Remotion's frame clock.
 */
export class GsapRemotionAnimator {
  /**
   * Calculates progress (0 to 1) for a specific frame window
   */
  static getProgress(frame: number, startFrame: number, durationFrames: number): number {
    if (frame <= startFrame) return 0;
    if (frame >= startFrame + durationFrames) return 1;
    return (frame - startFrame) / durationFrames;
  }

  /**
   * Evaluates GSAP power2.out cubic easing for smooth entrance animations
   */
  static easeOutCubic(progress: number): number {
    const p = Math.max(0, Math.min(1, progress));
    return 1 - Math.pow(1 - p, 3);
  }

  /**
   * Evaluates GSAP back.out elastic bounce easing for card pop-in effects
   */
  static easeOutBack(progress: number, overshoot: number = 1.70158): number {
    const p = Math.max(0, Math.min(1, progress));
    const c1 = overshoot;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
  }

  /**
   * Generates CSS transform properties (scale, opacity, translateY) based on GSAP easing
   */
  static getCardStyle(
    frame: number,
    startFrame: number,
    durationFrames: number = 20
  ): { transform: string; opacity: number } {
    const progress = this.getProgress(frame, startFrame, durationFrames);
    const scale = this.easeOutBack(progress, 1.4);
    const translateY = (1 - this.easeOutCubic(progress)) * 40;
    const opacity = Math.min(1, progress * 1.5);

    return {
      transform: `translateY(${translateY}px) scale(${scale})`,
      opacity,
    };
  }
}
