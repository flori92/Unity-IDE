package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// Allow all origins in development
		// In production, restrict to your domain
		return true
	},
}

type Hub struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
}

type Client struct {
	hub  *Hub
	conn *websocket.Conn
	send chan []byte
}

type Message struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

func newHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client] = true
			log.Printf("Client connected. Total clients: %d", len(h.clients))

		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
				log.Printf("Client disconnected. Total clients: %d", len(h.clients))
			}

		case message := <-h.broadcast:
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
		}
	}
}

func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}
		// Process incoming message
		log.Printf("Received message: %s", message)
		// Echo message back to all clients
		c.hub.broadcast <- message
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(54 * time.Second)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Add queued messages to the current websocket message
			n := len(c.send)
			for i := 0; i < n; i++ {
				w.Write([]byte("\n"))
				w.Write(<-c.send)
			}

			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func handleWebSocket(hub *Hub) gin.HandlerFunc {
	return func(c *gin.Context) {
		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Printf("Failed to upgrade connection: %v", err)
			return
		}

		client := &Client{
			hub:  hub,
			conn: conn,
			send: make(chan []byte, 256),
		}

		client.hub.register <- client

		go client.writePump()
		go client.readPump()
	}
}

func setupRouter(hub *Hub) *gin.Engine {
	router := gin.New()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	// Configure CORS
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000", "http://localhost:5173", "tauri://localhost"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization", "Accept"}
	config.AllowCredentials = true
	router.Use(cors.New(config))

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// Docker endpoints
		docker := v1.Group("/docker")
		{
			docker.GET("/containers", getDockerContainers)
			docker.POST("/containers/:id/start", startContainer)
			docker.POST("/containers/:id/stop", stopContainer)
			docker.DELETE("/containers/:id", removeContainer)
			docker.GET("/images", getDockerImages)
			docker.POST("/images/pull", pullImage)
		}

		// Kubernetes endpoints
		k8s := v1.Group("/kubernetes")
		{
			k8s.GET("/pods", getK8sPods)
			k8s.GET("/deployments", getK8sDeployments)
			k8s.GET("/services", getK8sServices)
			k8s.GET("/nodes", getK8sNodes)
			k8s.POST("/apply", applyK8sManifest)
		}

		// Ansible endpoints
		ansible := v1.Group("/ansible")
		{
			ansible.GET("/playbooks", getPlaybooks)
			ansible.POST("/playbooks/run", runPlaybook)
			ansible.GET("/inventory", getInventory)
			ansible.GET("/roles", getRoles)
		}

		// Monitoring endpoints
		monitoring := v1.Group("/monitoring")
		{
			monitoring.GET("/metrics", getSystemMetrics)
			monitoring.GET("/logs", getLogs)
			monitoring.GET("/alerts", getAlerts)
		}

		// Extension endpoints
		extensions := v1.Group("/extensions")
		{
			extensions.GET("/list", listExtensions)
			extensions.GET("/marketplace", getMarketplace)
			extensions.POST("/install", installExtension)
			extensions.DELETE("/:id", uninstallExtension)
		}

		// Workflow endpoints
		workflows := v1.Group("/workflows")
		{
			workflows.GET("/list", listWorkflows)
			workflows.POST("/create", createWorkflow)
			workflows.POST("/:id/execute", executeWorkflow)
			workflows.DELETE("/:id", deleteWorkflow)
		}
	}

	// WebSocket endpoint
	router.GET("/ws", handleWebSocket(hub))

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "healthy",
			"version": "1.0.0",
			"time":    time.Now(),
		})
	})

	return router
}

// Docker handlers
func getDockerContainers(c *gin.Context) {
	// Mock implementation
	c.JSON(200, gin.H{
		"containers": []map[string]interface{}{
			{
				"id":     "abc123",
				"name":   "nginx",
				"status": "running",
				"image":  "nginx:latest",
			},
		},
	})
}

func startContainer(c *gin.Context) {
	id := c.Param("id")
	c.JSON(200, gin.H{"message": fmt.Sprintf("Container %s started", id)})
}

func stopContainer(c *gin.Context) {
	id := c.Param("id")
	c.JSON(200, gin.H{"message": fmt.Sprintf("Container %s stopped", id)})
}

func removeContainer(c *gin.Context) {
	id := c.Param("id")
	c.JSON(200, gin.H{"message": fmt.Sprintf("Container %s removed", id)})
}

func getDockerImages(c *gin.Context) {
	c.JSON(200, gin.H{"images": []string{"nginx:latest", "alpine:3.14"}})
}

func pullImage(c *gin.Context) {
	var body map[string]string
	c.BindJSON(&body)
	c.JSON(200, gin.H{"message": fmt.Sprintf("Pulling image %s", body["image"])})
}

// Kubernetes handlers
func getK8sPods(c *gin.Context) {
	namespace := c.DefaultQuery("namespace", "default")
	c.JSON(200, gin.H{
		"pods": []map[string]interface{}{
			{
				"name":      "app-pod-1",
				"namespace": namespace,
				"status":    "Running",
			},
		},
	})
}

func getK8sDeployments(c *gin.Context) {
	c.JSON(200, gin.H{"deployments": []string{"app-deployment"}})
}

func getK8sServices(c *gin.Context) {
	c.JSON(200, gin.H{"services": []string{"app-service"}})
}

func getK8sNodes(c *gin.Context) {
	c.JSON(200, gin.H{"nodes": []map[string]interface{}{
		{"name": "node-1", "status": "Ready"},
	}})
}

func applyK8sManifest(c *gin.Context) {
	var body map[string]string
	c.BindJSON(&body)
	c.JSON(200, gin.H{"message": "Manifest applied successfully"})
}

// Ansible handlers
func getPlaybooks(c *gin.Context) {
	c.JSON(200, gin.H{"playbooks": []string{"site.yml", "deploy.yml"}})
}

func runPlaybook(c *gin.Context) {
	var body map[string]string
	c.BindJSON(&body)
	c.JSON(200, gin.H{"message": fmt.Sprintf("Running playbook %s", body["playbook"])})
}

func getInventory(c *gin.Context) {
	c.JSON(200, gin.H{"hosts": []string{"web-server-1", "db-server-1"}})
}

func getRoles(c *gin.Context) {
	c.JSON(200, gin.H{"roles": []string{"nginx", "postgresql"}})
}

// Monitoring handlers
func getSystemMetrics(c *gin.Context) {
	c.JSON(200, gin.H{
		"cpu":    map[string]interface{}{"usage": 45.2, "cores": 8},
		"memory": map[string]interface{}{"usage": 60.5, "total": 16384},
		"disk":   map[string]interface{}{"usage": 70.0, "total": 500},
	})
}

func getLogs(c *gin.Context) {
	c.JSON(200, gin.H{
		"logs": []string{
			"2024-01-19 10:00:00 INFO Application started",
			"2024-01-19 10:00:05 INFO Connected to database",
		},
	})
}

func getAlerts(c *gin.Context) {
	c.JSON(200, gin.H{
		"alerts": []map[string]interface{}{
			{
				"id":       "alert-1",
				"severity": "warning",
				"message":  "High CPU usage detected",
			},
		},
	})
}

// Extension handlers
func listExtensions(c *gin.Context) {
	c.JSON(200, gin.H{
		"extensions": []map[string]interface{}{
			{
				"id":          "ext-1",
				"name":        "AWS Integration",
				"version":     "1.0.0",
				"installed":   true,
			},
		},
	})
}

func getMarketplace(c *gin.Context) {
	c.JSON(200, gin.H{
		"extensions": []map[string]interface{}{
			{
				"id":          "ext-2",
				"name":        "Azure DevOps",
				"version":     "2.0.0",
				"downloads":   1000,
			},
		},
	})
}

func installExtension(c *gin.Context) {
	var body map[string]string
	c.BindJSON(&body)
	c.JSON(200, gin.H{"message": fmt.Sprintf("Installing extension %s", body["id"])})
}

func uninstallExtension(c *gin.Context) {
	id := c.Param("id")
	c.JSON(200, gin.H{"message": fmt.Sprintf("Extension %s uninstalled", id)})
}

// Workflow handlers
func listWorkflows(c *gin.Context) {
	c.JSON(200, gin.H{
		"workflows": []map[string]interface{}{
			{
				"id":   "wf-1",
				"name": "Deploy to Production",
				"status": "active",
			},
		},
	})
}

func createWorkflow(c *gin.Context) {
	var body map[string]interface{}
	c.BindJSON(&body)
	c.JSON(200, gin.H{"message": "Workflow created", "id": "wf-2"})
}

func executeWorkflow(c *gin.Context) {
	id := c.Param("id")
	c.JSON(200, gin.H{"message": fmt.Sprintf("Executing workflow %s", id)})
}

func deleteWorkflow(c *gin.Context) {
	id := c.Param("id")
	c.JSON(200, gin.H{"message": fmt.Sprintf("Workflow %s deleted", id)})
}

func main() {
	// Set Gin to release mode in production
	if os.Getenv("GIN_MODE") == "" {
		gin.SetMode(gin.DebugMode)
	}

	// Create WebSocket hub
	hub := newHub()
	go hub.run()

	// Setup router
	router := setupRouter(hub)

	// Create HTTP server
	srv := &http.Server{
		Addr:    ":8080",
		Handler: router,
	}

	// Start server in goroutine
	go func() {
		log.Printf("Server starting on port 8080...")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Send periodic metrics updates
	go func() {
		ticker := time.NewTicker(5 * time.Second)
		defer ticker.Stop()
		
		for {
			select {
			case <-ticker.C:
				// Broadcast metrics to all connected clients
				metricsMsg := fmt.Sprintf(`{"type":"metrics","payload":{"cpu":%.1f,"memory":%.1f,"timestamp":"%s"}}`,
					45.0+float64(time.Now().Unix()%20),
					60.0+float64(time.Now().Unix()%15),
					time.Now().Format(time.RFC3339))
				hub.broadcast <- []byte(metricsMsg)
			}
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	// Graceful shutdown with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("Server exited")
}
