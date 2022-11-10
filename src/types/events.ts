export enum AttendanceMode {
	OFFLINE = "Offline",
	ONLINE = "Online",
	MIXED = "Mixed",
}

export interface Attendance {
	attendanceMode: AttendanceMode,
	virtualLocationUrl?: string,
}

export interface AgeRange {
	minValue?: number,
	maxValue?: number,
}

export enum EventStatus {
	SCHEDULED = "Scheduled",
	RESCHEDULED = "Rescheduled",
	POSTPONED = "Postponed",
	CANCELED = "Canceled",
	EVENT_MOVED_ONLINE = "Event Moved Online",
}

export interface EntityReference {
	entityId: string,
	name: string,
}

export enum TicketAvailability {
	IN_STOCK = "In Stock",
	SOLD_OUT = "Sold Out",
	PRE_ORDER = "Pre Order",
	UNSPECIFIED = "Unspecified",
}

export interface TicketPriceRange {
	minValue?: number,
	maxValue?: number,
	currencyCode?: string,
}

export interface Time {
	start?: any,
	end?: any,
}

export interface Address {
	line1?: string,
	line2?: string,
	line3?: string,
	sublocality?: string,
	city?: string,
	region?: string,
	postalCode?: string,
	extraDescription?: string,
	countryCode?: string,
}

export interface Coordinate {
	latitude?: number,
	longitude?: number,
}

export enum LinkType {
	OTHER = "Other",
	URL = "URL",
	PHONE = "Phone",
	EMAIL = "Email",
}

export interface C_primaryCTA {
	label?: string,
	linkType?: LinkType,
	link?: string,
}

export interface ImageThumbnail {
	url: string,
	width: number,
	height: number,
}

export interface Image {
	url: string,
	width: number,
	height: number,
	thumbnails?: ImageThumbnail[],
	alternateText?: string,
}

export interface ComplexImage {
	image: Image,
	details?: string,
	description?: string,
	clickthroughUrl?: string,
}

export interface WebsiteUrl {
	url?: string,
	displayUrl?: string,
	preferDisplayUrl?: boolean,
}

export default interface Event {
	attendance?: Attendance,
	landingPageUrl?: string,
	slug?: string,
	what3WordsAddress?: string,
	ageRange?: AgeRange,
	eventStatus?: EventStatus,
	isFreeEvent?: boolean,
	isTicketedEvent?: boolean,
	linkedLocation?: EntityReference,
	organizerEmail?: string,
	organizerName?: string,
	organizerPhone?: any,
	performers?: string[],
	additionalPromotingLocations?: EntityReference[],
	ticketAvailability?: TicketAvailability,
	ticketPriceRange?: TicketPriceRange,
	ticketSaleDateTime?: any,
	ticketUrl?: string,
	time: Time,
	venueName?: string,
	address?: Address,
	description?: string,
	name: string,
	categories?: any,
	cityCoordinate?: Coordinate,
	c_featuredGuests?: string[],
	c_primaryCTA?: C_primaryCTA,
	displayCoordinate?: Coordinate,
	dropoffCoordinate?: Coordinate,
	photoGallery?: ComplexImage[],
	geocodedCoordinate?: Coordinate,
	keywords?: string[],
	pickupCoordinate?: Coordinate,
	routableCoordinate?: Coordinate,
	id: string,
	timezone?: any,
	walkableCoordinate?: Coordinate,
	websiteUrl?: WebsiteUrl,
	yextDisplayCoordinate?: Coordinate,
	yextDropoffCoordinate?: Coordinate,
	yextPickupCoordinate?: Coordinate,
	yextRoutableCoordinate?: Coordinate,
	yextWalkableCoordinate?: Coordinate,
}
