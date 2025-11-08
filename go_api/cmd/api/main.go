package main

import (
	"fmt"
	"log"

	"github.com/Kenfoxfire/Gear-Core-app/internal/config"
	"github.com/Kenfoxfire/Gear-Core-app/internal/db"
)

func main() {
	fmt.Print("Hello Kenneth")
	cfg := config.Load()
	dsn := db.DSN(cfg.DB.User, cfg.DB.Password, cfg.DB.Addr, cfg.DB.Database)
	if cfg.DB.RunMigrations {
		if err := db.AutoMigrate(dsn); err != nil {
			log.Fatalf("auto-migrate: %v", err)
		}
	} else {
		log.Println("skipping auto-migrate: db.run_migrations disabled")
	}
}
