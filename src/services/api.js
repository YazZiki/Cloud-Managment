const BASE_URL = "http://localhost:5003/api";

export async function request(
  path,
  options = {
    method: "GET",
    headers: {},
    body: null,
  },
) {
  const token = localStorage.getItem("jwttoken");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: options.method,
      headers: headers,
      body: options.body ? JSON.stringify(options.body) : null,
    });

    if (response.status === 401) {
      localStorage.removeItem("jwttoken");
      window.location.href = "/login";
      return;
    }
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Request failed: ${response.status}`,
      );
    }

    const data = await response.json();
    // console.log("Full response data:", data);
    return data;
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
}
export function login({ email, password }) {
  return request("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: { email, password },
  });
}
export function getAllGovEntities() {
  return request("/government-entities", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}
export function approveGovEntity(id) {
  return request(`/government-entities/${id}/approve`, {
    method: "PUT",
  });
}

export function rejectGovEntity(id) {
  return request(`/government-entities/${id}/reject`, {
    method: "PUT",
  });
}

export function suspendGovEntity(id) {
  return request(`/government-entities/${id}/suspend`, {
    method: "PUT",
  });
}

export function getAllVulnerabilities() {
  return request("/vulnerabilities", { method: "GET" });
}

export function updateVulnerability(id, body) {
  return request(`/vulnerabilities/${id}`, {
    method: "PUT",
    body,
  });
}

export function updateVulnerabilityStatus(id, body) {
  return request(`/vulnerabilities/${id}/status`, {
    method: "PUT",
    body,
  });
}

export function deleteVulnerability(id) {
  return request(`/vulnerabilities/${id}`, { method: "DELETE" });
}

export function getMyVulnerabilities() {
  return request("/vulnerabilities/my", { method: "GET" });
}

export function createVulnerability(body) {
  return request("/vulnerabilities", { method: "POST", body });
}
export function getAllNotifications() {
  return request("/notifications", { method: "GET" });
}

export function getMyNotifications() {
  return request("/notifications/my", { method: "GET" });
}

export function broadcastNotification(body) {
  return request("/notifications/broadcast", { method: "POST", body });
}

export function sendNotificationToEntity(body) {
  return request("/notifications/send-to-entity", { method: "POST", body });
}

export function markNotificationRead(id) {
  return request(`/notifications/${id}/read`, { method: "PUT" });
}

export function deleteNotification(id) {
  return request(`/notifications/${id}`, { method: "DELETE" });
}

export function getAllPolicies() {
  return request("/policies", { method: "GET" });
}

export function createPolicy(body) {
  return request("/policies", { method: "POST", body });
}

export function updatePolicy(id, body) {
  return request(`/policies/${id}`, { method: "PUT", body });
}

export function deletePolicy(id) {
  return request(`/policies/${id}`, { method: "DELETE" });
}

export function getMaturityResults() {
  return request("/maturity/results", { method: "GET" });
}

export function getMyMaturityResult() {
  return request("/maturity/my-result", { method: "GET" });
}

export function submitMaturityAssessment(body) {
  return request("/maturity/submit", { method: "POST", body });
}

export function getAllSupportRequests() {
  return request("/support-requests", { method: "GET" });
}

export function getMySupportRequests() {
  return request("/support-requests/my", { method: "GET" });
}

export function createSupportRequest(body) {
  return request("/support-requests", { method: "POST", body });
}

export function replySupportRequest(id, body) {
  return request(`/support-requests/${id}/reply`, { method: "POST", body });
}

export function closeSupportRequest(id) {
  return request(`/support-requests/${id}/close`, { method: "PUT" });
}

export function deleteSupportRequest(id) {
  return request(`/support-requests/${id}`, { method: "DELETE" });
}
export function getReadinessResults() {
  return request("/readiness/results", { method: "GET" });
}

export function getReadinessResultByEntity(entityId) {
  return request(`/readiness/results/${entityId}`, { method: "GET" });
}

export function getPlatformSummary() {
  return request("/reports/platform-summary", { method: "GET" });
}

export function getEntityReport(entityId) {
  return request(`/reports/entity/${entityId}`, { method: "GET" });
}

export function getReadinessReport() {
  return request("/reports/readiness", { method: "GET" });
}

export function getMaturityReport() {
  return request("/reports/maturity", { method: "GET" });
}

export function getVulnerabilitiesReport() {
  return request("/reports/vulnerabilities", { method: "GET" });
}
