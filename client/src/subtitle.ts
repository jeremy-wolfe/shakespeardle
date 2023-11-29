import {App} from '.';
import {RandomGrid} from './grid/random';

export abstract class Subtitle {
	protected readonly header: HTMLHeadElement = document.querySelector('#container > header');
	protected readonly subtitle: HTMLParagraphElement = document.createElement('p');

	public attach(): void {
		this.header.append(this.subtitle);
	}

	public detach(): void {
		this.subtitle.remove();
	}
}

export class DailySubtitle extends Subtitle {
	protected readonly bookName: HTMLElement = document.createElement('i');

	constructor(app: App) {
		super();
		this.subtitle.innerText = 'Today’s word is found in ';
		this.bookName.innerText = app.bookshelf.word.book.title;
		this.subtitle.append(this.bookName);
	}
}

export class RandomSubtitle extends Subtitle {
	protected readonly rollButton: HTMLDivElement = document.createElement('div');

	constructor(grid: RandomGrid) {
		super();
		this.rollButton.className = 'btn dice';
		this.rollButton.innerHTML = '<svg><use href="#icon-dice"></use></svg>';
		this.subtitle.innerText = `Random word #${grid.randomIndex}`;
		this.subtitle.append(this.rollButton);

		this.rollButton.addEventListener('click', () => {
			grid.rollDice();
		}, {once: true});
	}
}
