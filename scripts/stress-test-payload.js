const TARGET_URL = 'http://localhost:3000/api/generate-system';
const payload = {
  name: 'Hacker',
  role: 'PenTester',
  level: 'Junior',
  goal: 'x'.repeat(2000), // > 1500 limit
  sector: 'Cybersecurity',
  hoursPerWeek: 40,
  technologies: [],
  courses: [],
  projects: [],
  parent_id: 'fake-id'
};
fetch(TARGET_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '192.168.99.100' },
  body: JSON.stringify(payload)
}).then(r => r.json().then(data => console.log(r.status, data)));
