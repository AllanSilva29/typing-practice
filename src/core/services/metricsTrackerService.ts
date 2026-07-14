export class MetricsTrackerService {
  private startTime: number = 0;
  private totalKeystrokes: number = 0;
  private correctKeystrokes: number = 0;

  public start(): void {
    this.startTime = Date.now();
    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;
  }

  public recordKeystroke(isCorrect: boolean): void {
    this.totalKeystrokes++;
    if (isCorrect) {
      this.correctKeystrokes++;
    }
  }

  public calculate(): { ppm: number; accuracy: number } {
    const durationMs = Date.now() - this.startTime;
    const minutes = durationMs / 60000;

    const ppm = minutes > 0 ? Math.round((this.correctKeystrokes / 5) / minutes) : 0;
    const accuracy = this.totalKeystrokes > 0 ? Math.round((this.correctKeystrokes / this.totalKeystrokes) * 100) : 100;

    return { ppm, accuracy };
  }
}
