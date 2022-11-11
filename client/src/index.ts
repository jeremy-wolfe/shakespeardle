import {Chance} from 'chance';

export class Bookshelf {
	private alphaBooks: string[];
	private books: Book[];
	public day: number;

	public async load(): Promise<void> {
		const booksResponse = await fetch('/books/books.json');
		const books = await booksResponse.json() as string[];
		this.books = books.map((book) => new Book(this, book))

		const day = await fetch('/day');
		this.day = parseInt(await day.text());
	}

	public get cycle(): number {
		return this.day % this.books.length;
	}

	public get book(): Book {
		return this.books[this.cycle];
	}
}

export class Book {
	public title: string;
	private alphaWords: string[];
	private words: string[];

	constructor(private readonly bookshelf: Bookshelf, private readonly name: string) {}

	public async load(): Promise<void> {
		const bookResponse = await fetch(`/books/${this.name}.json`);
		const book = await bookResponse.json() as {title: string, words: string[]};
		this.title = book.title;
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
