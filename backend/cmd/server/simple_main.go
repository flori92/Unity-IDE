// Fichier désactivé pour éviter les doublons avec main.go
				delete(h.clients, client)
				close(client.send)
				logrus.Infof("Client disconnected. Total clients: %d", len(h.clients))
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

	for {
		_, _, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				logrus.Errorf("WebSocket error: %v", err)
			}
			break
		}
	}
}

func (c *Client) writePump() {
	defer c.conn.Close()

	for {
		select {
		case message, ok := <-c.send:
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			c.conn.WriteMessage(websocket.TextMessage, message)
		}
	}
}

func handleWebSocket(hub *Hub) gin.HandlerFunc {
	return func(c *gin.Context) {
		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			logrus.Errorf("WebSocket upgrade error: %v", err)
			return
		}

		client := &Client{hub: hub, conn: conn, send: make(chan []byte, 256)}
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
	config.AllowAllOrigins = true
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization", "Accept", "X-Requested-With"}
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

// Docker handlers - Mock implementations for now
func getDockerContainers(c *gin.Context) {
	// Check if Docker is available
	dockerAvailable := checkDockerAvailable()

	containers := []map[string]interface{}{
		{
			"id":      "abc123def456",
			"name":    "nginx-web",
			"status":  "running",
			"image":   "nginx:latest",
			"state":   "running",
			"ports":   []map[string]interface{}{{"private_port": 80, "public_port": 8080, "type": "tcp"}},
			"created": time.Now().Add(-2 * time.Hour),
			"labels":  map[string]string{"app": "web", "env": "dev"},
		},
		{
			"id":      "def456ghi789",
			"name":    "postgres-db",
			"status":  "running",
			"image":   "postgres:15",
			"state":   "running",
			"ports":   []map[string]interface{}{{"private_port": 5432, "public_port": 5432, "type": "tcp"}},
			"created": time.Now().Add(-1 * time.Hour),
			"labels":  map[string]string{"app": "database", "env": "dev"},
		},
	}

	c.JSON(200, gin.H{
		"containers":       containers,
		"docker_available": dockerAvailable,
	})
}

func checkDockerAvailable() bool {
	// Simple check - in real implementation, try to connect to Docker daemon
	return true
}

func startContainer(c *gin.Context) {
	id := c.Param("id")
	logrus.Infof("Starting container: %s", id)
	c.JSON(200, gin.H{"message": fmt.Sprintf("Container %s started", id)})
}

func stopContainer(c *gin.Context) {
	id := c.Param("id")
	logrus.Infof("Stopping container: %s", id)
	c.JSON(200, gin.H{"message": fmt.Sprintf("Container %s stopped", id)})
}

func removeContainer(c *gin.Context) {
	id := c.Param("id")
	logrus.Infof("Removing container: %s", id)
	c.JSON(200, gin.H{"message": fmt.Sprintf("Container %s removed", id)})
}

func getDockerImages(c *gin.Context) {
	images := []map[string]interface{}{
		{
			"id":           "nginx:latest",
			"repo_tags":    []string{"nginx:latest"},
			"size":         187000000,
			"created":      time.Now().Add(-24 * time.Hour),
			"virtual_size": 187000000,
		},
		{
			"id":           "postgres:15",
			"repo_tags":    []string{"postgres:15"},
			"size":         456000000,
			"created":      time.Now().Add(-12 * time.Hour),
			"virtual_size": 456000000,
		},
	}
	c.JSON(200, gin.H{"images": images})
}

func pullImage(c *gin.Context) {
	var body map[string]string
	c.BindJSON(&body)
	imageName := body["image"]
	logrus.Infof("Pulling image: %s", imageName)
	c.JSON(200, gin.H{"message": fmt.Sprintf("Image %s pulled successfully", imageName)})
}

// Kubernetes handlers - Mock implementations
func getK8sPods(c *gin.Context) {
	namespace := c.DefaultQuery("namespace", "default")
	pods := []map[string]interface{}{
		{
			"name":      "web-app-7d4b8c9f6-abc12",
			"namespace": namespace,
			"status":    "Running",
			"ready":     "2/2",
			"restarts":  0,
			"age":       "2h",
			"node":      "worker-node-1",
			"labels":    map[string]string{"app": "web-app", "version": "v1.0.0"},
			"ip":        "10.244.1.5",
		},
		{
			"name":      "api-server-6c8d9e2f1-def34",
			"namespace": namespace,
			"status":    "Running",
			"ready":     "1/1",
			"restarts":  1,
			"age":       "1h",
			"node":      "worker-node-2",
			"labels":    map[string]string{"app": "api-server", "version": "v2.1.0"},
			"ip":        "10.244.2.3",
		},
	}
	c.JSON(200, gin.H{"pods": pods})
}

func getK8sDeployments(c *gin.Context) {
	namespace := c.DefaultQuery("namespace", "default")
	deployments := []map[string]interface{}{
		{
			"name":      "web-app",
			"namespace": namespace,
			"replicas":  3,
			"ready":     3,
			"available": 3,
			"age":       "2h",
			"labels":    map[string]string{"app": "web-app"},
		},
		{
			"name":      "api-server",
			"namespace": namespace,
			"replicas":  2,
			"ready":     2,
			"available": 2,
			"age":       "1h",
			"labels":    map[string]string{"app": "api-server"},
		},
	}
	c.JSON(200, gin.H{"deployments": deployments})
}

func getK8sServices(c *gin.Context) {
	namespace := c.DefaultQuery("namespace", "default")
	services := []map[string]interface{}{
		{
			"name":       "web-app-service",
			"namespace":  namespace,
			"type":       "ClusterIP",
			"cluster_ip": "10.96.1.100",
			"ports":      []string{"80:8080/TCP"},
			"labels":     map[string]string{"app": "web-app"},
			"age":        "2h",
		},
		{
			"name":       "api-service",
			"namespace":  namespace,
			"type":       "LoadBalancer",
			"cluster_ip": "10.96.1.101",
			"ports":      []string{"443:8443/TCP"},
			"labels":     map[string]string{"app": "api-server"},
			"age":        "1h",
		},
	}
	c.JSON(200, gin.H{"services": services})
}

func getK8sNodes(c *gin.Context) {
	nodes := []map[string]interface{}{
		{
			"name":     "master-node-1",
			"status":   "Ready",
			"roles":    []string{"master"},
			"age":      "5d",
			"version":  "v1.28.0",
			"labels":   map[string]string{"node-role.kubernetes.io/master": ""},
			"capacity": map[string]string{"cpu": "4", "memory": "8Gi", "pods": "110"},
		},
		{
			"name":     "worker-node-1",
			"status":   "Ready",
			"roles":    []string{"worker"},
			"age":      "5d",
			"version":  "v1.28.0",
			"labels":   map[string]string{"node-role.kubernetes.io/worker": ""},
			"capacity": map[string]string{"cpu": "8", "memory": "16Gi", "pods": "110"},
		},
	}
	c.JSON(200, gin.H{"nodes": nodes})
}

func applyK8sManifest(c *gin.Context) {
	var body map[string]string
	c.BindJSON(&body)
	manifest := body["manifest"]
	logrus.Infof("Applying Kubernetes manifest: %s", manifest)
	c.JSON(200, gin.H{"message": "Manifest applied successfully"})
}

// Ansible handlers - Mock implementations
func getPlaybooks(c *gin.Context) {
	playbooks := []map[string]interface{}{
		{
			"name":        "deploy-web-app",
			"path":        "/home/user/ansible/deploy-web-app.yml",
			"description": "Deploy web application to production servers",
			"tags":        []string{"deploy", "web"},
			"variables":   map[string]interface{}{"app_version": "v1.0.0"},
			"hosts":       "webservers",
			"created":     time.Now().Add(-3 * time.Hour),
			"modified":    time.Now().Add(-1 * time.Hour),
		},
		{
			"name":        "backup-database",
			"path":        "/home/user/ansible/backup-database.yml",
			"description": "Backup database and store in S3",
			"tags":        []string{"backup", "database"},
			"variables":   map[string]interface{}{"backup_retention": 30},
			"hosts":       "databases",
			"created":     time.Now().Add(-2 * time.Hour),
			"modified":    time.Now().Add(-30 * time.Minute),
		},
	}
	c.JSON(200, gin.H{"playbooks": playbooks})
}

func runPlaybook(c *gin.Context) {
	var body map[string]interface{}
	c.BindJSON(&body)
	playbook := body["playbook"].(string)
	logrus.Infof("Running playbook: %s", playbook)

	execution := map[string]interface{}{
		"id":         "exec_12345",
		"playbook":   playbook,
		"status":     "success",
		"start_time": time.Now().Add(-5 * time.Minute),
		"end_time":   time.Now(),
		"output":     "PLAY [Deploy web application] ********************************\nTASK [Install nginx] ************************************\nok: [web-server-1]\nok: [web-server-2]\n\nPLAY RECAP **********************************************\nweb-server-1: ok=5 changed=2 unreachable=0 failed=0\nweb-server-2: ok=5 changed=2 unreachable=0 failed=0",
		"exit_code":  0,
		"hosts":      []string{"web-server-1", "web-server-2"},
		"extra_vars": body["extraVars"],
		"duration":   "2m30s",
	}
	c.JSON(200, gin.H{"execution": execution})
}

func getInventory(c *gin.Context) {
	inventories := []map[string]interface{}{
		{
			"name": "production",
			"groups": map[string][]string{
				"webservers": {"web-server-1", "web-server-2"},
				"databases":  {"db-server-1"},
			},
			"vars": map[string]interface{}{"ansible_user": "ubuntu"},
			"path": "/home/user/ansible/inventory/production",
		},
		{
			"name": "staging",
			"groups": map[string][]string{
				"webservers": {"staging-web-1"},
				"databases":  {"staging-db-1"},
			},
			"vars": map[string]interface{}{"ansible_user": "ubuntu"},
			"path": "/home/user/ansible/inventory/staging",
		},
	}
	c.JSON(200, gin.H{"inventories": inventories})
}

func getRoles(c *gin.Context) {
	roles := []string{"nginx", "postgresql", "redis", "docker"}
	c.JSON(200, gin.H{"roles": roles})
}

// Monitoring handlers
func getSystemMetrics(c *gin.Context) {
	metrics := map[string]interface{}{
		"cpu": map[string]interface{}{
			"usage": 45.2,
			"cores": 8,
			"load":  []float64{1.2, 1.5, 1.8},
		},
		"memory": map[string]interface{}{
			"usage":     60.5,
			"total":     16384,
			"available": 6480,
			"used":      9904,
		},
		"disk": map[string]interface{}{
			"usage": 70.0,
			"total": 500,
			"free":  150,
		},
		"network": map[string]interface{}{
			"rx_bytes": 1024000,
			"tx_bytes": 2048000,
		},
		"timestamp": time.Now(),
	}
	c.JSON(200, metrics)
}

func getLogs(c *gin.Context) {
	logs := []map[string]interface{}{
		{
			"timestamp": time.Now().Add(-5 * time.Minute),
			"level":     "INFO",
			"message":   "Application started successfully",
			"source":    "web-app",
		},
		{
			"timestamp": time.Now().Add(-4 * time.Minute),
			"level":     "INFO",
			"message":   "Connected to database",
			"source":    "api-server",
		},
		{
			"timestamp": time.Now().Add(-3 * time.Minute),
			"level":     "WARN",
			"message":   "High memory usage detected",
			"source":    "monitoring",
		},
		{
			"timestamp": time.Now().Add(-2 * time.Minute),
			"level":     "ERROR",
			"message":   "Failed to connect to external API",
			"source":    "api-server",
		},
	}
	c.JSON(200, gin.H{"logs": logs})
}

func getAlerts(c *gin.Context) {
	alerts := []map[string]interface{}{
		{
			"id":        "alert-1",
			"severity":  "warning",
			"message":   "High CPU usage detected on worker-node-1",
			"source":    "monitoring",
			"timestamp": time.Now().Add(-10 * time.Minute),
			"status":    "active",
		},
		{
			"id":        "alert-2",
			"severity":  "critical",
			"message":   "Database connection failed",
			"source":    "api-server",
			"timestamp": time.Now().Add(-5 * time.Minute),
			"status":    "resolved",
		},
	}
	c.JSON(200, gin.H{"alerts": alerts})
}

// Extension handlers
func listExtensions(c *gin.Context) {
	extensions := []map[string]interface{}{
		{
			"id":          "ext-1",
			"name":        "AWS Integration",
			"version":     "1.0.0",
			"installed":   true,
			"description": "Integrate with AWS services",
		},
		{
			"id":          "ext-2",
			"name":        "Azure DevOps",
			"version":     "2.0.0",
			"installed":   false,
			"description": "Azure DevOps integration",
		},
	}
	c.JSON(200, gin.H{"extensions": extensions})
}

func getMarketplace(c *gin.Context) {
	extensions := []map[string]interface{}{
		{
			"id":          "ext-3",
			"name":        "GitHub Actions",
			"version":     "1.5.0",
			"downloads":   1000,
			"description": "GitHub Actions integration",
		},
		{
			"id":          "ext-4",
			"name":        "Terraform",
			"version":     "3.0.0",
			"downloads":   2500,
			"description": "Terraform IaC integration",
		},
	}
	c.JSON(200, gin.H{"extensions": extensions})
}

func installExtension(c *gin.Context) {
	var body map[string]string
	c.BindJSON(&body)
	extensionID := body["id"]
	logrus.Infof("Installing extension: %s", extensionID)
	c.JSON(200, gin.H{"message": fmt.Sprintf("Extension %s installed successfully", extensionID)})
}

func uninstallExtension(c *gin.Context) {
	id := c.Param("id")
	logrus.Infof("Uninstalling extension: %s", id)
	c.JSON(200, gin.H{"message": fmt.Sprintf("Extension %s uninstalled", id)})
}

// Workflow handlers
func listWorkflows(c *gin.Context) {
	workflows := []map[string]interface{}{
		{
			"id":       "wf-1",
			"name":     "Deploy to Production",
			"status":   "active",
			"last_run": time.Now().Add(-2 * time.Hour),
		},
		{
			"id":       "wf-2",
			"name":     "Backup Database",
			"status":   "active",
			"last_run": time.Now().Add(-6 * time.Hour),
		},
	}
	c.JSON(200, gin.H{"workflows": workflows})
}

func createWorkflow(c *gin.Context) {
	var body map[string]interface{}
	c.BindJSON(&body)
	logrus.Infof("Creating workflow: %s", body["name"])
	c.JSON(200, gin.H{"message": "Workflow created", "id": "wf-3"})
}

func executeWorkflow(c *gin.Context) {
	id := c.Param("id")
	logrus.Infof("Executing workflow: %s", id)
	c.JSON(200, gin.H{"message": fmt.Sprintf("Workflow %s executed successfully", id)})
}

func deleteWorkflow(c *gin.Context) {
	id := c.Param("id")
	logrus.Infof("Deleting workflow: %s", id)
	c.JSON(200, gin.H{"message": fmt.Sprintf("Workflow %s deleted", id)})
}

func main() {
	// Initialize logrus
	logrus.SetLevel(logrus.InfoLevel)
	logrus.SetFormatter(&logrus.TextFormatter{
		FullTimestamp: true,
	})

	logrus.Info("Starting DevOps Unity IDE Backend Server...")

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
		Addr:    ":9090",
		Handler: router,
	}

	// Start server in goroutine
	go func() {
		logrus.Infof("Server starting on port 9090...")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logrus.Fatalf("Failed to start server: %v", err)
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
					float64(time.Now().Unix()%100),
					float64(time.Now().Unix()%80),
					time.Now().Format(time.RFC3339))

				hub.broadcast <- []byte(metricsMsg)
			}
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	logrus.Info("Shutting down server...")

	// Give outstanding requests a deadline for completion
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Attempt graceful shutdown
	if err := srv.Shutdown(ctx); err != nil {
		logrus.Fatal("Server forced to shutdown:", err)
	}

	logrus.Info("Server exited")
}
