import {Keyboard} from 'keyboard';

export abstract class Key {
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
		this.keyboard.keyClick(this);
		this.keyboard.grid.key(this.value);
	}

	public disable(): void {
		this.element.classList.add('disabled');
	}
}

export class EnterKey extends Key {
	constructor(keyboard: Keyboard) {
		super(keyboard, '<svg><use xlink:href="#icon-circle-check"></use></svg>');
		this.element.id = 'enter';
	}

	public press(): void {
		this.keyboard.keyClick(this);
		this.keyboard.grid.submit();
	}
}

export class BackspaceKey extends Key {
	constructor(keyboard: Keyboard) {
		super(keyboard, '<svg><use xlink:href="#icon-delete-left"></use></svg>');
		this.element.id = 'backspace';
	}

	public press(): void {
		this.keyboard.keyClick(this);
		this.keyboard.grid.backspace();
	}
}
