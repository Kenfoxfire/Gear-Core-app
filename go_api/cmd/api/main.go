package main

import (
	"fmt"
	"log"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/Kenfoxfire/Gear-Core-app/internal/config"
	"github.com/Kenfoxfire/Gear-Core-app/internal/db"
	"github.com/Kenfoxfire/Gear-Core-app/internal/graph"

	"context"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
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

	pg := db.Connect(cfg.DB)
	defer pg.Close()

	if err := db.SeedBase(context.Background(), pg, cfg.Security.AdminPassword); err != nil {
		log.Fatal(err)
	}

	// repos := &domain.Repos{DB: pg}
	// authSvc := &domain.AuthService{Repos: repos, JWTSecret: []byte(cfg.App.JWTSecret)}

	router := chi.NewRouter()
	// router.Use(httpx.CORS(cfg.App.CORSAllowOrigins))
	// router.Use(httpx.AuthMiddleware([]byte(cfg.App.JWTSecret)))

	srv := handler.NewDefaultServer(graph.NewExecutableSchema(graph.Config{Resolvers: nil}))

	router.Handle("/query", srv)
	router.Get("/", func(w http.ResponseWriter, r *http.Request) {
		playground.Handler("GraphQL", "/query").ServeHTTP(w, r)
	})

	addr := ":" + strconv.Itoa(cfg.App.Port)
	log.Printf("listening on %s", addr)
	log.Fatal(http.ListenAndServe(addr, router))
}
