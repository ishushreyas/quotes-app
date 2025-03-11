// main.go
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/mux"
)

// Quote structure to hold our quote data
type Quote struct {
	ID       int    `json:"id"`
	Text     string `json:"text"`
	Author   string `json:"author"`
	Category string `json:"category"`
	Color    string `json:"color"`
	AddedAt  string `json:"addedAt,omitempty"`
}

// In-memory storage for quotes
var (
	quotes = []Quote{
		{
			ID:       1,
			Text:     "The only way to do great work is to love what you do.",
			Author:   "Steve Jobs",
			Category: "Motivation",
			Color:    "from-purple-500 to-pink-500",
			AddedAt:  time.Now().Format(time.RFC3339),
		},
		{
			ID:       2,
			Text:     "Innovation distinguishes between a leader and a follower.",
			Author:   "Steve Jobs",
			Category: "Leadership",
			Color:    "from-blue-500 to-cyan-400",
			AddedAt:  time.Now().Format(time.RFC3339),
		},
		{
			ID:       3,
			Text:     "Design is not just what it looks like and feels like. Design is how it works.",
			Author:   "Steve Jobs",
			Category: "Design",
			Color:    "from-green-400 to-teal-500",
			AddedAt:  time.Now().Format(time.RFC3339),
		},
		{
			ID:       4,
			Text:     "Your time is limited, so don't waste it living someone else's life.",
			Author:   "Steve Jobs",
			Category: "Life",
			Color:    "from-yellow-400 to-orange-500",
			AddedAt:  time.Now().Format(time.RFC3339),
		},
		{
			ID:       5,
			Text:     "Think different.",
			Author:   "Apple Inc.",
			Category: "Innovation",
			Color:    "from-red-500 to-pink-500",
			AddedAt:  time.Now().Format(time.RFC3339),
		},
	}
	mutex = &sync.Mutex{}
	nextID = 6 // Start ID counter after our initial quotes
)

func main() {
	r := mux.NewRouter()

	// API routes
	r.HandleFunc("/quotes", getQuotes).Methods("GET")
	r.HandleFunc("/quotes/{id}", getQuote).Methods("GET")
	r.HandleFunc("/quotes", createQuote).Methods("POST")
	r.HandleFunc("/quotes/{id}", updateQuote).Methods("PUT")
	r.HandleFunc("/quotes/{id}", deleteQuote).Methods("DELETE")


	// Start server
	fmt.Println("Server is running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}

// getQuotes returns all quotes
func getQuotes(w http.ResponseWriter, r *http.Request) {
	mutex.Lock()
	defer mutex.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(quotes)
}

// getQuote returns a single quote by ID
func getQuote(w http.ResponseWriter, r *http.Request) {
	mutex.Lock()
	defer mutex.Unlock()

	params := mux.Vars(r)
	var id int
	fmt.Sscanf(params["id"], "%d", &id)

	for _, quote := range quotes {
		if quote.ID == id {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(quote)
			return
		}
	}

	w.WriteHeader(http.StatusNotFound)
	json.NewEncoder(w).Encode(map[string]string{"error": "Quote not found"})
}

// createQuote adds a new quote
func createQuote(w http.ResponseWriter, r *http.Request) {
	mutex.Lock()
	defer mutex.Unlock()

	var quote Quote
	err := json.NewDecoder(r.Body).Decode(&quote)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	// Set ID and timestamp
	quote.ID = nextID
	nextID++
	quote.AddedAt = time.Now().Format(time.RFC3339)

	quotes = append(quotes, quote)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(quote)
}

// updateQuote updates an existing quote
func updateQuote(w http.ResponseWriter, r *http.Request) {
	mutex.Lock()
	defer mutex.Unlock()

	params := mux.Vars(r)
	var id int
	fmt.Sscanf(params["id"], "%d", &id)

	var updatedQuote Quote
	err := json.NewDecoder(r.Body).Decode(&updatedQuote)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	for i, quote := range quotes {
		if quote.ID == id {
			// Keep ID and update other fields
			updatedQuote.ID = id
			quotes[i] = updatedQuote
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(updatedQuote)
			return
		}
	}

	w.WriteHeader(http.StatusNotFound)
	json.NewEncoder(w).Encode(map[string]string{"error": "Quote not found"})
}

// deleteQuote removes a quote
func deleteQuote(w http.ResponseWriter, r *http.Request) {
	mutex.Lock()
	defer mutex.Unlock()

	params := mux.Vars(r)
	var id int
	fmt.Sscanf(params["id"], "%d", &id)

	for i, quote := range quotes {
		if quote.ID == id {
			// Remove the quote by slicing
			quotes = append(quotes[:i], quotes[i+1:]...)
			w.WriteHeader(http.StatusNoContent)
			return
		}
	}

	w.WriteHeader(http.StatusNotFound)
	json.NewEncoder(w).Encode(map[string]string{"error": "Quote not found"})
}
