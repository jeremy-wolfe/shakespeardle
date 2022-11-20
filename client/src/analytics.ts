import {App} from '.';

export class Analytics {
	private readonly script = document.createElement('script');
	private id: string = 'G-5PMER41FTX';

	constructor(private readonly app: App) {
		this.script.async = true;
		window.dataLayer = window.dataLayer || [];

		if (!this.isEnabled) return;
		this.script.src = 'https://www.googletagmanager.com/gtag/js?id=' + this.id;
		document.head.append(this.script);

		this.push('js', new Date());
		this.push('config', this.id);
	}

	private readonly push: Gtag.Gtag = function(this: Analytics): void {
		if (this.isEnabled) {
			window.dataLayer.push(arguments);
		} else {
			console.log('Analytics', arguments);
			if (arguments[2]?.event_callback) arguments[2].event_callback();
		}
	}

	public event(action: Gtag.EventNames, params?: Gtag.EventParams): Promise<void> {
		return new Promise((event_callback) => {
			this.push('event', action, Object.assign({event_callback}, params));
		});
	}

	public get isEnabled(): boolean {
		return /^(www\.)shakespeardle\.com$/.test(window.location.hostname);
	}
}
