import {DOMParser} from '@xmldom/xmldom';
import {readdir, readFile, writeFile} from 'fs/promises';
import {basename, dirname} from 'path';

class Parser {
	public readonly rootPath: string = dirname(dirname(__dirname));
	public readonly booksPath: string = this.rootPath + '/books';
	public readonly parser: DOMParser = new DOMParser();
	public readonly books: Book[] = [];

	public async parse(): Promise<void> {
		for (const file of await readdir(`${this.booksPath}/src`)) {
			if (!file.endsWith('.xml')) continue;
			this.books.push(new Book(this, file));
		}
		await Promise.all(this.books.map((book) => book.parse()));
		await writeFile(`${this.booksPath}/dist/books.json`, JSON.stringify(this.books.map((book) => book.name)));
	}
}

class Book {
	public readonly name: string;
	private title?: string;
	private document?: XMLDocument;
	private speechElements?: Element[];
	private allWordElements: Element[] = [];
	public readonly allWords: Map<string, number> = new Map();

	constructor(private readonly parser: Parser, public readonly file: string) {
		this.name = basename(file, '.xml');
	}

	public async parse(): Promise<void> {
		const {booksPath, parser} = this.parser;
		const raw = await readFile(`${booksPath}/src/${this.file}`);
		this.document = parser.parseFromString(raw.toString());
		this.title = this.document.getElementsByTagName('title')[0].textContent || '';
		this.speechElements = Array.from(this.document.getElementsByTagName('sp'));
		this.speechElements.forEach((element) => {
			this.allWordElements.push(...Array.from(element.getElementsByTagName('w')));
		})
		this.allWordElements.forEach((element) => {
			const word = element.textContent?.toUpperCase().trim();
			if (word) this.allWords.set(word, (this.allWords.get(word) || 0) + 1);
		});
		await this.write();
	}

	private async write(): Promise<void> {
		const {title, words} = this;
		await writeFile(
			`${this.parser.booksPath}/dist/${this.name}.json`,
			JSON.stringify({title, words})
		);
	}

	public get words(): string[] {
		return Array
			.from(this.allWords.keys())
			.filter((word) => !/[^A-Z]/.test(word) && word.length === 5)
			.sort((wordA, wordB) => wordA.localeCompare(wordB));
	};
}

const parser = new Parser();
parser.parse();
