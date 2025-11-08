package domain

import "time"

// Permanent roles seeded in DB.
const (
	RoleAdmin  = "Admin"
	RoleEditor = "Editor"
	RoleViewer = "Viewer"
)

type Role struct {
	tableName struct{}  `pg:"roles"`
	ID        int64     `pg:"id,pk"`
	Name      string    `pg:"name,unique,notnull"`
	CreatedAt time.Time `pg:"created_at,default:now()"`
}

type User struct {
	tableName    struct{}  `pg:"users"`
	ID           int64     `pg:"id,pk"`
	Email        string    `pg:"email,unique,notnull"`
	PasswordHash string    `pg:"password_hash,notnull"`
	RoleID       int64     `pg:"role_id,notnull"`
	Role         *Role     `pg:"rel:has-one,fk:role_id"`
	CreatedAt    time.Time `pg:"created_at,default:now()"`
}

// Vehicle basics (invented but realistic for CRUD)
type Vehicle struct {
	tableName    struct{}  `pg:"vehicles"`
	ID           int64     `pg:"id,pk"`
	VIN          string    `pg:"vin,unique,notnull"`
	Name         string    `pg:"name,notnull"`
	ModelCode    string    `pg:"model_code,notnull"`    // e.g., "F-150"
	TractionType string    `pg:"traction_type,notnull"` // RWD | FWD | AWD | 4WD
	ReleaseYear  int       `pg:"release_year,notnull"`
	BatchNumber  string    `pg:"batch_number,notnull"`
	Color        string    `pg:"color"`
	Mileage      int       `pg:"mileage,default:0"`
	Status       string    `pg:"status,notnull,default:'ACTIVE'"` // ACTIVE | INACTIVE | DISCONTINUED
	CreatedAt    time.Time `pg:"created_at,default:now()"`
	UpdatedAt    time.Time `pg:"updated_at,default:now()"`
}

// Movement types (inventory lifecycle events)
const (
	MoveSale         = "SALE"
	MoveDefect       = "DEFECT"
	MoveDiscontinued = "DISCONTINUED"
	MoveTransfer     = "TRANSFER"
	MoveReturn       = "RETURN"
)

type Movement struct {
	tableName   struct{}       `pg:"movements"`
	ID          int64          `pg:"id,pk"`
	VehicleID   int64          `pg:"vehicle_id,notnull"`
	Vehicle     *Vehicle       `pg:"rel:has-one,fk:vehicle_id"`
	Type        string         `pg:"type,notnull"` // enum-ish
	Description string         `pg:"description"`
	OccurredAt  time.Time      `pg:"occurred_at,notnull"`
	Metadata    map[string]any `pg:"metadata,type:jsonb"`
	CreatedBy   int64          `pg:"created_by,notnull"`
	CreatedAt   time.Time      `pg:"created_at,default:now()"`
}
