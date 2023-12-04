import {Grid} from 'grid';
import {Key, CharacterKey, EnterKey, BackspaceKey} from './key';

export class Keyboard {
	public readonly element: HTMLUListElement = document.createElement('ul');
	public readonly keys: Key[] = [
		...'QWERTYUIOPASDFGHJKL'.split('').map((char) => new CharacterKey(this, char)),
		new EnterKey(this),
		...'ZXCVBNM'.split('').map((char) => new CharacterKey(this, char)),
		new BackspaceKey(this)
	];

	private readonly keypress = (event: KeyboardEvent) => {
		const keyPressed = event.key.toLowerCase();
		switch (keyPressed) {
			case 'enter':
			case 'backspace':
				this.keys.find((key) => key.element.id === keyPressed).press();
				break;

			default:
				this.keys.find((key) => key.value.toLowerCase() === keyPressed)?.press();
		}
	};

	constructor(public readonly grid: Grid) {}

	public attach(): void {
		document.addEventListener('keydown', this.keypress);
		document.querySelector('#container > footer').append(this.element);
	}

	public detach(): void {
		this.element.remove();
		this.end();
	}

	public end(): void {
		document.removeEventListener('keydown', this.keypress);
	}

	public getKey(value: string): CharacterKey {
		const key = this.keys.find((key) => key.value === value);
		if (key && key instanceof CharacterKey) return key;
	}

	public keyClick(key: Key): void {
		this.grid.app.keyClick.play(key);
	}
}
