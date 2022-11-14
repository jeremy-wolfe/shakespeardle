import {App} from 'index';
import {CharacterKey} from 'keyboard';

type ValidType = 'letter' | 'position' | null;

export class Grid {
	public readonly element: HTMLDivElement = document.createElement('div');
	public readonly rows: Row[] = [];
	public readonly tiles: Tile[] = [];
	public answer: AnswerRow;
	private readonly emoji: Emoji = new Emoji();
	private _activeRow: Row;
	private _activeTile: Tile;

	constructor(public readonly app: App, public readonly tries: number) {
		document.querySelector('main').append(this.element);
	}

	public load(): void {
		const style = document.createElement('style');
		style.innerText = `main ul {grid-template-columns: repeat(${this.word.length}, auto);}`;
		document.head.append(style);
		while (this.rows.push(new Row(this)) < this.tries);
		this.answer = new AnswerRow(this.word);
		this.element.append(this.answer.element);
		this.updateCursor();
	}

	public key(value: string): void {
		if (this.activeTile) this.activeTile.value = value;
		this.app.save();
	}

	public submit(): void {
		this.activeRow?.submit();
		this.app.save();
	}

	public backspace(): void {
		this.activeRow?.backspace();
		this.app.save();
	}

	public updateCursor(): void {
		if (this.app.isComplete) return this.end();
		this.activeRow = this.rows.find((row) => !row.isComplete);
		this.activeTile = this.activeRow?.tiles.find((tile) => !tile.value);
	}

	private end(): void {
		this.activeRow = null;
		this.activeTile = null;
		this.app.keyboard.end();
		this.app.save();
		this.app.saveStats();
		setTimeout(() => {
			this.app.stats.show();
		}, 2000);
	}

	public get state(): [string, boolean][] {
		return this.rows.filter((row) => row.guess).map((row) => [row.guess, row.isComplete]);
	}

	public get guesses(): number {
		return this.rows.filter((row) => row.isComplete).length;
	}

	public set state(state: [string, boolean][]) {
		for (const guess of state) {
			const row = this.activeRow;
			if (!row) break;
			row.guess = guess[0];
			if (guess[1]) row.submit();
			if (!row.isComplete) break;
		}
	}

	public get tileMap(): ValidType[][] {
		return this.rows.filter((row) => row.isComplete).map((row) => row.tiles.map((tile) => {
			if (tile.isValidPosition) return 'position';
			if (tile.isValidLetter) return 'letter';
		}));
	}

	public get tileMapString(): string {
		return this.tileMap.map((row) => row.map((tile) => this.emoji[tile || 'none']).join('')).join('\n');
	}

	public get word(): string {
		return this.app.bookshelf.word.word;
	}

	public get activeRow(): Row {
		return this._activeRow;
	}

	private set activeRow(activeRow: Row) {
		this._activeRow = activeRow;
		for (const row of this.rows) row.isActive = row === activeRow;
	}

	public get activeTile(): Tile {
		return this._activeTile;
	}

	private set activeTile(activeTile: Tile) {
		this._activeTile = activeTile;
		for (const tile of this.tiles) tile.isActive = tile === activeTile;
	}
}

abstract class Segment {
	public abstract readonly element: HTMLElement;
	private _isActive: boolean;

	public get isActive(): boolean {
		return this._isActive;
	}

	public set isActive(isActive: boolean) {
		this._isActive = isActive;
		this.element.classList.toggle('active', this._isActive);
	}
}

class Row extends Segment {
	public readonly element: HTMLUListElement = document.createElement('ul');
	public readonly tiles: Tile[] = [];
	private _isComplete: boolean = false;

	private readonly animationEnd = () => {
		this.element.removeEventListener('animationend', this.animationEnd);
		this.element.classList.remove('invalid');
	};

	constructor(public readonly grid: Grid) {
		super();
		this.grid.element.append(this.element);
		while (this.tiles.push(new Tile(this, this.tiles.length)) < this.grid.word.length);
		this.grid.tiles.push(...this.tiles);
	}

	private invalid(): void {
		this.animationEnd();
		this.element.addEventListener('animationend', this.animationEnd);
		this.element.classList.add('invalid');
	}

	public submit(): void {
		const {guess} = this;
		const {app, word, rows} = this.grid;
		if (guess.length < word.length) return;
		if (!app.bookshelf.has(guess)) return this.invalid();
		this._isComplete = true;
		this.element.classList.add('complete');
		for (const tile of this.tiles) tile.validatePosition();
		for (const tile of this.tiles) tile.validateLetter();
		if (guess === word) {
			app.isWin = true;
			app.isLoss = false;
		} else if (rows[rows.length - 1] === this) {
			app.isWin = false;
			app.isLoss = true;
			this.grid.answer.show();
		}
		this.grid.updateCursor();
	}

	public backspace(): void {
		const {tiles} = this;
		const {activeTile} = this.grid;
		const index = activeTile ? tiles.indexOf(activeTile) : tiles.length;
		const previous = this.tiles[index - 1];
		if (previous) previous.value = '';
	}

	public get isComplete(): boolean {
		return this._isComplete;
	}

	public get guess(): string {
		return this.tiles.map((tile) => tile.value).join('');
	}

	public set guess(guess: string) {
		this.tiles.forEach((tile, i) => {
			tile.value = guess[i];
		});
	}
}

class Tile extends Segment {
	public readonly element: HTMLLIElement = document.createElement('li');
	public isValidPosition: boolean = false;
	public isValidLetter: boolean = false;
	private _value: string = '';

	constructor(public readonly row: Row, private readonly index: number) {
		super();
		this.row.element.append(this.element);
	}

	public validatePosition(): void {
		if (!this.inWord) return this.key.disable();
		if (this.row.grid.word[this.index] !== this.value) return;
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

	private get inWord(): boolean {
		return this.row.grid.word.includes(this.value);
	}

	private get occurrences(): number {
		return this.row.grid.word.split(this.value).length - 1;
	}

	private get occurrencesMarked(): number {
		return this.row.tiles.filter((tile) => tile.value === this.value && tile.isValidLetter).length;
	}

	private get key(): CharacterKey {
		return this.row.grid.app.keyboard.getKey(this.value);
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

class AnswerRow {
	public readonly element: HTMLUListElement = document.createElement('ul');
	public readonly tiles: HTMLLIElement[] = this.word.split('').map(() => document.createElement('li'));

	constructor(private readonly word: string) {
		this.element.append(...this.tiles);
	}

	public show(): void {
		this.tiles.forEach((tile, i) => {
			tile.innerHTML = this.word[i];
		});
	}
}

class Emoji {
	private readonly element: HTMLDivElement = document.createElement('div');
	public readonly letter: string;
	public readonly position: string;
	public readonly none: string;

	constructor() {
		this.element.innerHTML = '&#x1f7e8;';
		this.letter = this.element.textContent;
		this.element.innerHTML = '&#x1f7e9;';
		this.position = this.element.textContent;
		this.element.innerHTML = '&#x2B1c;';
		this.none = this.element.textContent;
	}
}
