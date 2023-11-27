import {Grid} from 'grid';

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
		document.querySelector('footer').append(this.element);
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
}

abstract class Key {
	public readonly element: HTMLLIElement = document.createElement('li');
	public abstract press(): void;

	constructor(protected readonly keyboard: Keyboard, public readonly value: string) {
		this.keyboard.element.append(this.element);
		this.element.innerHTML = this.value;
		this.element.addEventListener('click', () => {
			navigator.vibrate?.(1);
			this.press();
		});
	}
}

export class CharacterKey extends Key {
	public press(): void {
		this.keyboard.grid.key(this.value);
	}

	public disable(): void {
		this.element.classList.add('disabled');
	}
}

class EnterKey extends Key {
	constructor(keyboard: Keyboard) {
		super(keyboard, 'ENTER');
		this.element.id = 'enter';
	}

	public press(): void {
		this.keyboard.grid.submit();
	}
}

class BackspaceKey extends Key {
	constructor(keyboard: Keyboard) {
		super(keyboard, '&larr;');
		this.element.id = 'backspace';
	}

	public press(): void {
		this.keyboard.grid.backspace();
	}
}
