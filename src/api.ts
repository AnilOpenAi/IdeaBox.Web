import type { AuthResponse, Idea, PagedResult } from "./types";

const API_BASE_URL = "http://localhost:5145"; // backend port'un farklıysa burayı değiştir

export async function register(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Register failed: ${res.status} ${text}`);
  }

  return res.json();
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Login failed: ${res.status} ${text}`);
  }

  return res.json();
}

export async function getIdeas(
  token: string,
  page: number,
  pageSize: number
): Promise<PagedResult<Idea>> {
  const res = await fetch(
    `${API_BASE_URL}/api/ideas?page=${page}&pageSize=${pageSize}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Get ideas failed: ${res.status} ${text}`);
  }

  return res.json();
}

export async function createIdea(
  token: string,
  title: string,
  description: string
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/ideas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, description }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Create idea failed: ${res.status} ${text}`);
  }
}

export async function likeIdea(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/ideas/${id}/like`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Like failed: ${res.status} ${text}`);
  }
}

export async function unlikeIdea(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/ideas/${id}/unlike`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Unlike failed: ${res.status} ${text}`);
  }
}
