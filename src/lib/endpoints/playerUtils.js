class VideoFormat {
    constructor(hasCipher, value, mimeType, video_id, bitrate, hasAudio) {
        this.hasCipher = hasCipher
        this.value = value
        this.mimeType = mimeType
        this.video_id = video_id
        this.bitrate = bitrate
        this.hasAudio = hasAudio
    }

    async downloadURL() {
        if (this.hasCipher) {
            const signature = ''
            return this.value.url + '&sig=' + signature
        } else {
            return this.value
        }
    }
}

const parseProxyRedir = (url) => {
    let new_url = url.replace('https://', '')
    new_url = new_url.split('/')
    new_url = new_url[2] !== undefined ? new_url[2] : new_url[1]
    url = 'https://redirector.googlevideo.com/' + new_url
    return { url: url }
}

export const sort = (data) => {
    try {
        const json = data
        const streamingData = json.streamingData
        const formatParent = streamingData['formats'].concat(
            streamingData['adaptiveFormats']
        )
        let arr = []

        const r = formatParent.forEach((i) => {
            let { url } = parseProxyRedir(i.url)
            i.url = url
            if (i.mimeType.includes('audio')) {
                if (
                    i.audioChannels === 2 &&
                    i.audioQuality.includes('AUDIO_QUALITY_MEDIUM')
                ) {
                    return arr.push(i)
                }
            }

            return { url: url }
        })
        if (arr.length !== 0) {
            return arr.map((format) => {
                const hasCipher = Boolean(format.signatureCipher)
                return new VideoFormat(
                    hasCipher,
                    format.url,

                    format.mimeType,
                    format.videoId,
                    format.bitrate,
                    format.audioQuality !== undefined
                )
            })
        }

        return null
    } catch (e) {
        console.log('Fetch error', e)

        return null
    }
}
