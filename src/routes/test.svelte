<script lang="ts">
	import { queryParams } from '$lib/utils'
	import db from '$lib/db'

	let text
	const dbTest = async () => {
		const items = [
			{
				index: 0,
				itct: 'OAHyAQIIAQ%3D%3D',
				album: {
					text: '5.1M views'
				},
				title:
					'Lil Tjay - Not In The Mood (Feat. Fivio Foreign & Kay Flock) [Official Video]',
				artistInfo: {
					pageType: 'MUSIC_PAGE_TYPE_ARTIST',
					artist: 'Lil Tjay',
					browseId: 'UCFmW9YSajN0XrhLlHEN0OOA'
				},
				videoId: 'mwznbHHjnXk',
				hash: 'tpatkzhcajl3ylaot596',
				autoMixList: 'RDAMVMmwznbHHjnXk',
				thumbnail:
					'https://i.ytimg.com/vi/mwznbHHjnXk/sddefault.jpg?sqp=-oaymwEWCJADEOEBIAQqCghqEJQEGHgg6AJIWg&rs=AMzJL3m8sHVys_b9Qz3FWxDDiUQLxEu-Hw',
				length: '2:34'
			},
			{
				index: 1,
				itct: 'OAHyAQIIAQ%3D%3D',
				album: {
					text: '61M views'
				},
				title:
					'King Von - Crazy Story, Pt. 3 (Official Video) (feat. Booka600)',
				artistInfo: {
					pageType: 'MUSIC_PAGE_TYPE_ARTIST',
					artist: 'King Von'
				},
				videoId: 'YpxzPXaYyM4',
				hash: 'x75z51s5fshy1syclmrf',
				autoMixList: 'RDAMVMYpxzPXaYyM4',
				thumbnail:
					'https://i.ytimg.com/vi/YpxzPXaYyM4/sddefault.jpg?sqp=-oaymwEWCJADEOEBIAQqCghqEJQEGHgg6AJIWg&rs=AMzJL3mllpgZVuj7-ul_oDhY5Q2KITe2Yg',
				length: '3:13'
			},
			{
				index: 2,
				itct: 'OAHyAQIIAQ%3D%3D',
				album: {
					text: '25M views'
				},
				title:
					'Nardo Wick - Who Want Smoke?? ft. Lil Durk, 21 Savage & G Herbo (Directed by Cole Bennett)',
				artistInfo: {
					pageType: 'MUSIC_PAGE_TYPE_ARTIST',
					artist: 'Lyrical Lemonade',
					browseId: 'UCtylTUUVIGY_i5afsQYeBZA'
				},
				videoId: 'U2SNwtE-0Us',
				hash: 'w0lg9plcffh00hznhlmznicb',
				autoMixList: 'RDAMVMU2SNwtE-0Us',
				thumbnail:
					'https://i.ytimg.com/vi/U2SNwtE-0Us/sddefault.jpg?sqp=-oaymwEWCJADEOEBIAQqCghqEJQEGHgg6AJIWg&rs=AMzJL3lk38sMA0ePfEYQHBGZH-xfiuMgNg',
				length: '4:59'
			},
			{
				index: 3,
				itct: 'OAHyAQIIAQ%3D%3D',
				album: {
					text: '61M views'
				},
				title: 'Epidemic',
				artistInfo: {
					pageType: 'MUSIC_PAGE_TYPE_ARTIST',
					artist: 'Polo G',
					browseId: 'UCBeXuLfTU8vI-BQKImvEK3Q'
				},
				videoId: '64IGINWXrGQ',
				hash: '69qw54vxoszhqdgls60mp',
				autoMixList: 'RDAMVM64IGINWXrGQ',
				thumbnail:
					'https://i.ytimg.com/vi/64IGINWXrGQ/sddefault.jpg?sqp=-oaymwEWCJADEOEBIAQqCghqEJQEGHgg6AJIWg&rs=AMzJL3kgtinrxLMGjwN-fFr7JYwSo3TQtA',
				length: '2:58'
			},
			{
				index: 4,
				itct: 'OAHyAQIIAQ%3D%3D',
				album: {
					text: '66M views'
				},
				title: 'Moonwalking in Calabasas (Remix) (feat. Blueface)',
				artistInfo: {
					pageType: 'MUSIC_PAGE_TYPE_ARTIST',
					artist: 'DDG',
					browseId: 'UCYd5wzV5IiGQHoHxxn-OEjg'
				},
				videoId: 'QZ2F3ZP1sxg',
				hash: 'po4532h5czmqjwigo7qs3m',
				autoMixList: 'RDAMVMQZ2F3ZP1sxg',
				thumbnail:
					'https://i.ytimg.com/vi/QZ2F3ZP1sxg/sddefault.jpg?sqp=-oaymwEWCJADEOEBIAQqCghqEJQEGHgg6AJIWg&rs=AMzJL3kJuVUpiK7Dzwhytsszp4LEvqnYbA',
				length: '3:09'
			},
			{
				index: 5,
				itct: 'OAHyAQIIAQ%3D%3D',
				album: {
					text: '42M views'
				},
				title: 'How It Go',
				artistInfo: {
					pageType: 'MUSIC_PAGE_TYPE_ARTIST',
					artist: 'King Von'
				},
				videoId: 'WU6EHi410UQ',
				hash: 'xc4nfyxj9243616g1lxsi',
				autoMixList: 'RDAMVMWU6EHi410UQ',
				thumbnail:
					'https://i.ytimg.com/vi/WU6EHi410UQ/sddefault.jpg?sqp=-oaymwEWCJADEOEBIAQqCghqEJQEGHgg6AJIWg&rs=AMzJL3m2sKj2QmeWykensk9AZPJPzmUroA',
				length: '3:53'
			},
			{
				index: 6,
				itct: 'OAHyAQIIAQ%3D%3D',
				album: {
					text: '62M views'
				},
				title: 'War (feat. Lil Tjay)',
				artistInfo: {
					pageType: 'MUSIC_PAGE_TYPE_ARTIST',
					artist: 'Pop Smoke',
					browseId: 'UCD3fewmHnwmzjA3IeYWovaQ'
				},
				videoId: 'zOB5-Id1ZfU',
				hash: 'r6qjoq3r09d4axlf7k124s',
				autoMixList: 'RDAMVMzOB5-Id1ZfU',
				thumbnail:
					'https://i.ytimg.com/vi/zOB5-Id1ZfU/sddefault.jpg?sqp=-oaymwEWCJADEOEBIAQqCghqEJQEGHgg6AJIWg&rs=AMzJL3nlQgND1zZRW6DqgOl1fZ9R_1b2pA',
				length: '3:26'
			},
			{
				index: 7,
				itct: 'OAHyAQIIAQ%3D%3D',
				album: {
					text: '49M views'
				},
				title: 'I Am What I Am (feat. Fivio Foreign)',
				artistInfo: {
					pageType: 'MUSIC_PAGE_TYPE_ARTIST',
					artist: 'King Von',
					browseId: 'UCaTkYm0MHBne8hPAQwb9cVg'
				},
				videoId: 'JHixsTYXfso',
				hash: 'cqqj1wmaomlmygo1mh242q',
				autoMixList: 'RDAMVMJHixsTYXfso',
				thumbnail:
					'https://i.ytimg.com/vi/JHixsTYXfso/sddefault.jpg?sqp=-oaymwEWCJADEOEBIAQqCghqEJQEGHgg6AJIWg&rs=AMzJL3lrM5XEUm_DHJtTZyCF90-LnTWxTQ',
				length: '3:05'
			},
			{
				index: 8,
				itct: 'OAHyAQIIAQ%3D%3D',
				album: {
					text: '437M views'
				},
				title: 'Freestyle',
				artistInfo: {
					pageType: 'MUSIC_PAGE_TYPE_ARTIST',
					artist: 'Lil Baby',
					browseId: 'UC_z9AthnCGSAk_tZf-KqoFA'
				},
				videoId: 'MHryuYVyHhk',
				hash: 'dswo2d0n9mjv1e92rbuh',
				autoMixList: 'RDAMVMMHryuYVyHhk',
				thumbnail:
					'https://i.ytimg.com/vi/MHryuYVyHhk/sddefault.jpg?sqp=-oaymwEWCJADEOEBIAQqCghqEJQEGHgg6AJIWg&rs=AMzJL3lC1jsEqAZCDPYt5xw254-PtHJcog',
				length: '2:56'
			},
			{
				index: 9,
				itct: 'OAHyAQIIAQ%3D%3D',
				album: {
					text: '228M views'
				},
				title: 'F.N (UK Remix) (feat. DigDat)',
				artistInfo: {
					pageType: 'MUSIC_PAGE_TYPE_ARTIST',
					artist: 'Lil Tjay',
					browseId: 'UCFmW9YSajN0XrhLlHEN0OOA'
				},
				videoId: 'R9RtTGzs5EE',
				hash: '5cysf6880flf5s1qc3b7ff',
				autoMixList: 'RDAMVMR9RtTGzs5EE',
				thumbnail:
					'https://i.ytimg.com/vi/R9RtTGzs5EE/sddefault.jpg?sqp=-oaymwEWCJADEOEBIAQqCghqEJQEGHgg6AJIWg&rs=AMzJL3mP6MpdBfx98LQS-stG6HIex9VptQ',
				length: '4:05'
			},
			{
				index: 10,
				itct: 'OAHyAQIIAQ%3D%3D',
				album: {
					text: '6.2M views'
				},
				title: 'Brotherly Love (feat. Dougz Flock & B Lovee)',
				artistInfo: {
					pageType: 'MUSIC_PAGE_TYPE_ARTIST',
					artist: 'Kay Flock',
					browseId: 'UCkY7v1KqHPxzIUraCrTz-ow'
				},
				videoId: '3XCaWUl2mtg',
				hash: '2pef1p82h87inu3f6woik',
				autoMixList: 'RDAMVM3XCaWUl2mtg',
				thumbnail:
					'https://i.ytimg.com/vi/3XCaWUl2mtg/sddefault.jpg?sqp=-oaymwEWCJADEOEBIAQqCghqEJQEGHgg6AJIWg&rs=AMzJL3n8dtdBLwqPei9I8utLdauYskWaOQ',
				length: '3:58'
			},
			{
				index: 11,
				itct: 'OAHyAQIIAQ%3D%3D',
				album: {
					text: '25M views'
				},
				title: 'Run It Up (feat. Offset & Moneybagg Yo)',
				artistInfo: {
					pageType: 'MUSIC_PAGE_TYPE_ARTIST',
					artist: 'Lil Tjay',
					browseId: 'UCFmW9YSajN0XrhLlHEN0OOA'
				},
				videoId: 'ML-iBsCUDg8',
				hash: 'myipunoozbdcwe3ntwdsk',
				autoMixList: 'RDAMVMML-iBsCUDg8',
				thumbnail:
					'https://i.ytimg.com/vi/ML-iBsCUDg8/sddefault.jpg?sqp=-oaymwEWCJADEOEBIAQqCghqEJQEGHgg6AJIWg&rs=AMzJL3lhfQQ3jYgdFb6oztq3hiKJv6uTDQ',
				length: '3:57'
			},
			{
				index: 12,
				itct: 'OAHyAQIIAQ%3D%3D',
				album: {
					text: '329M views'
				},
				title: 'Genie',
				artistInfo: {
					pageType: 'MUSIC_PAGE_TYPE_ARTIST',
					artist: 'Youngboy Never Broke Again',
					browseId: 'UCR28YDxjDE3ogQROaNdnRbQ'
				},
				videoId: 'nQ1mmVG-G1g',
				hash: 'do1icqr8np766qo02whmo3',
				autoMixList: 'RDAMVMnQ1mmVG-G1g',
				thumbnail:
					'https://i.ytimg.com/vi/nQ1mmVG-G1g/sddefault.jpg?sqp=-oaymwEWCJADEOEBIAQqCghqEJQEGHgg6AJIWg&rs=AMzJL3lGOBF6HUl2kxOv6WFkUJH2xkD44w',
				length: '3:11'
			},
			{
				index: 13,
				itct: 'OAHyAQIIAQ%3D%3D',
				album: {
					text: '32M views'
				},
				title: 'Broke Opps',
				artistInfo: {
					pageType: 'MUSIC_PAGE_TYPE_ARTIST',
					artist: 'King Von'
				},
				videoId: 'oVEVrYq9v7M',
				hash: 'fhcz4zbtkocwc8rgmmlc5',
				autoMixList: 'RDAMVMoVEVrYq9v7M',
				thumbnail:
					'https://i.ytimg.com/vi/oVEVrYq9v7M/sddefault.jpg?sqp=-oaymwEWCJADEOEBIAQqCghqEJQEGHgg6AJIWg&rs=AMzJL3kkP0f0lTX_GnyT0XN_9ua1n-jOaw',
				length: '2:56'
			},
			{
				index: 14,
				itct: 'OAHyAQIIAQ%3D%3D',
				album: {
					text: '4.2M views'
				},
				title: 'Being Honest',
				artistInfo: {
					pageType: 'MUSIC_PAGE_TYPE_ARTIST',
					artist: 'Kay Flock',
					browseId: 'UCkY7v1KqHPxzIUraCrTz-ow'
				},
				videoId: 'cMV4-xekoaY',
				hash: '2jhfr878h5epyhprfoxfw',
				autoMixList: 'RDAMVMcMV4-xekoaY',
				thumbnail:
					'https://i.ytimg.com/vi/cMV4-xekoaY/sddefault.jpg?sqp=-oaymwEWCJADEOEBIAQqCghqEJQEGHgg6AJIWg&rs=AMzJL3m9Ui12AuBBKHiFidpABReWmR0Dlw',
				length: '2:36'
			},
			{
				index: 15,
				itct: 'OAHyAQIIAQ%3D%3D',
				album: {
					text: '44M views'
				},
				title: 'Zoo York (feat. Fivio Foreign & Pop Smoke)',
				artistInfo: {
					pageType: 'MUSIC_PAGE_TYPE_ARTIST',
					artist: 'Lil Tjay',
					browseId: 'UCFmW9YSajN0XrhLlHEN0OOA'
				},
				videoId: 'ToRiflECtU8',
				hash: 'zpxbxuruff5d64myv3342',
				autoMixList: 'RDAMVMToRiflECtU8',
				thumbnail:
					'https://i.ytimg.com/vi/ToRiflECtU8/sddefault.jpg?sqp=-oaymwEWCJADEOEBIAQqCghqEJQEGHgg6AJIWg&rs=AMzJL3lHYlsBik5ZFqCwTVeUxnz227dufw',
				length: '3:38'
			},
			{
				index: 16,
				itct: 'OAHyAQIIAQ%3D%3D',
				album: {
					text: '347M views'
				},
				title: 'The Box',
				artistInfo: {
					pageType: 'MUSIC_PAGE_TYPE_ARTIST',
					artist: 'Roddy Ricch',
					browseId: 'UCC30L98-rMHfY5PJ46duOPg'
				},
				videoId: 'uLHqpjW3aDs',
				hash: 'c78552sbyg83zuyroy29sr',
				autoMixList: 'RDAMVMuLHqpjW3aDs',
				thumbnail:
					'https://i.ytimg.com/vi/uLHqpjW3aDs/sddefault.jpg?sqp=-oaymwEWCJADEOEBIAQqCghqEJQEGHgg6AJIWg&rs=AMzJL3njSsClhFxdb0h5mLjWkxk5e2Vciw',
				length: '3:17'
			},
			{
				index: 17,
				itct: 'OAHyAQIIAQ%3D%3D',
				album: {
					text: '225M views'
				},
				title: 'Armed And Dangerous',
				artistInfo: {
					pageType: 'MUSIC_PAGE_TYPE_ARTIST',
					artist: 'Juice WRLD',
					browseId: 'UCbn0GRdgsQtl9hlV-IqxFGg'
				},
				videoId: 'cr82wSBZeeQ',
				hash: 'oybpwkie0s9ckcr5gxjfv',
				autoMixList: 'RDAMVMcr82wSBZeeQ',
				thumbnail:
					'https://i.ytimg.com/vi/cr82wSBZeeQ/sddefault.jpg?sqp=-oaymwEWCJADEOEBIAQqCghqEJQEGHgg6AJIWg&rs=AMzJL3kSH6hm2XLP7FHfvQrpwtlUhO1Uvg',
				length: '3:14'
			},
			{
				index: 18,
				itct: 'OAHyAQIIAQ%3D%3D',
				album: {
					text: '3.7M views'
				},
				title: 'Gang Gang',
				artistInfo: {
					pageType: 'MUSIC_PAGE_TYPE_ARTIST',
					artist: 'Lil Tjay',
					browseId: 'UCFmW9YSajN0XrhLlHEN0OOA'
				},
				videoId: 'u84TUajNM-U',
				hash: 'dwo4rafq468vbm82h75xpr',
				autoMixList: 'RDAMVMu84TUajNM-U',
				thumbnail:
					'https://i.ytimg.com/vi/u84TUajNM-U/sddefault.jpg?sqp=-oaymwEWCJADEOEBIAQqCghqEJQEGHgg6AJIWg&rs=AMzJL3l7lWVADsKfCtQLFFEtLDN4nnBGeA',
				length: '4:19'
			},
			{
				index: 19,
				itct: 'OAHyAQIIAQ%3D%3D',
				album: {
					text: '22M views'
				},
				title: 'Life Support',
				artistInfo: {
					pageType: 'MUSIC_PAGE_TYPE_ARTIST',
					artist: 'Youngboy Never Broke Again',
					browseId: 'UCR28YDxjDE3ogQROaNdnRbQ'
				},
				videoId: 'Z9AnasYjtvg',
				hash: 'enoyid869kml1cebn5kscb',
				autoMixList: 'RDAMVMZ9AnasYjtvg',
				thumbnail:
					'https://i.ytimg.com/vi/Z9AnasYjtvg/sddefault.jpg?sqp=-oaymwEWCJADEOEBIAQqCghqEJQEGHgg6AJIWg&rs=AMzJL3l4bdOe_3r6W_xm1k04DN_8D4TRpw',
				length: '3:54'
			},
			{
				index: 20,
				itct: 'OAHyAQIIAQ%3D%3D',
				album: {
					text: '756M views'
				},
				title: 'Lucid Dreams',
				artistInfo: {
					pageType: 'MUSIC_PAGE_TYPE_ARTIST',
					artist: 'Juice WRLD',
					browseId: 'UCbn0GRdgsQtl9hlV-IqxFGg'
				},
				videoId: 'mzB1VGEGcSU',
				hash: 'f6vjsym0k11iqn7e1rjqs',
				autoMixList: 'RDAMVMmzB1VGEGcSU',
				thumbnail:
					'https://i.ytimg.com/vi/mzB1VGEGcSU/sddefault.jpg?sqp=-oaymwEWCJADEOEBIAQqCghqEJQEGHgg6AJIWg&rs=AMzJL3m4ceCJYCJ7ZIZ5P0PjDB47qwdtqg',
				length: '3:51'
			},
			{
				index: 21,
				itct: 'OAHyAQIIAQ%3D%3D',
				album: {
					text: 'Lil Tjay',
					navigationEndpoint: {
						clickTrackingParams: 'CD4QyCAYFSITCLjJgouU9PMCFYLiwQodBlANVA==',
						browseEndpoint: {
							browseId: 'UCFmW9YSajN0XrhLlHEN0OOA',
							browseEndpointContextSupportedConfigs: {
								browseEndpointContextMusicConfig: {
									pageType: 'MUSIC_PAGE_TYPE_ARTIST'
								}
							}
						}
					}
				},
				title: 'Hood Scars 2',
				artistInfo: {
					pageType: 'MUSIC_PAGE_TYPE_ARTIST',
					artist: 'J.I the Prince of N.Y',
					browseId: 'UCJddJdlRHV_QnKx21wmV-8Q'
				},
				videoId: 'r5y4EDxiMWs',
				hash: 'zp0zvrsurzjo1q7j4d54cr',
				autoMixList: 'RDAMVMr5y4EDxiMWs',
				thumbnail:
					'https://i.ytimg.com/vi/r5y4EDxiMWs/sddefault.jpg?sqp=-oaymwEWCJADEOEBIAQqCghqEJQEGHgg6AJIWg&rs=AMzJL3kA4dXo7bFrbdCoH3z1_BMdiFrm_Q',
				length: '3:43'
			},
			{
				index: 22,
				itct: 'OAHyAQIIAQ%3D%3D',
				album: {
					text: 'Youngboy Never Broke Again',
					navigationEndpoint: {
						clickTrackingParams: 'CDAQyCAYFiITCLjJgouU9PMCFYLiwQodBlANVA==',
						browseEndpoint: {
							browseId: 'UCR28YDxjDE3ogQROaNdnRbQ',
							browseEndpointContextSupportedConfigs: {
								browseEndpointContextMusicConfig: {
									pageType: 'MUSIC_PAGE_TYPE_ARTIST'
								}
							}
						}
					}
				},
				title: 'Bandit',
				artistInfo: {
					pageType: 'MUSIC_PAGE_TYPE_ARTIST',
					artist: 'Juice WRLD',
					browseId: 'UCbn0GRdgsQtl9hlV-IqxFGg'
				},
				videoId: 'Sw5fNI400E4',
				hash: '8ia6dv83mx7ul4x0ujcdug',
				autoMixList: 'RDAMVMSw5fNI400E4',
				thumbnail:
					'https://i.ytimg.com/vi/Sw5fNI400E4/sddefault.jpg?sqp=-oaymwEWCJADEOEBIAQqCghqEJQEGHgg6AJIWg&rs=AMzJL3mr1xrfCIQbkQzmLR3O3LhPYMzLnQ',
				length: '3:11'
			},
			{
				index: 23,
				itct: 'OAHyAQIIAQ%3D%3D',
				album: {
					text: '6ix9ine',
					navigationEndpoint: {
						clickTrackingParams: 'CCIQyCAYFyITCLjJgouU9PMCFYLiwQodBlANVA==',
						browseEndpoint: {
							browseId: 'UCYore7kfhcJYO_gSpN_KJKQ',
							browseEndpointContextSupportedConfigs: {
								browseEndpointContextMusicConfig: {
									pageType: 'MUSIC_PAGE_TYPE_ARTIST'
								}
							}
						}
					}
				},
				title: 'TROLLZ',
				artistInfo: {
					pageType: 'MUSIC_PAGE_TYPE_ARTIST',
					artist: 'Nicki Minaj',
					browseId: 'UCTTcTeAszDGxALRSMkJH9FQ'
				},
				videoId: 'oNg3M9IJJlY',
				hash: 'd2ksegnac7eubdv68s3su',
				autoMixList: 'RDAMVMoNg3M9IJJlY',
				thumbnail:
					'https://i.ytimg.com/vi/oNg3M9IJJlY/sddefault.jpg?sqp=-oaymwEWCJADEOEBIAQqCghqEJQEGHgg6AJIWg&rs=AMzJL3lb4eubCabTSjdTdgS-MX0IWel1zw',
				length: '3:36'
			},
			{
				index: 24,
				itct: 'OAHyAQIIAQ%3D%3D',
				album: {
					text: 'Dusty Locane',
					navigationEndpoint: {
						clickTrackingParams: 'CBQQyCAYGCITCLjJgouU9PMCFYLiwQodBlANVA==',
						browseEndpoint: {
							browseId: 'UCLR1qbnIGcZj_b25b17QW9Q',
							browseEndpointContextSupportedConfigs: {
								browseEndpointContextMusicConfig: {
									pageType: 'MUSIC_PAGE_TYPE_ARTIST'
								}
							}
						}
					}
				},
				title: 'Ron Suno & DUSTY LOCANE - Grabba (Remix) (Official Video)',
				artistInfo: {
					pageType: 'MUSIC_PAGE_TYPE_ARTIST',
					artist: 'Ron Suno',
					browseId: 'UCOdtbBecPLD-GUs5XcU77Qw'
				},
				videoId: 's8FKfmnCyY0',
				hash: '2em84qsnrpk561nq4cd564',
				autoMixList: 'RDAMVMs8FKfmnCyY0',
				thumbnail:
					'https://i.ytimg.com/vi/s8FKfmnCyY0/hqdefault.jpg?sqp=-oaymwEWCMACELQBIAQqCghQEJADGFogjgJIWg&rs=AMzJL3lHxdVugymexDG4DzkiBSSZEkb1BQ',
				length: '3:55'
			}
		]

		db.addToPlaylist({ name: 'Rap', contents: items })
	}
	const req = async () => {
		let body = {
			path: 'playlist',
			endpoint: 'browse',
			type: 'playlist',
			browseId: 'VLRDCLAK5uy_kfYirvQ6KXjHJBgPBl5kAqoWrg4VMMkiY'
		}
		let newbody = Object.entries(body)
			.map(
				([key, value]) =>
					`${encodeURIComponent(key)}=${encodeURIComponent(value)}`
			)
			.join('&')
		if (newbody) {
			const res = await fetch('/api/api.json', {
				method: 'POST',
				body: newbody,
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			})
			const data = await res.json()
			text = await JSON.stringify(data)
			console.log(text)
		}
	}
</script>

{text}
<button on:click|preventDefault={dbTest}>Click me</button>

<style lang="scss">
</style>
