package config

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	AppPort string
	AppEnv  string

	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	DBDsn      string

	JWTSecret      string
	JWTExpiryHours int

	CORSAllowedOrigins string
	// StaticDir: absolute/relative path to the compiled frontend dist.
	// When set, Go serves the React SPA (used in production / Railway).
	StaticDir string
}

func Load() (*Config, error) {
	_ = godotenv.Load()

	expiryHours, err := strconv.Atoi(getEnv("JWT_EXPIRY_HOURS", "24"))
	if err != nil {
		expiryHours = 24
	}

	cfg := &Config{
		AppPort:            getEnv("APP_PORT", "8080"),
		AppEnv:             getEnv("APP_ENV", "development"),
		DBHost:             getEnv("DB_HOST", "localhost"),
		DBPort:             getEnv("DB_PORT", "5432"),
		DBUser:             getEnv("DB_USER", "postgres"),
		DBPassword:         getEnv("DB_PASSWORD", ""),
		DBName:             getEnv("DB_NAME", "tabungan_siswa"),
		JWTSecret:          getEnv("JWT_SECRET", "changeme"),
		JWTExpiryHours:     expiryHours,
		CORSAllowedOrigins: getEnv("CORS_ALLOWED_ORIGINS", ""),
		StaticDir:          getEnv("STATIC_DIR", ""),
	}

	// Railway menyediakan DATABASE_URL lengkap — prioritaskan jika ada.
	// Format: postgres://user:password@host:port/dbname
	if dbURL := os.Getenv("DATABASE_URL"); dbURL != "" {
		cfg.DBDsn = dbURL + "?sslmode=require&TimeZone=Asia/Jakarta"
	} else {
		cfg.DBDsn = fmt.Sprintf(
			"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable TimeZone=Asia/Jakarta",
			cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword, cfg.DBName,
		)
	}

	return cfg, nil
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
