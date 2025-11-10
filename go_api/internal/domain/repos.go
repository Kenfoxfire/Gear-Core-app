package domain

import (
	"context"

	"github.com/go-pg/pg/v10"
)

type Repos struct{ DB *pg.DB }

func (r *Repos) GetUserByEmail(ctx context.Context, email string) (*User, error) {
	var u User
	err := r.DB.Model(&u).Relation("Role").Where("email = ?", email).Limit(1).Select()
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *Repos) CreateUserViewer(ctx context.Context, email, passwordHash string, viewerRoleID int64) (*User, error) {
	u := &User{Email: email, PasswordHash: passwordHash, RoleID: viewerRoleID}
	_, err := r.DB.Model(u).Insert()
	return u, err
}

func (r *Repos) UpdateUserRole(ctx context.Context, userID, newRoleID int64) error {
	_, err := r.DB.Model(&User{ID: userID, RoleID: newRoleID}).Column("role_id").WherePK().Update()
	return err
}

func (r *Repos) GetRoleByName(ctx context.Context, name string) (*Role, error) {
	var ro Role
	if err := r.DB.Model(&ro).Where("name = ?", name).Select(); err != nil {
		return nil, err
	}
	return &ro, nil
}

func (r *Repos) GetRoleByID(ctx context.Context, id int64) (*Role, error) {
	var ro Role
	if err := r.DB.Model(&ro).Where("id = ?", id).Select(); err != nil {
		return nil, err
	}
	return &ro, nil
}

func (r *Repos) CreateVehicle(ctx context.Context, v *Vehicle) (*Vehicle, error) {
	_, err := r.DB.Model(v).Insert()
	return v, err
}

func (r *Repos) UpdateVehicle(ctx context.Context, v *Vehicle) (*Vehicle, error) {
	_, err := r.DB.Model(v).WherePK().Update()
	return v, err
}

func (r *Repos) DeleteVehicle(ctx context.Context, id int64) error {
	_, err := r.DB.Model(&Vehicle{ID: id}).WherePK().Delete()
	return err
}

func (r *Repos) GetVehicleByID(ctx context.Context, id int64) (*Vehicle, error) {
	var v Vehicle
	err := r.DB.Model(&v).Where("id = ?", id).Select()
	if err != nil {
		return nil, err
	}
	return &v, nil
}

func (r *Repos) ListVehicles(ctx context.Context, limit, offset int) ([]*Vehicle, error) {
	var items []*Vehicle
	err := r.DB.Model(&items).Order("created_at DESC").Limit(limit).Offset(offset).Select()
	return items, err
}

func (r *Repos) CreateMovement(ctx context.Context, m *Movement) (*Movement, error) {
	_, err := r.DB.Model(m).Insert()
	return m, err
}

func (r *Repos) ListMovementsByVehicle(ctx context.Context, vehicleID int64, limit, offset int) ([]*Movement, error) {
	var ms []*Movement
	err := r.DB.Model(&ms).Where("vehicle_id = ?", vehicleID).
		Order("occurred_at DESC").Limit(limit).Offset(offset).Select()
	return ms, err
}

// Simple report: counts by type in time window
type MovementReportRow struct {
	Type  string `pg:"type"`
	Count int    `pg:"count"`
}

func (r *Repos) MovementReport(ctx context.Context, from, to string) ([]MovementReportRow, error) {
	var rows []MovementReportRow
	_, err := r.DB.Query(&rows, `
	  SELECT type, COUNT(*)::int AS count
	  FROM movements
	  WHERE occurred_at >= ? AND occurred_at < ?
	  GROUP BY type
	  ORDER BY count DESC`, from, to)
	return rows, err
}
