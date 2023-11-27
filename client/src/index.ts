import {Analytics} from 'analytics';
import {Bookshelf} from 'bookshelf';
import {Grid} from 'grid';
import {RandomGrid} from 'grid/random';
import {Notify} from 'notify';
import {Stats} from 'stats';

export class App {
	public readonly epoch: number = 19309;
	public readonly notify: Notify = new Notify();
	public readonly grid: Grid = new Grid(this, 6);
	public readonly analytics: Analytics = new Analytics(this);
	public randomGrid: RandomGrid = new RandomGrid(this, 6);
	public loaded: Promise<void>;
	public isLoaded: boolean = false;
	public bookshelf?: Bookshelf;
	public stats: Stats;
	public isWin?: boolean;
	public isLoss?: boolean;
	public inactiveGrid?: Grid;
	private _activeGrid?: Grid;

	constructor() {
		const stats = localStorage.getItem('stats');
		this.stats = new Stats(this, stats && JSON.parse(stats) || []);
		this.loaded = this.load();
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
		this.analytics.event('share');
	}

	public switchGrids(): void {
		this.activeGrid = this.inactiveGrid;
	}

	public rollDice(): void {
		localStorage.removeItem('randomState');
		localStorage.removeItem('randomIndex');
		this.randomGrid = new RandomGrid(this, 6);
		this.randomGrid.load();
		this.activeGrid = this.randomGrid;
	}

	private async load(): Promise<void> {
		await new Promise((resolve) => {
			window.addEventListener('load', resolve);
		});
		this.activeGrid = this[localStorage.getItem('activeGrid') as 'grid' | 'randomGrid' || 'grid'] || this.grid;
		this.analytics.load();
		this.bookshelf = await Bookshelf.load();
		this.grid.load(this.bookshelf.word);
		this.randomGrid.load();
		this.stats.recalculate();
		document.getElementById('loading').remove();
		this.isLoaded = true;
	}
	
	private async attachGrid(isRandom: boolean): Promise<void> {
		await this.loaded;
		this._activeGrid.attach();
		this.inactiveGrid.detach();
		localStorage.setItem('activeGrid', isRandom ? 'randomGrid' : 'grid');
		this.randomGrid.dailyButton.classList.toggle('disabled', !isRandom);
	}

	public get isComplete(): boolean {
		return this.isWin || this.isLoss;
	}

	private set activeGrid(grid: Grid) {
		const isRandom = grid === this.randomGrid;
		this._activeGrid = grid;
		this.inactiveGrid = isRandom ? this.grid : this.randomGrid;
		this.attachGrid(isRandom);
	}

	public get activeGrid(): Grid {
		return this._activeGrid;
	}
}

new App();
