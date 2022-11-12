import {Bookshelf} from 'bookshelf';
import {Grid} from 'grid';
import {Keyboard} from 'keyboard';

export class App {
	public readonly bookshelf: Bookshelf = new Bookshelf();
	public readonly grid: Grid = new Grid(this, 6);
	public readonly keyboard: Keyboard = new Keyboard(this);

	constructor() {
		window.addEventListener('load', () => {
			this.load();
		});
	}

	private async load(): Promise<void> {
		await this.bookshelf.load();
		this.grid.load();
	}
}

new App();
