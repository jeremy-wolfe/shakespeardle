import {App} from '..';
import {Chart} from './chart';

type Fill<N extends number, T extends number = 1, D extends 0[] = [0], L extends number = D['length']> = number & (L extends N ? T | N : Fill<N, L | T, [0, ...D]>);
export type MaxTries = Fill<App['grid']['tries']>;
export type Distribution = {[I in MaxTries]: {rounds: number, percentage: number, offset: number}};

export interface StatData {
	day: number;
	win: boolean;
	guesses: MaxTries;
}

export class Stats {
	public readonly elements: StatElements;
	public readonly chart: Chart;
	public played: number = this.data.length;
	public wins: number = this.data.filter((stat) => stat.win).length;
	public accuracy: string;
	public streaks: number[];
	public currentStreak: number;
	public longestStreak: number;

	constructor(public readonly app: App, public readonly data: StatData[]) {
		this.elements = new StatElements(this);
		this.chart = new Chart(this);
		this.recalculate();
	}

	public recalculate(): void {
		this.accuracy = Math.round(this.wins / this.played * 100 || 0) + '%';
		this.streaks = [];
		this.streaks.push(this.data.reduce((streak, stat) => {
			if (stat.win) return streak + 1;
			if (streak) this.streaks.push(streak);
			return 0;
		}, 0));
		this.currentStreak = this.streaks[this.streaks.length - 1] || 0;
		this.longestStreak = Math.max(...this.streaks) || 0;
		this.elements.update();
		this.chart.update();
	}

	public show(): void {
		this.elements.show();
		this.chart.animate();
	}

	public hide(): void {
		this.elements.hide();
	}

	public getDay(day: number): StatData {
		return this.data.find((stat) => stat.day === day);
	}

	public add(day: number, win: boolean, guesses: MaxTries): void {
		if (this.getDay(day)) return;
		this.data.push({day, win, guesses});
		this.played++;
		if (win) this.wins++;
		this.recalculate();
	}

	public get guessDistribution(): Distribution {
		return Array.from<number, MaxTries>({length: this.app.grid.tries}, (_, i) => i + 1 as MaxTries).reduce((dist, guesses) => {
			const rounds = this.data.filter((stat) => stat.win && stat.guesses === guesses).length;
			const previous = dist[guesses - 1 as MaxTries];
			dist[guesses] = {
				rounds,
				percentage: rounds / this.wins,
				offset: previous ? previous.offset + previous.percentage : 0
			};
			return dist;
		}, {} as Distribution);
	}
}

class StatElements {
	public readonly main: HTMLElement = document.querySelector('body > aside');
	public readonly shade: HTMLDivElement = document.getElementById('shade') as HTMLDivElement;
	public readonly close: HTMLDivElement = this.main.querySelector('.close');
	public readonly statItems: HTMLLIElement[] = Array.from(this.main.querySelectorAll('ul > li > b'));
	public readonly button: HTMLDivElement = document.getElementById('stats-btn') as HTMLDivElement;
	public readonly share: HTMLDivElement = this.main.querySelector('.btn.share');
	public readonly charts: HTMLDivElement = this.main.querySelector('figure') as HTMLDivElement;

	constructor(private readonly stats: Stats) {
		this.button.addEventListener('click', () => {
			this.stats.show();
		});
		this.shade.addEventListener('click', () => {
			this.stats.hide();
		});
		this.close.addEventListener('click', () => {
			this.stats.hide();
		});
		this.share.addEventListener('click', () => {
			this.stats.app.share();
		});
	}

	public show(): void {
		document.body.classList.add('show-stats');
	}

	public hide(): void {
		document.body.classList.remove('show-stats');
	}

	public update(): void {
		(['played', 'accuracy', 'currentStreak', 'longestStreak'] as const).forEach((value, i) => {
			this.statItems[i].innerHTML = this.stats[value].toString();
		});
		this.share.style.display = this.stats.app.grid.isComplete ? '' : 'none';
	}
}
