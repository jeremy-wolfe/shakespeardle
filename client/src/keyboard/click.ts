import {App} from '..';
import {BackspaceKey, EnterKey, Key} from './key';

class ClickSound {
	constructor(
		private readonly keyClick: KeyClick,
		private readonly volume: number,
		private readonly frequency: [number, number],
		private readonly duration: number
	) {}

	public play(delay: number = 0): void {
		const {context} = this.keyClick;
		const start = context.currentTime + delay;

		const gain = context.createGain();
		const oscillator = context.createOscillator();

		gain.gain.setValueAtTime(0, start);
		gain.gain.linearRampToValueAtTime(this.volume, start + 0.005);
		gain.gain.linearRampToValueAtTime(0, start + this.duration);

		oscillator.type = 'sine';
		oscillator.frequency.setValueAtTime(this.frequency[0], start);
		oscillator.frequency.linearRampToValueAtTime(this.frequency[1], start + 0.003);
		oscillator.onended = () => {
			oscillator.disconnect();
			gain.disconnect();
		}
		
		oscillator.connect(gain);
		gain.connect(context.destination);
		oscillator.start(start);
		oscillator.stop(start + this.duration);
	}

}

export class KeyClick {
	public readonly context: AudioContext = new AudioContext();
	private readonly sounds = {
		normal: new ClickSound(this, 1, [1400, 100], 0.1),
		disabled: new ClickSound(this, 0.7, [12000, 3000], 0.005),
		invalid: new ClickSound(this, 1, [1000, 120], 0.25),
		submit: new ClickSound(this, 1, [1200, 150], 0.25)
	} as const;

	constructor(public readonly app: App) {}

	public play(key: Key): void {
		if (this.isDisabled(key)) {
			this.sounds.disabled.play();
		} else if (this.isInvalid(key)) {
			this.sounds.invalid.play();
			this.sounds.invalid.play(0.2);
		} else if (key instanceof EnterKey) {
			this.sounds.invalid.play();
			this.sounds.submit.play(0.2);
		} else {
			this.sounds.normal.play();
		}
	}

	private isDisabled(key: Key): boolean {
		const {isComplete, activeRow} = this.app.activeGrid;
		if (isComplete) return true;
		if (activeRow.guess.length >= activeRow.tiles.length && key.value.length === 1) return true;
		if (key instanceof BackspaceKey && activeRow.guess.length === 0) return true;
		if (key instanceof EnterKey && activeRow.guess.length < activeRow.tiles.length) return true;
		return false;
	}

	private isInvalid(key: Key): boolean {
		if (key instanceof EnterKey) return this.app.activeGrid.activeRow.isInvalid;
		return false;
	}
}
