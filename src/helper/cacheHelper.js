import { optionalValidation } from "./object-validation-helper.js";
export const setCacheStorage = (cacheName, dataValue) => {
    if ('caches' in window) {
        caches.open(cacheName)
            .then((cache) => {
                const response = new Response(JSON.stringify(dataValue));
                caches.open(cacheName)
                    .then((cache) => {
                        cache.put(cacheName, response);
                    })
                    .catch((error) => {
                        console.error('Cache data storage failed: ', error);
                    });
            })
            .catch((error) => {
                console.error('Cache open failed: ', error);
            });
    }
}

export const getCacheStorage = async (cacheName) => {
    if ('caches' in window) {
        const cache = await caches.open(cacheName)
        const cachedResponse = await cache.match(cacheName);
        if (!cachedResponse || !optionalValidation(cachedResponse,'ok')) {
            return null;
        }
        return await cachedResponse.json();
    }
}

export const deleteCacheStorage = async (cacheName) => {
    try {
        const hasDeleted = await caches.delete(cacheName);
        return hasDeleted;        
    } catch (error) {
        return false;
    }
}

/**
 * Dispatch records to listeners by creating a CustomEvent and triggering it on the window.
 * @param {Object} obj - The data object to be dispatched.
 * @param {string} key - The key under which the data will be stored in the CustomEvent detail.
 * @param {string} eventType - The type of the CustomEvent to be dispatched.
 */

export const dispatchRecordsByListener = (obj, key, eventType) => {
    try {
        // Creating an object with the specified key and value
        const objectValue = { [key]: obj };

        // Creating a CustomEvent with the specified type and detail
        const updateEvent = new CustomEvent(eventType, objectValue);

        // Dispatching the CustomEvent to the window
        window.dispatchEvent(updateEvent);
    } catch (error) {
        console.info('An error occurred while dispatching the event:', error);
    }
};
