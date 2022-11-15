import {App} from 'index';

export interface StatData {
	day: number;
	win: boolean;
	guesses: number;
}

export class Stats {
	private readonly elements: StatElements = new StatElements(this);
	public played: number = this.data.length;
	public wins: number = this.data.filter((stat) => stat.win).length;
	public accuracy: string;
	public streaks: number[];
	public currentStreak: number;
	public longestStreak: number;

	constructor(public readonly app: App, public readonly data: StatData[]) {
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
	}

	public show(): void {
		this.elements.show();
	}

	public hide(): void {
		this.elements.hide();
	}

	public getDay(day: number): StatData {
		return this.data.find((stat) => stat.day === day);
	}

	public add(day: number, win: boolean, guesses: number): void {
		if (this.getDay(day)) return;
		this.data.push({day, win, guesses});
		this.played++;
		if (win) this.wins++;
		this.recalculate();
	}
}

class StatElements {
	public readonly main: HTMLElement = document.querySelector('#container > aside');
	public readonly shade: HTMLDivElement = document.getElementById('shade') as HTMLDivElement;
	public readonly close: HTMLDivElement = this.main.querySelector('.close');
	public readonly statItems: HTMLLIElement[] = Array.from(this.main.querySelectorAll('ul > li > b'));
	public readonly button: HTMLDivElement = document.getElementById('stats-btn') as HTMLDivElement;
	public readonly share: HTMLDivElement = this.main.querySelector('.btn.share');

	constructor(private readonly stats: Stats) {
		this.button.addEventListener('click', () => {
			this.show();
		});
		this.shade.addEventListener('click', () => {
			this.hide();
		});
		this.close.addEventListener('click', () => {
			this.hide();
		});
		this.share.addEventListener('click', () => {
			this.stats.app.share();
		});
	}

	public show(): void {
		this.main.classList.add('show');
		this.shade.classList.add('show');
	}

	public hide(): void {
		this.main.classList.remove('show');
		this.shade.classList.remove('show');
	}

	public update(): void {
		(['played', 'accuracy', 'currentStreak', 'longestStreak'] as const).forEach((value, i) => {
			this.statItems[i].innerHTML = this.stats[value].toString();
		});
		this.share.style.display = this.stats.app.isComplete ? '' : 'none';
	}
}
