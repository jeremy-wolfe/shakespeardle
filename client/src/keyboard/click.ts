export function keyClick() {
	const context = new AudioContext();
	const oscillator = context.createOscillator();
	const gain = context.createGain();

	oscillator.type = 'sine';
	oscillator.frequency.value = 1400;
	oscillator.frequency.setValueAtTime(1400, 0);
	oscillator.frequency.linearRampToValueAtTime(100, 0.003);
	oscillator.connect(gain);

	gain.gain.value = 0;
	gain.gain.setValueAtTime(0, 0);
	gain.gain.linearRampToValueAtTime(0.8, 0.005);
	gain.gain.linearRampToValueAtTime(0, 0.1);
	gain.connect(context.destination);

	oscillator.start(0);
	oscillator.stop(0.1);
}
