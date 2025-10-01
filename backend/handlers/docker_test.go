package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestListContainers(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	
	// Mock handler
	router.GET("/api/v1/docker/containers", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"containers": []gin.H{
				{
					"id":     "abc123",
					"name":   "nginx",
					"status": "running",
					"image":  "nginx:latest",
				},
				{
					"id":     "def456",
					"name":   "postgres",
					"status": "running",
					"image":  "postgres:15",
				},
			},
		})
	})

	// Test
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/v1/docker/containers", nil)
	router.ServeHTTP(w, req)

	// Assert
	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Contains(t, response, "containers")
	
	containers := response["containers"].([]interface{})
	assert.Equal(t, 2, len(containers))
}

func TestStartContainer(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	
	router.POST("/api/v1/docker/containers/:id/start", func(c *gin.Context) {
		containerId := c.Param("id")
		c.JSON(http.StatusOK, gin.H{
			"success":     true,
			"message":     "Container started",
			"containerId": containerId,
		})
	})

	// Test
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/v1/docker/containers/abc123/start", nil)
	router.ServeHTTP(w, req)

	// Assert
	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, true, response["success"])
	assert.Equal(t, "abc123", response["containerId"])
}

func TestStopContainer(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	
	router.POST("/api/v1/docker/containers/:id/stop", func(c *gin.Context) {
		containerId := c.Param("id")
		c.JSON(http.StatusOK, gin.H{
			"success":     true,
			"message":     "Container stopped",
			"containerId": containerId,
		})
	})

	// Test
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/v1/docker/containers/abc123/stop", nil)
	router.ServeHTTP(w, req)

	// Assert
	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, true, response["success"])
}

func TestGetContainerLogs(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	
	router.GET("/api/v1/docker/containers/:id/logs", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"logs": []string{
				"Log line 1",
				"Log line 2",
				"Log line 3",
			},
		})
	})

	// Test
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/v1/docker/containers/abc123/logs?tail=100", nil)
	router.ServeHTTP(w, req)

	// Assert
	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Contains(t, response, "logs")
	
	logs := response["logs"].([]interface{})
	assert.Equal(t, 3, len(logs))
}

func TestListImages(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	
	router.GET("/api/v1/docker/images", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"images": []gin.H{
				{
					"id":         "img123",
					"repository": "nginx",
					"tag":        "latest",
					"size":       142000000,
				},
				{
					"id":         "img456",
					"repository": "postgres",
					"tag":        "15",
					"size":       376000000,
				},
			},
		})
	})

	// Test
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/v1/docker/images", nil)
	router.ServeHTTP(w, req)

	// Assert
	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Contains(t, response, "images")
	
	images := response["images"].([]interface{})
	assert.Equal(t, 2, len(images))
}
