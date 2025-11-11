package httpx

import (
	"context"
	"errors"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

type ctxKey string

const (
	UserIDKey ctxKey = "uid"
	RoleKey   ctxKey = "role"
)

func WithUser(ctx context.Context, uid int64, role string) context.Context {
	ctx = context.WithValue(ctx, UserIDKey, uid)
	return context.WithValue(ctx, RoleKey, role)
}
func UserFrom(ctx context.Context) (int64, string, bool) {
	uid, ok1 := ctx.Value(UserIDKey).(int64)
	role, ok2 := ctx.Value(RoleKey).(string)
	return uid, role, ok1 && ok2
}

func AuthMiddleware(secret []byte) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			h := r.Header.Get("Authorization")
			if h == "" || !strings.HasPrefix(h, "Bearer ") {
				next.ServeHTTP(w, r)
				return
			}
			tokStr := strings.TrimPrefix(h, "Bearer ")
			tok, err := jwt.Parse(tokStr, func(t *jwt.Token) (any, error) { return secret, nil })
			if err == nil && tok.Valid {
				if c, ok := tok.Claims.(jwt.MapClaims); ok {
					uidF, hasUID := c["uid"].(float64)
					role, _ := c["role"].(string)
					if hasUID && role != "" {
						r = r.WithContext(WithUser(r.Context(), int64(uidF), role))
					}
				}
			}
			next.ServeHTTP(w, r)
		})
	}
}

var ErrForbidden = errors.New("forbidden")

func RequireAdmin(ctx context.Context) error {
	_, role, ok := UserFrom(ctx)
	if !ok || role != "Admin" {
		return ErrForbidden
	}
	return nil
}
