import {App} from '..';
import {BackspaceKey, EnterKey, Key} from './key';

type Variation = 'Delete' | 'Invalid' | 'Return' | 'Standard';

const audio = new Audio;
const format = audio.canPlayType('audio/ogg; codecs=vorbis') === 'probably' ? 'ogg' : 'wav';

class ClickSound<V extends Variation> {
	private readonly file: `Keypress${V}.${typeof format}` = `Keypress${this.variation}.${format}`;
	private readonly buffer: Promise<AudioBuffer> = this.init();

	constructor(
		private readonly keyClick: KeyClick,
		private readonly variation: V
	) {}

	private async init(): Promise<AudioBuffer> {
		const {context} = this.keyClick;
		const response = await fetch(`/assets/sounds/${this.file}`);
		const buffer = await response.arrayBuffer();
		return context.decodeAudioData(buffer);
	}

	public async play(delay: number = 0): Promise<void> {
		const {context} = this.keyClick;
		const source = context.createBufferSource();
		source.buffer = await this.buffer;
		source.onended = () => source.disconnect();
		source.connect(context.destination);
		source.start(context.currentTime + delay);
	}
}

export class KeyClick {
	public readonly context: AudioContext = new AudioContext();
	private readonly sounds = {
		normal: new ClickSound(this, 'Standard'),
		disabled: new ClickSound(this, 'Standard'),
		invalid: new ClickSound(this, 'Invalid'),
		submit: new ClickSound(this, 'Return'),
		backspace: new ClickSound(this, 'Delete')
	} as const;

	constructor(public readonly app: App) {}

	public play(key: Key): void {
		if (this.isDisabled(key)) {
			this.sounds.disabled.play();
		} else if (this.isInvalid(key)) {
			this.sounds.invalid.play();
		} else if (key instanceof EnterKey) {
			this.sounds.submit.play();
		} else if (key instanceof BackspaceKey) {
			this.sounds.backspace.play();
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
