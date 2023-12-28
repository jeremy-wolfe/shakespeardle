import {Stats} from '.';

const definitionUrl = 'https://www.perseus.tufts.edu/hopper/xmlchunk?doc=Perseus%3Atext%3A1999.03.0068%3Aentry%3D';
const version = 1;

interface SavedDefinition {
	word: string;
	definition: string;
	version: number;
}

export class Definition {
	public readonly element: HTMLDivElement = this.stats.elements.main.querySelector('#definition');
	private readonly parser: DOMParser = new DOMParser();

	constructor(public readonly stats: Stats) {}

	public async update(): Promise<void> {
		const {app, elements} = this.stats;
		this.element.remove();
		if (!app.grid.isComplete) return;

		const saved = this.load();
		const html = saved?.word === this.word ? saved.definition : this.format(await this.fetch());
		this.element.innerHTML = html;
		if (!html) return;
		
		elements.main.insertBefore(this.element, elements.charts);
		this.save();
	}

	private async fetch(): Promise<Document> {
		const response = await fetch(definitionUrl + this.word);
		const text = await response.text();
		return this.parser.parseFromString(text, 'text/xml');
	}

	private format(doc: Document): string {
		const entry = document.createElement('div');
		entry.innerHTML = doc?.querySelector(`entryFree[key="${this.word}"]`)?.innerHTML;
		if (!entry) return '';

		this.removeElements(entry, 'oRef');
		this.replaceElements(entry, 'orth', 'dfn').forEach((dfn) => {
			dfn.title = dfn.innerText.toLowerCase().replace(/[^a-z]+/g, '');
			dfn.innerHTML = dfn.title.replace(/\w/g, '<b>$&</b>');
		});
		this.replaceElements(entry, 'quote', 'q');
		this.replaceElements(entry, 'bibl', 'cite');
		return entry.innerHTML;
	}

	private replaceElements(entry: Element, from: string, to: keyof HTMLElementTagNameMap): HTMLElement[] {
		return Array.from(entry.querySelectorAll(from)).map((element) => {
			const replacement = document.createElement(to);
			replacement.innerHTML = element.innerHTML;
			element.replaceWith(replacement);
			return replacement;
		});
	}

	private removeElements(entry: Element, selector: string): void {
		entry.querySelectorAll(selector).forEach((element) => {
			element.remove();
		});
	}

	private save(): void {
		const def: SavedDefinition = {word: this.word, definition: this.element.innerHTML, version};
		localStorage.setItem('definition', JSON.stringify(def));
	}

	private load(): SavedDefinition {
		const raw = localStorage.getItem('definition');
		const def = raw && JSON.parse(raw) || null;
		return def?.word === this.word && def?.version === version ? def : null;
	}

	private get word(): string {
		return this.stats.app.grid.word.word.toLowerCase();
	}
}
