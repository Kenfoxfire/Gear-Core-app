// Graph Helpers

package graph

import (
	"encoding/json"
	"errors"
	"strconv"

	"github.com/Kenfoxfire/Gear-Core-app/internal/domain"
	"github.com/Kenfoxfire/Gear-Core-app/internal/graph/model"
)

// parseID converts a GraphQL string ID to int64
func parseID(id string) int64 {
	n, err := strconv.ParseInt(id, 10, 64)
	if err != nil {
		panic(errors.New("invalid ID format: must be numeric"))
	}
	return n
}

// int64 → string
func idStr(n int64) string {
	return strconv.FormatInt(n, 10)
}

func ptrStr(s *string) string { return *s }

func strToPtr(s string) *string {
	return &s
}

func ptrInt32ToInt(p *int32, fallback int) int {
	if p == nil {
		return fallback
	}
	return int(*p)
}

func mapUser(u *domain.User) *model.User {
	var gqlRole *model.Role
	if u.Role != nil {
		gqlRole = &model.Role{
			ID:        strconv.FormatInt(u.Role.ID, 10),
			Name:      u.Role.Name,
			CreatedAt: u.Role.CreatedAt,
		}
	}
	return &model.User{
		ID:        strconv.FormatInt(u.ID, 10),
		Email:     u.Email,
		Role:      gqlRole,
		CreatedAt: u.CreatedAt,
	}
}
func mapReport(rows []domain.MovementReportRow) []*model.MovementReportRow {
	mapped := make([]*model.MovementReportRow, 0, len(rows))
	for i := range rows {
		r := rows[i]
		mapped = append(mapped, &model.MovementReportRow{
			Type:  model.MovementType(r.Type),
			Count: int32(r.Count),
		})
	}
	return mapped
}
func mapVehicle(v *domain.Vehicle) *model.Vehicle {
	return &model.Vehicle{
		ID: idStr(v.ID), Vin: v.VIN, Name: v.Name, ModelCode: v.ModelCode,
		TractionType: model.TractionType(v.TractionType), ReleaseYear: int32(v.ReleaseYear),
		BatchNumber: v.BatchNumber, Color: strToPtr(v.Color), Mileage: int32(v.Mileage),
		Status: model.VehicleStatus(v.Status), CreatedAt: v.CreatedAt, UpdatedAt: v.UpdatedAt,
	}
}
func mapMovement(m *domain.Movement) *model.Movement {
	var metadataStr *string
	if m.Metadata != nil {
		if data, err := json.Marshal(m.Metadata); err == nil {
			str := string(data)
			metadataStr = &str
		}
	}
	return &model.Movement{
		ID: idStr(m.ID), VehicleID: idStr(m.VehicleID),
		Type: model.MovementType(m.Type), Description: &m.Description,
		OccurredAt: m.OccurredAt, Metadata: metadataStr,
		CreatedBy: idStr(m.CreatedBy), CreatedAt: m.CreatedAt,
	}
}
