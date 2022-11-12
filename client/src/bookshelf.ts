import {Chance} from 'chance';

export class Bookshelf {
	private alphaBooks: string[];
	private books: Book[];
	public day: number;

	public async load(): Promise<void> {
		const booksResponse = await fetch('/books/books.json');
		const books = await booksResponse.json() as {name: string, title: string}[];
		this.books = books.map((book) => new Book(this, book.name, book.title));

		const day = await fetch('/day');
		this.day = parseInt(await day.text());

		await this.book.load();
	}

	public get cycle(): number {
		return this.day % this.books.length;
	}

	public get book(): Book {
		return this.books[this.cycle];
	}
}

export class Book {
	private alphaWords: string[];
	private words: string[];

	constructor(private readonly bookshelf: Bookshelf, private readonly name: string, public readonly title: string) {}

	public async load(): Promise<void> {
		const bookResponse = await fetch(`/books/${this.name}.json`);
		const book = await bookResponse.json() as {title: string, words: string[]};
		this.alphaWords = book.words;

		const chance = new Chance(this.cycle);
		this.words = chance.shuffle(this.alphaWords);
	}

	public get day(): number {
		return this.bookshelf.day % this.alphaWords.length;
	}

	public get cycle(): number {
		return Math.floor(this.bookshelf.day / this.alphaWords.length);
	}

	public get word(): string {
		return this.words[this.day];
	}
}
