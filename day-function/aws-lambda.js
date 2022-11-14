exports.handler = async () => {
	const epoch = new Date(0);
	const today = new Date();
	today.setHours(-5);

    const response = {
		headers: {'Content-Type': 'text/plain'},
        statusCode: 200,
        body: Math.floor((today.valueOf() - epoch.valueOf()) / 1000 / 60 / 60 / 24).toString(),
    };
    return response;
};
