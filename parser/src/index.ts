import {DOMParser} from '@xmldom/xmldom';
import {readdir, readFile, writeFile} from 'fs/promises';
import {basename, dirname} from 'path';

class Parser {
	public readonly rootPath: string = dirname(dirname(__dirname));
	public readonly srcPath: string = this.rootPath + '/books';
	public readonly parser: DOMParser = new DOMParser();
	public readonly books: Book[] = [];
	public readonly words: Map<string, Word> = new Map();

	public async parse(): Promise<void> {
		for (const file of await readdir(this.srcPath)) {
			if (!file.endsWith('.xml')) continue;
			this.books.push(new Book(this, file));
		}
		await Promise.all(this.books.sort((a, b) => a.name.localeCompare(b.name)).map((book) => book.parse()));
		await writeFile(`${this.srcPath}/books.json`, JSON.stringify({
			books: this.books.map((book) => book.index),
			words: Array.from(this.words.values()).map((word) => word.data).sort((a, b) => a.word.localeCompare(b.word))
		}));
	}
}

class Word {
	private readonly books: Set<Book> = new Set();
	private count: number = 1;

	constructor(public readonly word: string, book: Book) {
		this.books.add(book);
	}

	public add(book: Book): void {
		this.books.add(book);
		this.count++;
	}

	public get data(): {word: string, books: string[]} {
		return {word: this.word, books: Array.from(this.books).map((book) => book.name).sort((a, b) => a.localeCompare(b))};
	}
}

class Book {
	public readonly name: string;
	private title!: string;
	private document?: XMLDocument;
	private speechElements?: Element[];
	private allWordElements: Element[] = [];

	constructor(private readonly parser: Parser, public readonly file: string) {
		this.name = basename(file, '.xml');
	}

	public async parse(): Promise<void> {
		const {srcPath, parser} = this.parser;
		const raw = await readFile(`${srcPath}/${this.file}`);
		this.document = parser.parseFromString(raw.toString());
		this.title = this.document.getElementsByTagName('title')[0].textContent || '';
		this.speechElements = Array.from(this.document.getElementsByTagName('sp'));
		this.speechElements.forEach((element) => {
			this.allWordElements.push(...Array.from(element.getElementsByTagName('w')));
		})
		this.allWordElements.forEach((element) => {
			const word = element.textContent?.toUpperCase().trim();
			if (!word || /[^A-Z]/.test(word) || word.length !== 5) return;
			this.parser.words.has(word) ? this.parser.words.get(word)?.add(this) : this.parser.words.set(word, new Word(word, this));
		});
	}

	public get index(): {name: string, title: string} {
		const {name, title} = this;
		return {name, title};
	}
}

const parser = new Parser();
parser.parse();
