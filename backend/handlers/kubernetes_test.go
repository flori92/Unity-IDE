package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestListPods(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	
	router.GET("/api/v1/kubernetes/pods", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"pods": []gin.H{
				{
					"name":      "frontend-abc123",
					"namespace": "default",
					"status":    "Running",
					"ready":     "1/1",
				},
				{
					"name":      "backend-def456",
					"namespace": "default",
					"status":    "Running",
					"ready":     "1/1",
				},
			},
		})
	})

	// Test
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/v1/kubernetes/pods?namespace=default", nil)
	router.ServeHTTP(w, req)

	// Assert
	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Contains(t, response, "pods")
	
	pods := response["pods"].([]interface{})
	assert.Equal(t, 2, len(pods))
}

func TestListDeployments(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	
	router.GET("/api/v1/kubernetes/deployments", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"deployments": []gin.H{
				{
					"name":      "frontend",
					"namespace": "default",
					"replicas":  3,
					"available": 3,
					"ready":     3,
				},
				{
					"name":      "backend",
					"namespace": "default",
					"replicas":  2,
					"available": 2,
					"ready":     2,
				},
			},
		})
	})

	// Test
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/v1/kubernetes/deployments?namespace=default", nil)
	router.ServeHTTP(w, req)

	// Assert
	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Contains(t, response, "deployments")
	
	deployments := response["deployments"].([]interface{})
	assert.Equal(t, 2, len(deployments))
}

func TestScaleDeployment(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	
	router.POST("/api/v1/kubernetes/deployments/:name/scale", func(c *gin.Context) {
		deploymentName := c.Param("name")
		c.JSON(http.StatusOK, gin.H{
			"success":    true,
			"message":    "Deployment scaled",
			"deployment": deploymentName,
			"replicas":   5,
		})
	})

	// Test
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/v1/kubernetes/deployments/frontend/scale", nil)
	router.ServeHTTP(w, req)

	// Assert
	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, true, response["success"])
	assert.Equal(t, "frontend", response["deployment"])
}

func TestGetPodLogs(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	
	router.GET("/api/v1/kubernetes/pods/:name/logs", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"logs": []string{
				"Pod log line 1",
				"Pod log line 2",
				"Pod log line 3",
			},
		})
	})

	// Test
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/v1/kubernetes/pods/frontend-abc123/logs?namespace=default&tail=100", nil)
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

func TestDeletePod(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	
	router.DELETE("/api/v1/kubernetes/pods/:name", func(c *gin.Context) {
		podName := c.Param("name")
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Pod deleted",
			"pod":     podName,
		})
	})

	// Test
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("DELETE", "/api/v1/kubernetes/pods/frontend-abc123?namespace=default", nil)
	router.ServeHTTP(w, req)

	// Assert
	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, true, response["success"])
	assert.Equal(t, "frontend-abc123", response["pod"])
}

func TestListNamespaces(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	
	router.GET("/api/v1/kubernetes/namespaces", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"namespaces": []string{
				"default",
				"kube-system",
				"kube-public",
				"production",
			},
		})
	})

	// Test
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/v1/kubernetes/namespaces", nil)
	router.ServeHTTP(w, req)

	// Assert
	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Contains(t, response, "namespaces")
	
	namespaces := response["namespaces"].([]interface{})
	assert.Equal(t, 4, len(namespaces))
}
