import { IncomingHttpHeaders } from 'node:http';

import { operations } from './generated';

/**
 * @see https://developers.zoom.us/docs/api/rest/webhook-reference/#request-headers
 */
export interface IncomingZoomHttpHeaders extends IncomingHttpHeaders {
    /** @description The server where the request is being sent. */
    host: string;
    /** @description The identifier of the application that is sending the request. */
    'user-agent': string;
    /** @description The resource's media type. */
    'content-type': string;
    /** @description The content length of the HTTP request body, in bytes. */
    'content-length': string;
    /** @description The client ID of your Marketplace application. For example, application/json; charset=utf-8 */
    clientid: string;
    /** @description Unique to your application, this confirms that Zoom sent the request when you configure verification with your own header. */
    authorization: string;
    /** @description The encrypted authorization header used to verify that webhook requests come from Zoom. */
    'x-zm-signature': string;
    /** @description The time the request was sent, in epoch format. */
    'x-zm-request-timestamp': string;
    /** @description A unique ID that Zoom uses to identify the request. */
    'x-zm-trackingid': string;
}

export type ZoomEvent = keyof operations;
export interface AbstractZoomWebhookPayload {
    event: string;
    event_ts: number;
    download_token?: string;
    payload: unknown;
}

type ExtractPayload<T> = T extends { requestBody?: { content: { "application/json": { payload: infer U } } } } ? U : never;

export interface ZoomWebhookPayload<Event extends ZoomEvent = ZoomEvent> extends AbstractZoomWebhookPayload {
    event: Event;
    event_ts: number;
    download_token?: string;
    payload: ExtractPayload<operations[Event]>;
}
