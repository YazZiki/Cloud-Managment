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
