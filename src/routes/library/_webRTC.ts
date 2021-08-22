import db from '$lib/db'

const settings = [
	{ iceServers: [{ url: 'stun:global.stun.twilio.com:3478?transport=udp' }] },
	{ optional: [{ DtlsSrtpKeyAgreement: true }] }
]

// let dataChannels = {}
let pending = {}
let connection
// Sender
const sender = new RTCPeerConnection(settings)
const channel = sender.createDataChannel('transfer', {
	negotiated: true,
	id: 0
})
sender.addEventListener('connectionstatechange', (event) => {
	if (sender.connectionState === 'connected') {
		alert('Connection established')
	}
})

channel.onopen = (e) => console.log('channel opened ' + e)
channel.onclose = (e) => console.log('channel closed ' + e)
channel.onmessage = (e) => console.log('channel message: ' + e.data)
sender.oniceconnectionstatechange = (e) =>
	console.log(sender.iceConnectionState)
sender.onicecandidate = ({ candidate }) => {
	console.log('candidate: ', candidate)
	if (candidate) return
}
export async function setRemoteDesc(offer) {
	if (sender.signalingState != 'have-local-offer') return
	console.log('setting desc: ' + offer)
	const desc = await sender.setRemoteDescription({ type: 'answer', sdp: offer })
	console.log('desc: ', desc)
}
export async function createSenderOffer() {
	if (sender.signalingState != 'stable') return
	try {
		const offer = await sender.createOffer()
		await sender.setRemoteDescription({ type: 'offer', sdp: offer })
		await sender.setLocalDescription(await sender.createAnswer())
		if (offer) {
			return offer
		}
	} catch (e) {
		console.error(e)
	}
}

// Recipient
const peer = new RTCPeerConnection(settings)
peer.ondatachannel = (e) => {
	const rChannel = e.channel
	rChannel.onopen = (e) => console.log('open ' + e)
	rChannel.onclose = (e) => console.log('close ' + e)
	rChannel.onmessage = (e) => console.log('message  ' + e.data)
}

peer.onicecandidate
async function peerOffer(candidate) {
	const data = await db.getFavorites()
	try {
		// await peer.setRemoteDescription('none');
		// const answer = await peer.createAnswer();
		// await peer.setLocalDescription(answer);
	} catch (err) {}
}
