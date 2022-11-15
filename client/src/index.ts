import {Bookshelf} from 'bookshelf';
import {Grid} from 'grid';
import {Keyboard} from 'keyboard';
import {Notify} from 'notify';
import {Stats} from 'stats';

export class App {
	private readonly epoch: number = 19309;
	public readonly notify: Notify = new Notify();
	public readonly grid: Grid = new Grid(this, 6);
	public readonly keyboard: Keyboard = new Keyboard(this);
	public bookshelf?: Bookshelf;
	public stats: Stats;
	public isWin?: boolean;
	public isLoss?: boolean;

	constructor() {
		const stats = localStorage.getItem('stats');
		this.stats = new Stats(this, stats && JSON.parse(stats) || []);
		window.addEventListener('load', () => {
			this.load();
		});
	}

	public save(): void {
		const {state} = this.grid;
		if (!state.length) return;
		localStorage.setItem(`day${this.bookshelf.day}`, JSON.stringify(state));
	}

	public saveStats(): void {
		this.stats.add(this.bookshelf.day, this.isWin, this.grid.guesses);
		localStorage.setItem('stats', JSON.stringify(this.stats.data));
	}

	public share(): void {
		if (!this.isComplete) return;
		const text = `Shakespeardle #${this.bookshelf.day - this.epoch} `
			+ ` ${this.isWin ? this.grid.guesses : 'X'} / ${this.grid.tries}\n`
			+ `${this.bookshelf.word.book.title}\n\n`
			+ `${this.grid.tileMapString}\n\n`
			+ 'https://shakespeardle.com';
		
		if (navigator.share) {
			navigator.share({
				title: 'Shakespeardle',
				text
			});
		} else if (navigator.clipboard) {
			navigator.clipboard.writeText(text);
			this.notify.push('Copied to clipboard');
		}
	}

	private async load(): Promise<void> {
		this.bookshelf = await Bookshelf.load();
		this.grid.load();
		const stateJson = localStorage.getItem(`day${this.bookshelf.day}`);
		const state = stateJson && JSON.parse(stateJson);
		if (state) this.grid.state = state;
		this.stats.recalculate();
		document.getElementById('loading').remove();
	}

	public get isComplete(): boolean {
		return this.isWin || this.isLoss;
	}
}

new App();
