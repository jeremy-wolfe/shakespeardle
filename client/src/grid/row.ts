import {Grid} from 'grid';
import {Segment} from './segment';
import {Tile} from './tile';

export class Row extends Segment {
	public readonly element: HTMLUListElement = document.createElement('ul');
	public readonly index: number = this.grid.rows.length;
	public readonly tiles: Tile[] = [];
	private _isComplete: boolean = false;

	private readonly animationEnd = () => {
		this.element.removeEventListener('animationend', this.animationEnd);
		this.element.classList.remove('invalid');
	};

	constructor(public readonly grid: Grid) {
		super();
		this.grid.element.append(this.element);
		while (this.tiles.push(new Tile(this)) < this.grid.word.word.length);
		this.grid.tiles.push(...this.tiles);
	}

	private invalid(): void {
		this.animationEnd();
		this.element.addEventListener('animationend', this.animationEnd);
		this.element.classList.add('invalid');
		navigator.vibrate?.([100, 100, 100]);
	}

	public attach(): void {
		setTimeout(() => {
			this.element.classList.add('animate');
			for (const tile of this.tiles) tile.setAnimations();
		}, 100 * this.index);
	}

	public detach(): void {
		this.element.classList.remove('animate');
	}

	public submit(): void {
		const {guess} = this;
		const {rows} = this.grid;
		const {word} = this.grid.word;
		if (guess.length < word.length) return;
		if (this.isInvalid) return this.invalid();
		this._isComplete = true;
		this.element.classList.add('complete');
		for (const tile of this.tiles) tile.validatePosition();
		for (const tile of this.tiles) tile.validateLetter();
		if (guess === word) {
			this.grid.isWin = true;
			this.grid.isLoss = false;
		} else if (rows[rows.length - 1] === this) {
			this.grid.isWin = false;
			this.grid.isLoss = true;
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

	public get isInvalid(): boolean {
		return !this.grid.app.bookshelf.has(this.guess);
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

export class AnswerRow {
	public readonly element: HTMLUListElement = document.createElement('ul');
	public readonly tiles: HTMLLIElement[] = this.word.split('').map(() => document.createElement('li'));

	constructor(private readonly word: string) {
		this.element.append(...this.tiles);
	}

	public show(): void {
		this.tiles.forEach((tile, i) => {
			tile.innerHTML = this.word[i];
		});
		setTimeout(() => this.element.classList.add('show'), 0);
	}
}
