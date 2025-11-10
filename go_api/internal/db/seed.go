package db

import (
	"context"
	"time"

	"golang.org/x/crypto/bcrypt"

	"github.com/Kenfoxfire/Gear-Core-app/internal/domain"
	"github.com/go-pg/pg/v10"
)

func SeedBase(ctx context.Context, db *pg.DB, adminPassword string) error {
	// Ensure roles
	roles := []domain.Role{
		{Name: domain.RoleAdmin},
		{Name: domain.RoleEditor},
		{Name: domain.RoleViewer},
	}
	for i := range roles {
		_, err := db.Model(&roles[i]).
			Where("name = ?", roles[i].Name).
			OnConflict("DO NOTHING").
			Insert()
		if err != nil {
			return err
		}
	}

	// Upsert main admin user
	var adminRole domain.Role
	if err := db.Model(&adminRole).Where("name = ?", domain.RoleAdmin).Select(); err != nil {
		return err
	}
	hash, _ := bcrypt.GenerateFromPassword([]byte(adminPassword), bcrypt.DefaultCost)

	// Create or update password of user "main"
	u := &domain.User{
		Email:        "main",
		PasswordHash: string(hash),
		RoleID:       adminRole.ID,
		CreatedAt:    time.Now(),
	}
	_, err := db.Model(u).
		OnConflict("(email) DO UPDATE").
		Set("password_hash = EXCLUDED.password_hash, role_id = EXCLUDED.role_id").
		Insert()
	return err
}
