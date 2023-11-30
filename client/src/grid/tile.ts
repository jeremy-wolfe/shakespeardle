import {CharacterKey} from 'keyboard/key';
import {Row} from './row';
import {Segment} from './segment';

export class Tile extends Segment {
	public readonly element: HTMLLIElement = document.createElement('li');
	public readonly index: number = this.row.tiles.length;
	public flipAnimation: Animation;
	public keyAnimation: Animation;
	public isValidPosition: boolean = false;
	public isValidLetter: boolean = false;
	private _value: string = '';

	constructor(public readonly row: Row) {
		super();
		this.row.element.append(this.element);
	}

	public setAnimations(): void {
		if (this.flipAnimation) return;
		this.flipAnimation = this.element.getAnimations()?.[0];
		this.keyAnimation = this.element.animate([
			{transform: 'scale(100%)'},
			{transform: 'scale(125%)'},
		], {direction: 'alternate', iterations: 2, duration: 75, easing: 'linear'});
		this.keyAnimation?.cancel();
	}

	public validatePosition(): void {
		this.flipAnimation?.play();
		if (!this.inWord) return this.key.disable();
		if (this.word[this.index] !== this.value) return;
		this.isValidPosition = true;
		this.isValidLetter = true;
		for (const {element} of [this, this.key]) element.classList.add('valid-position');
	}

	public validateLetter(): void {
		if (!this.inWord) return;
		if (this.occurrencesMarked >= this.occurrences) return;
		this.isValidLetter = true;
		for (const {element} of [this, this.key]) element.classList.add('valid-letter');
	}

	private get word(): string {
		return this.row.grid.word.word;
	}

	private get inWord(): boolean {
		return this.word.includes(this.value);
	}

	private get occurrences(): number {
		return this.word.split(this.value).length - 1;
	}

	private get occurrencesMarked(): number {
		return this.row.tiles.filter((tile) => tile.value === this.value && tile.isValidLetter).length;
	}

	private get key(): CharacterKey {
		return this.row.grid.keyboard.getKey(this.value);
	}

	public get value(): string {
		return this._value;
	}

	public set value(value: string) {
		this._value = value?.trim()[0]?.toUpperCase() || '';
		this.element.innerHTML = this._value;
		this.row.grid.updateCursor();
	}
}
