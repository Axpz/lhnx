package app

import (
	"context"
	"fmt"

	"github.com/lhnx/config"
	"github.com/lhnx/pkg/database"
	"github.com/lhnx/pkg/logger"
	"github.com/lhnx/repository"
	"github.com/olivere/elastic/v7"
	"github.com/spf13/cobra"
)

func NewEsSyncCommand(cfg *config.Config) *cobra.Command {
	var daysAgo int

	cmd := &cobra.Command{
		Use:   "esync",
		Short: "Sync company data to Elasticsearch",
		RunE: func(cmd *cobra.Command, args []string) error {
			logger := logger.InitLogger()

			// Initialize database
			db, err := database.New(database.Config{
				DSN: cfg.Database.DSN,
			})
			if err != nil {
				logger.Error(fmt.Sprintf("Failed to connect to database: %v", err))
				return err
			}
			logger.Info("Database connection established")

			esClient, err := elastic.NewClient(
				elastic.SetURL(cfg.Es.URL),
				elastic.SetSniff(false),
			)
			if err != nil {
				logger.Error(fmt.Sprintf("Failed to create Elasticsearch client: %v", err))
				return err
			}
			logger.Info("Elasticsearch client created")

			repos := repository.New(config.ClientSet{
				Db: db,
				Es: esClient,
			})

			if err := repos.Company.EsSync(context.Background(), daysAgo); err != nil {
				logger.Error(fmt.Sprintf("Failed to sync to Elasticsearch: %v", err))
				return err
			}
			logger.Info("Sync to Elasticsearch completed")
			return nil
		},
	}

	cmd.Flags().IntVarP(&daysAgo, "days-ago", "d", 3, "Sync data updated in the last N days")

	return cmd
}
