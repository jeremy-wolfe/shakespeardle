import {App} from 'index';

export class Keyboard {
	public readonly element: HTMLUListElement = document.createElement('ul');
	public readonly keys: Key[] = [
		...'QWERTYUIOPASDFGHJKL'.split('').map((char) => new CharacterKey(this, char)),
		new EnterKey(this),
		...'ZXCVBNM'.split('').map((char) => new CharacterKey(this, char)),
		new BackspaceKey(this)
	];

	constructor(public readonly app: App) {
		document.querySelector('footer').append(this.element);
	}

	public getKey(value: string): CharacterKey {
		const key = this.keys.find((key) => key.value === value);
		if (key && key instanceof CharacterKey) return key;
	}
}

abstract class Key {
	public readonly element: HTMLLIElement = document.createElement('li');
	protected readonly click = () => this.press();
	protected abstract press(): void;

	constructor(protected readonly keyboard: Keyboard, public readonly value: string) {
		this.keyboard.element.append(this.element);
		this.element.innerHTML = this.value;
		this.element.addEventListener('click', this.click);
	}
}

class CharacterKey extends Key {
	protected press(): void {
		this.keyboard.app.grid.key(this.value);
	}

	public disable(): void {
		this.element.removeEventListener('click', this.click);
		this.element.classList.add('disabled');
	}
}

class EnterKey extends Key {
	constructor(keyboard: Keyboard) {
		super(keyboard, 'ENTER');
		this.element.id = 'enter';
	}

	protected press(): void {
		this.keyboard.app.grid.submit();
	}
}

class BackspaceKey extends Key {
	constructor(keyboard: Keyboard) {
		super(keyboard, '&larr;');
		this.element.id = 'backspace';
	}

	protected press(): void {
		this.keyboard.app.grid.backspace();
	}
}
