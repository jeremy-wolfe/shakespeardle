import {App} from 'index';

export class Grid {
	public readonly element: HTMLDivElement = document.createElement('div');
	public readonly rows: Row[] = [];
	public readonly tiles: Tile[] = [];
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
		this.updateCursor();
	}

	public key(value: string): void {
		if (this.activeTile) this.activeTile.value = value;
	}

	public submit(): void {
		this.activeRow.submit();
		this.updateCursor();
	}

	public backspace(): void {
		const {tiles} = this.activeRow;
		const index = this.activeTile ? tiles.indexOf(this.activeTile) : tiles.length;
		const previous = this.activeRow.tiles[index - 1];
		if (previous) previous.value = '';
	}

	public updateCursor(): void {
		this.activeRow = this.rows.find((row) => !row.isComplete);
		this.activeTile = this.activeRow?.tiles.find((tile) => !tile.value);
	}

	public get word(): string {
		return this.app.bookshelf.book.word;
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

	constructor(public readonly grid: Grid) {
		super();
		this.grid.element.append(this.element);
		while (this.tiles.push(new Tile(this)) < this.grid.word.length);
		this.grid.tiles.push(...this.tiles);
	}

	public submit(): void {
		this._isComplete = true;
		this.element.classList.add('complete');
		for (const tile of this.tiles) tile.validate();
	}

	public get isComplete(): boolean {
		return this._isComplete;
	}
}

class Tile extends Segment {
	public readonly element: HTMLLIElement = document.createElement('li');
	private index: number;
	private _value: string = '';

	constructor(public readonly row: Row) {
		super();
		this.row.element.append(this.element);
	}

	public validate(): void {
		const {grid, tiles} = this.row;
		const key = this.row.grid.app.keyboard.getKey(this.value);

		if (!grid.word.includes(this.value)) return key.disable();
		
		const type = grid.word[tiles.indexOf(this)] === this.value ? 'position' : 'letter';

		for (const {element} of [this, key]) {
			for (const property of ['position', 'letter']) {
				element.classList.toggle(`valid-${property}`, property === type);
			}
		}
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
