package db

import (
	"context"
	"log"

	"github.com/Kenfoxfire/Gear-Core-app/internal/config"
	"github.com/go-pg/pg/v10"
)

func Connect(cfg config.DB) *pg.DB {
	db := pg.Connect(&pg.Options{
		Addr:     cfg.Addr,
		User:     cfg.User,
		Password: cfg.Password,
		Database: cfg.Database,
		PoolSize: cfg.PoolSize,
	})
	if _, err := db.Exec("select 1"); err != nil {
		log.Fatalf("db ping: %v", err)
	}
	return db
}

func WithTx(ctx context.Context, db *pg.DB, fn func(tx *pg.Tx) error) error {
	return db.RunInTransaction(ctx, fn)
}
