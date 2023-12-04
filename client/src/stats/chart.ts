import {Stats} from '.';

// The circle will be this many times the size of the slice ring
// 1 = circle completely filled
const pieRadius: number = 1;

export class Chart {
	private readonly figure: HTMLElement = this.stats.elements.charts;
	private readonly svg: SVGSVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	private readonly caption: HTMLElement = document.createElement('figcaption');
	private readonly list: HTMLUListElement = document.createElement('ul');
	private slices?: Slice[];

	constructor(private readonly stats: Stats) {
		this.svg.setAttribute('viewBox', `-${pieRadius} -${pieRadius} ${pieRadius * 2} ${pieRadius * 2}`);
		this.caption.append(this.list);
		this.figure.append(this.svg, this.caption);
		this.update();
	}
	
	public update(): void {
		if (this.slices) this.slices.forEach((slice) => slice.remove());
		this.slices = Object.entries(this.stats.guessDistribution).map(([guesses, {percentage, offset}]) => {
			const slice = new Slice(
				`${guesses} guess${guesses === '1' ? '' : 'es'}: ${Math.round(percentage * 100)}%`,
				offset,
				percentage
			);
			this.svg.append(slice.circle);
			this.list.append(slice.label);
			return slice;
		});
	}

	public animate(): void {
		if (this.slices) for (const slice of this.slices) slice.animate();
	}
}

class Slice {
	public readonly circle: SVGCircleElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
	public readonly label: HTMLLIElement = document.createElement('li');
	private readonly animation: Animation;

	constructor(public readonly title: string, public readonly startRatio: number, public readonly sizeRatio: number) {
		const sliceRadius = pieRadius - 0.5;
		const circumference = Math.PI * sliceRadius * 2;
		const offset = (circumference / 4) - (this.startRatio * circumference);
		const size = this.sizeRatio * circumference;

		this.label.innerText = this.title;
		this.circle.setAttribute('title', this.title);
		this.circle.setAttribute('r', sliceRadius.toString());
		this.circle.setAttribute('stroke-dashoffset', `${offset}`);
		this.circle.setAttribute('stroke-dasharray', `${size} ${circumference - size}`);
		this.animation = this.circle.animate([
			{
				strokeDashoffset: `${circumference / 4}`,
				strokeDasharray: `0 ${circumference}`
			},
			{
				strokeDashoffset: `${offset}`,
				strokeDasharray: `${size} ${circumference - size}`
			}
		], {
			duration: 1000,
			easing: 'ease-in-out',
			fill: 'both'
		});
	}

	public animate(): void {
		console.log('animate', this.title);
		this.animation.play();
	}

	public remove(): void {
		this.circle.remove();
		this.label.remove();
	}

	public get endRatio(): number {
		return this.startRatio + this.sizeRatio;
	}
}
