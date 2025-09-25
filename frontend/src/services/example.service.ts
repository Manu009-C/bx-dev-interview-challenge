export class ExampleService {
  async getMessage(): Promise<{ message: string }> {
    const response = await fetch("http://localhost:3000/api/hello");
    return response.json();
  }
}
