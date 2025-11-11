package domain

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	Repos     *Repos
	JWTSecret []byte
}

func (s *AuthService) SignupViewer(ctx context.Context, email, password string) (*User, string, error) {
	if len(password) < 8 {
		return nil, "", errors.New("weak password")
	}
	hash, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	viewer, err := s.Repos.GetRoleByName(ctx, RoleViewer)
	if err != nil {
		return nil, "", fmt.Errorf("resolve role: %w", err)
	}
	u, err := s.Repos.CreateUserViewer(ctx, email, string(hash), viewer.ID)
	if err != nil {
		return nil, "", err
	}
	u.Role = viewer
	tok, _ := s.makeJWT(u.ID, RoleViewer)
	return u, tok, nil
}

func (s *AuthService) Login(ctx context.Context, email, password string) (*User, string, error) {
	u, err := s.Repos.GetUserByEmail(ctx, email)
	if err != nil {
		return nil, "", errors.New("invalid credentials")
	}
	if bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(password)) != nil {
		return nil, "", errors.New("invalid credentials")
	}
	roleName := u.Role.Name
	tok, _ := s.makeJWT(u.ID, roleName)
	return u, tok, nil
}

func (s *AuthService) ChangeUserRole(ctx context.Context, actingRole string, userID int64, newRoleName string) error {
	if actingRole != RoleAdmin {
		return errors.New("forbidden: only Admin can change roles")
	}
	role, err := s.Repos.GetRoleByName(ctx, newRoleName)
	if err != nil {
		return err
	}
	return s.Repos.UpdateUserRole(ctx, userID, role.ID)
}

func (s *AuthService) makeJWT(uid int64, role string) (string, error) {
	claims := jwt.MapClaims{"uid": uid, "role": role, "exp": time.Now().Add(24 * time.Hour).Unix()}
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return t.SignedString(s.JWTSecret)
}
