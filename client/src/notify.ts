export class Notify {
	private readonly queue: string[] = [];
	private timeout?: number;

	public push(message: string): void {
		this.queue.push(message);
		this.cycle();
	}

	private cycle(): void {
		if (this.timeout) return;
		const message = this.queue.shift();
		const element = document.createElement('div');
		element.className = 'notify';
		element.innerHTML = message;
		document.body.append(element);
		this.timeout = window.setTimeout(() => {
			this.timeout = null;
			element.remove();
			if (this.queue.length) this.cycle();
		}, 2000);
	}
}
