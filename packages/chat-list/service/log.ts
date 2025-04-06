// import posthog from 'posthog-js';
// import { getEmailWithCache } from './sheet';
// import { platform } from 'chat-list/utils';

// const PLATFORM = platform();

type EventType = 'exception' | 'action' | '$pageview';
// logEvent('exception', {
//     'agent': plugin.action,
//     'message': e.message,
//   })'
type EventProperty = {
    message?: string;
    [x: string]: string;
};

export const logEvent = async (event: EventType, properties: EventProperty = { message: '' }) => {
    // const email = await getEmailWithCache();
    // posthog.capture(event, {
    //     $set: {
    //         platform: PLATFORM,
    //         email
    //     },
    //     ...properties,
    // });
};

export const init = () => {
    // posthog.init('phc_wxFFiS7sNu1rV1PWewr5fe7eUp6OW3A3KpNJVvCOHB3', {
    //     api_host: 'https://app.posthog.com',
    //     autocapture: false,
    //     loaded: async () => {
    //         const email = await getEmailWithCache();
    //         if (email) {
    //             posthog.identify(email, { email });
    //         }
    //     },
    //     capture_pageview: false,
    //     capture_pageleave: false,
    // });
};

export const identify = async () => {
    // const email = await getEmailWithCache();
    // if (email) {
    //     posthog.identify(email, { email });
    //     // posthog.people.set(info);
    // }
};

export const pageView = (pageName: string) => {
    // logEvent('$pageview', {
    //     $current_url: pageName,
    //     $pathname: pageName,
    //     $platform: PLATFORM
    // });
};
