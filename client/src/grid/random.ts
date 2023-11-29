import {Grid} from 'grid';
import {App} from 'index';
import {RandomSubtitle} from '../subtitle';

export class RandomGrid extends Grid {
	private _randomIndex?: number = parseInt(localStorage.getItem('randomIndex') || '') || undefined;

	constructor(app: App, tries: number) {
		super(app, tries);
	}

	public load(): void {
		if (typeof this.randomIndex !== 'number') this.randomIndex = this.app.bookshelf.randomIndex;
		super.load(this.app.bookshelf.randomWords[this.randomIndex]);
		this.subtitle = new RandomSubtitle(this);
	}

	public rollDice(): void {
		this.detach();
		this.app.rollDice();
	}

	public loadState(): void {
		const stateJson = localStorage.getItem('randomState');
		const state = stateJson && JSON.parse(stateJson);
		if (state) this.state = state;
	}

	public save(): void {
		const {state} = this;
		if (!state.length) return;
		localStorage.setItem('randomState', JSON.stringify(state));
	}

	private set randomIndex(index: number) {
		this._randomIndex = index;
		localStorage.setItem('randomIndex', this.randomIndex.toString());
	}

	public get randomIndex(): number {
		return this._randomIndex;
	}
}
