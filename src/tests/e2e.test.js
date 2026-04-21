describe('BuildaMart Basic Tests', () => {
  test('homepage is accessible', async () => {
    const response = await fetch('http://localhost:5173');
    expect(response.status).toBe(200);
  }, 30000);

  test('app title is BuildaMart', async () => {
    const response = await fetch('http://localhost:5173');
    const html = await response.text();
    expect(html).toContain('BuildaMart');
  }, 30000);
});