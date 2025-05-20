package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"github.com/joho/godotenv"
)

// PriceData represents the current prices of TF2 items
type PriceData struct {
	KeyPriceInRef float64 `json:"keyPriceInRef"`
	RefPriceInUSD float64 `json:"refPriceInUSD"`
	LastUpdated   string  `json:"lastUpdated"`
}

// BackpackTFResponse represents the response from backpack.tf API
type BackpackTFResponse struct {
	Response struct {
		Success int `json:"success"`
		Currencies struct {
			Keys struct {
				Price struct {
					Value    float64 `json:"value"`
					ValueRaw float64 `json:"value_raw"`
				} `json:"price"`
			} `json:"keys"`
			Refined struct {
				Price struct {
					Value    float64 `json:"value"`
					ValueRaw float64 `json:"value_raw"`
				} `json:"price"`
			} `json:"refined"`
			USD struct {
				Price struct {
					Value float64 `json:"value"`
				} `json:"price"`
			} `json:"USD"`
		} `json:"currencies"`
	} `json:"response"`
}

type PriceHistoryPoint struct {
	Timestamp int64   `json:"timestamp"`
	Value     float64 `json:"value"`
}

type PriceHistoryResponse struct {
	Item   string              `json:"item"`
	Points []PriceHistoryPoint `json:"points"`
}

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found")
	}

	// Create a new router
	r := mux.NewRouter()

	// API routes
	r.HandleFunc("/api/prices", getPrices).Methods("GET")
	r.HandleFunc("/api/prices/history", getPriceHistory).Methods("GET")
	r.HandleFunc("/api/items/search", searchItems).Methods("GET")

	// CORS middleware
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	// Create server with timeout settings
	srv := &http.Server{
		Handler:      c.Handler(r),
		Addr:         ":8080",
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	// Start server
	log.Printf("Server starting on port 8080...")
	log.Fatal(srv.ListenAndServe())
}

// getPrices returns the current prices of keys and refined metal
func getPrices(w http.ResponseWriter, r *http.Request) {
	// Get API key from environment
	apiKey := os.Getenv("BACKPACK_TF_API_KEY")
	if apiKey == "" {
		log.Printf("Error: BACKPACK_TF_API_KEY not set")
		http.Error(w, "Server configuration error", http.StatusInternalServerError)
		return
	}

	// Create HTTP client with timeout
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	// Make request to backpack.tf API
	req, err := http.NewRequest("GET", "https://backpack.tf/api/IGetCurrencies/v1", nil)
	if err != nil {
		log.Printf("Error creating request: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Add API key to request
	q := req.URL.Query()
	q.Add("key", apiKey)
	q.Add("appid", "440") // TF2's app ID
	req.URL.RawQuery = q.Encode()

	// Make the request
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Error making request: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Error reading response: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Parse response
	var bpResponse BackpackTFResponse
	if err := json.Unmarshal(body, &bpResponse); err != nil {
		log.Printf("Error parsing response: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Check if request was successful
	if bpResponse.Response.Success != 1 {
		log.Printf("Backpack.tf API error: %s", string(body))
		http.Error(w, "Error fetching prices", http.StatusInternalServerError)
		return
	}

	// Create response
	prices := PriceData{
		KeyPriceInRef: bpResponse.Response.Currencies.Keys.Price.Value,
		RefPriceInUSD: bpResponse.Response.Currencies.Refined.Price.Value,
		LastUpdated:   time.Now().Format(time.RFC3339),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(prices)
}

// getPriceHistory returns historical price data
func getPriceHistory(w http.ResponseWriter, r *http.Request) {
	apiKey := os.Getenv("BACKPACK_TF_API_KEY")
	if apiKey == "" {
		http.Error(w, "Server configuration error", http.StatusInternalServerError)
		return
	}

	item := r.URL.Query().Get("item")
	quality := r.URL.Query().Get("quality")
	if item == "" || quality == "" {
		http.Error(w, "Missing item or quality parameter", http.StatusBadRequest)
		return
	}

	timeframe := r.URL.Query().Get("timeframe") // e.g., "7days", "30days", "90days", "1year", "3years"
	if timeframe == "" {
		timeframe = "30days" // Default timeframe
	}

	// Build backpack.tf API request
	client := &http.Client{Timeout: 10 * time.Second}
	req, err := http.NewRequest("GET", "https://backpack.tf/api/IGetPriceHistory/v1", nil)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	q := req.URL.Query()
	q.Add("key", apiKey)
	q.Add("item", item)
	q.Add("quality", quality)
	q.Add("appid", "440") // TF2's app ID
	req.URL.RawQuery = q.Encode()

	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, "Error fetching price history", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		http.Error(w, "Error reading response", http.StatusInternalServerError)
		return
	}

	var apiResp struct {
		Response struct {
			Success int    `json:"success"`
			Message string `json:"message"`
			History []struct {
				Value     float64 `json:"value"`
				Timestamp int64   `json:"timestamp"`
			} `json:"history"`
		} `json:"response"`
	}
	if err := json.Unmarshal(body, &apiResp); err != nil {
		log.Printf("Error parsing history response: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	if apiResp.Response.Success != 1 {
		log.Printf("Backpack.tf price history API error for item %s (quality %s): %s", item, quality, apiResp.Response.Message)
		http.Error(w, fmt.Sprintf("Error fetching price history: %s", apiResp.Response.Message), http.StatusInternalServerError)
		return
	}

	// Filter history by timeframe on the backend
	var cutoff int64
	now := time.Now().Unix()
	switch timeframe {
	case "7days":
		cutoff = now - 7*24*60*60
	case "30days":
		cutoff = now - 30*24*60*60
	case "90days":
		cutoff = now - 90*24*60*60
	case "1year":
		cutoff = now - 365*24*60*60
	case "3years":
		cutoff = now - 3*365*24*60*60
	default:
		cutoff = 0 // Return all if timeframe is invalid or not specified
	}

	filteredPoints := []PriceHistoryPoint{}
	for _, h := range apiResp.Response.History {
		if h.Timestamp >= cutoff {
			filteredPoints = append(filteredPoints, PriceHistoryPoint{
				Timestamp: h.Timestamp,
				Value:     h.Value,
			})
		}
	}

	respData := PriceHistoryResponse{
		Item:   item,
		Points: filteredPoints,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(respData)
}

// searchItems handles item search requests
func searchItems(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement item search functionality
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Not implemented yet"})
} 