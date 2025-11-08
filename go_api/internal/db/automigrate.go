package db

import (
	"embed"
	"fmt"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	"github.com/golang-migrate/migrate/v4/source/iofs"
)

// Embed all migration SQL files.
//
//go:embed migrations/*.sql
var migrationsFS embed.FS

// DSN helper
func DSN(user, pass, hostPort, database string) string {
	return fmt.Sprintf("postgres://%s:%s@%s/%s?sslmode=disable", user, pass, hostPort, database)
}

func AutoMigrate(dsn string) error {
	src, err := iofs.New(migrationsFS, "migrations")
	if err != nil {
		return err
	}

	m, err := migrate.NewWithSourceInstance("iofs", src, dsn)
	if err != nil {
		return err
	}
	defer m.Close()

	// Up is idempotent: if no pending, returns ErrNoChange
	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		return err
	}
	return nil
}
