import {Chance} from 'chance';

interface BookData {
	name: string;
	title: string;
}

interface WordData {
	word: string;
	books: string[];
}

export class Bookshelf {
	private readonly alphaWords: Word[];
	public readonly dayChance: Chance.Chance = new Chance(this.day);
	public readonly books: Book[];
	public readonly words: Word[];
	public readonly cycleChance: Chance.Chance;
	public readonly cycle: number;
	public readonly cycleDay: number;
	public readonly word: Word;

	public static async load(): Promise<Bookshelf> {
		const day = parseInt(await (await fetch('/day')).text());
		const {books, words} = await (await fetch('/books.json')).json() as {books: BookData[], words: WordData[]};
		return new Bookshelf(books, words, day);
	}

	constructor(books: BookData[], words: WordData[], public readonly day: number) {
		this.books = books.map((book) => new Book(this, book.name, book.title));
		this.alphaWords = words.map((word) => new Word(this, word));
		this.cycleDay = this.day % this.alphaWords.length;
		this.cycle = Math.floor(this.cycleDay / this.alphaWords.length);
		this.cycleChance = new Chance(this.cycle);
		this.words = this.cycleChance.shuffle(this.alphaWords);
		this.word = this.words[this.cycleDay];

		const subtitle = document.createElement('p');
		const bookName = document.createElement('i');
		subtitle.innerText = 'Today’s word is found in ';
		bookName.innerText = this.word.book.title;
		subtitle.append(bookName);
		document.querySelector('#container > header').append(subtitle);
	}

	public has(word: string): boolean {
		return !!this.words.find((wordData) => wordData.word === word);
	}
}

class Word {
	public readonly word: string;
	public readonly books: Book[];
	public readonly book: Book;

	constructor(private readonly bookshelf: Bookshelf, {word, books}: {word: string, books: string[]}) {
		this.word = word;
		this.books = books.map((name) => this.bookshelf.books.find((book) => book.name === name));
		this.book = this.bookshelf.dayChance.pickone(this.books);
	}
}

class Book {
	constructor(private readonly bookshelf: Bookshelf, public readonly name: string, public readonly title: string) {}

	public has(word: string): boolean {
		return !!this.bookshelf.words.find((wordData) => wordData.word === word && wordData.books.includes(this));
	}
}
