// Graph Helpers

package graph

import (
	"errors"
	"strconv"
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
