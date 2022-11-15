import {App} from 'index';
import {AnswerRow, Row} from './row';
import {Tile} from './tile';

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
		if (!this.activeTile) return;
		this.activeTile.keyAnimation?.play();
		this.activeTile.value = value;
		this.app.save();
	}

	public submit(): void {
		this.activeRow?.submit();
		this.app.save();
	}

	public backspace(): void {
		this.activeRow?.backspace();
		this.activeTile?.keyAnimation?.play();
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
		}, this.app.isWin ? 1000 : 3000);
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
		this.element.innerHTML = '&#x2b1b;';
		this.none = this.element.textContent;
	}
}
