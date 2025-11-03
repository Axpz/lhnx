package main

import (
	"log"

	"github.com/lhnx/app"
	"github.com/lhnx/config"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("Failed to load configuration:", err)
	}

	// Initialize and start the application
	appcmd := app.NewAppCommand(cfg)
	if err := appcmd.Execute(); err != nil {
		log.Fatal("Failed to start application:", err)
	}
}
