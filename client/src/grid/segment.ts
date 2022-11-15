export abstract class Segment {
	public abstract readonly element: HTMLElement;
	private _isActive: boolean;

	public get isActive(): boolean {
		return this._isActive;
	}

	public set isActive(isActive: boolean) {
		this._isActive = isActive;
		this.element.classList.toggle('active', this._isActive);
	}
}
