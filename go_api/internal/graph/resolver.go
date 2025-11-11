// Package graph contains the GraphQL resolver implementations and wiring,
// including the Resolver type which holds the database, repositories, and auth services.
package graph

import (
	"github.com/Kenfoxfire/Gear-Core-app/internal/domain"
	"github.com/go-pg/pg/v10"
)

type Resolver struct {
	DB        *pg.DB
	Repos     *domain.Repos
	Auth      *domain.AuthService
	JWTSecret []byte
}
