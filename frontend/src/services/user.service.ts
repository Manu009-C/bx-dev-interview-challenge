export class UserService {
  private baseUrl = 'http://localhost:3000/api';
  private getToken: (() => Promise<string | null>) | null = null;

  // Method to set the token getter function from the React component
  setTokenGetter(getToken: () => Promise<string | null>) {
    this.getToken = getToken;
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    if (!this.getToken) {
      throw new Error('Token getter not set. Call setTokenGetter() first.');
    }
    
    const token = await this.getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  async syncUser(): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/sync-user`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to sync user: ${response.statusText}`);
    }

    return response.json();
  }
}
