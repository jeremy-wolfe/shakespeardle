import {Word} from 'bookshelf';
import {App} from 'index';
import {AnswerRow, Row} from 'grid/row';
import {Tile} from 'grid/tile';
import {Keyboard} from 'keyboard';
import {DailySubtitle, Subtitle} from 'subtitle';

type ValidType = 'letter' | 'position' | null;

export class Grid {
	public readonly element: HTMLDivElement = document.createElement('div');
	public readonly rows: Row[] = [];
	public readonly tiles: Tile[] = [];
	public readonly keyboard: Keyboard = new Keyboard(this);
	public word: Word;
	public answer: AnswerRow;
	private readonly emoji: Emoji = new Emoji();
	private readonly style: HTMLStyleElement = document.createElement('style');
	private _activeRow: Row;
	private _activeTile: Tile;
	protected subtitle: Subtitle;

	constructor(public readonly app: App, public readonly tries: number) {}

	public attach(): void {
		document.head.append(this.style);
		document.querySelector('main').append(this.element);
		this.keyboard.attach();
		this.subtitle.attach();
	}

	public detach(): void {
		this.element.remove();
		this.style.remove();
		this.keyboard.detach();
		this.subtitle.detach();
	}

	public load(word: Word): void {
		this.word = word;
		this.style.innerText = `main ul {grid-template-columns: repeat(${this.word.word.length}, auto);}`;
		this.rows.length = 0;
		while (this.rows.push(new Row(this)) < this.tries);
		this.answer = new AnswerRow(this.word.word);
		this.element.append(this.answer.element);
		this.updateCursor();
		this.loadState();
		this.subtitle = new DailySubtitle(this.app);
	}

	public loadState(): void {
		const stateJson = localStorage.getItem(`day${this.app.bookshelf.day}`);
		const state = stateJson && JSON.parse(stateJson);
		if (state) this.state = state;
	}

	public save(): void {
		const {state} = this;
		if (!state.length) return;
		localStorage.setItem(`day${this.app.bookshelf.day}`, JSON.stringify(state));
	}

	public key(value: string): void {
		if (!this.activeTile) return;
		this.activeTile.keyAnimation?.play();
		this.activeTile.value = value;
		this.save();
	}

	public submit(): void {
		this.activeRow?.submit();
		this.save();
	}

	public backspace(): void {
		this.activeRow?.backspace();
		this.activeTile?.keyAnimation?.play();
		this.save();
	}

	public updateCursor(): void {
		if (this.app.isComplete) return this.end();
		this.activeRow = this.rows.find((row) => !row.isComplete);
		this.activeTile = this.activeRow?.tiles.find((tile) => !tile.value);
	}

	private end(): void {
		this.activeRow = null;
		this.activeTile = null;
		this.keyboard.end();
		this.save();
		this.app.saveStats();
		setTimeout(() => {
			this.app.stats.show();
		}, this.app.isWin ? 1000 : 3000);
		if (this.app.isLoaded) this.app.analytics.event('level_end', {
			level_name: `#${this.app.bookshelf.day - this.app.epoch}`,
			success: this.app.isWin
		});
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
