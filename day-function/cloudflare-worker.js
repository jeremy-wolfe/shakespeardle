export default {
	async fetch() {
		const epoch = new Date(0);
		const today = new Date();
		today.setHours(-5);
	
		const response = new Response(
			Math.floor((today.valueOf() - epoch.valueOf()) / 1000 / 60 / 60 / 24).toString()
		);
		response.headers.set('Cache-Control', 'max-age=120');
		return response;
	}
}
