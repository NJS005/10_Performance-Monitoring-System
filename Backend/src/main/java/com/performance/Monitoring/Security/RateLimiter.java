package com.performance.Monitoring.Security;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Deque;
import java.util.LinkedList;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simple in-memory sliding-window rate limiter.
 * Tracks request timestamps per key (e.g., IP address).
 * Default: 10 requests per 60-second window.
 */
@Component
public class RateLimiter {

    private static final int  MAX_REQUESTS = 10;
    private static final long WINDOW_MILLIS = 60_000; // 1 minute

    private final Map<String, Deque<Long>> store = new ConcurrentHashMap<>();

    /**
     * Returns true if the request is allowed, false if the limit is exceeded.
     */
    public boolean isAllowed(String key) {
        long now = Instant.now().toEpochMilli();
        store.putIfAbsent(key, new LinkedList<>());
        Deque<Long> timestamps = store.get(key);

        synchronized (timestamps) {
            // Remove timestamps outside the window
            while (!timestamps.isEmpty() && now - timestamps.peekFirst() > WINDOW_MILLIS) {
                timestamps.pollFirst();
            }
            if (timestamps.size() >= MAX_REQUESTS) {
                return false;
            }
            timestamps.addLast(now);
            return true;
        }
    }
}
