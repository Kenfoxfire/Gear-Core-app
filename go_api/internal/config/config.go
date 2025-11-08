package config

import (
	"log"
	"strings"

	"github.com/spf13/viper"
)

type App struct {
	Env              string `mapstructure:"env"`
	Port             int    `mapstructure:"port"`
	JWTSecret        string `mapstructure:"jwt_secret"`
	CORSAllowOrigins string `mapstructure:"cors_allow_origins"`
}
type DB struct {
	Addr          string `mapstructure:"addr"`
	User          string `mapstructure:"user"`
	Password      string `mapstructure:"password"`
	Database      string `mapstructure:"database"`
	PoolSize      int    `mapstructure:"pool_size"`
	RunMigrations bool   `mapstructure:"run_migrations"`
}
type Security struct {
	AdminPassword string `mapstructure:"admin_password"`
}
type Config struct {
	App      App      `mapstructure:"app"`
	DB       DB       `mapstructure:"db"`
	Security Security `mapstructure:"security"`
}

func Load() Config {
	v := viper.New()
	v.SetConfigName("config")
	v.SetConfigType("yml")
	v.AddConfigPath("../..")
	v.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	v.AutomaticEnv() // Recognize auto Bind Env Variable

	if err := v.ReadInConfig(); err != nil {
		log.Fatalf("config read: %v", err)
	}
	var c Config
	if err := v.Unmarshal(&c); err != nil {
		log.Fatalf("config unmarshal: %v", err)
	}
	if c.App.JWTSecret == "" || c.Security.AdminPassword == "" {
		log.Fatal("JWT secret and security.admin_password are required")
	}
	return c
}
