import {App} from '.';

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
	constructor(randomIndex: number) {
		super();
		this.subtitle.innerText = `Random word #${randomIndex}`;
	}
}
