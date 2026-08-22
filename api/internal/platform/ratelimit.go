package platform

import (
	"net/http"
	"sync"
	"time"
)

type rateBucket struct {
	count   int
	resetAt time.Time
}

type ipLimiter struct {
	mu      sync.Mutex
	buckets map[string]rateBucket
}

func newIPLimiter() *ipLimiter {
	return &ipLimiter{buckets: make(map[string]rateBucket)}
}

func (s *Server) rateLimit(name string, maximum int, window time.Duration) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			key := name + ":" + remoteIP(r)
			now := time.Now()
			s.limits.mu.Lock()
			bucket := s.limits.buckets[key]
			if bucket.resetAt.Before(now) {
				bucket = rateBucket{resetAt: now.Add(window)}
			}
			bucket.count++
			s.limits.buckets[key] = bucket
			s.limits.mu.Unlock()
			if bucket.count > maximum {
				w.Header().Set("Retry-After", time.Until(bucket.resetAt).Round(time.Second).String())
				writeError(w, r, http.StatusTooManyRequests, "rate_limited", "Too many requests. Please try again later.", nil)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
