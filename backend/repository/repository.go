package repository

import "github.com/lhnx/config"

// Repository holds all repositories
type Repository struct {
	Company CompanyRepository
	Product ProductRepository
	OEM     OEMRepository
	User    UserRepository
}

// New creates a new repository instance
func New(clientSet config.ClientSet) *Repository {
	return &Repository{
		Company: NewCompanyRepository(clientSet),
		Product: NewProductRepository(clientSet),
		OEM:     NewOEMRepository(clientSet),
		User:    NewUserRepository(clientSet),
	}
}
