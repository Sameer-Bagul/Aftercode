export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
  };
  html_url: string;
  description: string | null;
  fork: boolean;
  archived: boolean;
  disabled: boolean;
  visibility?: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
  pushed_at: string;
  created_at: string;
}

export interface InventoryItem {
  name: string;
  slug: string;
  url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  classification: string | null;
  lastProcessedTime: string | null;
  error: string | null;
  fork: boolean;
  archived: boolean;
}

export interface InventoryState {
  owner: string;
  totalRepositories: number;
  lastUpdated: string;
  repositories: InventoryItem[];
}
