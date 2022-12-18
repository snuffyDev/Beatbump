import type { IMusicResponsiveListItemRenderer, IMusicTwoRowItemRenderer } from "./internals";

export interface MusicCarouselShelfRenderer {
	header: Header;
	contents: (
		| { musicTwoRowItemRenderer: IMusicTwoRowItemRenderer }
		| { musicResponsiveListItemRenderer: IMusicResponsiveListItemRenderer }
	)[];
	trackingParams: string;
	itemSize: string;
}

export interface Header {
	musicCarouselShelfBasicHeaderRenderer: MusicCarouselShelfBasicHeaderRenderer;
}

export interface MusicCarouselShelfBasicHeaderRenderer {
	title: Title;
	accessibilityData: MusicCarouselShelfBasicHeaderRendererAccessibilityData;
	headerStyle: string;
	moreContentButton: MoreContentButton;
	trackingParams: string;
}

export interface MusicCarouselShelfBasicHeaderRendererAccessibilityData {
	accessibilityData: AccessibilityDataAccessibilityData;
}

export interface AccessibilityDataAccessibilityData {
	label: string;
}

export interface MoreContentButton {
	buttonRenderer: ButtonRenderer;
}

export interface ButtonRenderer {
	style: string;
	text: Text;
	navigationEndpoint: NavigationEndpoint;
	trackingParams: string;
	accessibilityData: MusicCarouselShelfBasicHeaderRendererAccessibilityData;
}

export interface NavigationEndpoint {
	clickTrackingParams: string;
	browseEndpoint: BrowseEndpoint;
}

export interface BrowseEndpoint {
	browseId: string;
}

export interface Text {
	runs: TextRun[];
}

export interface TextRun {
	text: string;
}

export interface Title {
	runs: TitleRun[];
}

export interface TitleRun {
	text: string;
	navigationEndpoint: NavigationEndpoint;
}
