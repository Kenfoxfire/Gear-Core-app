// Package loaders provides data loaders for batching database queries.
package loaders

import (
	"context"
	"time"

	"github.com/Kenfoxfire/Gear-Core-app/internal/domain"
	"github.com/vikstrous/dataloadgen"
)

type Loaders struct {
	VehicleByID *dataloadgen.Loader[int64, *domain.Vehicle]
}

type CtxKey string

const Key CtxKey = "dataloaders"

func New(repos *domain.Repos) *Loaders {
	vehicleBatch := func(ctx context.Context, keys []int64) ([]*domain.Vehicle, []error) {
		res := make([]*domain.Vehicle, len(keys))
		errs := make([]error, len(keys))

		var items []*domain.Vehicle
		_ = repos.DB.WithContext(ctx).
			Model(&items).
			Where("id IN (?)", pgIn(keys)).
			Select()

		m := make(map[int64]*domain.Vehicle, len(items))
		for _, v := range items {
			m[v.ID] = v
		}
		for i, k := range keys {
			res[i] = m[k]
		}
		return res, errs
	}

	return &Loaders{
		VehicleByID: dataloadgen.NewLoader(
			vehicleBatch,
			dataloadgen.WithWait(1*time.Millisecond),
			dataloadgen.WithBatchCapacity(100),
		),
	}
}

// helper para IN query
func pgIn[T any](xs []T) []T { return xs }
