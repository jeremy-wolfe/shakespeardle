import {Chance} from 'chance';

class Word {
	public readonly word: string;
	public readonly books: Book[];

	constructor(private readonly bookshelf: Bookshelf, {word, books}: {word: string, books: string[]}) {
		this.word = word;
		this.books = books.map((name) => this.bookshelf.books.find((book) => book.name === name));
	}
}

export class Bookshelf {
	private alphaWords: Word[];
	public books: Book[];
	public words: Word[];
	public day: number;

	public async load(): Promise<void> {
		const booksResponse = await fetch('/books.json');
		const {books, words} = await booksResponse.json() as {books: {name: string, title: string}[], words: {word: string, books: string[]}[]};
		this.books = books.map((book) => new Book(this, book.name, book.title));
		this.alphaWords = words.map((word) => new Word(this, word));

		const chance = new Chance(this.cycle);
		this.words = chance.shuffle(this.alphaWords);

		const day = await fetch('/day');
		this.day = parseInt(await day.text());

	}

	public has(word: string): boolean {
		return !!this.words.find((wordData) => wordData.word === word);
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

	constructor(private readonly bookshelf: Bookshelf, public readonly name: string, public readonly title: string) {}

	public has(word: string): boolean {
		return this.words.includes(word);
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
