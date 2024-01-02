import {Stats} from '.';

const definitionUrl = 'https://www.perseus.tufts.edu/hopper/xmlchunk?doc=Perseus%3Atext%3A1999.03.0068%3Aentry%3D';
const version = 2;

interface SavedDefinition {
	word: string;
	definition: string | string[];
	version: number;
}

export class Definition {
	public readonly container: HTMLDivElement = this.stats.elements.inner.querySelector('#definition');
	public readonly element: HTMLDivElement = document.createElement('div');
	private readonly parser: DOMParser = new DOMParser();

	constructor(public readonly stats: Stats) {
		this.container.append(this.element);
	}

	public async update(): Promise<void> {
		const {app, elements} = this.stats;
		this.container.remove();
		if (!app.grid.isComplete) return;

		const saved = this.load();
		const definition = saved?.word === this.word ? saved.definition : await this.define();
		const html = this.format(definition);
		this.element.innerHTML = html;
		if (!html) return;
		
		elements.inner.insertBefore(this.container, elements.charts);
		this.save(definition);
	}

	private async define(): Promise<string | string[]> {
		const {word} = this;
		const wordDefinition = await this.fetch(word);
		if (wordDefinition) return wordDefinition;

		const indexedDefinitions = await this.fetchIndexed(word);
		if (indexedDefinitions.length) return indexedDefinitions;

		if (!word.endsWith('s')) return;

		const lemma = word.replace(/s$/, '');
		const lemmaDefinition = await this.fetch(lemma);
		if (lemmaDefinition) return lemmaDefinition;

		const indexedLemmaDefinitions = await this.fetchIndexed(lemma);
		if (indexedLemmaDefinitions.length) return indexedLemmaDefinitions;
	}

	private async fetchIndexed(word: string, index: number = 1, documents: string[] = []): Promise<string[]> {
		const doc = await this.fetch(word + index);
		if (!doc) return documents;
		documents.push(doc);
		return this.fetchIndexed(word, index + 1, documents);
	}

	private async fetch(word: string): Promise<string> {
		const response = await fetch(definitionUrl + word);
		if (response.status === 200) return response.text();
	}

	private format(xml: string | string[]): string {
		if (xml && Array.isArray(xml)) return xml.map((d) => this.format(d)).join('');

		const doc = xml && this.parser.parseFromString(xml as string, 'text/xml');
		const html = doc?.querySelector(`entryFree`)?.innerHTML;
		if (!html) return '';

		const entry = document.createElement('div');
		entry.innerHTML = html

		this.removeElements(entry, 'oRef', 'bibl', 'cit');
		this.replaceElements(entry, 'orth', 'dfn').forEach((dfn) => {
			dfn.innerHTML = dfn.innerHTML.replace(/\s*:\s*$/, '');
		});
		this.replaceElements(entry, 'quote', 'q');
		this.replaceElements(entry, 'sense', 'p');
		this.replaceElements(entry, 'hi', 'sup').forEach((sup) => {
			const dfn = sup.previousElementSibling;
			if (dfn?.tagName?.toLowerCase() === 'dfn') dfn.append(sup);
		});
		return entry.innerHTML.replace(/\s+,\s*/g, ' ');
	}

	private replaceElements(entry: Element, from: string, to: keyof HTMLElementTagNameMap): HTMLElement[] {
		return Array.from(entry.querySelectorAll(from)).map((element) => {
			const replacement = document.createElement(to);
			replacement.dataset.from = from;
			replacement.innerHTML = element.innerHTML;
			element.replaceWith(replacement);
			return replacement;
		});
	}

	private removeElements(entry: Element, ...selectors: string[]): void {
		for (const selector of selectors) entry.querySelectorAll(selector).forEach((element) => {
			element.remove();
		});
	}

	private save(definition: string | string[]): void {
		const def: SavedDefinition = {word: this.word, definition, version};
		localStorage.setItem('definition', JSON.stringify(def));
	}

	private load(): SavedDefinition {
		const raw = localStorage.getItem('definition');
		const def: SavedDefinition = raw && JSON.parse(raw) || null;
		return def?.word === this.word && def?.version === version ? def : null;
	}

	private get word(): string {
		return this.stats.app.grid.word.word.toLowerCase();
	}
}
