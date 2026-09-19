import confetti from 'canvas-confetti';

/**
 * Triggers a multi-stage celebratory particle explosion effect using canvas-confetti
 * when the user solves a puzzle.
 */
export function fireVictoryConfetti(stars: number = 3) {
  try {
    const vibrantColors = [
      '#06B6D4', // Cyan
      '#3B82F6', // Blue
      '#10B981', // Emerald
      '#F59E0B', // Amber
      '#EF4444', // Red
      '#EC4899', // Pink
      '#8B5CF6', // Purple
      '#F43F5E', // Rose
    ];

    const goldColors = ['#F59E0B', '#FBBF24', '#FCD34D', '#FEF3C7'];

    // 1. Immediate Center Impact Explosion (High velocity burst from center)
    confetti({
      particleCount: 90,
      spread: 120,
      startVelocity: 40,
      origin: { x: 0.5, y: 0.52 },
      colors: vibrantColors,
      ticks: 240,
      gravity: 0.9,
      scalar: 1.1,
      shapes: ['circle', 'square'],
      disableForReducedMotion: true,
    });

    // 2. Extra Golden Star Bursts for 3-star or high-tier completion
    if (stars >= 3) {
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 90,
          startVelocity: 35,
          origin: { x: 0.5, y: 0.48 },
          colors: goldColors,
          shapes: ['star'],
          scalar: 1.3,
          ticks: 220,
          disableForReducedMotion: true,
        });
      }, 150);
    }

    // 3. Staggered Left and Right Victory Cannons
    const shootCannons = (delay: number) => {
      setTimeout(() => {
        // Left cannon shooting up-right
        confetti({
          particleCount: 45,
          angle: 60,
          spread: 65,
          origin: { x: 0.05, y: 0.75 },
          colors: vibrantColors,
          startVelocity: 45,
          ticks: 220,
          disableForReducedMotion: true,
        });

        // Right cannon shooting up-left
        confetti({
          particleCount: 45,
          angle: 120,
          spread: 65,
          origin: { x: 0.95, y: 0.75 },
          colors: vibrantColors,
          startVelocity: 45,
          ticks: 220,
          disableForReducedMotion: true,
        });
      }, delay);
    };

    shootCannons(220);
    shootCannons(500);

    // 4. Lingering soft shower
    setTimeout(() => {
      confetti({
        particleCount: 30,
        spread: 160,
        startVelocity: 25,
        origin: { x: 0.5, y: 0.25 },
        colors: vibrantColors,
        gravity: 0.6,
        ticks: 260,
        scalar: 0.9,
        disableForReducedMotion: true,
      });
    }, 750);
  } catch {
    // Gracefully handle if canvas or window is restricted
  }
}
