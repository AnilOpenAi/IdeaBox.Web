export interface AuthResponse {
  token: string;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  status: number;
  createdAt: string;
  voteCount: number;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
