const BaseContext = {
	context: {
		client: {
			clientName: 'WEB_REMIX',
			clientVersion: '0.1'
		},

		user: {
			enableSafetyMode: false
		},
		utcOffsetMinutes: -new Date().getTimezoneOffset()
	}
}
export default BaseContext
